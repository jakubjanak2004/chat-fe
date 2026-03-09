// src/services/networkState.ts
type Listener = (isOffline: boolean) => void;

class NetworkState {
    private isOffline = false;
    private listeners = new Set<Listener>();

    get offline() {
        return this.isOffline;
    }

    setOffline(value: boolean) {
        if (this.isOffline === value) return;

        this.isOffline = value;

        for (const listener of this.listeners) {
            listener(this.isOffline);
        }
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
}

export const networkState = new NetworkState();