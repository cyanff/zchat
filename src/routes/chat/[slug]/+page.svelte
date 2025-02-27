<script lang="ts">
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	import Sidebar from '$components/layout/Sidebar.svelte';
</script>

<div class="flex h-screen bg-black text-white overflow-hidden">
	<Sidebar activeChatID={page.params.slug} />
	<div class="flex-1 flex flex-col overflow-hidden"></div>
</div>
