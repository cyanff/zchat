<script lang="ts">
  import Typeahead from 'svelte-typeahead';
  import { Icon } from 'svelte-hero-icons';
  import { 
    Pencil, 
    Trash, 
    LockClosed,
    ArrowTopRightOnSquare,
    DocumentText
  } from 'svelte-hero-icons';
  
  // Props
  export let isOpen = false;
  export let onClose = () => {};
  
  // State for typeahead
  let searchValue = '';
  
  // Define chat type for type safety
  interface Chat {
    id: string;
    title: string;
    time: string;
  }
  
  // Mock data for chat history (would be replaced with actual data)
  const mockChats: Chat[] = [
    { id: 'e4-mafia', title: 'E-4 Mafia: Military\'s Unofficial Network', time: 'Today' },
    { id: 'paypal-mafia', title: 'PayPal Mafia: Influence and Ventures', time: '1 minute ago' },
    { id: 'fermat', title: 'Fermat\'s Last Theorem Proof Overview', time: '1 minute ago' },
    { id: 'napier', title: 'John Napier: Inventor of Logarithms', time: '2 minutes ago' },
    { id: 'sarin', title: 'Sarin Gas: History and Legality', time: '2 minutes ago' }
  ];
  
  // Filter chats based on search value
  $: filteredChats = searchValue ? 
    mockChats.filter(chat => 
      chat.title.toLowerCase().includes(searchValue.toLowerCase())
    ) : 
    mockChats;
  
  // Handle selection in typeahead
  function handleSelect(event: CustomEvent<any>): void {
    const selectedItem = event.detail;
    console.log('Selected item:', selectedItem);
    onClose();
  }
  
  // Handle clicks outside to close modal
  function handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      onClose();
    }
  }
  
  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      onClose();
    }
  }
  
  // Custom result formatter for the typeahead component
  function formatResult(result: Chat, _searchTerm: string): string {
    return `
      <div class="flex items-center gap-3 py-1">
        <svg class="w-4 h-4 text-[rgba(255,255,255,0.6)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div class="flex-1 min-w-0">
          <div class="text-white text-sm truncate">${result.title}</div>
          <div class="text-xs text-[rgba(255,255,255,0.5)]">${result.time}</div>
        </div>
      </div>
    `;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div 
    class="modal-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center" 
    on:click={handleClickOutside}
  >
    <div 
      class="modal-content bg-[#1a1a1a] rounded-lg shadow-xl border border-[rgba(255,255,255,0.1)] w-full max-w-[600px] max-h-[90vh] overflow-hidden"
      on:click|stopPropagation
    >
      <!-- Search input -->
      <div class="p-4">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-[rgba(255,255,255,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <Typeahead
            data={mockChats}
            extract={(item: Chat) => item.title}
            placeholder="Search..."
            hideLabel={true}
            inputClassName="w-full bg-[#232323] text-black rounded-lg py-3 pl-10 pr-3 outline-none border border-[rgba(255,255,255,0.1)] focus:border-[rgba(255,255,255,0.3)]"
            resultListClassName="typeahead-results bg-[#232323] text-black border border-[rgba(255,255,255,0.1)] rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg custom-scrollbar z-[1001]"
            resultClassName="px-3 py-2 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors"
            highlightClassName="bg-[rgba(209,122,86,0.3)] text-black px-0.5 rounded-sm font-medium"
            bind:value={searchValue}
            on:select={handleSelect}
            autofocus={true}
            maxItems={10}
            showAllResults={true}
            defaultPointerIndex={0}
            formatResult={formatResult}
          />
        </div>
      </div>
      
      <!-- Results sections -->
      <div class="overflow-y-auto max-h-[70vh] custom-scrollbar">
        <!-- Actions section -->
        <div class="px-4 py-2">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-sm font-medium text-[rgba(255,255,255,0.7)]">Actions</h3>
            <button class="text-xs text-[rgba(255,255,255,0.5)] hover:text-white">Show All</button>
          </div>
          
          <button class="w-full text-left p-3 rounded flex items-center gap-3 hover:bg-[rgba(255,255,255,0.05)]">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[rgba(255,255,255,0.7)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span class="text-white">Create New Temporary Chat</span>
          </button>
        </div>
        
        <!-- Today section -->
        <div class="px-4 py-2 border-t border-[rgba(255,255,255,0.1)]">
          <h3 class="text-sm font-medium text-[rgba(255,255,255,0.7)] mb-2">Today</h3>
          
          <div class="space-y-1">
            {#each filteredChats as chat}
              <div class="flex items-center justify-between p-3 rounded hover:bg-[rgba(255,255,255,0.05)]">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <Icon src={DocumentText} size="16" class="text-[rgba(255,255,255,0.6)] shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p class="text-white truncate">{chat.title}</p>
                    {#if chat.time !== 'Today'}
                      <p class="text-xs text-[rgba(255,255,255,0.5)]">{chat.time}</p>
                    {/if}
                  </div>
                </div>
                
                <div class="flex gap-2 shrink-0">
                  <button class="p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)]" title="Open chat">
                    <Icon src={ArrowTopRightOnSquare} size="16" class="text-[rgba(255,255,255,0.7)]" />
                  </button>
                  <button class="p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)]" title="Edit chat">
                    <Icon src={Pencil} size="16" class="text-[rgba(255,255,255,0.7)]" />
                  </button>
                  <button class="p-1.5 rounded hover:bg-[rgba(255,255,255,0.1)]" title="Delete chat">
                    <Icon src={Trash} size="16" class="text-[rgba(255,255,255,0.7)]" />
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
      
      <!-- Keyboard shortcuts -->
      <div class="p-3 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-end gap-4 text-xs text-[rgba(255,255,255,0.5)]">
        <div class="flex items-center gap-1">
          <span class="bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded">Go</span>
          <span>⏎</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded">Edit</span>
          <span>Ctrl+E</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="bg-[rgba(255,255,255,0.1)] px-1.5 py-0.5 rounded">Delete</span>
          <span>Ctrl+D</span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom scrollbar styling */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  /* Firefox */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.05);
  }

  /* Typeahead specific styles */
  :global(.typeahead-results) {
    z-index: 1000;
    position: absolute;
    width: 100%;
    left: 0;
  }

  :global(.typeahead-results .selected) {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  :global(.typeahead-results .result:focus) {
    outline: none;
  }
</style> 