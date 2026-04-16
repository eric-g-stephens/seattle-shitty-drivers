import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// Server-side client using the anon key. RLS INSERT policies allow writes;
// our Next.js API routes enforce rate limiting, validation, and Seattle bbox checks
// before any data reaches Supabase.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
