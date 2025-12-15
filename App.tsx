import './global.css';
import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {SafeAreaProvider} from "react-native-safe-area-context";

import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: true,
                        animation: "none",
                        headerStyle: {
                            backgroundColor: "rgb(10,10,10)",
                        },
                        headerTintColor: "#ffffff",
                        headerTitleStyle: {
                            fontSize: 24,
                            fontWeight: "700",
                        },
                        headerTitleAlign: "left",
                        headerShadowVisible: false,
                    }}
                >
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{
                            title: "Log In",
                            headerBackVisible: false,
                        }}
                    />
                    <Stack.Screen
                        name="Signup"
                        component={SignUpScreen}
                        options={{
                            title: "Sign Up",
                            headerBackVisible: false,
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
