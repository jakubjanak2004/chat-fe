import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../lib/http";

type Token = string | null;

export interface User {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
}

export interface UpdateMeInput {
    firstName: string;
    lastName: string;
}

export interface AuthContextValue {
    loggedIn: boolean;
    token: Token;
    user: User | null;

    login: (token: string, user: User) => void;
    logout: () => void;

    updateUser: (input: UpdateMeInput) => Promise<void>;
}

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<Token>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        http.setToken(token);
    }, [token]);

    const value = useMemo<AuthContextValue>(() => ({
        loggedIn: !!token,
        token,
        user,

        login: (t, u) => {
            setToken(t);
            setUser(u);
        },

        logout: () => {
            setToken(null);
            setUser(null);
        },

        updateUser: async ({ firstName, lastName }: UpdateMeInput) => {
            // keep local state in sync
            setUser((prev) =>
                prev
                    ? { ...prev, firstName, lastName }
                    : prev
            );
        },
    }), [token, user]);

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
