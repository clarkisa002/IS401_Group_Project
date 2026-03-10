import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthUser {
  username: string;
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
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
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, _password: string) => {
    // In a real app, call your backend here.
    // For now, accept any non-empty credentials.
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      throw new Error("Please enter a valid username.");
    }

    const nameFromUsername = trimmedUsername || "Homeowner";
    const authUser: AuthUser = {
      username: trimmedUsername,
      name: nameFromUsername.charAt(0).toUpperCase() + nameFromUsername.slice(1),
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

