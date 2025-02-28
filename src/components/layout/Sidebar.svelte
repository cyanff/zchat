<script lang="ts">
	import { getZero } from '$lib/stores/zeroStore';
	import { Query } from 'zero-svelte';

	interface Props {
		activeChatID?: string;
	}
	const { activeChatID }: Props = $props();

	const z = getZero();
	const chats = new Query(z.current.query.chats);

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
					class="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100 cursor-pointer"
				>
					<div
						class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
						</svg>
					</div>
					<div class="flex-1 min-w-0">
						<div class="font-medium text-sm text-gray-800 truncate">{chat.id}</div>
						<!-- <div class="text-xs text-gray-500">{chat.created_at}</div> -->
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
