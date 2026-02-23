import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {http} from "../hooks/http";
import {stompService} from "../ws/stompService";
import {paths} from "../../api/schema";

type Token = string | null;

export interface User {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    hasProfilePicture: boolean;
}

type UpdateChatUserDTO = paths["/users/me"]["put"]["requestBody"]["content"]["application/json"]

// todo import from paths
export interface ProfilePicUpdate {
    hasProfilePicture: boolean;
}

export interface AuthContextValue {
    loggedIn: boolean;
    token: Token;
    user: User;

    login: (token: string, user: User) => void;
    logout: () => void;

    updateUser: (input: UpdateChatUserDTO) => Promise<void>;
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

    // Connect/disconnect websocket depending on auth state
    useEffect(() => {
        if (token) {
            stompService.connect(
                () => token,
                () => console.log("WS connected"),
                (err) => console.warn("WS error", err),
            );
        } else {
            stompService.disconnect();
        }
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

        updateUser: async ({firstName, lastName, email}: UpdateChatUserDTO) => {
            const payload: UpdateChatUserDTO = {
                firstName,
                lastName,
                email,
            }
            await http.client.put('/users/me', payload);
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
