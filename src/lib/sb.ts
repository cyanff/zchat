import type { Database } from '$lib/sb-types';
import { createClient } from '@supabase/supabase-js';
import { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } from '$env/static/private';

export const sb = createClient<Database>(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
