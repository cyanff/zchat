/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	// Add custom global declarations here
}

// Declare module for Svelte components
declare module "*.svelte" {
	import type { ComponentType } from "svelte";
	const component: ComponentType;
	export default component;
}

export {};
