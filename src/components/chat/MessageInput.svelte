<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    sendMessage: string;
  }>();

  let message = '';
  let modelSelection = 'Gemini 2.0 Flash';

  const handleSend = () => {
    if (message.trim()) {
      dispatch('sendMessage', message);
      message = '';
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };
</script>

<div class="flex items-end rounded-lg border border-gray-700 bg-gray-900 overflow-hidden">
  <textarea 
    class="flex-1 resize-none bg-transparent text-white p-3 min-h-[45px] max-h-[200px] focus:outline-none"
    placeholder="Type your message here..."
    bind:value={message}
    on:keydown={handleKeydown}
    rows="1"
  ></textarea>
  
  <div class="flex items-center px-3 py-2 border-l border-gray-700">
    <!-- Model selector dropdown -->
    <div class="flex items-center mr-2 text-gray-400 text-sm">
      <span>{modelSelection}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ml-1">
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
      </svg>
    </div>
    
    <!-- Attachment button -->
    <button aria-label="Attachment" class="text-gray-400 hover:text-white mr-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <!-- Send button -->
    <button 
      aria-label="Send"
      class="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full"
      on:click={handleSend}
      disabled={!message.trim()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
      </svg>
    </button>
  </div>
</div> 