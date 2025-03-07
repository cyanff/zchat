<script lang="ts">
	import { page } from '$app/state';
	import Chatbar from '$lib/components/Chatbar.svelte';
	import History from '$lib/components/History.svelte';
	import { Icon } from 'svelte-hero-icons';
	import { ArrowUpOnSquare, PlusCircle } from 'svelte-hero-icons';
	import { getZero } from '$lib/z-store';
	import { toast } from 'svelte-sonner';

	const chatID = $derived(page.params.slug);

	const z = getZero();

	const handleLinkClick = async () => {
		navigator.clipboard.writeText(`${window.location.origin}/share/${chatID}`);
		await z.current.mutate.chats.update({
			id: chatID,
			is_public: true
		});
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
			<a
				href="/"
				class="bg-transparent border-none text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)] w-10 h-10 p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors"
			>
				<Icon src={PlusCircle} size="22" />
			</a>
			<button
				class="bg-transparent border-none text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.1)] w-10 h-10 p-2 rounded-full flex items-center justify-center cursor-pointer transition-colors"
				onclick={handleLinkClick}
			>
				<Icon src={ArrowUpOnSquare} size="22" />
			</button>
		</div>
	</header>

	<div class="flex-1 mt-20">
		<History {chatID} />
	</div>
	<Chatbar {chatID} />
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
