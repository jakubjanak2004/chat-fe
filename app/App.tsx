import '../global.css';
import React from "react";

import {SafeAreaProvider} from "react-native-safe-area-context";
import RootNavigator from "./navigator/RootNavigator";
import {AuthProvider} from "./context/AuthContext";

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <RootNavigator/>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
