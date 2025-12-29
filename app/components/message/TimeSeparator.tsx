import React from "react";
import { Text, View } from "react-native";

type Props = { label: string };

function TimeSeparator({ label }: Props) {
    return (
        <View className="w-full items-center my-3">
            <Text className="text-white/40 text-xs">{label}</Text>
        </View>
    );
}

export default React.memo(TimeSeparator);