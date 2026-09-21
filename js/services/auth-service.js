import { supabase } from '../supabase-client.js';
import { redirect } from '../router.js';

export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data;
}

export async function isCurrentUserAdmin() {
  const { session } = await getSession();
  if (!session?.user) return false;

  // Verify against admin_users table
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) return false;
  return true;
}

export async function requireAdmin() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect('./login.html');
    return false;
  }
  return true;
}
