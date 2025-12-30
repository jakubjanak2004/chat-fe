import '../global.css';
import React, {useEffect} from "react";

import {SafeAreaProvider} from "react-native-safe-area-context";
import RootNavigator from "./navigator/RootNavigator";
import {AuthProvider} from "./context/AuthContext";
import {initNotifications} from "./notifications/notifications";

export default function App() {
    useEffect(() => {
        initNotifications();
    }, []);

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <RootNavigator/>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
