import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export async function getUserPermissions() {
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session) return [];

  const userEmail = sessionData.session.user.email;

  const { data: userData } = await supabase
    .from("users")
    .select("role_id")
    .eq("email", userEmail)
    .single();

  if (!userData) return [];

  const { data: roleData } = await supabase
    .from("roles")
    .select("permissions")
    .eq("id", userData.role_id)
    .single();

  return roleData?.permissions || [];
}