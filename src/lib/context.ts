import type { Pool } from 'pg';
import sql from 'sql-template-tag';
import type { MessageRow } from '../schema';

interface GetContextPageOptions {
	chatID: string;
	page?: number;
	fromMessageID?: string;
}

const pageSize = 10;

async function getContextPage(
	pool: Pool,
	options: GetContextPageOptions
): Promise<Readonly<MessageRow>[]> {
	const { chatID, page = 0, fromMessageID } = options;
	const offset = page * pageSize;
	const limit = pageSize;

	try {
		// Build the base query
		let query = sql`
      SELECT 
        id,
        text,
        is_ai,
        created_at,
        updated_at
      FROM messages
      WHERE chat_id = ${chatID}
    `;

		// Add fromMessageID filter if provided
		if (fromMessageID) {
			query = sql`
        ${query}
        AND id < ${fromMessageID}
      `;
		}

		// Add ordering and pagination
		query = sql`
      ${query}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

		const { rows } = await pool.query(query);
		return rows;
	} catch (error) {
		console.error('Error fetching message context:', error);
		throw error;
	}
}

/**
 * Options for retrieving a complete chat context
 */
interface GetContextOptions {
	chatID: string;
	fromMessageID?: string;
	maxContextTokens: number;
}

/**
 * Retrieves chat messages up to a specified token limit
 *
 * Fetches messages in reverse chronological order (newest first),
 * accumulating them until we reach the token limit or run out of messages.
 * Returns the messages in chronological order (oldest first).
 *
 * @param options - Configuration for context retrieval
 * @returns Promise resolving to an array of messages in chronological order
 */
export async function getContext(
	pool: Pool,
	options: GetContextOptions
): Promise<Readonly<MessageRow>[]> {
	const { chatID, fromMessageID, maxContextTokens } = options;
	const context: MessageRow[] = [];

	let totalTokens = 0;
	let page = 0;
	let messages;

	do {
		messages = await getContextPage(pool, {
			chatID,
			page,
			fromMessageID
		});

		for (const message of messages) {
			// Estimate tokens from the message text
			const estimatedTokens = estimateTokens(message.text);
			totalTokens += estimatedTokens;

			// Stop adding messages if we exceed the token limit
			if (totalTokens > maxContextTokens) break;

			context.push(message);
		}

		page++;
	} while (totalTokens < maxContextTokens && messages.length === pageSize);

	// Reverse the context so that the oldest messages are first
	const t = context.reverse();
	console.log('raw context', JSON.stringify(t, null, 2));
	return t;
}

/**
 * Estimates the number of tokens in a text string
 *
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
function estimateTokens(text: string): number {
	return Math.ceil(text.length / 4);
}
