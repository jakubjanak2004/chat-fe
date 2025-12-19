import GrayTextInput from "./GrayTextInput";
import SearchIcon from "../../../assets/icons/search-icon.svg";
import React from "react";
import {TextInputProps, View} from "react-native";

type SearchTextInputProps = Omit<TextInputProps, "placeholderTextColor"> & {
    icon?: React.ReactNode;
    className?: string;
    inputClassName?: string;
};

export default function SearchTextInput({
                                            icon,
                                            className = "",
                                            inputClassName = "",
                                            ...rest
                                        }: SearchTextInputProps) {
    return <>
        <View className="pt-5 pl-3 pr-3">
            <GrayTextInput
                icon={<SearchIcon width={15} height={15} stroke="#8E8E93"/>}
                placeholder="Search"
                {...rest}
            />
        </View>
    </>
}