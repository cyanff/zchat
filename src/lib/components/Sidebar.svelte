<script lang="ts">
	import { getZero } from '$lib/z-store';
	import { Query } from 'zero-svelte';
	import { Icon } from 'svelte-hero-icons';
	import { MagnifyingGlass, PlusCircle, ArrowsRightLeft } from 'svelte-hero-icons';
	import { onMount } from 'svelte';

	interface Props {
		activeChatID?: string;
	}

	const { activeChatID }: Props = $props();
	const SIDEBAR_STATE_KEY = 'sidebar-state';
	const z = getZero();

	// State management for sidebar behavior
	let isExpanded = $state(false);
	let isPinned = $state(false);
	let searchQuery = $state('');
	let isMounted = $state(false);

	const baseQ = z.current.query.chats.where('is_public', 'IS NOT', true);

	/**
	 * Creates a filtered query of chats based on the current search query
	 * - Always filters out public chats (handled by baseQuery)
	 * - When searchQuery is empty, returns all private chats
	 * - When searchQuery has content, filters chats using ILIKE on the title
	 * - Results are always ordered by creation date (newest first)
	 */
	function getFilteredChats() {
		let q = baseQ;

		// Only apply title filter if search query is not empty
		if (searchQuery.trim()) {
			q = q.where('title', 'ILIKE', `%${searchQuery}%`);
		}

		return q.orderBy('created_at', 'desc');
	}

	// Create the chats query
	let chats = $derived(new Query(getFilteredChats()));

	/**
	 * Loads the sidebar state from localStorage if available
	 * Falls back to default values if no saved state exists
	 */
	function loadSidebarState(): void {
		try {
			const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
			if (savedState) {
				const { isPinned: savedIsPinned } = JSON.parse(savedState);
				isPinned = savedIsPinned;
			}
		} catch (error) {
			console.error('Failed to load sidebar state:', error);
		}
	}

	/**
	 * Saves the current sidebar state to localStorage
	 * Only persists the pinned and expanded states, not the search query
	 */
	function saveSidebarState(): void {
		try {
			const stateToSave = {
				isPinned
			};
			localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(stateToSave));
		} catch (error) {
			console.error('Failed to save sidebar state:', error);
		}
	}

	/**
	 * Toggles the pinned state of the sidebar
	 * When pinned, the sidebar remains visible regardless of mouse position
	 * Persists the state change to localStorage
	 */
	function togglePin() {
		isPinned = !isPinned;
		if (isPinned) isExpanded = true;
		saveSidebarState();
	}

	function expandSidebar() {
		if (!isPinned) {
			isExpanded = true;
			saveSidebarState();
		}
	}

	function collapseSidebar() {
		if (!isPinned) {
			isExpanded = false;
			saveSidebarState();
		}
	}

	// Load saved state when component mounts
	onMount(() => {
		// First load the state from localStorage
		loadSidebarState();

		// Set mounted flag after a small delay to ensure DOM is ready
		// This prevents the initial animation from playing
		setTimeout(() => {
			isMounted = true;
		}, 100);
	});
</script>

<!-- Hover trigger area - invisible element that expands sidebar on hover -->
<div
	class="fixed top-0 left-0 h-screen w-[160px] z-[99]"
	role="complementary"
	onmouseenter={expandSidebar}
></div>

<div
	id="sidebar"
	role="navigation"
	class="fixed top-0 left-0 h-screen w-[280px] bg-[#1a1a1a] border-r border-[rgba(255,255,255,0.1)] {isMounted
		? 'transition-all duration-200 ease-in-out'
		: ''} overflow-hidden z-[100] flex flex-col {isExpanded
		? 'translate-x-0 shadow-md shadow-black/30'
		: '-translate-x-full shadow-none'} {isPinned ? 'translate-x-0' : ''}"
	onmouseleave={collapseSidebar}
>
	<div
		class="flex justify-between items-center px-5 py-[18px] border-b border-[rgba(255,255,255,0.1)]"
	>
		<a href="/" class="flex items-center gap-3 text-lg font-semibold group">
			<img
				src="/zero.png"
				alt="ZChat Logo"
				class="h-8 w-auto invert group-hover:rotate-180 transition duration-300 ease-in-out cursor-pointer"
			/>
			<span class="text-white display-font font-bold text-lg tracking-tight transition-colors"
				>ZChat</span
			>
		</a>

		<div class="flex items-center gap-1">
			<a
				href="/"
				aria-label="new chat"
				class="border-none cursor-pointer text-[rgba(255,255,255,0.7)] p-2 rounded-full transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)]"
				title="New chat"
			>
				<Icon src={PlusCircle} size="24" />
			</a>
			<button
				aria-label="pin"
				class="bg-transparent border-none cursor-pointer text-[rgba(255,255,255,0.7)] p-2 rounded-full transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)]"
				onclick={togglePin}
				title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
			>
				<Icon src={ArrowsRightLeft} size="20" class={isPinned ? 'rotate-45 text-[#f52388]' : ''} />
			</button>
		</div>
	</div>

	<div class="p-3 border-b border-[rgba(255,255,255,0.1)]">
		<div
			class="flex items-center bg-[rgba(255,255,255,0.05)] rounded-lg px-3.5 py-2.5 transition-all duration-200 focus-within:bg-[rgba(255,255,255,0.1)] focus-within:border-[rgba(255,255,255,0.3)]"
		>
			<Icon src={MagnifyingGlass} size="20" class="mr-2.5 text-[rgba(255,255,255,0.5)] shrink-0" />
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search chats"
				class="border-none bg-transparent outline-none w-fit text-sm text-white placeholder:text-[rgba(255,255,255,0.5)]"
			/>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto py-2 scroll-hidden">
		<div class="flex justify-between items-center px-5 py-2">
			<h3 class="text-xs font-medium uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
				Recent Chats
			</h3>
			{#if searchQuery.trim()}
				<span class="text-xs text-[#d17a56] font-medium">Filtered</span>
			{/if}
		</div>
		<div class="space-y-0.5 px-2">
			{#each chats.current as chat}
				<a
					href={`/chat/${chat.id}`}
					class="flex items-center px-3 py-3 rounded-md hover:bg-[rgba(255,255,255,0.05)] cursor-pointer {activeChatID ===
					chat.id
						? 'bg-[rgba(255,255,255,0.1)]'
						: ''}"
				>
					<div class="flex-1 min-w-0">
						<div class="font-medium text-sm text-white truncate">{chat.title}</div>
					</div>
				</a>
			{:else}
				<!-- Show when no chats match the search query -->
				<div class="px-3 py-4 text-center">
					<p class="text-sm text-[rgba(255,255,255,0.5)]">
						{searchQuery.trim() ? `No chats matching "${searchQuery}"` : 'No chats found'}
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>
