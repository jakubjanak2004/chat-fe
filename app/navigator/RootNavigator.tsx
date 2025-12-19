import {useAuth} from "../context/AuthContext";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";

export default function RootNavigator() {
    const {loggedIn} = useAuth();

    return <>
        {loggedIn ? <AppNavigator key="app"/> : <AuthNavigator key="auth"/>}
    </>
}