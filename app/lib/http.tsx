import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import { CONFIG } from "../config/env";

type Token = string | undefined;

interface HttpClient {
    setToken(t?: string | null): void;
    clearToken(): void;
    get token(): Token;
    readonly client: AxiosInstance;
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

    setToken(t?: string | null) {
        this._token = t ?? undefined;
    }

    clearToken() {
        this._token = undefined;
    }

    get token(): Token {
        return this._token;
    }

    private attachAuth = async (
        cfg: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
        const token = this._token;

        if (token) {
            // safest way: merge headers (works across axios header types)
            cfg.headers = {
                ...cfg.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        return cfg;
    };
}

export const http = new Http();
