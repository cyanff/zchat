<script lang="ts">
	import { page } from '$app/state';
	import Sidebar from '$components/layout/Sidebar.svelte';
	import History from '$components/chat/History.svelte';
	import { Icon } from 'svelte-hero-icons';
	import { ArrowUpOnSquare, UserCircle } from 'svelte-hero-icons';
	import { getZero } from '$lib/stores/zeroStore';
	import { toast } from 'svelte-sonner';
	import { Query } from 'zero-svelte';

	/**
	 * Share page displays a read-only view of a chat conversation
	 * Allows public access to shared conversations without editing capabilities
	 *
	 * The slug parameter identifies which chat to display
	 */
	const chatID = $derived(page.params.slug);
	const z = getZero();

	// Query to get chat details
	const chatQuery = $derived(new Query(z.current.query.chats.where('id', 'IS', chatID)));

	// Reactive variable to track if chat exists and is public
	const chatExists = $derived(chatQuery.current.length > 0);
	const isPublic = $derived(chatExists && chatQuery.current[0].is_public);

	/**
	 * Copies the current share link to clipboard
	 * Provides feedback via toast notification
	 */
	const handleCopyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		toast.success('Share link copied to clipboard');
	};
</script>

<div class="flex-1 flex flex-col">
	<header class="header">
		<a href="/" class="flex items-center gap-4 text-lg font-semibold group">
			<img
				src="/zero.png"
				alt="ZChat Logo"
				class="h-8 w-auto invert group-hover:rotate-180 transition duration-300 ease-in-out cursor-pointer"
			/>
			<span class="text-white font-bold display-font text-lg tracking-tight transition-colors">
				ZChat
			</span>
		</a>

		<div class="flex items-center gap-1">
			<!-- Share button to copy link -->
			<button
				class="bg-transparent border-none text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)] w-10 h-10 p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors"
				on:click={handleCopyLink}
				title="Copy share link"
			>
				<Icon src={ArrowUpOnSquare} size="22" />
			</button>

			<button
				class="bg-transparent border-none text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)] w-10 h-10 p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors"
			>
				<Icon src={UserCircle} size="28" solid />
			</button>
		</div>
	</header>

	{#if chatExists && isPublic}
		<div class="flex-1 mt-20">
			<History {chatID} />
		</div>
		<div
			class="px-4 py-3 text-center text-[rgba(255,255,255,0.6)] bg-[rgba(0,0,0,0.2)] border-t border-[rgba(255,255,255,0.1)] font-medium"
		>
			This is a read-only shared conversation
		</div>
	{:else}
		<div class="flex-1 flex flex-col items-center justify-center p-6">
			<div
				class="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg p-8 max-w-md text-center"
			>
				<h2 class="text-xl font-semibold text-white mb-3">Chat not available</h2>
				<p class="text-[rgba(255,255,255,0.7)] mb-6">
					This chat may not exist or is not shared publicly.
				</p>
				<a
					href="/"
					class="inline-flex items-center justify-center px-4 py-2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.15)] text-white rounded-md transition-colors"
				>
					Return to Home
				</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 24px;
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 10;
	}
</style>
