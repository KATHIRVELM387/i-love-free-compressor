import { createClient } from 'npm:@supabase/supabase-js@2.117.2';
import { deleteAccountHandler } from '../_shared/delete-account.js';

Deno.serve(deleteAccountHandler({
  createClient,
  url: Deno.env.get('SUPABASE_URL') || '',
  publicKey: Deno.env.get('SUPABASE_ANON_KEY') || '',
  serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  allowedOrigins: (Deno.env.get('ACCOUNT_ALLOWED_ORIGINS') || 'https://ilovefreecompressor.vercel.app,https://kathirvelm387.github.io').split(',').map(value => value.trim()).filter(Boolean)
}));
