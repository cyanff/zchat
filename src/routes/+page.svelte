<script lang="ts">
	import ChatFront from '../components/chat/ChatFront.svelte';
	import Sidebar from '../components/layout/Sidebar.svelte';
</script>

<div class="flex w-full h-screen relative">
	<Sidebar />
	<div id="content" class={`flex-1 w-full transition-[margin-left] duration-300 ease-in-out`}>
		<ChatFront />
	</div>
</div>

<style>
</style>
