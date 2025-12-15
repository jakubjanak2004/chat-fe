import React from "react";
import {Text, TouchableOpacity, TouchableOpacityProps} from "react-native";

type BaseButtonProps = {
    value: string;
    className?: string;
    onPress?: () => void;
} & TouchableOpacityProps;

export type SimpleButtonProps = {
    value: string;
    onPress?: () => void;
};

export function BaseButton({
   value,
   className,
    onPress,
   ...touchableProps
}: BaseButtonProps) {
    function callOnPress() {
        if (onPress) {
            onPress();
        }
    }
    return (
        <TouchableOpacity
            className={`rounded-xl py-3 mt-1 items-center ${className ?? ""}`}
            {...touchableProps}
            onPress={callOnPress}
        >
            <Text className="text-white font-semibold text-base">
                {value}
            </Text>
        </TouchableOpacity>
    );
}
