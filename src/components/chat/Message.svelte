<script lang="ts">
	import { fade } from 'svelte/transition';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import ImageRenderer from './ImageRenderer.svelte';
	import { Icon } from 'svelte-hero-icons';
	import { ClipboardDocument, ArrowPath } from 'svelte-hero-icons';
	import { toast } from 'svelte-sonner';
	/**
	 * Message component displays individual chat messages with appropriate styling
	 * based on whether they're from the user or assistant.
	 *
	 * @prop {string} id - Unique identifier for the message
	 * @prop {'user' | 'assistant'} role - Determines message styling and position
	 * @prop {string} content - The message text content
	 * @prop {boolean} showFooter - Whether to show action buttons (copy/retry)
	 */
	interface Props {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		showFooter: boolean;
	}

	const { id, role, content, showFooter = false }: Props = $props();

	/**
	 * Copies the message content to clipboard
	 * Provides a seamless way for users to extract information
	 */
	function copyContent() {
		navigator.clipboard.writeText(content);
		toast.success('Copied to clipboard!');
	}
</script>

<div
	{id}
	class="message-container {role === 'user' ? 'flex justify-end' : ''} my-4"
	transition:fade={{ duration: 200 }}
>
	<div
		class="message-content {role === 'user'
			? 'bg-user-message rounded-lg p-4 max-w-[80%]'
			: 'max-w-[90%]'}"
	>
		{#if role === 'user'}
			<div class="content text-white font-medium">
				{content}
			</div>
		{/if}

		{#if role === 'assistant'}
			<div class="content prose markdown-content">
				<SvelteMarkdown source={content} />
			</div>
		{/if}

		{#if showFooter && content.length > 0}
			<div class="message-footer mt-4 flex justify-start -mx-2.5">
				<button class="footer-button rounded-full" title="Copy to clipboard" on:click={copyContent}>
					<Icon src={ClipboardDocument} size="20" solid />
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	/* User message styling to match the dark theme */
	:global(.bg-user-message) {
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Footer button styling to match the image design */
	.footer-button {
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.6);
		background-color: transparent;
		border: none;
		width: 32px;
		height: 32px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.footer-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.9);

		border-radius: 50%;
	}

	/* Scoped styles for markdown content */
	/* Scoped styles for markdown content */
	.markdown-content :global(.prose) {
		max-width: none;
		color: rgba(255, 255, 255, 0.9);
	}

	.markdown-content :global(pre) {
		background-color: rgba(40, 43, 48, 0.8) !important;
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.markdown-content :global(strong) {
		color: white;
	}

	.markdown-content :global(img) {
		width: 100%;
		height: auto;
		border-radius: 10px;
	}

	.markdown-content :global(code) {
		font-size: 0.875em;
		color: #e2e2e2;
	}

	/* Enhanced typography for markdown content */
	.markdown-content :global(h1),
	.markdown-content :global(h2),
	.markdown-content :global(h3),
	.markdown-content :global(h4),
	.markdown-content :global(h5),
	.markdown-content :global(h6) {
		font-weight: 600;
		letter-spacing: -0.025em;
		color: white;
		margin-top: 1.5em;
		margin-bottom: 0.5em;
	}

	.markdown-content :global(p) {
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.6;
		margin-bottom: 1em;
	}

	/* Better link styling within markdown content */
	.markdown-content :global(a) {
		color: #3b82f6;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.markdown-content :global(a:hover) {
		color: #60a5fa;
		text-decoration: underline;
	}

	.markdown-content :global(td) {
		color: white;
		font-style: normal;
	}

	/* List styling */
	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		color: rgba(255, 255, 255, 0.8);
		padding-left: 1.5em;
		margin-bottom: 1em;
	}

	.markdown-content :global(li) {
		margin-bottom: 0.5em;
	}

	/* Table styling */
	.markdown-content :global(table) {
		border-collapse: collapse;
		width: 100%;
		margin-bottom: 1em;
	}

	.markdown-content :global(th),
	.markdown-content :global(td) {
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.5em;
		text-align: left;
	}

	.markdown-content :global(th) {
		background-color: rgba(255, 255, 255, 0.05);
		color: white;
	}
</style>
