import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { config } from '$lib/config';
import { SignJWT } from 'jose';
import { ZERO_AUTH_SECRET } from '$env/static/private';

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	event.locals.sb = createServerClient(config.supabaseURL, config.supabaseAnonKey, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			/**
			 * SvelteKit's cookies API requires `path` to be explicitly set in
			 * the cookie options. Setting `path` to `/` replicates previous/
			 * standard behavior.
			 */
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.sb.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.sb.auth.getUser();
		if (error) {
			// JWT validation has failed
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	if (!session) {
		const cookies = event.cookies;
		const sb = event.locals.sb;
		const { data, error } = await sb.auth.signInAnonymously();
		if (error) {
			console.error(error);
			redirect(303, '/auth/error');
		}
		const user = data.user;
		if (!user) throw new Error('This should never happen, user is null');

		const payload = {
			sub: user.id,
			iat: Math.floor(Date.now() / 1000)
		};

		const jwt = await new SignJWT(payload)
			.setProtectedHeader({ alg: 'HS256' })
			.setExpirationTime('30days')
			.sign(new TextEncoder().encode(ZERO_AUTH_SECRET));

		cookies.set('jwt', jwt, {
			path: '/',
			httpOnly: false,
			secure: import.meta.env.PROD,
			sameSite: 'lax'
		});
	}

	if (!event.locals.session && event.url.pathname.startsWith('/chat')) {
		redirect(303, '/auth');
	}

	if (event.locals.session && event.url.pathname === '/auth') {
		redirect(303, '/');
	}
	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
