<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '$components/layout/Sidebar.svelte';
	import MessageInput from '$components/chat/MessageInput.svelte';
	import History from '$components/chat/History.svelte';

	const chatID = $derived(page.params.slug);
</script>

<div class="flex h-screen">
	<Sidebar activeChatID={chatID} />
	<div class="flex-1 flex flex-col">
		<div class="flex-1">
			<History {chatID} />
		</div>
		<MessageInput {chatID} />
	</div>
</div>
