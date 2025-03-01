import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { sb } }) => {
	const { data: sessionData, error: sessionError } = await sb.auth.getSession();
	if (sessionError) {
		console.error(sessionError);
		throw sessionError;
	}
	const user = sessionData?.session?.user;
	const id = user?.id ?? 'anon';

	// Fetch the username from the profiles table if user is authenticated
	let username = null;
	if (id !== 'anon') {
		const { data: profileData, error: profileError } = await sb
			.from('profiles')
			.select('username')
			.eq('id', id)
			.single();

		if (profileError) {
			console.error('Error fetching profile:', profileError);
		} else if (profileData) {
			username = profileData.username;
		}
	}

	return {
		user: id,
		username: username || 'anon'
	};
};
