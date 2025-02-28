import { writable, derived, type Writable } from 'svelte/store';
import { Zero } from '@rocicorp/zero';
import { schema, type Schema } from '../../schema';
import { get } from 'svelte/store';
import { Z } from 'zero-svelte';
import Cookies from 'js-cookie';

// Store for the Zero instance
export const zeroClient: Writable<Z<Schema> | null> = writable(null);

// Store for the ready state
export const zeroReady = writable(false);

// Initialize Zero with a user ID
export async function initZero(userId: string) {
	console.log(`zeroStore: Initializing Zero for user: ${userId}`);

	// Get current Zero instance
	let currentZ = get(zeroClient);

	// Clean up previous instance if it exists
	if (currentZ) {
		console.log('zeroStore: Closing previous Zero instance');
		// await currentZ.close();
	}

	// Set ready state to false during initialization
	zeroReady.set(false);

	console.log('zeroStore: Creating new Zero instance with config:', {
		userID: userId,
		server: import.meta.env.VITE_PUBLIC_SERVER,
		schema,
		kvStore: 'idb'
	});

	const jwt = Cookies.get('jwt');

	console.log('zeroStore: JWT:', jwt);

	// Create new Zero instance
	const z = new Z<Schema>({
		logLevel: 'debug',
		userID: userId,
		server: import.meta.env.VITE_PUBLIC_SERVER,
		auth: () => jwt,
		schema,
		kvStore: 'idb'
	});

	// Update the store with the new instance
	zeroClient.set(z);
	zeroReady.set(true);

	console.log('zeroStore: Zero instance created successfully');
	return z;
}

// Helper to get the current Zero instance (throws if not ready)
export function getZero(): Z<Schema> {
	const client = get(zeroClient);
	if (!client) throw new Error('Zero client is not initialized');
	return client;
}
