<script lang="ts">
	import { getZero } from '$lib/stores/zeroStore';
	import { Query } from 'zero-svelte';

	interface Props {
		activeChatID?: string;
	}

	// TODO: active chat should be highlighted
	const { activeChatID }: Props = $props();

	const z = getZero();
	const chats = new Query(
		z.current.query.chats.where('is_public', 'IS NOT', true).orderBy('created_at', 'desc')
	);

	// State management
	let isExpanded = $state(false);
	let isPinned = $state(false);
	let searchQuery = $state('');

	// Function to handle pinning/unpinning the sidebar
	function togglePin() {
		isPinned = !isPinned;
		if (isPinned) {
			isExpanded = true;
		}

		// Dispatch event to notify parent component of pin state change
		const event = new CustomEvent('pinChange', { detail: { isPinned } });
		document.dispatchEvent(event);
	}

	// Handle mouse enter/leave for expanding/collapsing
	function expandSidebar() {
		if (!isPinned) {
			isExpanded = true;
		}
	}

	function collapseSidebar() {
		if (!isPinned) {
			isExpanded = false;
		}
	}

	// Handle search input
	function handleSearch() {
		// Future functionality for search
		console.log('Searching for:', searchQuery);
	}
</script>

<!-- Hover trigger area -->
<div
	class="fixed top-0 left-0 h-screen w-[15px] z-[99]"
	role="complementary"
	on:mouseenter={expandSidebar}
></div>

<!-- TODO: use transform instead of of translate, smoother anims -->
<div
	id="sidebar"
	role="navigation"
	class="fixed top-0 left-0 h-screen w-[280px] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden z-[100] flex flex-col {isExpanded
		? 'translate-x-0 shadow-md'
		: '-translate-x-full shadow-none'} {isPinned ? 'translate-x-0' : ''}"
	on:mouseleave={collapseSidebar}
>
	<div class="flex justify-between items-center px-5 py-[18px] border-b border-gray-200 bg-white">
		<div class="flex items-center gap-2.5 text-lg font-semibold">
			<img src="/zero.png" alt="ZChat Logo" class="h-7 w-auto" />
			<a
				href="/"
				class="text-gray-800 font-semibold text-lg tracking-tight hover:text-blue-600 transition-colors"
				>ZChat</a
			>
		</div>

		<div class="flex items-center gap-2">
			<button
				aria-label="new chat"
				class="border-none cursor-pointer text-gray-600 p-2 rounded-md transition-all duration-200 hover:bg-gray-200"
				title="New chat"
			>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
				<path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
				<path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
			  </svg>
			  
			</button>
			<button
				aria-label="pin"
				class="bg-transparent border-none cursor-pointer text-gray-600 p-1.5 rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-blue-500"
				on:click={togglePin}
				title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class={isPinned ? 'rotate-45 text-blue-500' : ''}
				>
					<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
				</svg>
			</button>
		</div>
	</div>

	<div class="p-5 border-b border-gray-200 bg-white">
		<div
			class="flex items-center bg-gray-100 rounded-lg px-3.5 py-2.5 transition-all duration-200 focus-within:bg-white focus-within:shadow-sm focus-within:shadow-gray-200"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="mr-2.5 text-gray-500"
			>
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				on:input={handleSearch}
				placeholder="Search chats"
				class="border-none bg-transparent outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
			/>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto py-2 bg-white">
		<h3 class="px-5 py-2 text-xs font-medium uppercase tracking-wider text-gray-500">
			Recent Chats
		</h3>
		<div class="space-y-0.5 px-2">
			{#each chats.current as chat}
				<a
					href={`/chat/${chat.id}`}
					class="flex items-center px-3 py-3 rounded-md hover:bg-gray-100 cursor-pointer"
				>
					<div class="flex-1 min-w-0">
						<div class="font-medium text-sm text-gray-800 truncate">{chat.id}</div>
						<!-- <div class="text-xs text-gray-500">{chat.created_at}</div> -->
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
