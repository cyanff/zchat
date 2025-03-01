<script lang="ts">
	import Message from './Message.svelte';
	import { Query } from 'zero-svelte';
	import { getZero } from '$lib/stores/zeroStore';

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

	// Query messages for the current chat, ordered chronologically
	const ms = $derived(
		new Query(z.current.query.messages.where('chat_id', 'IS', chatID).orderBy('created_at', 'asc'))
	);

	let rootDiv: HTMLElement;

	/**
	 * Ensures proper spacing at the bottom of the chat history
	 * Maintains visual balance when scrolling through conversation
	 * Prevents last message from being too close to the composer
	 */
	$effect(() => {
		if (ms.current.length > 1) {
			// Wait for DOM to update with the messages
			setTimeout(() => {
				const viewportHeight = document.documentElement.clientHeight;
				const lastMessageId = ms.current[ms.current.length - 1].id;
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

<div class="chat-history relative max-w-[760px] mx-auto px-4 py-6" bind:this={rootDiv}>
	{#if ms.current.length === 0}
		<div class="empty-state flex flex-col items-center justify-center py-12 text-center">
			<p class="text-gray-400 text-lg mb-2">No messages yet</p>
			<p class="text-gray-500 text-sm">Start a conversation to see messages here</p>
		</div>
	{:else}
		<div class="messages-container flex flex-col gap-6">
			{#each ms.current as message, index (message.id)}
				<Message
					id={message.id}
					role={message.is_ai ? 'assistant' : 'user'}
					content={message.text}
					showFooter={index === ms.current.length - 1 && message.is_ai === true}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.chat-history {
		/* Ensures smooth scrolling behavior */
		scroll-behavior: smooth;
	}

	.empty-state {
		min-height: 200px;
		border-radius: 12px;
		background-color: rgba(255, 255, 255, 0.03);
		border: 1px dashed rgba(255, 255, 255, 0.1);
	}
</style>
