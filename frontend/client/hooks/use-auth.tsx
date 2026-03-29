import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface AuthUser {
  user_id: string;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  /** `redirectPath` should be a path like `/goals` (defaults to `/dashboard`). Uses current origin so local dev stays on localhost. */
  loginWithGoogle: (redirectPath?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function buildDisplayName(
  profileFirstName: string,
  profileLastName: string,
  metadata: Record<string, unknown>,
  email: string
): string {
  const profileName = [profileFirstName, profileLastName].filter(Boolean).join(" ").trim();
  if (profileName) return profileName;

  const metaFirstName = String(metadata.first_name ?? metadata.given_name ?? "").trim();
  const metaLastName = String(metadata.last_name ?? metadata.family_name ?? "").trim();
  const metadataName = [metaFirstName, metaLastName].filter(Boolean).join(" ").trim();
  if (metadataName) return metadataName;

  const fullMetadataName = String(metadata.full_name ?? metadata.name ?? "").trim();
  return fullMetadataName || email;
}

async function sessionToAuthUser(session: Session | null): Promise<AuthUser | null> {
  if (!session?.user) return null;
  const u = session.user;

  let profileFirstName = "";
  let profileLastName = "";

  // Prefer canonical profile fields saved in the app DB.
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name")
    .eq("id", u.id)
    .maybeSingle();

  if (profile) {
    profileFirstName = String(profile.first_name ?? "").trim();
    profileLastName = String(profile.last_name ?? "").trim();
  }

  const metadata = (u.user_metadata || {}) as Record<string, unknown>;
  const email = u.email ?? "";
  const name = buildDisplayName(profileFirstName, profileLastName, metadata, email);

  return {
    user_id: u.id,
    email,
    name,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        setUser(await sessionToAuthUser(session));
        setLoading(false);
      })();
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(await sessionToAuthUser(session));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error("Please enter your email and password.");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      throw new Error(error.message || "Invalid email or password.");
    }

    if (data.session) {
      setUser(await sessionToAuthUser(data.session));
    }
  };

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error("Please enter your email and password.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          first_name: firstName || "",
          last_name: lastName || "",
        },
      },
    });

    if (error) {
      throw new Error(error.message || "Failed to sign up.");
    }

    if (data.session) {
      setUser(await sessionToAuthUser(data.session));
    }
  };

  const loginWithGoogle = async (redirectPath: string = "/dashboard") => {
    const path = redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`;
    const redirectTo = `${window.location.origin}${path}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      throw new Error(error.message || "Failed to sign in with Google.");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signUp,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
