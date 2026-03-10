import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import ChatsScreen from "../screens/chats/ChatsScreen";
import PeopleScreen from "../screens/people/PeopleScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import ChatScreen from "../screens/chats/ChatScreen";
import {ChatEventsProvider} from "../context/ChatsEventsContext";
import {useAuth} from "../context/AuthContext";
import {useCallback} from "react";
import ChatSettingsScreen from "../screens/chats/ChatSettingsScreen";

export type RootStackParamList = {
    Chats: undefined;
    Chat: {
        id?: string;
        personUsernameFallback?: string;
    };
    ChatSettings: {
        id: string | null;
    };
    People: undefined;
    Settings: undefined;
    Login: undefined;
    Signup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    const {accessToken} = useAuth();
    const getToken = useCallback(() => accessToken, [accessToken]);

    return <>
        <ChatEventsProvider getToken={getToken}>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerShown: true,
                        animation: "fade",
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
                            animation: "slide_from_right",
                        }}
                    />
                    <Stack.Screen
                        name="ChatSettings"
                        component={ChatSettingsScreen}
                        options={{
                            title: "Chat Settings",
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