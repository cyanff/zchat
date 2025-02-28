<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import ZContextProvider from '$lib/components/ZContextProvider.svelte';

	let { data, children } = $props();
	let { session, sb } = $derived(data);

	onMount(() => {
		const { data } = sb.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});
		return () => data.subscription.unsubscribe();
	});
</script>

<ZContextProvider {sb}>
	{@render children()}
</ZContextProvider>
