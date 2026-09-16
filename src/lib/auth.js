import { isSupabaseConfigured, supabase } from "./supabaseClient";

function notConfiguredError() {
  return new Error(
    "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export function getAuthRedirectOrigin() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

export function getEmailConfirmRedirectUrl() {
  return `${getAuthRedirectOrigin()}/auth/callback`;
}

export function getPasswordResetRedirectUrl() {
  return `${getAuthRedirectOrigin()}/reset-password`;
}

export async function signUpWithEmail({
  email,
  password,
  username,
}) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: notConfiguredError() };
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getEmailConfirmRedirectUrl(),
      data: username
        ? { username }
        : undefined,
    },
  });
}

export async function signInWithEmail({
  email,
  password,
}) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: notConfiguredError() };
  }

  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: notConfiguredError() };
  }

  return supabase.auth.signOut();
}

export async function requestPasswordReset(email) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: notConfiguredError() };
  }

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetRedirectUrl(),
  });
}

export async function updatePassword(newPassword) {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: notConfiguredError() };
  }

  return supabase.auth.updateUser({
    password: newPassword,
  });
}

export async function getSession() {
  if (!isSupabaseConfigured() || !supabase) {
    return { session: null, error: notConfiguredError() };
  }

  const { data, error } = await supabase.auth.getSession();

  return {
    session: data?.session ?? null,
    error,
  };
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null, error: notConfiguredError() };
  }

  const { data, error } = await supabase.auth.getUser();

  return {
    user: data?.user ?? null,
    error,
  };
}

export async function getAccessToken() {
  const { session, error } = await getSession();

  if (error) {
    return { token: null, error };
  }

  return {
    token: session?.access_token ?? null,
    error: null,
  };
}

export function isEmailVerified(user) {
  if (!user) {
    return false;
  }

  return Boolean(user.email_confirmed_at || user.confirmed_at);
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      data: {
        subscription: {
          unsubscribe() {},
        },
      },
    };
  }

  return supabase.auth.onAuthStateChange(callback);
}

export function subscribeToAuthSession(onSession) {
  let active = true;

  getSession().then(({ session }) => {
    if (active) {
      onSession(session);
    }
  });

  const {
    data: { subscription },
  } = onAuthStateChange((_event, session) => {
    if (active) {
      onSession(session);
    }
  });

  return function unsubscribe() {
    active = false;
    subscription.unsubscribe();
  };
}
