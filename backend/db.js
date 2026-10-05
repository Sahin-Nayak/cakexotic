import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper: run raw SQL via supabase rpc
// For complex queries we use the postgres connection via supabase's REST
export default supabase;
