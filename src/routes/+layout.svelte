<script lang="ts">
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import ZContextProvider from '$lib/components/ZContextProvider.svelte';
	import { Toaster } from 'svelte-sonner';
	import Sidebar from '$lib/components/Sidebar.svelte';

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
	const toastOptions = {
		unstyled: true,
		classes: {
			toast:
				'flex items-center gap-2 font-medium text-sm bg-[#262629] font-medium px-4 py-3 rounded-lg shadow-[0_0_10px_0_rgba(0,0,0,0.1)] border border-[rgba(255,255,255,0.1)]'
		}
	};
</script>

<ZContextProvider {sb}>
	<Toaster theme="dark" {toastOptions} position="top-center" />
	<div class="flex w-full h-screen relative">
		<Sidebar />
		{@render children()}
	</div>
</ZContextProvider>
