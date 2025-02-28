import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { config } from '$lib/config';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
	/**
	 * Declare a dependency so the layout can be invalidated, for example, on
	 * session refresh.
	 */
	depends('supabase:auth');

	const sb = isBrowser()
		? createBrowserClient(config.supabaseURL, config.supabaseAnonKey, {
				global: {
					fetch
				}
			})
		: createServerClient(config.supabaseURL, config.supabaseAnonKey, {
				global: {
					fetch
				},
				cookies: {
					getAll() {
						return data.cookies;
					}
				}
			});

	/**
	 * It's fine to use `getSession` here, because on the client, `getSession` is
	 * safe, and on the server, it reads `session` from the `LayoutData`, which
	 * safely checked the session using `safeGetSession`.
	 */
	const {
		data: { session }
	} = await sb.auth.getSession();

	const {
		data: { user }
	} = await sb.auth.getUser();

	return { session, sb, user };
};
export const ssr = false;
