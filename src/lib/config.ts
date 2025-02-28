export const config = {
	supabaseURL: import.meta.env.VITE_SUPABASE_URL,
	supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
	vitePublicServer: import.meta.env.VITE_PUBLIC_SERVER
};

if (!config.supabaseURL) throw new Error('SUPABASE_URL is not set');
if (!config.supabaseAnonKey) throw new Error('SUPABASE_ANON_KEY is not set');
if (!config.vitePublicServer) throw new Error('VITE_PUBLIC_SERVER is not set');
