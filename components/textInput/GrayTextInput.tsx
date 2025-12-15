import {TextInput, TextInputProps} from "react-native";
import React from "react";

type GrayTextInputProps = Omit<TextInputProps, "placeholderTextColor"> & {
    // allowing to override tailwind classes
    className?: string;
};

export default function GrayTextInput({...rest}: GrayTextInputProps) {
    return <>
        <TextInput
            className="bg-neutral-800 rounded-xl px-4 py-3 mb-4 text-white"
            placeholderTextColor="#9a9a9a"
            {...rest}
        />
    </>
}