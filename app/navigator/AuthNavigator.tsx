import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: true,
                    animation: "slide_from_right",
                    animationDuration: 220,
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
                    contentStyle: {
                        backgroundColor: "rgb(10,10,10)",
                    },
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        title: "Log In",
                        headerBackVisible: false,
                        animation: "slide_from_left",
                    }}
                />
                <Stack.Screen
                    name="Signup"
                    component={SignUpScreen}
                    options={{
                        title: "Sign Up",
                        headerBackVisible: false,
                        animation: "slide_from_right",
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}