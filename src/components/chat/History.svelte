<script lang="ts">
	import Message from './Message.svelte';
	import { Query } from 'zero-svelte';
	import { getZero } from '$lib/stores/zeroStore';
	interface Props {
		chatID: string;
	}
	const { chatID }: Props = $props();
	const z = getZero();

	const ms = $derived(
		new Query(z.current.query.messages.where('chat_id', 'IS', chatID).orderBy('created_at', 'asc'))
	);

	let rootDiv: HTMLElement;

	$effect(() => {
		if (ms.current.length > 1) {
			// Wait for DOM to update with the messages
			setTimeout(() => {
				const viewportHeight = document.documentElement.clientHeight;
				const lastMessageId = ms.current[ms.current.length - 1].id;

				const lastMessage = document.getElementById(lastMessageId);

				if (lastMessage && rootDiv) {
					const offset = lastMessage.offsetHeight + 100;

					let padding: any = '0px';
					if (offset > viewportHeight) {
						padding = '180px';
					} else {
						padding = `${viewportHeight - offset}px`;
					}

					rootDiv.style.paddingBottom = padding;
				}
			}, 0);
		}
	});
</script>


<div class="relative max-w-[800px] mx-auto p-4" bind:this={rootDiv}>
	<div class="flex flex-col gap-4">
		{#each ms.current as message, index (message.id)}
			<Message
				id={message.id}
				role={message.is_ai ? 'assistant' : 'user'}
				content={message.text}
				showFooter={false}
			/>
		{/each}
	</div>
</div>
