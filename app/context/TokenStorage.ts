import * as SecureStore from 'expo-secure-store';
import {CONFIG} from "../config/Env";

export async function saveRefreshToken(refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(CONFIG.REFRESH_TOKEN_KEY, refreshToken);
}

export async function getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(CONFIG.REFRESH_TOKEN_KEY);
}

export async function clearRefreshToken(): Promise<void> {
    await SecureStore.deleteItemAsync(CONFIG.REFRESH_TOKEN_KEY);
}