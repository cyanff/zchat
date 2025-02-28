<script lang="ts">
  // Define interface for component props
  interface $$Props {
    sidebarPinned?: boolean;
  }

  // Placeholder for any future functionality
  let messageText = '';
  let inputFocused = false;
  
  // Accept sidebarPinned prop
  export let sidebarPinned = false;

  function handleSubmit() {
    if (messageText.trim()) {
      // Future implementation for message handling
      messageText = '';
    }
  }

  // Handle input focus
  function handleFocus() {
    inputFocused = true;
  }

  function handleBlur() {
    inputFocused = false;
  }
</script>

<div class="flex flex-col h-screen ">
  <!-- Header -->
  <header class="py-4 px-8 flex justify-between items-center bg-white shadow-sm">
    <div>
      {#if !sidebarPinned}
        <div class="flex items-center gap-2.5 text-lg font-semibold">
          <img src="/zero.png" alt="ZChat Logo" class="h-7 w-auto" />
          <a href="/" class="text-gray-800 font-semibold text-lg tracking-tight hover:text-blue-600 transition-colors">ZChat</a>
        </div>
      {/if}
    </div>
    <div class="flex items-center gap-3">
      <a href="/signin" class="text-sm font-medium py-2 px-4 rounded-lg border border-gray-200 bg-transparent text-gray-600 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-colors inline-flex items-center justify-center">
        Sign in
      </a>
      <a href="/signup" class="text-sm font-medium py-2 px-4 rounded-lg bg-blue-500 border border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600 shadow-sm hover:shadow transition-colors inline-flex items-center justify-center">
        Sign up
      </a>
    </div>
  </header>

  <!-- Main content -->
  <main class="flex-1 flex flex-col items-center">
    <div class="text-center mt-72 mb-8">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight mb-2">Welcome to <span class="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">ZChat</span>.</h1>
      <p class="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">How can I help you today?</p>
    </div>
      
    <!-- Message input (positioned higher) -->
    <div class="w-full px-4 max-w-3xl mx-auto">
      <form on:submit|preventDefault={handleSubmit} class="relative">
        <div class="{inputFocused ? 'border-blue-500 shadow-blue-500/15 shadow-lg' : 'border-gray-200 shadow-sm'} flex items-center relative border rounded-xl bg-white h-[65px] w-full transition-all duration-300">
          <input
            type="text"
            bind:value={messageText}
            on:focus={handleFocus}
            on:blur={handleBlur}
            placeholder="What do you want to know?"
            class="w-full px-6 text-lg outline-none border-none bg-transparent h-full"
          />
          <button
            type="submit"
            class="{messageText.trim().length > 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 bg-blue-50 p-2.5 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-blue-500 hover:text-white"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  </main>

  <!-- Footer -->
  <footer class="text-center py-5 text-sm text-gray-500 bg-white mt-auto">
    <p>Created by cyan & blahaj using the zero-sync engine</p>
  </footer>
</div>
