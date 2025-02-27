// See https://svelte.dev/docs/kit/types#app.d.ts
/// <reference types="@sveltejs/kit" />

import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from './database.types.ts'; // import generated types

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}

		interface Locals {
			sb: SupabaseClient<Database>;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
		}
		interface PageData {
			session: Session | null;
		}
	}

	// Add custom global declarations here
}

// Declare module for Svelte components
declare module '*.svelte' {
	import type { ComponentType } from 'svelte';
	const component: ComponentType;
	export default component;
}

export {};
