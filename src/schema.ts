import {
	ANYONE_CAN,
	boolean,
	createSchema,
	definePermissions,
	NOBODY_CAN,
	relationships,
	string,
	table,
	type ExpressionBuilder,
	type Row,
	number
} from '@rocicorp/zero';
import type { Condition } from '@rocicorp/zero';

type AuthData = {
	sub: string; // The authenticated user ID (auth.uid())
};

/* Table Definitions */
const profiles = table('profiles')
	.columns({
		id: string(),
		username: string(),
		created_at: string(),
		updated_at: string().optional()
	})
	.primaryKey('id');

const chats = table('chats')
	.columns({
		id: string(),
		is_public: boolean(),
		created_by: string(),
		created_at: string(),
		updated_at: string().optional()
	})
	.primaryKey('id');

const messages = table('messages')
	.columns({
		id: string(),
		chat_id: string(),
		text: string(),
		is_ai: boolean().optional(),
		created_by: string(),
		created_at: string(),
		updated_at: string().optional(),
		prime_candidate_id: string().optional()
	})
	.primaryKey('id');

const candidateMessages = table('candidate_messages')
	.columns({
		id: string(),
		message_id: string(),
		text: string(),
		created_by: string(),
		created_at: string(),
		updated_at: string().optional()
	})
	.primaryKey('id');

const colors = table('colors')
	.columns({
		id: string(),
		name: string().optional(),
		hex: string(),
		red: number().optional(),
		green: number().optional(),
		blue: number().optional(),
		hue: number().optional(),
		sat_hsl: number().optional(),
		light_hsl: number().optional(),
		sat_hsv: number().optional(),
		val_hsv: number().optional(),
		source: string().optional()
	})
	.primaryKey('id');

/* Relationships */
const profilesRelationships = relationships(profiles, ({ many }) => ({
	chats: many({
		sourceField: ['id'],
		destField: ['created_by'],
		destSchema: chats
	}),
	messages: many({
		sourceField: ['id'],
		destField: ['created_by'],
		destSchema: messages
	}),
	candidateMessages: many({
		sourceField: ['id'],
		destField: ['created_by'],
		destSchema: candidateMessages
	})
}));

const chatsRelationships = relationships(chats, ({ many, one }) => ({
	messages: many({
		sourceField: ['id'],
		destField: ['chat_id'],
		destSchema: messages
	}),
	creator: one({
		sourceField: ['created_by'],
		destField: ['id'],
		destSchema: profiles
	})
}));

const messagesRelationships = relationships(messages, ({ many, one }) => ({
	candidateMessages: many({
		sourceField: ['id'],
		destField: ['message_id'],
		destSchema: candidateMessages
	}),
	chat: one({
		sourceField: ['chat_id'],
		destField: ['id'],
		destSchema: chats
	}),
	creator: one({
		sourceField: ['created_by'],
		destField: ['id'],
		destSchema: profiles
	}),
	primeCandidate: one({
		sourceField: ['prime_candidate_id'],
		destField: ['id'],
		destSchema: candidateMessages
	})
}));

const candidateMessagesRelationships = relationships(candidateMessages, ({ one }) => ({
	message: one({
		sourceField: ['message_id'],
		destField: ['id'],
		destSchema: messages
	}),
	creator: one({
		sourceField: ['created_by'],
		destField: ['id'],
		destSchema: profiles
	})
}));

/* Schema Definition */
export const schema = createSchema(1, {
	tables: [profiles, chats, messages, candidateMessages, colors],
	relationships: [
		profilesRelationships,
		chatsRelationships,
		messagesRelationships,
		candidateMessagesRelationships
	]
});

export type Schema = typeof schema;
type TableName = keyof Schema['tables'];

export type ProfileRow = Row<typeof schema.tables.profiles>;
export type ChatRow = Row<typeof schema.tables.chats>;
export type MessageRow = Row<typeof schema.tables.messages>;
export type CandidateMessageRow = Row<typeof schema.tables.candidate_messages>;
export type ColorRow = Row<typeof schema.tables.colors>;

