import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SignJWT } from 'jose';
import { ZERO_AUTH_SECRET } from '$env/static/private';

// TODO: dedupe
export const actions: Actions = {
	signup: async ({ request, cookies, locals: { sb } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { data, error } = await sb.auth.signUp({ email, password });
		if (error) {
			console.error(error);
			redirect(303, '/auth/error');
		}
		const user = data.user;
		if (!user) {
			throw new Error(
				"This shouldn't happen, user is null because email auto confirm is off. Please set email auto confirm to true in Supabase."
			);
		}

		const payload = {
			sub: user.id,
			iat: Math.floor(Date.now() / 1000),
			email: user.email
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
		redirect(303, '/');
	},
	login: async ({ request, cookies, locals: { sb } }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { data, error } = await sb.auth.signInWithPassword({ email, password });
		if (error) {
			console.error(error);
			redirect(303, '/auth/error');
		} else {
			const user = data.user;

			const payload = {
				sub: user.id,
				iat: Math.floor(Date.now() / 1000),
				email: user.email
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
			redirect(303, '/private');
		}
	}
};
