<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/sb-types';
	import { zeroClient, zeroReady, initZero, getZero } from '$lib/stores/zeroStore';
	import type { Schema } from '../../schema';
	import type { Zero } from '@rocicorp/zero';

	let {
		sb,
		children
	}: {
		sb: SupabaseClient<Database, any>;
		children: any;
	} = $props();

	console.log('ZContextProvider: Component initialized');

	onMount(() => {
		console.log('ZContextProvider: onMount triggered');

		// Initialize with current session
		const initializeZero = async () => {
			console.log('ZContextProvider: initializeZero called');
			try {
				console.log('ZContextProvider: Getting session from Supabase');
				const {
					data: { session }
				} = await sb.auth.getSession();

				console.log(
					'ZContextProvider: Session retrieved',
					session ? 'Session exists' : 'No session'
				);
				const userId = session?.user?.id ?? 'anon';
				console.log(`ZContextProvider: Using user ID: ${userId}`);

				await initZero(userId);
				console.log('ZContextProvider: Initial Zero initialization complete');
			} catch (error) {
				console.error('ZContextProvider: Error during initialization:', error);
				throw error;
			}
		};

		// Call initialization immediately
		initializeZero();

		// Set up auth state change listener
		console.log('ZContextProvider: Setting up auth state change listener');
		const { data } = sb.auth.onAuthStateChange(async (event, session) => {
			console.log(`ZContextProvider: Auth state changed - Event: ${event}`);
			console.log('ZContextProvider: New session:', session ? 'Session exists' : 'No session');

			const userId = session?.user?.id ?? 'anon';
			console.log(`ZContextProvider: Reinitializing Zero with user ID: ${userId}`);

			try {
				await initZero(userId);
				console.log('ZContextProvider: Zero reinitialized after auth change');
			} catch (error) {
				console.error('ZContextProvider: Error during reinitialization:', error);
			}
		});

		console.log('ZContextProvider: Auth state change listener set up successfully');

		// Return cleanup function directly (not wrapped in a Promise)
		return () => {
			console.log('ZContextProvider: Cleanup function from onMount called');
			data.subscription.unsubscribe();
			console.log('ZContextProvider: Auth subscription unsubscribed');
		};
	});

	onDestroy(() => {
		console.log('ZContextProvider: onDestroy triggered');

		const z = getZero();

		if (z) {
			console.log('ZContextProvider: Closing Zero instance');
			// z.close();
		}
	});
</script>

{#if $zeroReady}
	{@render children()}
{:else}
	<div class="loading">Initializing...</div>
{/if}

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
	}
</style>
