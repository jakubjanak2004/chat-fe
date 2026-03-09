type BackendListener = (status: BackendStatusInfo) => void;

type BackendStatusInfo = {
    isUnavailable: boolean;
    message: string | null;
};

class BackendState {
    private state: BackendStatusInfo = {
        isUnavailable: false,
        message: null,
    };

    private listeners = new Set<BackendListener>();

    get current() {
        return this.state;
    }

    markHealthy() {
        this.setState({
            isUnavailable: false,
            message: null,
        });
    }

    markUnavailable(message: string) {
        this.setState({
            isUnavailable: true,
            message,
        });
    }

    private setState(next: BackendStatusInfo) {
        if (
            this.state.isUnavailable === next.isUnavailable &&
            this.state.message === next.message
        ) {
            return;
        }

        this.state = next;
        for (const listener of this.listeners) {
            listener(this.state);
        }
    }

    subscribe(listener: BackendListener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

export const backendState = new BackendState();