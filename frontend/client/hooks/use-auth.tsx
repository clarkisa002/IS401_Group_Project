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
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function sessionToAuthUser(session: Session | null): AuthUser | null {
  if (!session?.user) return null;
  const u = session.user;
  const meta = u.user_metadata || {};
  const firstName = meta.first_name || "";
  const lastName = meta.last_name || "";
  const name = [firstName, lastName].filter(Boolean).join(" ") || u.email || "";
  return {
    user_id: u.id,
    email: u.email ?? "",
    name,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(sessionToAuthUser(session));
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(sessionToAuthUser(session));
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
      setUser(sessionToAuthUser(data.session));
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
      setUser(sessionToAuthUser(data.session));
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
