import React from "react";
import {View, TextInput, TextInputProps} from "react-native";

type GrayTextInputProps = Omit<TextInputProps, "placeholderTextColor"> & {
    icon?: React.ReactNode;
    className?: string;
    inputClassName?: string;
};

export default function GrayTextInput({
                                          icon,
                                          className = "",
                                          inputClassName = "",
                                          ...rest
                                      }: GrayTextInputProps) {
    return (
        <View className={`flex-row items-center bg-neutral-800 rounded-xl px-4 mb-4 ${className}`}>
            {icon ? <View className="mr-2">{icon}</View> : null}

            <TextInput
                className={`flex-1 text-white py-3 leading-none ${inputClassName}`}
                placeholderTextColor="#9a9a9a"
                textAlignVertical="center" // helps Android
                {...rest}
            />
        </View>
    );
}
