<script lang="ts">
	import MessageInput from './MessageInput.svelte';
	type Message = {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		timestamp: Date;
	};

	type Chat = {
		id: string;
		title: string;
		messages: Message[];
	};

	// Example active chat for demonstration
	let activeChat: Chat | null = {
		id: 'welcome',
		title: 'Welcome',
		messages: []
	};

	// Function to format timestamp
	const formatTime = (date: Date): string => {
		return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	function sendMessage(message: string) {
		// Handle message sending
		console.log('Message sent:', message);
	}
</script>

<div class="flex flex-col h-full w-full bg-[#121212] text-white overflow-hidden">
	<!-- Header with back button -->
	<div class="flex items-center p-4 border-b border-gray-800">
		<button aria-label="Back" class="text-gray-400 hover:text-white mr-2">
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
		</button>
		{#if activeChat}
			<h2 class="text-lg font-medium">{activeChat.title}</h2>
		{/if}
	</div>

	<!-- Chat content -->
	<div class="flex-1 overflow-y-auto p-4 md:p-8" id="chat-messages">
		{#if activeChat?.id === 'welcome'}
			<div class="max-w-3xl mx-auto">
				<h1 class="text-3xl font-bold mb-8 text-center">T3 Chat is the best AI Chat ever made.</h1>

				<div class="space-y-10">
					<div>
						<h2 class="text-xl font-bold mb-4">1. We're fast.</h2>
						<p class="text-gray-300">
							We're 2x faster than ChatGPT, 10x faster than DeepSeek. You'll feel the difference -
							trust me.
						</p>
					</div>

					<div>
						<h2 class="text-xl font-bold mb-4">2. We have every model you could want.</h2>
						<p class="text-gray-300">
							Want to use <span class="text-white">Claude</span> for code? We got you.
							<span class="text-white">DeepSeek r1</span> for math? Of course.
							<span class="text-white">ChatGPT 4o</span> for picture analysis? Why not.
						</p>
					</div>

					<div>
						<h2 class="text-xl font-bold mb-4">3. We're cheap. ($8/month)</h2>
						<p class="text-gray-300">
							We're less than half the price of ChatGPT or Claude, and we're MORE generous with
							limits. You get over 1,500 messages per month!
						</p>
					</div>

					<div class="mt-10">
						<h2 class="text-xl font-bold mb-4">Whatcha waiting for?</h2>
						<p class="text-gray-300">
							Reply here to get started, or click the little "chat" icon up top to make a new chat.
							Or you can
							<a href="https://www.google.com" class="text-blue-400 hover:underline"
								>check out the FAQ</a
							>
						</p>
					</div>
				</div>
			</div>
		{:else if activeChat?.id === 'faq'}
			<div class="max-w-3xl mx-auto">
				<h1 class="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
				<div class="space-y-6">
					<div>
						<h2 class="text-xl font-bold">How does T3 Chat work?</h2>
						<p class="text-gray-300">
							T3 Chat connects you to the best AI models with lightning-fast speed and reliability.
						</p>
					</div>
					<div>
						<h2 class="text-xl font-bold">What models are available?</h2>
						<p class="text-gray-300">
							We offer Claude, DeepSeek, ChatGPT and more, all in one convenient interface.
						</p>
					</div>
				</div>
			</div>
		{:else}
			<div class="space-y-6 max-w-3xl mx-auto">
				{#each activeChat?.messages || [] as message}
					<div class="flex flex-col {message.role === 'user' ? 'items-end' : 'items-start'}">
						<div
							class="px-4 py-3 rounded-2xl max-w-[85%] break-words {message.role === 'user'
								? 'bg-purple-600 text-white'
								: 'bg-gray-800 text-white'}"
						>
							<p class="whitespace-pre-wrap">{message.content}</p>
						</div>
						<div class="text-xs text-gray-500 mt-1 px-2">
							{formatTime(message.timestamp)}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Footer with user agreement and input -->
	<div class="border-t border-gray-800 p-4">
		<MessageInput on:sendMessage={(e: CustomEvent<string>) => sendMessage(e.detail)} />
	</div>
</div>
