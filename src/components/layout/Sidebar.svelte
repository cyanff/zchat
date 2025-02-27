<script lang="ts">
	import { writable } from 'svelte/store';
	// import { z } from '$lib/z.svelte';
	// import { Query } from 'zero-svelte';
	import { goto } from '$app/navigation';

	interface Props {
		activeChatID?: string;
	}
	const { activeChatID }: Props = $props();

	const isCollapsed = writable(false);

	// const chats = new Query(z.current.query.chats);

	const chats = { current: [{ id: '1' }, { id: '2' }] };

	// These need to remain as 'let' because they are reassigned in the subscription

	function handleChatClick(id: string) {
		goto(`/chat/${id}`);
	}

	function toggleSidebar() {}
</script>

<aside
	class="flex flex-col h-full {$isCollapsed
		? 'w-[60px]'
		: 'w-[220px]'} bg-[#1a1a1a] border-r border-gray-800 transition-all duration-300"
>
	<div class="p-4 flex items-center justify-between">
		{#if !$isCollapsed}
			<h1 class="text-white font-semibold text-lg">T3 Chat</h1>
		{/if}
		<div class="flex space-x-2 {$isCollapsed ? 'mx-auto' : ''}">
			{#if !$isCollapsed}
				<button aria-label="Search" class="text-gray-400 hover:text-white">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							fill-rule="evenodd"
							d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{/if}
			<button aria-label="New Chat" class="text-gray-400 hover:text-white">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z"
					/>
					<path
						d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z"
					/>
				</svg>
			</button>
		</div>
	</div>

	<div class="flex-1 overflow-y-auto">
		<div class="px-2 space-y-1">
			{#each chats.current as chat}
				<button
					class="w-full text-left px-3 py-2 rounded-md flex items-center space-x-2 {activeChatID ===
					chat.id
						? 'bg-gray-800 text-white'
						: 'text-gray-400 hover:bg-gray-800 hover:text-white'}"
					on:click={() => handleChatClick(chat.id)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5 flex-shrink-0"
					>
						<path
							d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 015 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914z"
						/>
					</svg>
					{#if !$isCollapsed}
						<span class="truncate">{'Chat: ' + chat.id}</span>
					{/if}
				</button>
			{/each}
		</div>
	</div>

	<!-- Footer -->
	<div class="p-4 border-t border-gray-800 flex justify-between items-center">
		{#if !$isCollapsed}
			<button class="text-gray-400 hover:text-white"> Login </button>
		{/if}
		<button
			aria-label="Toggle Sidebar"
			class="text-gray-400 hover:text-white {$isCollapsed ? 'mx-auto' : ''}"
			on:click={toggleSidebar}
		>
			{#if $isCollapsed}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						fill-rule="evenodd"
						d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
						clip-rule="evenodd"
					/>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					class="w-5 h-5"
				>
					<path
						fill-rule="evenodd"
						d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		</button>
	</div>
</aside>
