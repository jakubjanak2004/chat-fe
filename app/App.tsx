import '../global.css';
import React from "react";

import {SafeAreaProvider} from "react-native-safe-area-context";
import Routes from "./Routes";
import {AuthProvider} from "./context/AuthContext";

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <Routes/>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
