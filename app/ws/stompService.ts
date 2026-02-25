import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import {CONFIG} from "../config/env";
import SockJS from "sockjs-client";

type Unsubscribe = () => void;

type SubDef = {
    destination: string;
    callback: (msg: IMessage) => void;
    subscription?: StompSubscription;
};

class StompService {
    private client: Client | null = null;
    private connected = false;

    private getToken: (() => string | null) | null = null;

    // registry of desired subscriptions so we can resubscribe after reconnect
    private subs = new Map<string, SubDef>(); // key = destination

    connect(
        getToken: () => string | null,
        onConnect?: () => void,
        onError?: (err: any) => void
    ) {
        // keep latest token getter (useful for reconnects)
        this.getToken = getToken;

        // if already active/created, don’t create a second client
        if (this.client) {
            // optional: if you want to force reconnect when token changes, call this.reconnect()
            return;
        }

        this.client = new Client({
            webSocketFactory: () => new SockJS(CONFIG.WS_URL),

            brokerURL: CONFIG.WS_URL,
            reconnectDelay: CONFIG.WS_RECONNECT_DELAY,
            heartbeatIncoming: CONFIG.WS_HEARTBEAT_INCOMING,
            heartbeatOutgoing: CONFIG.WS_HEARTBEAT_OUTGOING,

            forceBinaryWSFrames: false,
            appendMissingNULLonIncoming: true,

            connectHeaders: {
                Authorization: `Bearer ${getToken()}`,
            },

            debug: (msg) => console.log("[STOMP]", msg),

            onConnect: () => {
                console.log("[WS] STOMP CONNECTED");
                this.connected = true;

                for (const def of this.subs.values()) {
                    def.subscription = this.client!.subscribe(def.destination, def.callback);
                }

                onConnect?.();
            },

            onDisconnect: () => console.log("[WS] STOMP DISCONNECTED"),

            onStompError: (frame) => {
                console.warn("[WS] STOMP ERROR", frame.headers["message"], frame.body);

                onError?.(frame.headers["message"] ?? frame.body);
            },

            onWebSocketClose: (evt) => {
                console.log("[WS] WebSocket CLOSE", evt);
                this.connected = false;
                // server dropped subs; we recreate them onConnect
                for (const def of this.subs.values()) def.subscription = undefined;
            },

            onWebSocketError: (e) => {
                onError?.(e);
            },
        });

        this.client.activate();
    }

    /**
     * Call this when token changes (refresh) or on logout.
     * - token refresh: disconnect(false) then connect(newTokenProvider)
     * - logout: disconnect(true)
     */
    disconnect(clearSubscriptions = true) {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
        this.connected = false;

        if (clearSubscriptions) this.subs.clear();
        else {
            // keep desired subscriptions but drop active handles (they're invalid now)
            for (const def of this.subs.values()) def.subscription = undefined;
        }
    }

    isConnected() {
        return this.connected;
    }

    /**
     * Subscribe and auto-resubscribe on reconnect.
     * Returns an unsubscribe function.
     */
    subscribe(destination: string, callback: (msg: IMessage) => void): Unsubscribe {
        // store desired subscription
        this.subs.set(destination, { destination, callback });

        // if connected now, subscribe immediately
        if (this.client && this.connected) {
            const def = this.subs.get(destination)!;
            def.subscription = this.client.subscribe(destination, callback);
        }

        return () => {
            const def = this.subs.get(destination);
            def?.subscription?.unsubscribe();
            this.subs.delete(destination);
        };
    }

    /**
     * Optional: publishing (if you later send via WS instead of REST).
     */
    publish(destination: string, body: unknown) {
        if (!this.client || !this.connected) {
            throw new Error("STOMP client is not connected");
        }
        this.client.publish({
            destination,
            body: JSON.stringify(body),
        });
    }

    /** If you need to reconnect because token changed */
    reconnect() {
        if (!this.getToken) return;
        // keep desired subs, drop active ones, reconnect
        this.disconnect(false);
        this.connect(this.getToken);
    }

    private buildConnectHeaders() {
        const token = this.getToken?.() ?? null;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
}

export const stompService = new StompService();
