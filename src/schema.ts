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
		created_at: number(),
		updated_at: number().optional()
	})
	.primaryKey('id');

const chats = table('chats')
	.columns({
		id: string(),
		is_public: boolean(),
		title: string(),
		created_by: string(),
		created_at: number(),
		updated_at: number().optional()
	})
	.primaryKey('id');

const messages = table('messages')
	.columns({
		id: string(),
		chat_id: string(),
		text: string(),
		is_ai: boolean().optional(),
		created_by: string(),
		created_at: number(),
		updated_at: number().optional()
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

const messagesRelationships = relationships(messages, ({ one }) => ({
	chat: one({
		sourceField: ['chat_id'],
		destField: ['id'],
		destSchema: chats
	}),
	creator: one({
		sourceField: ['created_by'],
		destField: ['id'],
		destSchema: profiles
	})
}));

/* Schema Definition */
export const schema = createSchema(1, {
	tables: [profiles, chats, messages],
	relationships: [profilesRelationships, chatsRelationships, messagesRelationships]
});

export type Schema = typeof schema;
type TableName = keyof Schema['tables'];

export type ProfileRow = Row<typeof schema.tables.profiles>;
export type ChatRow = Row<typeof schema.tables.chats>;
export type MessageRow = Row<typeof schema.tables.messages>;

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
		eb: ExpressionBuilder<Schema, 'chats' | 'messages'>
	) => eb.and(userIsLoggedIn(authData, eb), eb.cmp('created_by', '=', authData.sub));

	const canAccessChat = (authData: AuthData, eb: ExpressionBuilder<Schema, 'chats'>) =>
		eb.or(eb.cmp('is_public', '=', true), eb.cmp('created_by', '=', authData.sub));

	const canAccessMessage = (authData: AuthData, eb: ExpressionBuilder<Schema, 'messages'>) =>
		eb.exists('chat', (q) => q.where((eb) => canAccessChat(authData, eb)));

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
		}
	};
});
