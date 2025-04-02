import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbSupplier {
  id: string;
  name: string;
  default_payment_method: 'contanti' | 'bonifico';
  created_at: string;
}

export interface DbEntry {
  id: string;
  date: string;
  supplier_id: string;
  amount: number;
  description: string;
  payment_method: 'contanti' | 'bonifico';
  created_at: string;
}

export interface DbUser {
  username: string;
  password: string;
  created_at: string;
} 