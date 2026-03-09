import {Text, View} from "react-native";
import React from "react";

export default function BackendUnavailable() {
    return <>
        <View className="flex-1 items-center justify-center px-6">
            <Text className="text-white text-lg font-semibold text-center">
                Backend Unavailable
            </Text>
            <Text className="text-white/70 text-center mt-2">
                Please make sure the backend is running.
            </Text>
        </View>
    </>
}