import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// In a real environment, this imports from the local config.js
// If config.js doesn't exist (e.g., user hasn't created it yet), we want a graceful fallback to example
let SUPABASE_URL = '';
let SUPABASE_PUBLISHABLE_KEY = '';

try {
  // We use dynamic import so it doesn't hard-fail if config.js is missing
  const config = await import('./config.js');
  SUPABASE_URL = config.SUPABASE_URL;
  SUPABASE_PUBLISHABLE_KEY = config.SUPABASE_PUBLISHABLE_KEY;
} catch (e) {
  console.warn('config.js not found. Using empty credentials. App will not function correctly without Supabase.');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://example.supabase.co', 
  SUPABASE_PUBLISHABLE_KEY || 'example_key'
);
