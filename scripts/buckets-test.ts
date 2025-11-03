// scripts/buckets-test.ts
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

supabase.storage.listBuckets().then(({ data, error }) => {
  console.log('Buckets:', data?.map(b => b.name));
  console.log('Error:', error);
});