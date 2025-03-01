import type { RequestHandler } from '@sveltejs/kit';
import { OPENROUTER_API_KEY, ZERO_UPSTREAM_DB, ZERO_AUTH_SECRET } from '$env/static/private';
import nodePG from 'pg';
import sql from 'sql-template-tag';
import { nanoid } from 'nanoid';
import { jwtVerify } from 'jose';
import { getContextPage } from '$lib/context';

const { Pool } = nodePG;

// Separate configuration logic
const poolConfig = import.meta.env.PROD
	? { connectionString: process.env.POSTGRES_URL }
	: { connectionString: ZERO_UPSTREAM_DB };

const pool = new Pool(poolConfig);

// Authentication helper function to reduce cognitive load
async function authenticateUser(jwt: string | undefined): Promise<string> {
	if (!jwt) throw new Error('Authentication required');

	try {
		const secretKey = new TextEncoder().encode(ZERO_AUTH_SECRET);
		const { payload } = await jwtVerify(jwt, secretKey);
		const userId = payload.sub;

		if (!userId) {
			throw new Error('User ID not found in token');
		}

		return userId as string;
	} catch (error) {
		console.error('JWT verification failed:', error);
		throw new Error('Invalid authentication token');
	}
}

// AI generation helper function
async function generateAIResponse(prompt: string, context: string): Promise<string[]> {
	try {
		// Original implementation below, commented out
		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'meta-llama/llama-3.2-1b-instruct',
				stream: false,
				max_tokens: 1024, // Limit output tokens to 1024 as requested
				messages: [
					// Include context as a system message if available
					...(context ? [{ role: 'system', content: context }] : []),
					{ role: 'user', content: prompt }
				]
			})
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(`AI API error: ${errorData.error || response.statusText}`);
		}

		const data = await response.json();
		return [data.choices[0].message.content];
	} catch (error) {
		console.error('Error generating AI response:', error);
		throw new Error('Failed to generate AI response');
	}
}

// Function to prepare context from previous messages
async function prepareContext(chatId: string): Promise<string> {
	try {
		// Fetch context messages
		const contextMessages = await getContextPage(pool, {
			chatID: chatId
			// No page or fromMessageID specified to get the most recent messages
		});

		// Format messages into a context string
		// Reverse to get chronological order (oldest first)
		const formattedContext = contextMessages
			.reverse()
			.map((msg) => `${msg.is_ai ? 'Assistant' : 'User'}: ${msg.text}`)
			.join('\n\n');

		// If we have context, add a preamble
		if (formattedContext) {
			return `Previous conversation history:\n\n${formattedContext}\n\nPlease continue the conversation based on this context.`;
		}

		return '';
	} catch (error) {
		console.error('Error preparing context:', error);
		// Return empty context on error, allowing the conversation to continue
		return '';
	}
}

// Database helper function to create a new message
async function createMessage(chatId: string, text: string, userId: string): Promise<string> {
	const id = nanoid();
	try {
		const query = sql`
			INSERT INTO messages (id, chat_id, text, is_ai, created_by) 
			VALUES (${id}, ${chatId}, ${text}, true, ${userId});
		`;
		await pool.query(query);
		return id;
	} catch (error) {
		console.error('Database error:', error);
		throw new Error('Failed to save message to database');
	}
}

// Database helper function to update an existing message
async function updateMessage(messageId: string, text: string): Promise<void> {
	try {
		const query = sql`
			UPDATE messages 
			SET text = ${text}
			WHERE id = ${messageId};
		`;
		await pool.query(query);
	} catch (error) {
		console.error('Database error:', error);
		throw new Error('Failed to update message in database');
	}
}

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		// Authentication
		const userId = await authenticateUser(cookies.get('jwt'));

		// Request processing
		const { chat_id, prompt } = await request.json();

		if (!chat_id || !prompt) {
			return new Response(
				JSON.stringify({ error: 'Missing required fields: chat_id and prompt' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		// Fetch and prepare context from previous messages
		const context = await prepareContext(chat_id);

		// AI generation - now returns an array of paragraphs
		const paragraphs = await generateAIResponse(prompt, context);

		if (paragraphs.length === 0) {
			throw new Error('No response generated');
		}

		// Create initial message with the first paragraph
		const messageId = await createMessage(chat_id, paragraphs[0], userId);

		// Stream setup
		const stream = new ReadableStream({
			async start(controller) {
				// Send the first paragraph and message ID
				controller.enqueue(
					JSON.stringify({
						message_id: messageId,
						text: paragraphs[0],
						is_complete: paragraphs.length === 1
					})
				);

				// Process remaining paragraphs
				let fullText = paragraphs[0];

				for (let i = 1; i < paragraphs.length; i++) {
					// Add a small delay to simulate streaming
					await new Promise((resolve) => setTimeout(resolve, 200));

					// Append the new paragraph to the full text
					fullText += '\n\n' + paragraphs[i];

					// Update the message in the database
					await updateMessage(messageId, fullText);

					// Send the update to the client
					controller.enqueue(
						JSON.stringify({
							message_id: messageId,
							text: paragraphs[i],
							is_complete: i === paragraphs.length - 1
						})
					);
				}

				controller.close();
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'application/json',
				'Transfer-Encoding': 'chunked'
			}
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		const statusCode =
			errorMessage.includes('Authentication') || errorMessage.includes('token')
				? 401
				: errorMessage.includes('Missing required fields')
					? 400
					: 500;

		return new Response(JSON.stringify({ error: errorMessage }), {
			status: statusCode,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};
