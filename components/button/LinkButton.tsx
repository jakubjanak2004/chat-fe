import {Pressable, Text, View} from "react-native";
import React from "react";
import RightArrow from "../../assets/icons/right-arrow-icon.svg"

export default function LinkButton({
                                       label,
                                       onPress,
                                   }: {
    label: string;
    onPress?: () => void;
}) {
    return (
        <Pressable onPress={onPress} className="px-5 active:opacity-80">
            <View className="flex-row items-center justify-between py-3">
                <Text className="text-neutral-400 text-[14px]">{label}</Text>
                <RightArrow width={20} height={20} stroke="white"/>
            </View>
            <View className="h-[1px] bg-neutral-800/40"/>
        </Pressable>
    );
}