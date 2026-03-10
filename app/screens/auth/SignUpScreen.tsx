import React from "react";
import {View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import BlueButton from "../../components/button/BlueButton";
import {GreenButton} from "../../components/button/GreenButton";
import GrayTextInput from "../../components/textInput/GrayTextInput";
import Divider from "../../components/divider/Divider";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteProp} from "@react-navigation/native";
import {http} from "../../hooks/Http";
import {useAuth} from "../../context/AuthContext";
import {paths} from "../../../api/schema";
import NoInternetConnection from "../../components/NoInternetConnection";
import {useNetwork} from "../../context/NetworkContext";
import BackendUnavailable from "../../components/BackendUnavailable";
import BottomTabBar from "../../components/BottomTabBar";
import {useBackendStatus} from "../../hooks/UseBackendState";

type SignUpRequest = paths["/auth/signup"]["post"]["requestBody"]["content"]["application/json"];
type SignUpResponse = paths["/auth/signup"]["post"]["responses"]["200"]["content"]["application/json"];


type Props = {
    navigation: NativeStackNavigationProp<any>;
}

const SignUpScreen = ({navigation}: Props) => {
    const {login} = useAuth();
    const {isOffline} = useNetwork();
    const {isUnavailable} = useBackendStatus()
    const [username, setUsername] = React.useState<string>("");
    const [firstName, setFistName] = React.useState<string>("");
    const [lastName, setLastName] = React.useState<string>("");
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    async function onSignUp() {
        try {
            const payload: SignUpRequest = {
                username,
                firstName,
                lastName,
                email,
                password,
            }
            const res = await http.client.post<SignUpResponse>('/auth/signup', payload);
            const data = res.data;
            login(data.accessToken, data.refreshToken, data);
        } catch (error) {
            console.error(error);
        }
    }

    if (isOffline) {
        return <NoInternetConnection />
    } else if (isUnavailable) {
        return <>
            <BackendUnavailable />
        </>
    }

    return <>
        <SafeAreaView
            className="flex-1 bg-[rgb(10,10,10)]"
            edges={["top"]}
        >
            <View className="flex-1 pt-8 px-6 bg-black">
                <GrayTextInput
                    placeholder="username"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={setUsername}
                />
                <GrayTextInput
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFistName}
                />
                <GrayTextInput
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                />
                <GrayTextInput
                    placeholder="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <GrayTextInput
                    placeholder="password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <GreenButton
                    value="Sign Up"
                    onPress={() => onSignUp()}
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
