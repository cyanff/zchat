<script lang="ts">
	import { fade } from 'svelte/transition';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';

	interface Props {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		showFooter: boolean;
	}

	const { id, role, content, showFooter = false }: Props = $props();

	function copyContent() {
		navigator.clipboard.writeText(content);
	}

	function retry() {
		console.log('Retry message');
	}
</script>

<div
	{id}
	class="message-container {role === 'user' ? 'flex justify-end' : ''} my-4"
	transition:fade={{ duration: 200 }}
>
	<div
		class="message-content {role === 'user'
			? 'bg-shell rounded-lg p-4 max-w-[80%]'
			: 'max-w-[90%]'}"
	>
		{#if role === 'user'}
			<div class="content text-gray-800">
				{content}
			</div>
		{/if}

		{#if role === 'assistant'}
			<div class="content prose prose-sm dark:prose-invert">
				<SvelteMarkdown source={content} />
			</div>
		{/if}

		{#if showFooter}
			<div class="message-footer mt-2 flex justify-end gap-2 text-xs text-gray-500">
				<button class="hover:text-gray-700 transition-colors" on:click={copyContent}> Copy </button>
				{#if role === 'assistant'}
					<button class="hover:text-gray-700 transition-colors" on:click={retry}> Retry </button>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.bg-shell) {
		background-color: #f5f5f0;
	}

	:global(.prose) {
		max-width: none;
	}

	:global(.prose pre) {
		background-color: #f8f8f8;
		border-radius: 0.375rem;
		padding: 1rem;
		overflow-x: auto;
	}

	:global(.dark .prose pre) {
		background-color: #1e1e1e;
	}

	:global(.prose code) {
		font-size: 0.875em;
	}
</style>
