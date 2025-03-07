<script lang="ts">
	import Message from './Message.svelte';
	import { Query } from 'zero-svelte';
	import { getZero } from '$lib/z-store';

	/**
	 * History component displays the conversation thread between user and assistant
	 * Handles message loading, scrolling, and proper spacing
	 *
	 * @prop {string} chatID - Unique identifier for the current chat thread
	 */
	interface Props {
		chatID: string;
	}
	const { chatID }: Props = $props();
	const z = getZero();

	const messages = $derived(
		new Query(z.current.query.messages.where('chat_id', 'IS', chatID).orderBy('created_at', 'asc'))
	);

	let rootDiv: HTMLElement;

	/**
	 * Gemini / Claude like scroll "wipe" effect.
	 * When the user sends a message, that messsage is scrolled to the top.
	 * We must ensure that there is "content" below the message such that it could be scrolled to top.
	 * Hence, padding.
	 */
	$effect(() => {
		if (messages.current.length > 1) {
			// Wait for DOM to update with the messages
			setTimeout(() => {
				const viewportHeight = document.documentElement.clientHeight;
				const lastMessageId = messages.current[messages.current.length - 1].id;
				const lastMessage = document.getElementById(lastMessageId);

				if (lastMessage && rootDiv) {
					const offset = lastMessage.offsetHeight + 100;
					let padding = '0px';

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

<div class="relative max-w-[760px] mx-auto px-4 py-6" bind:this={rootDiv}>
	{#if messages.current.length !== 0}
		<div class="flex flex-col gap-6">
			{#each messages.current as message, index (message.id)}
				<Message
					id={message.id}
					role={message.is_ai ? 'assistant' : 'user'}
					content={message.text}
					showFooter={index === messages.current.length - 1 && message.is_ai === true}
				/>
			{/each}
		</div>
	{/if}
</div>
