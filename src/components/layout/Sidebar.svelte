<script lang="ts">
	import { getZero } from '$lib/stores/zeroStore';
	import { Query } from 'zero-svelte';
	import { Icon } from 'svelte-hero-icons';
	import { DocumentText, MagnifyingGlass, PlusCircle, ArrowsRightLeft } from 'svelte-hero-icons';

	interface Props {
		activeChatID?: string;
	}

	// The active chat should be highlighted in the sidebar
	const { activeChatID }: Props = $props();

	const z = getZero();
	const chats = new Query(
		z.current.query.chats.where('is_public', 'IS NOT', true).orderBy('created_at', 'desc')
	);

	// State management for sidebar behavior
	let isExpanded = $state(false);
	let isPinned = $state(false);
	let searchQuery = $state('');

	/**
	 * Toggles the pinned state of the sidebar
	 * When pinned, the sidebar remains visible regardless of mouse position
	 */
	function togglePin() {
		isPinned = !isPinned;
		if (isPinned) {
			isExpanded = true;
		}

		// Notify parent components about pin state changes
		const event = new CustomEvent('pinChange', { detail: { isPinned } });
		document.dispatchEvent(event);
	}

	/**
	 * Expands the sidebar when mouse enters the trigger area
	 * Only takes effect when sidebar is not pinned
	 */
	function expandSidebar() {
		if (!isPinned) {
			isExpanded = true;
		}
	}

	/**
	 * Collapses the sidebar when mouse leaves
	 * Only takes effect when sidebar is not pinned
	 */
	function collapseSidebar() {
		if (!isPinned) {
			isExpanded = false;
		}
	}

	/**
	 * Handles search input changes
	 * Currently logs the search query for future implementation
	 */
	function handleSearch() {
		console.log('Searching for:', searchQuery);
	}
</script>

<!-- Hover trigger area - invisible element that expands sidebar on hover -->
<div
	class="fixed top-0 left-0 h-screen w-[40px] z-[99]"
	role="complementary"
	on:mouseenter={expandSidebar}
></div>

<div
	id="sidebar"
	role="navigation"
	class="fixed top-0 left-0 h-screen w-[280px] bg-[#1a1a1a] border-r border-[rgba(255,255,255,0.1)] transition-all duration-300 ease-in-out overflow-hidden z-[100] flex flex-col {isExpanded
		? 'translate-x-0 shadow-lg shadow-black/30'
		: '-translate-x-full shadow-none'} {isPinned ? 'translate-x-0' : ''}"
	on:mouseleave={collapseSidebar}
>
	<div
		class="flex justify-between items-center px-5 py-[18px] border-b border-[rgba(255,255,255,0.1)]"
	>
		<a href="/" class="flex items-center gap-4 text-lg font-semibold group">
			<img
				src="/zero.png"
				alt="ZChat Logo"
				class="h-8 w-auto invert group-hover:rotate-180 transition duration-300 ease-in-out cursor-pointer"
			/>
			<span class="text-white font-semibold mt-2 text-lg tracking-tight transition-colors"
				>ZChat</span
			>
		</a>

		<div class="flex items-center gap-2">
			<button
				aria-label="new chat"
				class="border-none cursor-pointer text-[rgba(255,255,255,0.7)] p-2 rounded-full transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)]"
				title="New chat"
			>
				<Icon src={PlusCircle} size="24" />
			</button>
			<button
				aria-label="pin"
				class="bg-transparent border-none cursor-pointer text-[rgba(255,255,255,0.7)] p-2 rounded-full transition-all duration-200 hover:bg-[rgba(255,255,255,0.1)]"
				on:click={togglePin}
				title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
			>
				<Icon src={ArrowsRightLeft} size="20" class={isPinned ? 'rotate-45 text-[#d17a56]' : ''} />
			</button>
		</div>
	</div>

	<div class="p-5 border-b border-[rgba(255,255,255,0.1)]">
		<div
			class="flex items-center bg-[rgba(255,255,255,0.05)] rounded-lg px-3.5 py-2.5 transition-all duration-200 focus-within:bg-[rgba(255,255,255,0.1)] focus-within:border-[rgba(255,255,255,0.3)]"
		>
			<Icon src={MagnifyingGlass} size="16" class="mr-2.5 text-[rgba(255,255,255,0.5)]" />
			<input
				type="text"
				bind:value={searchQuery}
				on:input={handleSearch}
				placeholder="Search chats"
				class="border-none bg-transparent outline-none w-full text-sm text-white placeholder:text-[rgba(255,255,255,0.5)]"
			/>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto py-2 scroll-hidden">
		<h3 class="px-5 py-2 text-xs font-medium uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
			Recent Chats
		</h3>
		<div class="space-y-0.5 px-2">
			{#each chats.current as chat}
				<a
					href={`/chat/${chat.id}`}
					class="flex items-center px-3 py-3 rounded-md hover:bg-[rgba(255,255,255,0.05)] cursor-pointer {activeChatID ===
					chat.id
						? 'bg-[rgba(255,255,255,0.1)]'
						: ''}"
				>
					<Icon src={DocumentText} size="16" class="mr-2.5 text-[rgba(255,255,255,0.7)]" />
					<div class="flex-1 min-w-0">
						<div class="font-medium text-sm text-white truncate">{chat.id}</div>
						<!-- <div class="text-xs text-[rgba(255,255,255,0.5)]">{new Date(chat.created_at).toLocaleDateString()}</div> -->
					</div>
				</a>
			{/each}
		</div>
	</div>

	<!-- Add a style for the scrollbar to match the ChatFront component -->
	<style>
		/* Hide scrollbar for clean UI while maintaining functionality */
		.scroll-hidden::-webkit-scrollbar {
			display: none;
		}

		.scroll-hidden {
			-ms-overflow-style: none;
			scrollbar-width: none;
		}
	</style>
</div>
