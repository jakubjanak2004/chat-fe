import React, {useState} from "react";
import {
    View,
    Text,
    TouchableOpacity, Alert,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {GreenButton} from "../../components/button/GreenButton";
import BlueButton from "../../components/button/BlueButton";
import Divider from "../../components/divider/Divider";
import GrayTextInput from "../../components/textInput/GrayTextInput";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteProp} from "@react-navigation/native";
import {http} from "../../hooks/http";
import {useAuth} from "../../context/AuthContext";
import axios from "axios";
import {paths} from "../../../api/schema";
import {useNetwork} from "../../context/NetworkContext";
import NoInternetConnection from "../../components/NoInternetConnection";
import BackendUnavailable from "../../components/BackendUnavailable";
import BottomTabBar from "../../components/BottomTabBar";
import {useBackendStatus} from "../../hooks/UseBackendState";

type LoginRequest = paths["/auth/login"]["post"]["requestBody"]["content"]["application/json"];
type LoginResponse = paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];

type Props = {
    navigation: NativeStackNavigationProp<any>;
}

const LoginScreen = ({navigation}: Props) => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const {login} = useAuth();
    const {isOffline} = useNetwork();
    const {isUnavailable} = useBackendStatus();

    async function logInCallback() {
        try {
            const payload: LoginRequest = {username, password};
            const res = await http.client.post<LoginResponse>('/auth/login', payload);
            const data = res.data;
            login(data.token, data);
        } catch (error) {
            console.error(error);
            if (!axios.isAxiosError(error)) return;
            const status = error.response?.status;
            if (status == 401) {
                Alert.alert("The username or password is incorrect!");
            }
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
            <View className="flex-1 pt-16 px-6 bg-black">
                <GrayTextInput
                    placeholder="username"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={username => setUsername(username)}
                />

                <GrayTextInput
                    placeholder="password"
                    secureTextEntry
                    value={password}
                    onChangeText={password => setPassword(password)}
                />

                <BlueButton
                    value="Log In"
                    onPress={() => logInCallback()}
                />

                <TouchableOpacity className="mt-4 self-center">
                    <Text className="text-white underline">Forgot password?</Text>
                </TouchableOpacity>

                <Divider/>

                <GreenButton
                    value="Sign Up"
                    onPress={() => navigation.navigate("Signup")}
                />
            </View>
        </SafeAreaView>
    </>
};

export default LoginScreen;
