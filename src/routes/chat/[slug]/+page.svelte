<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '$components/layout/Sidebar.svelte';
	import MessageInput from '$components/chat/MessageInput.svelte';
	import History from '$components/chat/History.svelte';
</script>

<div class="flex h-screen">
	<Sidebar activeChatID={page.params.slug} />
	<div class="flex-1 flex flex-col">
		<div class="flex-1 overflow-y-auto">
			<History chatID={page.params.slug} />
		</div>
		<MessageInput chatID={page.params.slug} />
	</div>
</div>
