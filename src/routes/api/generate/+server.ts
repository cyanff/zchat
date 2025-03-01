import type { RequestHandler } from '@sveltejs/kit';
import { OPENROUTER_API_KEY, ZERO_UPSTREAM_DB, ZERO_AUTH_SECRET } from '$env/static/private';
import sql from 'sql-template-tag';
import { nanoid } from 'nanoid';
import { jwtVerify } from 'jose';
import { getContext } from '$lib/context';
import nodePG from 'pg';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';

const { Pool } = nodePG;

// Separate configuration logic
const poolConfig = { connectionString: ZERO_UPSTREAM_DB };
const pool = new Pool(poolConfig);

// Initialize OpenAI client with OpenRouter integration
const openai = new OpenAI({
	apiKey: OPENROUTER_API_KEY,
	baseURL: 'https://openrouter.ai/api/v1'
});

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

/**
 * Streams AI responses using OpenAI's API with proper stream handling
 *
 * This function leverages the OpenAI client to stream responses in real-time,
 * accumulating text into paragraphs for natural text flow.
 *
 * @param contextMessages - Previously formatted conversation context
 * @returns AsyncGenerator that yields accumulated paragraphs as they complete
 */
async function* streamAIResponse(
	contextMessages: ChatCompletionMessageParam[]
): AsyncGenerator<string, void, unknown> {
	try {
		// Create a streaming completion request
		const stream = await openai.chat.completions.create({
			model: 'meta-llama/llama-3.2-1b-instruct',
			messages: contextMessages,
			max_tokens: 512,
			stream: true
		});

		let currentParagraph = '';

		// Process the stream chunks
		for await (const chunk of stream) {
			// Extract the content from the chunk
			const content = chunk.choices[0]?.delta?.content || '';

			if (content) {
				// Accumulate the content
				currentParagraph += content;

				// Check if we have a complete paragraph
				// This detects double newlines which typically indicate paragraph breaks
				if (content.includes('\n\n') || content.endsWith('\n\n')) {
					// Split by double newlines and handle multiple paragraphs in one chunk
					const paragraphs = currentParagraph.split('\n\n');

					// Yield all complete paragraphs
					for (let i = 0; i < paragraphs.length - 1; i++) {
						if (paragraphs[i].trim()) {
							yield paragraphs[i].trim();
						}
					}

					// Keep the last part as the start of the next paragraph
					currentParagraph = paragraphs[paragraphs.length - 1];
				}
			}
		}

		// Yield any remaining content as the final paragraph
		if (currentParagraph.trim()) {
			yield currentParagraph.trim();
		}
	} catch (error) {
		console.error('Error streaming AI response:', error);
		throw new Error('Failed to stream AI response');
	}
}

// Function to prepare context from previous messages
async function prepareContextMessages(
	chatId: string,
	prompt: string
): Promise<ChatCompletionMessageParam[]> {
	try {
		// Fetch context messages
		const contextMessages = await getContext(pool, {
			chatID: chatId,
			maxContextTokens: 2048
		});

		// Format messages into proper role/content format with correct typing
		// Convert to chronological order (oldest first)
		const formattedMessages = contextMessages.map((msg) => ({
			role: msg.is_ai ? ('assistant' as const) : ('user' as const),
			content: msg.text
		}));

		// Add the current user prompt
		formattedMessages.push({
			role: 'user' as const,
			content: prompt
		});

		// Log for debugging
		console.log('Formatted messages:', JSON.stringify(formattedMessages, null, 2));

		return formattedMessages;
	} catch (error) {
		console.error('Error preparing context messages:', error);
		// Return just the current prompt on error
		return [{ role: 'user' as const, content: prompt }];
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

		// Prepare context messages in the proper format
		const contextMessages = await prepareContextMessages(chat_id, prompt);

		// Create an initial empty message to start with
		const messageId = await createMessage(chat_id, '', userId);

		// Accumulated full text for database updates
		let fullText = '';

		// Stream setup for real-time response
		const stream = new ReadableStream({
			async start(controller) {
				try {
					// Stream AI response paragraphs
					const aiStream = streamAIResponse(contextMessages);

					// Process each paragraph as it completes
					let isFirstParagraph = true;
					for await (const paragraph of aiStream) {
						// Update the accumulated full text
						if (isFirstParagraph) {
							fullText = paragraph;
							isFirstParagraph = false;
						} else {
							fullText += '\n\n' + paragraph;
						}

						// Update the message in the database
						// This triggers the sync engine to stream updates to the client
						await updateMessage(messageId, fullText);

						// Send the update to the client through our stream
						controller.enqueue(
							JSON.stringify({
								message_id: messageId,
								text: paragraph,
								is_complete: false // We don't know if it's complete until the stream ends
							})
						);
					}

					// Mark the final response as complete
					controller.enqueue(
						JSON.stringify({
							message_id: messageId,
							text: '',
							is_complete: true
						})
					);

					controller.close();
				} catch (error) {
					console.error('Stream processing error:', error);
					controller.error(error);
				}
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
