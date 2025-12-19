import React, {useState} from "react";
import {
    View,
    Text,
    TouchableOpacity, Alert,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {GreenButton} from "../components/button/GreenButton";
import BlueButton from "../components/button/BlueButton";
import Divider from "../components/divider/Divider";
import GrayTextInput from "../components/textInput/GrayTextInput";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteProp} from "@react-navigation/native";
import {http} from "../lib/http";
import {useAuth} from "../context/AuthContext";
import axios from "axios";

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<any>;
    route: RouteProp<any>;
}

const LoginScreen = ({navigation, route}: LoginScreenProps) => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const {login} = useAuth();

    async function logInCallback() {
        try {
            const res = await http.client.post('/auth/login', {
                username, password
            });
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
