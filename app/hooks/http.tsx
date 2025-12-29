import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { AxiosHeaders, AxiosError } from "axios";
import { Alert } from "react-native";
import { CONFIG } from "../config/env";

type Token = string | undefined;

interface HttpClient {
    setToken(t?: string | null): void;
    clearToken(): void;
    get token(): Token;
    readonly client: AxiosInstance;
}

function isAxiosHeaders(h: unknown): h is AxiosHeaders {
    return !!h && typeof (h as AxiosHeaders).set === "function";
}

class Http implements HttpClient {
    private _token: Token = undefined;
    public readonly client: AxiosInstance;

    // prevents showing multiple alerts if many requests fail at once
    // allows the pop-up to be shown only after user pressed Ok
    private networkAlertShown = false;

    constructor() {
        this.client = axios.create({
            baseURL: CONFIG.API_URL,
            timeout: CONFIG.TIMEOUT_MS,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });

        this.client.interceptors.request.use(this.attachAuth);

        this.client.interceptors.response.use(
            (r) => r,
            (err) => {
                this.handleGlobalNetworkError(err);
                return Promise.reject(err);
            }
        );
    }

    setToken(t?: string | null): void {
        this._token = t ?? undefined;
    }

    clearToken(): void {
        this._token = undefined;
    }

    get token(): Token {
        return this._token;
    }

    private attachAuth = (cfg: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = this._token;
        if (!token) return cfg;

        if (!cfg.headers) cfg.headers = {} as any;

        if (isAxiosHeaders(cfg.headers)) {
            cfg.headers.set("Authorization", `Bearer ${token}`);
        } else {
            (cfg.headers as any).Authorization = `Bearer ${token}`;
        }

        return cfg;
    };

    private handleGlobalNetworkError(err: unknown) {
        if (!axios.isAxiosError(err)) return;

        // If we have a response, it’s not a "network error"
        if (err.response) return;

        // No response => network issue / DNS / refused / offline / CORS (web) / etc.
        // Timeout is usually ECONNABORTED in axios
        const isTimeout = err.code === "ECONNABORTED";

        if (this.networkAlertShown) return;
        this.networkAlertShown = true;

        Alert.alert(
            isTimeout ? "Timeout" : "Connection problem",
            isTimeout
                ? "The server took too long to respond. Please try again."
                : "Cannot connect to the server. Check your internet connection (or that the server is running).",
            [
                {
                    text: "OK",
                    onPress: () => {
                        // allow future alerts again (next failure can show)
                        this.networkAlertShown = false;
                    },
                },
            ]
        );
    }
}

export const http = new Http();