type PermissionRule<TTable extends TableName> = (
	authData: AuthData,
	eb: ExpressionBuilder<Schema, TTable>
) => Condition;

function and<TTable extends TableName>(...rules: PermissionRule<TTable>[]): PermissionRule<TTable> {
	return (authData, eb) => eb.and(...rules.map((rule) => rule(authData, eb)));
}

/* Authorization Rules */
export const permissions = definePermissions<AuthData, Schema>(schema, () => {
	const userIsLoggedIn = (authData: AuthData, { cmpLit }: ExpressionBuilder<Schema, TableName>) =>
		cmpLit(authData.sub, 'IS NOT', null);

	const loggedInUserIsCreator = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'chats' | 'messages' | 'candidate_messages'>
	) => eb.and(userIsLoggedIn(authData, eb), eb.cmp('created_by', '=', authData.sub));

	const canAccessChat = (authData: AuthData, eb: ExpressionBuilder<Schema, 'chats'>) =>
		eb.or(eb.cmp('is_public', '=', true), eb.cmp('created_by', '=', authData.sub));

	const canAccessMessage = (authData: AuthData, eb: ExpressionBuilder<Schema, 'messages'>) =>
		eb.exists('chat', (q) => q.where((eb) => canAccessChat(authData, eb)));

	const canAccessCandidateMessage = (
		authData: AuthData,
		eb: ExpressionBuilder<Schema, 'candidate_messages'>
	) =>
		eb.exists('message', (q) =>
			q.where((eb) => and(canAccessMessage, loggedInUserIsCreator)(authData, eb))
		);

	return {
		profiles: {
			row: {
				insert: NOBODY_CAN,
				update: {
					preMutation: NOBODY_CAN,
					postMutation: NOBODY_CAN
				},
				delete: NOBODY_CAN,
				select: ANYONE_CAN
			}
		},
		chats: {
			row: {
				insert: [loggedInUserIsCreator],
				update: {
					preMutation: [loggedInUserIsCreator],
					postMutation: [loggedInUserIsCreator]
				},
				delete: [loggedInUserIsCreator],
				select: [canAccessChat]
			}
		},
		messages: {
			row: {
				insert: [
					(authData, eb) =>
						eb.exists('chat', (q) => q.where((eb) => loggedInUserIsCreator(authData, eb))),
					loggedInUserIsCreator
				],
				update: {
					preMutation: [
						loggedInUserIsCreator,
						(authData, eb) =>
							eb.exists('chat', (q) => q.where((eb) => loggedInUserIsCreator(authData, eb)))
					],
					postMutation: [loggedInUserIsCreator]
				},
				delete: [
					loggedInUserIsCreator,
					(authData, eb) =>
						eb.exists('chat', (q) => q.where((eb) => loggedInUserIsCreator(authData, eb)))
				],
				select: [canAccessMessage]
			}
		},
		// messages: {
		// 	row: {
		// 		insert: ANYONE_CAN,
		// 		update: {
		// 			preMutation: ANYONE_CAN,
		// 			postMutation: ANYONE_CAN
		// 		},
		// 		delete: ANYONE_CAN,
		// 		select: ANYONE_CAN
		// 	}
		// },
		candidate_messages: {
			row: {
				insert: [loggedInUserIsCreator, canAccessCandidateMessage],
				update: {
					preMutation: [loggedInUserIsCreator, canAccessCandidateMessage],
					postMutation: [loggedInUserIsCreator]
				},
				delete: [loggedInUserIsCreator, canAccessCandidateMessage],
				select: [canAccessCandidateMessage]
			}
		},
		colors: {
			row: {
				insert: ANYONE_CAN,
				update: {
					preMutation: ANYONE_CAN,
					postMutation: ANYONE_CAN
				},
				delete: ANYONE_CAN,
				select: ANYONE_CAN
			}
		}
	};
});
