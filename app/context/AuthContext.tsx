import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {stompService} from "../ws/stompService";
import {paths} from "../../api/schema";
import {http} from "../hooks/Http";
import {clearRefreshToken, getRefreshToken, saveRefreshToken} from "./TokenStorage";

type AccessToken = string | null;

export interface User {
    userId: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    hasProfilePicture: boolean;
}

type UpdateChatUserDTO =
    paths["/users/me"]["put"]["requestBody"]["content"]["application/json"];
type RefreshResponse = paths["/auth/refresh"]["post"]["responses"]["200"]["content"]["application/json"];

export interface ProfilePicUpdate {
    hasProfilePicture: boolean;
}

export interface AuthContextValue {
    loggedIn: boolean;
    initializing: boolean;
    accessToken: AccessToken;
    user: User;

    login: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
    logout: () => Promise<void>;
    refreshLogin: () => Promise<boolean>;

    updateUser: (input: UpdateChatUserDTO) => Promise<void>;
    updateProfilePicture: (input: ProfilePicUpdate) => void;
}

const AuthCtx = createContext<AuthContextValue | undefined>(undefined);

const emptyUser: User = {
    userId: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    hasProfilePicture: false,
};

export function AuthProvider({children}: { children: React.ReactNode }) {
    const [accessToken, setAccessToken] = useState<AccessToken>(null);
    const [user, setUser] = useState<User>(emptyUser);
    const [initializing, setInitializing] = useState(true);

    useEffect(() => {
        http.setToken(accessToken);
    }, [accessToken]);

    useEffect(() => {
        if (accessToken) {
            stompService.connect(
                () => accessToken,
                () => console.log("WS connected"),
                (err) => console.warn("WS error", err),
            );
        } else {
            stompService.disconnect();
        }
    }, [accessToken]);

    const logout = async () => {
        setAccessToken(null);
        setUser(emptyUser);
        await clearRefreshToken();
    };

    const refreshLogin = async (): Promise<boolean> => {
        try {
            const refreshToken = await getRefreshToken();

            if (!refreshToken) {
                return false;
            }

            const res = await http.client.post<RefreshResponse>("/auth/refresh", {
                refreshToken,
            });

            const newAccessToken: string = res.data.accessToken;
            const newRefreshToken: string = res.data.refreshToken ?? refreshToken
            const refreshedUser: User = res.data;

            setAccessToken(newAccessToken);
            setUser(refreshedUser);

            if (newRefreshToken !== refreshToken) {
                await saveRefreshToken(newRefreshToken);
            }

            return true;
        } catch (err) {
            console.warn("Refresh login failed", err);
            await logout();
            return false;
        }
    };

    useEffect(() => {
        const bootstrapAuth = async () => {
            try {
                const refreshToken = await getRefreshToken();

                if (!refreshToken) {
                    return;
                }

                await refreshLogin();
            } finally {
                setInitializing(false);
            }
        };

        bootstrapAuth();
    }, []);

    const value = useMemo<AuthContextValue>(() => ({
        loggedIn: !!accessToken,
        initializing,
        accessToken,
        user,

        login: async (newAccessToken, refreshToken, newUser) => {
            setAccessToken(newAccessToken);
            setUser(newUser);
            await saveRefreshToken(refreshToken);
        },

        logout,
        refreshLogin,

        updateUser: async ({firstName, lastName, email}: UpdateChatUserDTO) => {
            const payload: UpdateChatUserDTO = {
                firstName,
                lastName,
                email,
            };

            await http.client.put("/users/me", payload);

            setUser((prev) => ({
                ...prev,
                firstName,
                lastName,
                email,
            }));
        },

        updateProfilePicture: ({hasProfilePicture}: ProfilePicUpdate) => {
            setUser((prev) => ({...prev, hasProfilePicture}));
        },
    }), [accessToken, user, initializing]);

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}