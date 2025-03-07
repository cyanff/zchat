<script lang="ts">
	import { getZero } from '$lib/z-store';
	import { nanoid } from 'nanoid';
	import Composer from './Composer.svelte';

	interface Props {
		chatID: string;
	}
	const { chatID }: Props = $props();

	const z = getZero();
	let input = $state('');

	/**
	 * Handles sending a message
	 * - Creates a unique ID for the message
	 * - Inserts the message into the store
	 * - Triggers the AI generation API
	 * - Scrolls to the newly created message
	 */
	const handleSend = (message: string) => {
		const userID = z.current.userID;
		const id = nanoid();

		z.current.mutate.messages.insert({
			id,
			chat_id: chatID,
			text: message,
			created_by: userID,
			created_at: Date.now()
		});

		fetch('/api/generate', {
			method: 'POST',
			body: JSON.stringify({
				chat_id: chatID,
				prompt: message
			})
		});

		input = '';

		// Scroll to the newly created message
		setTimeout(() => {
			const el = document.getElementById(id);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 200);
	};
</script>

<div class="fixed bottom-0 left-0 right-0 w-full px-4 pb-4 pt-2">
	<div class="mx-auto max-w-2xl">
		<Composer
			bind:value={input}
			placeholder="Type a message..."
			focusOnMount={true}
			submitLabel="Send message"
			onSubmit={handleSend}
		/>
	</div>
</div>

<style>
</style>
