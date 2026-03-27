import * as SecureStore from 'expo-secure-store';
import {Platform} from "react-native";
import {CONFIG} from "../config/Env";

export async function saveRefreshToken(refreshToken: string): Promise<void> {
    if (Platform.OS === "web") {
        window.localStorage.setItem(CONFIG.REFRESH_TOKEN_KEY, refreshToken);
        return;
    }
    await SecureStore.setItemAsync(CONFIG.REFRESH_TOKEN_KEY, refreshToken);
}

export async function getRefreshToken(): Promise<string | null> {
    if (Platform.OS === "web") {
        return window.localStorage.getItem(CONFIG.REFRESH_TOKEN_KEY);
    }
    return await SecureStore.getItemAsync(CONFIG.REFRESH_TOKEN_KEY);
}

export async function clearRefreshToken(): Promise<void> {
    if (Platform.OS === "web") {
        window.localStorage.removeItem(CONFIG.REFRESH_TOKEN_KEY);
        return;
    }
    await SecureStore.deleteItemAsync(CONFIG.REFRESH_TOKEN_KEY);
}