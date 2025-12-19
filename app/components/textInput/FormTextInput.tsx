import {Text, TextInput, View} from "react-native";
import React from "react";

export default function FormTextInput({
                      label,
                      value,
                      onChangeText,
                      keyboardType,
                      autoCapitalize,
                  }: {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    keyboardType?: "default" | "email-address";
    autoCapitalize?: "none" | "words" | "sentences";
}) {
    return (
        <View className="px-5">
            <View className="flex-row items-center justify-between py-2">
                <Text className="text-neutral-400 text-[14px]">{label}</Text>

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    className="text-white text-[14px] text-right min-w-[180px] py-2 leading-[18px]"
                    placeholderTextColor="rgba(163,163,163,0.8)"
                    textAlign="right"
                    textAlignVertical="center"
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                />
            </View>

            <View className="h-[1px] bg-neutral-800/40"/>
        </View>
    );
}