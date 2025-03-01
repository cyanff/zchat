<script lang="ts">
	/**
	 * SafeHtmlRenderer component
	 *
	 * This component safely renders HTML content by escaping it rather than using the @html directive.
	 * It's used as a custom renderer for svelte-markdown to prevent XSS attacks from user-generated content.
	 *
	 * @prop {string} text - The HTML content to be rendered safely
	 */
	export let text: string;

	// The text is rendered as plain text, which automatically escapes HTML
	// This prevents any HTML tags from being interpreted by the browser
</script>

<!-- Render the HTML content as escaped text -->
{text}
