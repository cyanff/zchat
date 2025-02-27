<script lang="ts">
  import { chatStore, type Chat, type ChatMessage } from '$lib/stores/chatStore';
  import MessageInput from './MessageInput.svelte';
  import { onMount, tick, afterUpdate } from 'svelte';
  
  // These need to remain as 'let' because they're reassigned in the subscription
  let activeChat: Chat | null = null;
  let messages: ChatMessage[] = [];
  let chatContainer: HTMLElement;
  let lastMessageRole: 'user' | 'assistant' | null = null;
  let userHasScrolled = false;
  let pendingScrollToMessageId: string | null = null;
  let useSmooth = false;
  let messagesChanged = false;

  onMount(() => {
    // Add scroll event listener to detect manual user scrolling
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer && chatContainer.removeEventListener('scroll', handleScroll);
    }
  });

  // After any update to the component, handle scrolling if needed
  afterUpdate(async () => {
    if (messagesChanged) {
      messagesChanged = false;
      
      if (pendingScrollToMessageId && chatContainer) {
        // Wait for DOM to fully update
        await tick();
        
        const messageElement = document.querySelector(`[data-message-id="${pendingScrollToMessageId}"]`);
        
        if (messageElement) {
          // Get the top of the message element relative to the page
          const messageRect = messageElement.getBoundingClientRect();
          const containerRect = chatContainer.getBoundingClientRect();
          
          // Calculate how far to scroll to get the message at the top
          // with a small padding
          const padding = 20;
          const scrollTo = chatContainer.scrollTop + (messageRect.top - containerRect.top) - padding;
          
          // Do the actual scrolling
          chatContainer.scrollTo({
            top: scrollTo,
            behavior: useSmooth ? 'smooth' : 'auto'
          });
          
          console.log('Scrolling to message:', pendingScrollToMessageId, 'position:', scrollTo);
        } else {
          console.log('Message element not found:', pendingScrollToMessageId);
        }
        
        pendingScrollToMessageId = null;
      }
    }
  });

  const handleScroll = () => {
    // Check if user has manually scrolled up
    if (chatContainer) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      userHasScrolled = !isAtBottom;
    }
  };

  chatStore.subscribe((state) => {
    const currentChat = state.chats.find((chat) => chat.id === state.activeChat);
    const oldMessages = [...messages]; // Copy current messages before updating
    
    activeChat = currentChat || null;
    messages = currentChat?.messages || [];
    
    // Check if messages have changed
    if (JSON.stringify(oldMessages) !== JSON.stringify(messages)) {
      messagesChanged = true;
      
      // If this is a new message and not just an initial load
      if (oldMessages.length > 0 && messages.length > oldMessages.length) {
        const newMessage = messages[messages.length - 1];
        
        // If user sent a message, scroll to it
        if (newMessage.role === 'user') {
          pendingScrollToMessageId = newMessage.id;
          useSmooth = lastMessageRole === 'assistant';
          userHasScrolled = false;
        }
        
        lastMessageRole = newMessage.role;
      }
    }
  });

  function sendMessage(message: string) {
    if (activeChat) {
      // For the welcome and FAQ screens, create a new chat before sending the message
      if (activeChat.id === 'welcome' || activeChat.id === 'faq') {
        const newChatId = chatStore.addChat('New Chat');
        chatStore.addMessage(newChatId, message, 'user');
        
        // Simulate a response after a short delay
        setTimeout(() => {
          const responses = [
            "I'm an AI assistant, here to help you with anything you need!",
            "That's an interesting point. Would you like to explore it further?",
            "I understand what you're asking. Let me think about that for a moment...",
            "Thanks for your message! I'm processing your request.",
            "I appreciate your question. Here's what I think about that topic."
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          
          chatStore.addMessage(
            newChatId,
            randomResponse,
            'assistant'
          );
        }, 1000);
      } else {
        chatStore.addMessage(activeChat.id, message, 'user');
        userHasScrolled = false; // Reset scroll flag on user messages
        
        // Simulate a response after a short delay
        setTimeout(() => {
          if (activeChat) {
            const responses = [
              "I'm an AI assistant, here to help you with anything you need!",
              "That's an interesting point. Would you like to explore it further?",
              "I understand what you're asking. Let me think about that for a moment...",
              "Thanks for your message! I'm processing your request.",
              "I appreciate your question. Here's what I think about that topic."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            // Create a longer response for testing scroll behavior
            const longResponse = activeChat.messages.length % 3 === 0 
              ? randomResponse + "\n\n" + Array(10).fill("This is additional text to make the response longer. ").join("")
              : randomResponse;
            
            chatStore.addMessage(
              activeChat.id,
              longResponse,
              'assistant'
            );
          }
        }, 1000);
      }
    }
  }

  // Function to format timestamp
  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
</script>

<div class="flex flex-col h-full w-full bg-[#121212] text-white overflow-hidden">
  <!-- Header with back button -->
  <div class="flex items-center p-4 border-b border-gray-800">
    <button aria-label="Back" class="text-gray-400 hover:text-white mr-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
      </svg>
    </button>
    {#if activeChat}
      <h2 class="text-lg font-medium">{activeChat.title}</h2>
    {/if}
  </div>

  <!-- Chat content -->
  <div 
    class="flex-1 overflow-y-auto p-4 md:p-8" 
    id="chat-messages" 
    bind:this={chatContainer}
  >
    {#if activeChat?.id === 'welcome'}
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-center">T3 Chat is the best AI Chat ever made.</h1>
        
        <div class="space-y-10">
          <div>
            <h2 class="text-xl font-bold mb-4">1. We're fast.</h2>
            <p class="text-gray-300">We're 2x faster than ChatGPT, 10x faster than DeepSeek. You'll feel the difference - trust me.</p>
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
            <p class="text-gray-300">We're less than half the price of ChatGPT or Claude, and we're MORE generous with limits. You get over 1,500 messages per month!</p>
          </div>
          
          <div class="mt-10">
            <h2 class="text-xl font-bold mb-4">Whatcha waiting for?</h2>
            <p class="text-gray-300">
              Reply here to get started, or click the little "chat" icon up top to make a new chat. Or you can 
              <a href="https://www.google.com" class="text-blue-400 hover:underline">check out the FAQ</a>
            </p>
          </div>
        </div>
      </div>
    {:else if activeChat?.id === 'faq'}
      <div class="max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
        <!-- FAQ content would go here -->
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-bold">How does T3 Chat work?</h2>
            <p class="text-gray-300">T3 Chat connects you to the best AI models with lightning-fast speed and reliability.</p>
          </div>
          <div>
            <h2 class="text-xl font-bold">What models are available?</h2>
            <p class="text-gray-300">We offer Claude, DeepSeek, ChatGPT and more, all in one convenient interface.</p>
          </div>
        </div>
      </div>
    {:else}
      <div class="space-y-6 max-w-3xl mx-auto">
        {#each messages as message}
          <div 
            class="flex flex-col {message.role === 'user' ? 'items-end' : 'items-start'}"
            data-message-id={message.id}
          >
            <div class="px-4 py-3 rounded-2xl max-w-[85%] break-words {message.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-white'}">
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
    <div class="text-center text-xs text-gray-500 mb-4">
      Make sure you agree to our <a href="https://www.google.com" class="text-blue-400">Terms</a> and our <a href="https://www.google.com" class="text-blue-400">Privacy Policy</a>
    </div>
    
    <MessageInput on:sendMessage={(e: CustomEvent<string>) => sendMessage(e.detail)} />
  </div>
</div> 