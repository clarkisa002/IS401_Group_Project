import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface AuthUser {
  user_id: number;
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "home_ownership_auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user_id && parsed.email && parsed.name) {
          setUser(parsed);
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error("Please enter your email and password.");
    }

    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Invalid email or password.");
    }

    const authUser: AuthUser = {
      user_id: data.user_id,
      email: data.email,
      name: data.name || data.email,
    };
    setUser(authUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
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

