import {useAuth} from "../context/AuthContext";
import AppNavigator from "./AppNavigator";
import AuthNavigator from "./AuthNavigator";
import Initializing from "../components/Initializing";

export default function RootNavigator() {
    const {loggedIn, initializing} = useAuth();

    if (initializing) {
        return <Initializing />;
    }

    if (loggedIn) {
        return <AppNavigator />;
    }

    return <>
        <AuthNavigator key="auth"/>
    </>
}