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
