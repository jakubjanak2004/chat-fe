import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import type { AxiosHeaders } from "axios";
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
            (err) => Promise.reject(err)
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

    private attachAuth = (
        cfg: InternalAxiosRequestConfig
    ): InternalAxiosRequestConfig => {
        const token = this._token;
        if (!token) return cfg;

        // Ensure headers exists
        if (!cfg.headers) cfg.headers = {} as any;

        // Support both AxiosHeaders and plain object headers
        if (isAxiosHeaders(cfg.headers)) {
            cfg.headers.set("Authorization", `Bearer ${token}`);
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (cfg.headers as any).Authorization = `Bearer ${token}`;
        }

        return cfg;
    };
}

export const http = new Http();
