import { Pool } from 'pg';
import sql from 'sql-template-tag';
import type { MessageRow } from '../schema';

interface GetContextPageOptions {
	chatID: string;
	page?: number;
	fromMessageID?: string;
}

const PAGE_SIZE = 10; // Adjust as needed

async function getContextPage(
	pool: Pool,
	options: GetContextPageOptions
): Promise<Readonly<MessageRow>[]> {
	const { chatID, page = 0, fromMessageID } = options;
	const offset = page * PAGE_SIZE;
	const limit = PAGE_SIZE;

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
