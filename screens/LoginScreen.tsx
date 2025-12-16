import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {GreenButton} from "../components/button/GreenButton";
import BlueButton from "../components/button/BlueButton";
import Divider from "../components/divider/Divider";
import GrayTextInput from "../components/textInput/GrayTextInput";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteProp} from "@react-navigation/native";

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<any>;
    route: RouteProp<any>;
}

const LoginScreen = ({navigation, route}: LoginScreenProps) => {
    return (
        <SafeAreaView
            className="flex-1 bg-[rgb(10,10,10)]"
            edges={["top"]}
        >
            <View className="flex-1 pt-16 px-6 bg-black">
                <GrayTextInput
                    placeholder="username"
                    autoCapitalize="none"
                />
                <GrayTextInput
                    placeholder="password"
                    secureTextEntry
                />

                <BlueButton
                    value="Log In"
                    onPress={() => navigation.navigate("Chats")}
                />

                <TouchableOpacity className="mt-4 self-center">
                    <Text className="text-white underline">Forgot password?</Text>
                </TouchableOpacity>

                <Divider />

                <GreenButton
                    value="Sign Up"
                    onPress={() => navigation.navigate("Signup")}
                />
            </View>
        </SafeAreaView>
    );
};

export default LoginScreen;
