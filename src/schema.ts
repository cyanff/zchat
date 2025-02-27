import {
	createSchema,
	definePermissions,
	table,
	string,
	number,
	ANYONE_CAN,
	type Row
} from '@rocicorp/zero';

// Define the colors table
const colors = table('colors')
	.columns({
		id: string(), // Using string for simplicity, could use number if strictly enforcing bigint
		name: string(),
		hex: string(),
		red: number(),
		green: number(),
		blue: number(),
		hue: number(),
		sat_hsl: number(),
		light_hsl: number(),
		sat_hsv: number(),
		val_hsv: number(),
		source: string()
	})
	.primaryKey('id');

// Create the schema
export const schema = createSchema(1, {
	tables: [colors]
});

// Type exports for client usage
export type Schema = typeof schema;
export type Color = Row<typeof schema.tables.colors>;

// Authentication data type (minimal, assuming no auth required)
type AuthData = {
	sub: string | null;
};

// Define permissions - anyone can access everything
export const permissions = definePermissions<AuthData, Schema>(schema, () => ({
	colors: {
		row: {
			select: ANYONE_CAN, // Anyone can read
			insert: ANYONE_CAN, // Anyone can create
			update: {
				preMutation: ANYONE_CAN,
				postMutation: ANYONE_CAN
			},
			delete: ANYONE_CAN // Anyone can delete
		}
	}
}));
