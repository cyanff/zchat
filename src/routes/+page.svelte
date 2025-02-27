<<<<<<< HEAD
<script lang="ts">
	let { data } = $props();
	import { Query } from 'zero-svelte';
	import { z } from '$lib/z.svelte';
	import { nanoid } from 'nanoid';
	const colors = new Query(z.current.query.colors);

	function onclick() {
		const id = nanoid();
		z.current.mutate.colors.insert({
			id,
			name: 'color',
			hex: '#000000',
			red: 0,
			green: 0,
			blue: 0,
			hue: 0,
			sat_hsl: 0,
			light_hsl: 0,
			sat_hsv: 0,
			val_hsv: 0,
			source: 'CRAYOLA'
		});
	}
</script>

<h1>Welcome to Supabase! {data.user}</h1>
<ul>
	{#each colors.current as color}
		<li>{color.name}</li>
	{/each}
</ul>
<button on:click={onclick}>Add Color</button>
||||||| a326e4e
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
=======
<script lang="ts">
  import Sidebar from '../components/layout/Sidebar.svelte';
  import ChatContent from '../components/chat/ChatContent.svelte';
  import HeaderActions from '../components/layout/HeaderActions.svelte';
</script>

<div class="flex h-screen bg-black text-white overflow-hidden">
  <Sidebar />
  <div class="flex-1 flex flex-col overflow-hidden">
    <HeaderActions />
    <div class="flex-1 overflow-hidden">
      <ChatContent />
    </div>
  </div>
</div>
>>>>>>> 24655421d3dcb3f10023fe327854e4b1910edffe
