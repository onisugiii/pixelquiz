import { supabase } from './supabase.js';

export const current = { user: null, profile: null };

export async function loadSession() {
  const { data } = await supabase.auth.getSession();
  current.user = data.session ? data.session.user : null;
  current.profile = null;
  if (current.user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', current.user.id)
      .single();
    current.profile = p;
  }
  return current;
}

export const isAdmin = () => !!current.profile && current.profile.role === 'admin';

export const signUp = (name, email, password) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
  });

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export async function signOut() {
  await supabase.auth.signOut();
  current.user = null;
  current.profile = null;
}

export const requestReset = (email) =>
  supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });

export const updatePassword = (password) => supabase.auth.updateUser({ password });
