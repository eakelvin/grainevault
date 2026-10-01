import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/env";
import { supabaseSecretKey } from "@/lib/stripe/env";

export function createAdminClient() {
  const secret = supabaseSecretKey();
  if (!secret) {
    throw new Error(
      "NEXT_SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is missing."
    );
  }

  return createClient(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
