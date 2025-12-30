import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ChatsScreen from "../screens/chats/ChatsScreen";
import PeopleScreen from "../screens/people/PeopleScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import ChatScreen from "../screens/chats/ChatScreen";
import {ChatEventsProvider} from "../context/ChatsEventsContext";
import {useAuth} from "../context/AuthContext";
import {useCallback} from "react";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const {token} = useAuth();
    const getToken = useCallback(() => token, [token]);

    return <>
        <ChatEventsProvider getToken={getToken}>
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
                        name="Chats"
                        component={ChatsScreen}
                        options={{
                            title: "Chats",
                            headerBackVisible: false,
                        }}
                    />
                    <Stack.Screen
                        name="Chat"
                        component={ChatScreen}
                        options={{
                            title: "Chat",
                        }}
                    />
                    <Stack.Screen
                        name="People"
                        component={PeopleScreen}
                        options={{
                            title: "People",
                            headerBackVisible: false,
                        }}
                    />
                    <Stack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{
                            title: "Settings",
                            headerBackVisible: false,
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </ChatEventsProvider>
    </>
}