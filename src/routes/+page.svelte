<script lang="ts">
	import Sidebar from '../components/layout/Sidebar.svelte';
	import ChatContent from '../components/chat/ChatContent.svelte';
	import HeaderActions from '../components/layout/HeaderActions.svelte';
</script>

<div class="flex h-screen bg-black text-white overflow-hidden">
	<Sidebar />
	<div class="flex-1 flex flex-col overflow-hidden">
		<HeaderActions />
		<div class="flex-1 overflow-hidden">
			<ChatContent />
		</div>
	</div>
</div>
