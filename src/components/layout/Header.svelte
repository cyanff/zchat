<script lang="ts">
  let isInfoModalOpen = false;

  function toggleInfoModal() {
    isInfoModalOpen = !isInfoModalOpen;
  }
</script>

<div class="absolute top-4 right-4 z-10">
  <button 
    class="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
    on:click={toggleInfoModal}
  >
    What is T3 Chat?
  </button>

  {#if isInfoModalOpen}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 text-white p-6 rounded-lg max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">About T3 Chat</h2>
          <button aria-label="Close" class="text-gray-400 hover:text-white" on:click={toggleInfoModal}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          <p>T3 Chat is the fastest, most advanced AI chat platform available today.</p>
          <p>With access to multiple leading AI models, lightning-fast response times, and affordable pricing, T3 Chat is the ideal solution for all your AI conversation needs.</p>
          <p>Try it now and experience the difference!</p>
        </div>
      </div>
    </div>
  {/if}
</div> 