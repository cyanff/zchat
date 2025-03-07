import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SignJWT } from 'jose';
import { ZERO_AUTH_SECRET } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';
import type { User } from '@supabase/supabase-js';

/**
 * Authentication actions for the application
 *
 * This module handles user signup and login flows, creating JWT tokens
 * for authenticated sessions. The tokens are stored as cookies and used
 * for subsequent authenticated requests.
 */
export const actions: Actions = {
	signup: async ({ request, cookies, locals: { sb } }) => {
		const { email, password } = await getCredentials(request);

		// Attempt to create a new user account
		const { data, error } = await sb.auth.signUp({ email, password });

		if (error) {
			console.error('Signup error:', error);
			redirect(303, '/auth/error');
		}

		const user = data.user;
		if (!user) {
			throw new Error(
				'User is null after signup - this indicates email auto-confirm is disabled. ' +
					'Please enable email auto-confirm in Supabase configuration.'
			);
		}

		// Create and set authentication token
		await createAndSetAuthToken(user, cookies);
		redirect(303, '/');
	},

	login: async ({ request, cookies, locals: { sb } }) => {
		const { email, password } = await getCredentials(request);

		// Authenticate existing user
		const { data, error } = await sb.auth.signInWithPassword({ email, password });

		if (error) {
			console.error('Login error:', error);
			redirect(303, '/auth/error');
		}

		// Create and set authentication token
		await createAndSetAuthToken(data.user, cookies);
		redirect(303, '/');
	}
};

/**
 * Extracts and returns email and password from form data
 *
 * @param request - The incoming request containing form data
 * @returns Object containing email and password
 */
async function getCredentials(request: Request) {
	const formData = await request.formData();
	const email = formData.get('email') as string;
	const password = formData.get('password') as string;

	// Basic validation could be added here

	return { email, password };
}

/**
 * Creates a JWT token for the authenticated user and sets it as a cookie
 *
 * @param user - The authenticated user object
 * @param cookies - The cookies object for setting the JWT
 */
async function createAndSetAuthToken(user: User, cookies: Cookies) {
	// Create the payload with user identification
	const payload = {
		sub: user.id,
		iat: Math.floor(Date.now() / 1000), // Issued at timestamp
		email: user.email
	};

	// Sign the JWT with our secret key
	const jwt = await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime('30days')
		.sign(new TextEncoder().encode(ZERO_AUTH_SECRET));

	cookies.set('jwt', jwt, {
		path: '/',
		httpOnly: false,
		secure: import.meta.env.PROD, // Use http in dev mode and https in prod
		sameSite: 'lax'
	});
}
