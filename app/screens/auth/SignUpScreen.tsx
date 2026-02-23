import React from "react";
import {View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import BlueButton from "../../components/button/BlueButton";
import {GreenButton} from "../../components/button/GreenButton";
import GrayTextInput from "../../components/textInput/GrayTextInput";
import Divider from "../../components/divider/Divider";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteProp} from "@react-navigation/native";
import {http} from "../../hooks/http";
import {useAuth} from "../../context/AuthContext";
import {paths} from "../../../api/schema";

type SignUpDTO = paths["/auth/signup"]["post"]["requestBody"]["content"]["application/json"];
type AuthResponseDTO = paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];


type SignUpScreenProps = {
    navigation: NativeStackNavigationProp<any>;
    route: RouteProp<any>;
}

const SignUpScreen = ({navigation}: SignUpScreenProps) => {
    const {login} = useAuth();
    const [username, setUsername] = React.useState<string>("");
    const [firstName, setFistName] = React.useState<string>("");
    const [lastName, setLastName] = React.useState<string>("");
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    async function onSignUp() {
        try {
            const payload: SignUpDTO = {
                username,
                firstName,
                lastName,
                email,
                password,
            }
            const res = await http.client.post<AuthResponseDTO>('/auth/signup', payload);
            const data = res.data;
            login(data.token, data);
        } catch (error) {
            console.error(error);
        }
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
