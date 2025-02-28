<script lang="ts">
	import ChatFront from '../components/chat/ChatFront.svelte';
	import Sidebar from '../components/layout/Sidebar.svelte';
	import { onMount } from 'svelte';
	
	let contentShifted = false;
	
	onMount(() => {
		// Listen for pin state changes from the sidebar
		document.addEventListener('pinChange', (e: any) => {
			contentShifted = e.detail.isPinned;
		});
	});
</script>

<div class="app-container">
	<Sidebar />
	<div id="content" class="content" class:shifted={contentShifted}>
		<ChatFront sidebarPinned={contentShifted} />
	</div>
</div>

<style>
	.app-container {
		display: flex;
		width: 100%;
		height: 100vh;
		position: relative;
	}
	
	.content {
		flex: 1;
		width: 100%;
		/* No default margin to allow content to be full width by default */
		margin-left: 0;
		transition: margin-left 0.3s ease;
	}
	
	/* Only shift content when sidebar is explicitly pinned */
	.content.shifted {
		margin-left: 250px;
	}
</style>
