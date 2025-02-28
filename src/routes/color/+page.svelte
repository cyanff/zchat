<script lang="ts">
	import { getZero } from '$lib/stores/zeroStore';
	import { Query } from 'zero-svelte';

	const z = getZero();
	const t = z.current.query.colors.orderBy('name', 'desc');

	const colors = new Query(t);
</script>

<div class="container mx-auto p-6">
	<h1 class="text-2xl font-bold mb-6">Colors</h1>

	{#each colors.current as color}
		<div>
			{color.name}
		</div>
	{/each}
</div>
