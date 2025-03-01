<script lang="ts">
	import { onMount, tick } from 'svelte';
	import autosize from 'svelte-autosize';

	/**
	 * Composer component provides a textarea with submit functionality
	 *
	 * @prop {string} value - The current input value
	 * @prop {string} placeholder - Placeholder text for the textarea
	 * @prop {boolean} focusOnMount - Whether to focus the textarea when component mounts
	 * @prop {string} submitLabel - Accessibility label for the submit button
	 * @prop {(message: string) => void} onSubmit - Callback function when message is submitted
	 */
	export let value = '';
	export let placeholder = 'What do you want to know?';
	export let focusOnMount = false;
	export let submitLabel = 'Send message';
	export let onSubmit: (message: string) => void = () => {};

	// Reference to the textarea element for focusing
	let textarea: HTMLTextAreaElement;

	/**
	 * Handles form submission by calling the onSubmit callback with the current value
	 * Only submits if the value is not empty, then resets the textarea height
	 */
	async function handleSubmit(): Promise<void> {
		if (value.trim()) {
			onSubmit(value);
			// Wait for the next tick to ensure value changes have been applied
			// before updating the autosize (important if parent clears the value)
			await tick();
			// Reset the textarea height to its original size
			autosize.update(textarea);
		}
	}

	/**
	 * Handles keyboard shortcuts for message submission and text formatting
	 * Submits on Enter, uses Ctrl+Enter or Cmd+Enter for new line
	 * This reverses the common pattern to prioritize quick sending over formatting
	 *
	 * @param {KeyboardEvent} event - The keyboard event
	 */
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			if (event.ctrlKey || event.metaKey) {
				// Allow new line insertion when modifier keys are pressed
				return;
			} else {
				// Submit on plain Enter key
				event.preventDefault();
				handleSubmit();
			}
		}
	}

	// Focus the textarea on component mount if focusOnMount is true
	onMount(() => {
		if (focusOnMount && textarea) {
			textarea.focus();
		}
	});
</script>

<div class="composer">
	<textarea
		bind:this={textarea}
		bind:value
		class="composer-input min-h-[56px] placeholder:overflow-none placeholder:select-none max-h-96 w-full resize-none bg-transparent py-1 px-2 text-white scroll-hidden"
		{placeholder}
		on:keydown={handleKeydown}
		use:autosize
	></textarea>

	<button
		type="button"
		on:click={handleSubmit}
		class="submit-button ml-2 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:bg-[#d17a56] focus:outline-none"
		aria-label={submitLabel}
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
</div>

<style>
	.composer {
		width: 100%;
		display: flex;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
		background-color: rgba(38, 38, 41, 1);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 16px;
		gap: 4px;
		border-radius: 16px;
		position: relative;
		transition: border-color 0.3s ease;
	}

	.composer:focus-within {
		border-color: rgba(255, 255, 255, 0.3);
	}

	.composer-input {
		width: 100%;
		color: white;
		font-size: 16px;
		outline: none;
	}

	.submit-button {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		display: flex;
		align-items: center;
		padding: 6px;
	}

	.submit-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	/* Hide scrollbar for cleaner UI */
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
