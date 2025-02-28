<script lang="ts">
	import Message from './Message.svelte';
	import { Query } from 'zero-svelte';
	import { getZero } from '$lib/stores/zeroStore';

	interface Props {
		chatID: string;
	}

	const { chatID }: Props = $props();

	const z = getZero();

	const ms = new Query(z.current.query.messages.where('chat_id', 'IS', chatID));
</script>

<div class="chat-container">
	<div class="chat-messages">
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

<style>
	.chat-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem 1rem 10rem 1rem;

		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
			'Helvetica Neue', sans-serif;
	}

	.chat-messages {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.demo-button {
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		background-color: #4a4a4a;
		color: white;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.demo-button:hover {
		background-color: #333;
	}
</style>
