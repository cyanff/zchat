<!-- <script lang="ts">
	let message = $state('');

</script>
-->

<script lang="ts">
	import { getZero } from '$lib/stores/zeroStore';
	import { nanoid } from 'nanoid';
	import { onMount } from 'svelte';
	import autosize from 'svelte-autosize';

	interface Props {
		chatID: string;
	}
	const { chatID }: Props = $props();

	const z = getZero();
	let input = $state('');

	function isTouchDevice() {
		try {
			document.createEvent('TouchEvent');
			return true;
		} catch (e) {
			return false;
		}
	}

	// TODO:
	// desktop: enter key sends message, shift+enter goes to new line
	// mobile: send button sends message, enter key goes to new line
	//  // Handle key events (e.g., Enter to send)
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}

	const handleSend = () => {
		const userID = z.current.userID;
		const id = nanoid();
		z.current.mutate.messages.insert({
			id,
			chat_id: chatID,
			text: input,
			created_by: userID,
			created_at: Date.now()
		});

		fetch('/api/generate', {
			method: 'POST',
			body: JSON.stringify({
				chat_id: chatID,
				prompt: input
			})
		});

		input = '';

		// wait for dom mutation
		// probably make this an effect in <History/> later
		setTimeout(() => {
			const el = document.getElementById(id);

			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 200);
	};

	let textareaElement: HTMLTextAreaElement;
	onMount(() => {
		// Focus the textarea when the component mounts
		textareaElement.focus();
	});
</script>

<div class="fixed bottom-0 left-0 right-0 w-full px-4 pb-4 pt-2">
	<div class="mx-auto max-w-4xl">
		<div
			class="relative rounded-2xl bg-[#333333] p-3 shadow-sm ring-1 ring-inset ring-white/5 backdrop-blur-sm"
		>
			<!-- Subtle inner glow/border sheen effect -->
			<div
				class="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.07] to-transparent pointer-events-none"
			></div>

			<div class="flex items-end">
				<textarea
					bind:value={input}
					bind:this={textareaElement}
					use:autosize
					onkeydown={handleKeyDown}
					placeholder="Type a message..."
					id="message-input"
					class="min-h-[56px] placeholder:overflow-none placeholder:select-none max-h-96 w-full resize-none bg-transparent py-1 px-2 text-white focus:outline-none scroll-hidden"
					rows="1"
				></textarea>

				{#if input.trim()}
					<button
						type="submit"
						class="ml-2 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#c26d4d] text-white transition-opacity hover:bg-[#d17a56] focus:outline-none"
						aria-label="Send message"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="transform rotate-90"
						>
							<line x1="12" y1="5" x2="12" y2="19"></line>
							<polyline points="19 12 12 19 5 12"></polyline>
						</svg>
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.scroll-hidden::-webkit-scrollbar {
		display: none;
	}

	.scroll-hidden {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	#message-input {
		scrollbar-gutter: stable;
	}
</style>
