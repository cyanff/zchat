<script lang="ts">
	// Import the necessary from Svelte
	import { onMount, setContext } from 'svelte';

	// This component will receive the error from SvelteKit's error handler
	export let error = null;

	// Function to safely stringify the error object with circular references
	function getCircularReplacer() {
		const seen = new WeakSet();
		return (key: string, value: any) => {
			if (typeof value === 'object' && value !== null) {
				if (seen.has(value)) {
					return '[Circular Reference]';
				}
				seen.add(value);
			}
			return value;
		};
	}

	// Process the error object
	let errorMessage = '';
	let errorStack = '';
	let errorJSON = '';

	// Update error details whenever the error prop changes
	$: if (error) {
		try {
			// Handle different error formats
			if (typeof error === 'string') {
				errorMessage = error;
				errorStack = '';
			} else {
				// For SvelteKit errors or standard Error objects
				errorMessage = (error as Error).message || (error as any).error?.message || String(error);
				errorStack = (error as Error).stack || (error as any).error?.stack || '';
			}

			// Create detailed error JSON
			errorJSON = JSON.stringify(error, getCircularReplacer(), 2);
		} catch (e) {
			errorJSON = `Error stringifying error: ${JSON.stringify(e)}`;
		}
	}
</script>

<svelte:head>
	<title>Error: {errorMessage || 'An error occurred'}</title>
</svelte:head>

<div class="error-container">
	<h1>Application Error</h1>

	{#if error}
		<div class="error-message">
			<h2>Error Message</h2>
			<p>{errorMessage}</p>
		</div>

		{#if errorStack}
			<div class="stack-trace">
				<h2>Stack Trace</h2>
				<pre>{errorStack}</pre>
			</div>
		{/if}

		<div class="error-details">
			<h2>Complete Error Object</h2>
			<pre>{errorJSON}</pre>
		</div>

		<div class="actions">
			<button on:click={() => window.location.reload()}>Reload Page</button>
			<button on:click={() => (window.location.href = '/')}>Go to Home</button>
		</div>
	{:else}
		<p>No error information available.</p>
	{/if}
</div>

<style>
	.error-container {
		font-family: monospace;
		padding: 1rem;
		max-width: 100%;
		margin: 0 auto;
	}

	h1 {
		color: #e74c3c;
	}

	h2 {
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
		font-size: 1.2rem;
	}

	pre {
		background-color: #f8f8f8;
		padding: 1rem;
		overflow-x: auto;
		white-space: pre-wrap;
		word-break: break-all;
		border-left: 4px solid #e74c3c;
		max-height: 400px;
		overflow-y: auto;
	}

	.error-message p {
		color: #e74c3c;
		font-weight: bold;
	}

	.actions {
		margin-top: 2rem;
		display: flex;
		gap: 1rem;
	}

	button {
		padding: 0.5rem 1rem;
		background-color: #f8f8f8;
		border: 1px solid #ddd;
		cursor: pointer;
	}

	button:hover {
		background-color: #eee;
	}
</style>
