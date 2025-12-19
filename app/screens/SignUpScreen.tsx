import React from "react";
import {View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import BlueButton from "../components/button/BlueButton";
import {GreenButton} from "../components/button/GreenButton";
import GrayTextInput from "../components/textInput/GrayTextInput";
import Divider from "../components/divider/Divider";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteProp} from "@react-navigation/native";

type SignUpScreenProps = {
    navigation: NativeStackNavigationProp<any>;
    route: RouteProp<any>;
}

const SignUpScreen = ({navigation, route}: SignUpScreenProps) => {
    return <>
        <SafeAreaView
            className="flex-1 bg-[rgb(10,10,10)]"
            edges={["top"]}
        >
            <View className="flex-1 pt-8 px-6 bg-black">
                <GrayTextInput
                    placeholder="username"
                    autoCapitalize="none"
                />
                <GrayTextInput
                    placeholder="First Name"
                />
                <GrayTextInput
                    placeholder="Last Name"
                />
                <GrayTextInput
                    placeholder="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <GrayTextInput
                    placeholder="password"
                    secureTextEntry
                />

                <GreenButton
                    value="Sign Up"
                    onPress={() => navigation.navigate("Chats")}
                />

                <Divider/>

                <BlueButton
                    value="Log In"
                    onPress={() => navigation.navigate("Login")}
                />
            </View>
        </SafeAreaView>
    </>
};

export default SignUpScreen;
