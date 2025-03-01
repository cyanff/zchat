import { preprocessMeltUI, sequence } from '@melt-ui/pp';
import adapter from 'svelte-kit-sst';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'url';
/** @type {import('@sveltejs/kit').Config}*/
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: sequence([vitePreprocess(), preprocessMeltUI()]),
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		alias: {
			$components: fileURLToPath(new URL('./src/components', import.meta.url)),
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	}
};
export default config;
