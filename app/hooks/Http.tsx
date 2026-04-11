import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from "axios";
import type { AxiosHeaders } from "axios";
import { Alert } from "react-native";
import { CONFIG } from "../config/Env";
import qs from "qs";
import { networkState } from "../context/NetworkState";
import { backendState } from "../context/BackendState";

type Token = string | undefined;

export type AppError =
    | { type: "offline"; message: string }
    | { type: "timeout"; message: string }
    | { type: "backend_unreachable"; message: string; status?: number }
    | { type: "server"; message: string; status?: number }
    | { type: "unknown"; message: string };

interface HttpClient {
    setToken(t?: string | null): void;
    clearToken(): void;
    get token(): Token;
    readonly client: AxiosInstance;
    resetOfflineAlert(): void;
}

function isAxiosHeaders(h: unknown): h is AxiosHeaders {
    return !!h && typeof (h as AxiosHeaders).set === "function";
}

class Http implements HttpClient {
    private _token: Token = undefined;
    public readonly client: AxiosInstance;

    private offlineAlertShown = false;

    constructor() {
        networkState.subscribe((isOffline) => {
            if (!isOffline) {
                this.offlineAlertShown = false;
            } else {
                // offline is not the same as backend unavailable
                backendState.markHealthy();
            }
        });

        this.client = axios.create({
            baseURL: CONFIG.API_URL,
            timeout: CONFIG.TIMEOUT_MS,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            paramsSerializer: (params) =>
                qs.stringify(params, { arrayFormat: "repeat" }),
        });

        this.client.interceptors.request.use(this.attachAuth);
        this.client.interceptors.request.use(this.blockWhenOffline);

        this.client.interceptors.response.use(
            (response) => {
                backendState.markHealthy();
                return response;
            },
            (err) => {
                const appError = this.mapAxiosError(err);

                if (
                    appError.type === "timeout" ||
                    appError.type === "backend_unreachable" ||
                    (appError.type === "server" &&
                        (appError.status === 502 ||
                            appError.status === 503 ||
                            appError.status === 504))
                ) {
                    backendState.markUnavailable(appError.message);
                    console.log('appError:', appError)
                }

                this.handleGlobalNetworkError(appError);
                return Promise.reject(appError);
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

    resetOfflineAlert(): void {
        this.offlineAlertShown = false;
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

    private blockWhenOffline = (
        cfg: InternalAxiosRequestConfig
    ): InternalAxiosRequestConfig | Promise<never> => {
        if (!networkState.offline) return cfg;

        return Promise.reject<AppError>({
            type: "offline",
            message: "No internet connection.",
        });
    };

    private mapAxiosError(error: unknown): AppError {
        // already normalized by us
        if (
            error &&
            typeof error === "object" &&
            "type" in error &&
            typeof (error as any).type === "string"
        ) {
            return error as AppError;
        }

        if (!axios.isAxiosError(error)) {
            return {
                type: "unknown",
                message: "Unexpected error.",
            };
        }

        const err = error as AxiosError<any>;

        // no response from server
        if (!err.response) {
            if (networkState.offline) {
                return {
                    type: "offline",
                    message: "No internet connection.",
                };
            }

            if (err.code === "ECONNABORTED") {
                return {
                    type: "timeout",
                    message: "The server took too long to respond. Please try again.",
                };
            }

            return {
                type: "backend_unreachable",
                message: "We’re having trouble reaching the server. Please try again later.",
            };
        }

        const status = err.response.status;

        if (status === 502 || status === 503 || status === 504) {
            return {
                type: "backend_unreachable",
                status,
                message: "Service temporarily unavailable. Please try again later.",
            };
        }

        return {
            type: "server",
            status,
            message:
                err.response.data?.message ||
                `Request failed with status ${status}.`,
        };
    }

    private handleGlobalNetworkError(err: AppError) {
        if (err.type !== "offline") return;
        if (this.offlineAlertShown) return;

        this.offlineAlertShown = true;

        Alert.alert("No internet connection", err.message, [{ text: "OK" }]);
    }
}

export const http = new Http();