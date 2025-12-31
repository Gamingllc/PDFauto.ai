
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // It's okay to not have them during build/test sometimes, 
    // but we should warn in dev.
    console.warn("Supabase keys missing! Check .env.local");
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
