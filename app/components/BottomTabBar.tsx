import React from "react";
import {View, Pressable} from "react-native";
import {useNavigation, useRoute} from "@react-navigation/native";

import MessageIcon from "../../assets/icons/message-icon.svg";
import PeopleIcon from "../../assets/icons/people-icon.svg";
import SettingsIcon from "../../assets/icons/settings-icon.svg";
import {BlurView} from "expo-blur";

const ACTIVE = "white";
const INACTIVE = "#8E8E93";

export default function BottomTabBar() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const current = route.name;

    return (
        <View className="absolute left-0 right-0 bottom-0">
            <BlurView
                className="h-28"
                intensity={60}
                tint="dark"
            />

            <View className="absolute left-0 right-0 bottom-0 px-5 py-6 pt-4">
                <View className="flex-row items-center justify-between">
                    <Pressable
                        onPress={() => navigation.navigate("Chats")}
                        className="items-center justify-center p-5"
                        hitSlop={8}
                    >
                        <MessageIcon width={30} height={30} fill={current === "Chats" ? ACTIVE : INACTIVE}/>
                    </Pressable>

                    <Pressable
                        onPress={() => navigation.navigate("People")}
                        className="items-center justify-center p-5"
                        hitSlop={8}
                    >
                        <PeopleIcon width={34} height={34} fill={current === "People" ? ACTIVE : INACTIVE}/>
                    </Pressable>

                    <Pressable
                        onPress={() => navigation.navigate("Settings")}
                        className="items-center justify-center p-5"
                        hitSlop={8}
                    >
                        <SettingsIcon width={30} height={30} fill={current === "Settings" ? ACTIVE : INACTIVE}/>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
