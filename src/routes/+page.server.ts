import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { sb } }) => {
	const { data: sessionData, error: sessionError } = await sb.auth.getSession();
	if (sessionError) {
		console.error(sessionError);
		throw sessionError;
	}
	const user = sessionData?.session?.user;
	const id = user?.id ?? 'anon';

	return { user: id };
};
