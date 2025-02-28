<script lang="ts">
	import Sidebar from '../components/layout/Sidebar.svelte';
	const { data } = $props();
</script>

<!-- <Header /> -->
<!-- <div class="flex-1 overflow-hidden">
	<ChatContent />
</div> -->

<div class="flex h-screen bg-black text-white overflow-hidden">
	<Sidebar userID={data.user} />
	<div class="flex-1 flex flex-col overflow-hidden">
		Welcome {data.user}
	</div>
</div>
