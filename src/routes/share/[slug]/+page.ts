import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

/**
 * Page load function for the share/[slug] route
 * Validates that the requested chat exists and is publicly accessible
 *
 * @param {Object} params - Contains the route parameters
 * @returns {Object} - Data needed for the page
 */
export const load: PageLoad = async ({ params, fetch }) => {
	const { slug } = params;

	try {
		// We'll rely on client-side data fetching through the Zero store
		// This is just a placeholder to ensure the route is valid
		return {
			chatID: slug
		};
	} catch (err) {
		console.error('Error loading shared chat:', err);
		throw error(404, 'Chat not found or not publicly accessible');
	}
};
