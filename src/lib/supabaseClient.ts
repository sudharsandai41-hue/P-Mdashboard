import { createClient } from "@supabase/supabase-js";

// Fetch from .env.local securely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Expose a persistent browser client
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
