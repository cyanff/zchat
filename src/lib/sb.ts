import { config } from '$lib/config';
import type { Database } from '$lib/sb-types';
import { createClient } from '@supabase/supabase-js';

export const sb = createClient<Database>(config.supabaseURL, config.supabaseAnonKey);
