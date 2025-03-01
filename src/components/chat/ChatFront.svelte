<script lang="ts">
	import { Icon } from 'svelte-hero-icons';
	import {
		DocumentText,
		Bolt,
		ChartBar,
		CodeBracket,
		MagnifyingGlass,
		UserCircle
	} from 'svelte-hero-icons';
	import Composer from './Composer.svelte';
	import SearchModal from './SearchModal.svelte';
	import { tick } from 'svelte';
	import { Query } from 'zero-svelte';
	import { nanoid } from 'nanoid';
	import { goto } from '$app/navigation';
	import { getZero } from '$lib/stores/zeroStore';
  import { createDropdownMenu, melt } from '@melt-ui/svelte'
  
  const {
    elements: { menu, item, trigger, arrow }
  } = createDropdownMenu()


	const z = getZero();

	let inputValue = '';
	let composerComponent: Composer;
	let isSearchModalOpen = $state(false);

	/**
	 * Handles message submission from the Composer component
	 * Creates a new chat and its first message in a single atomic transaction
	 * Navigates to the new chat page upon completion
	 *
	 * @param {string} message - The submitted message
	 */
	async function handleSubmit(message: string): Promise<void> {
		console.log('Message submitted:', message);
		inputValue = '';

		const chatID = nanoid();
		const userID = z.current.userID;

		const truncated = message.slice(0, 128);

		await z.current.mutateBatch(async (tx) => {
			tx.chats.insert({
				id: chatID,
				is_public: false,
				title: truncated,
				created_at: Date.now(),
				created_by: userID
			});

			tx.messages.insert({
				id: nanoid(),
				chat_id: chatID,
				text: message,
				created_at: Date.now(),
				created_by: userID
			});
		});

		fetch('/api/generate', {
			method: 'POST',
			body: JSON.stringify({
				chat_id: chatID,
				prompt: message
			})
		});

		goto(`/chat/${chatID}`);
	}
</script>

<div id="content" class={`flex-1 w-full transition-[margin-left] duration-300 ease-in-out`}>
	<div class="app-container">
		<header class="header">
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

			<div class="header-actions">
				<button class="action-button size-10 p-8 rounded-full">
					<Icon src={MagnifyingGlass} size="24" class="m-auto" />
				</button>

				<button class="action-button size-10 p-8 rounded-full">
					<Icon src={UserCircle} size="30" solid class="m-auto" />
				</button>
			</div>
		</header>

		<main class="main-content">
			<h1 class="greeting">Good evening, cyan.</h1>
			<p class="subheading">{`How can I help you today?`}</p>

			<div class="input-container">
				<Composer
					bind:value={inputValue}
					placeholder="What do you want to know?"
					focusOnMount={true}
					onSubmit={handleSubmit}
				/>
			</div>

			<div class="features">
				<button class="feature-button">
					<Icon src={DocumentText} size="20" />
					Research
				</button>
				<button class="feature-button">
					<Icon src={Bolt} size="20" />
					Brainstorm
				</button>
				<button class="feature-button">
					<Icon src={ChartBar} size="20" />
					Analyze Data
				</button>
				<button class="feature-button">
					<Icon src={CodeBracket} size="20" />
					Code
				</button>
			</div>
		</main>
	</div>
</div>

<style>
	.app-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		padding: 0;
		box-sizing: border-box;
		padding: 16px 24px;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.user-avatar {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: #666;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: bold;
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 20px;
		overflow-y: auto;
	}

	.greeting {
		font-size: 2.2rem;
		font-weight: 600;
		margin-bottom: 8px;
		text-align: center;
	}

	.subheading {
		font-size: 1.1rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.5);
		margin-bottom: 40px;
		text-align: center;
	}

	.input-container {
		width: 100%;
		max-width: 760px;
		margin-bottom: 20px;
	}

	.action-button {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		display: flex;
		align-items: center;
		padding: 6px;
	}
	.action-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.features {
		display: flex;
		gap: 10px;
		margin-top: 20px;
		flex-wrap: wrap;
		justify-content: center;
		width: 100%;
		font-size: 16px;
		max-width: 760px;
	}

	.feature-button {
		display: flex;
		font-weight: 500;
		align-items: center;
		gap: 8px;
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: white;
		padding: 8px 16px;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.feature-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}
</style>
