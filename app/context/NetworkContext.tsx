import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import {networkState} from "./NetworkState";

type NetworkContextValue = {
    isOffline: boolean;
    isConnected: boolean | null;
};

const NetworkContext = createContext<NetworkContextValue>({
    isOffline: false,
    isConnected: null,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const connected =
                !!state.isConnected && state.isInternetReachable !== false;

            setIsConnected(connected);
            networkState.setOffline(!connected);
        });

        return unsubscribe;
    }, []);

    const value = useMemo(
        () => ({
            isConnected,
            isOffline: isConnected === false,
        }),
        [isConnected]
    );

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
}

export function useNetwork() {
    return useContext(NetworkContext);
}