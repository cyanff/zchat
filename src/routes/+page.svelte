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
	import Composer from '$components/chat/Composer.svelte';
	import { tick } from 'svelte';
	import { nanoid } from 'nanoid';
	import { goto } from '$app/navigation';
	import { getZero } from '$lib/stores/zeroStore';
	import { createDropdownMenu, melt } from '@melt-ui/svelte';
	import { fly } from 'svelte/transition';
	import Cookies from 'js-cookie';

	const z = getZero();

	const { data } = $props();

	let inputValue = $state('');

	// Get the username from server data instead of client-side query
	const username = data.username;

	const isSignedIn = $derived(z.current.userID !== 'anon');

	/**
	 * Determines the appropriate greeting based on the current time of day
	 * Creates a more personalized user experience
	 *
	 * @returns {string} Time-appropriate greeting (Good morning/afternoon/evening)
	 */
	function getTimeBasedGreeting(): string {
		const hour = new Date().getHours();

		if (hour < 12) {
			return 'Good morning';
		} else if (hour < 18) {
			return 'Good afternoon';
		} else {
			return 'Good evening';
		}
	}

	// Create the dropdown menu for the profile button
	const {
		elements: { trigger, menu, item, arrow },
		states: { open }
	} = createDropdownMenu({
		forceVisible: true,
		loop: true,
		positioning: {
			placement: 'bottom-end',
			gutter: 5
		}
	});

	/**
	 * Handles user login by redirecting to the auth page
	 * Provides entry point to authentication flow
	 */
	function handleLogin(): void {
		goto('/auth');
	}

	/**
	 * Handles user signout by clearing the JWT cookie
	 * Removes authentication state and resets to anonymous user
	 * Refreshes the page to apply changes immediately
	 */
	function handleSignout(): void {
		Cookies.remove('jwt', { path: '/' });
		Cookies.remove('sb-127-auth-token', { path: '/' });
		window.location.reload();
	}

	/**
	 * Handles message submission from the Composer component
	 * Creates a new chat and its first message in a single atomic transaction
	 * Navigates to the new chat page upon completion
	 *
	 * @param {string} message - The submitted message
	 */
	async function handleSubmit(message: string): Promise<void> {
		console.log('Message submitted ::', message);
		inputValue = '';

		const chatID = nanoid();
		const userID = z.current.userID;
		if (userID === 'anon') {
			goto('/auth');
			return;
		}

		const truncated = message.slice(0, 128);

		z.current.mutateBatch(async (tx) => {
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
		goto(`/chat/${chatID}`);

		setTimeout(() => {
			fetch('/api/generate', {
				method: 'POST',
				body: JSON.stringify({
					chat_id: chatID,
					prompt: message
				})
			});
		}, 300);
	}

	/**
	 * Collection of example prompts organized by category
	 * Provides users with inspiration and demonstrates capabilities
	 * Each category contains multiple examples to showcase variety
	 */
	const examplePrompts = {
		research: [
			'Explain the current state of quantum computing and its potential applications in cryptography.',
			'What are the environmental impacts of electric vehicles compared to traditional combustion engines?',
			'Summarize the latest research on intermittent fasting and its effects on longevity.',
			'What are the main theories about dark matter and how scientists are trying to detect it?',
			'Compare and contrast different approaches to artificial general intelligence.'
		],
		brainstorm: [
			'Help me brainstorm creative marketing ideas for a sustainable clothing brand.',
			'What are some unique app ideas that could help people reduce their carbon footprint?',
			'Generate 10 potential names for a science fiction novel about time travel.',
			'Brainstorm innovative solutions for reducing food waste in restaurants.',
			'What are some unconventional ways to improve employee engagement in remote teams?'
		],
		analyzeData: [
			'How would you approach analyzing customer churn data to identify key factors?',
			'What visualization techniques would be most effective for showing the correlation between income and education?',
			'Explain how to use clustering algorithms to segment customers based on purchasing behavior.',
			'What statistical methods would you recommend for analyzing the effectiveness of a new teaching method?',
			'How can I interpret this confusion matrix for my machine learning model?'
		],
		code: [
			'Write a Python function that finds the longest palindromic substring in a given string.',
			'Create a React component that implements a responsive image carousel with lazy loading.',
			"How would you optimize this database query that's running slowly: SELECT * FROM users JOIN orders ON users.id = orders.user_id WHERE orders.status = 'pending';",
			'Write a TypeScript utility type that makes all nested properties of an object optional.',
			'Implement a simple rate limiter middleware for an Express.js application.'
		]
	};

	/**
	 * Selects a random example prompt from the specified category
	 * Provides variety and inspiration for users
	 *
	 * @param {keyof typeof examplePrompts} category - The category to select from
	 * @returns {string} A randomly selected prompt from the category
	 */
	function getRandomPrompt(category: keyof typeof examplePrompts): string {
		const prompts = examplePrompts[category];
		const randomIndex = Math.floor(Math.random() * prompts.length);
		return prompts[randomIndex];
	}

	/**
	 * Sets the input value to a random example from the specified category
	 * Focuses the composer to encourage immediate interaction
	 *
	 * @param {keyof typeof examplePrompts} category - The category to get an example from
	 */
	async function setExamplePrompt(category: keyof typeof examplePrompts): Promise<void> {
		inputValue = getRandomPrompt(category);
		// Wait for the DOM to update with the new value
		await tick();
		// Focus the composer textarea to encourage immediate interaction
		const textareaElement = document.querySelector('.composer-input') as HTMLTextAreaElement;
		if (textareaElement) {
			textareaElement.focus();
		}
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
				<span class="text-white font-bold text-lg tracking-tight transition-colors display-font"
					>ZChat</span
				>
			</a>

			<div class="header-actions">
				<button class="action-button size-10 p-8 rounded-full" use:melt={$trigger}>
					<Icon src={UserCircle} size="30" solid class="m-auto" />
				</button>

				{#if $open}
					<div
						class="dropdown-menu"
						use:melt={$menu}
						transition:fly={{ duration: 100, opacity: 0 }}
					>
						{#if !isSignedIn}
							<div class="dropdown-item" use:melt={$item} on:click={handleLogin}>Login</div>
						{:else}
							<div class="dropdown-item" use:melt={$item} on:click={handleSignout}>Sign Out</div>
						{/if}
						<div use:melt={$arrow} class="dropdown-arrow" />
					</div>
				{/if}
			</div>
		</header>

		<main class="main-content">
			<h1 class="greeting display-font">
				{getTimeBasedGreeting()}, {username ? username.substring(0, 7) : 'anon'}.
			</h1>
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
				<button class="feature-button" on:click={() => setExamplePrompt('research')}>
					<Icon src={DocumentText} size="20" />
					Research
				</button>
				<button class="feature-button" on:click={() => setExamplePrompt('brainstorm')}>
					<Icon src={Bolt} size="20" />
					Brainstorm
				</button>
				<button class="feature-button" on:click={() => setExamplePrompt('analyzeData')}>
					<Icon src={ChartBar} size="20" />
					Analyze Data
				</button>
				<button class="feature-button" on:click={() => setExamplePrompt('code')}>
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
		position: relative;
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
		font-size: 2.5rem;
		font-weight: 600;
		margin-bottom: 8px;
		text-align: center;
		color: white;
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
		transition: all 0.2s ease;
	}

	.feature-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-2px);
	}

	.feature-button:active {
		transform: translateY(0);
	}

	/* Dropdown menu styles */
	.dropdown-menu {
		position: absolute;
		z-index: 40;
		min-width: 180px;
		display: flex;
		flex-direction: column;
		background-color: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
		padding: 8px 0;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
		transform-origin: top right;
	}

	.dropdown-arrow {
		fill: white;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		padding: 10px 16px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
	}

	.dropdown-item:hover,
	.dropdown-item[data-highlighted] {
		background-color: rgba(0, 0, 0, 0.05);
	}
</style>
