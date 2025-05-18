
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rgzsdsqlqvrnjbnxkjjf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnenNkc3FscXZybmpibnhrampmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzUyNzQsImV4cCI6MjA2MjcxMTI3NH0.3n_XJsS-CAXc2ipvjW3RJ10kVJ_amnvsZb-rHO4BTiw";

// Import the supabase client like this:
// import { supabase } from "@/backend/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
