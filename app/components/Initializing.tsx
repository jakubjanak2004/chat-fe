import {Text, View} from "react-native";
import React from "react";

export default function Initializing() {
    return <>
        <View className="flex-1 items-center justify-center px-6">
            <Text className="text-white text-lg font-semibold text-center">
                Initializing...
            </Text>
            <Text className="text-white/70 text-center mt-2">
                Trying to login.
            </Text>
        </View>
    </>
}