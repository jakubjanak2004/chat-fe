import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {http} from "../hooks/http";

type Token = string | null;

export interface User {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    hasProfilePicture: boolean;
}

export interface UpdateMeInput {
    firstName: string;
    lastName: string;
    email: string;
}

export interface ProfilePicUpdate {
    hasProfilePicture: boolean;
}

export interface AuthContextValue {
    loggedIn: boolean;
    token: Token;
    user: User;

    login: (token: string, user: User) => void;
    logout: () => void;

    updateUser: (input: UpdateMeInput) => Promise<void>;
    updateProfilePicture: (input: ProfilePicUpdate) => void;
}

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

const emptyUser = {
    userId: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    hasProfilePicture: false,
}

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [token, setToken] = useState<Token>(null);
    const [user, setUser] = useState<User>(emptyUser);

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
            setUser(emptyUser);
        },

        updateUser: async ({firstName, lastName, email}: UpdateMeInput) => {
            await http.client.put('/users/me', {
                firstName,
                lastName,
                email,
            });
            // keep local state in sync
            setUser((prev) =>
                prev
                    ? {...prev, firstName, lastName, email}
                    : prev
            );
        },

        updateProfilePicture: ({ hasProfilePicture }: ProfilePicUpdate) => {
            setUser(prev => ({ ...prev, hasProfilePicture }));
        },
    }), [token, user]);

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
