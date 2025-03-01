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

	let inputValue = '';
	let composerComponent: Composer;
	let isSearchModalOpen = $state(false);

	/**
	 * Handles message submission from the Composer component
	 * Logs the message, clears the input, and resets the textarea height
	 *
	 * @param {string} message - The submitted message
	 */
	async function handleSubmit(message: string): Promise<void> {
		console.log('Message submitted:', message);
		inputValue = '';
	}

	/**
	 * Toggles the search modal visibility
	 */
	function toggleSearchModal(): void {
		isSearchModalOpen = !isSearchModalOpen;
	}

	/**
	 * Closes the search modal
	 */
	function closeSearchModal(): void {
		isSearchModalOpen = false;
	}
</script>

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
			<button class="action-button size-10 p-8 rounded-full" on:click={toggleSearchModal} aria-label="Search">
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

<!-- Search Modal -->
<SearchModal isOpen={isSearchModalOpen} onClose={closeSearchModal} />

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
