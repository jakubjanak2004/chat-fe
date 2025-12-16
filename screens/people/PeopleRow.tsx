import React from "react";
import {View, Text, Image, Pressable} from "react-native";

export type Person = {
    id: string;
    name: string;
    avatar?: string;
};

export default function PeopleRow({
                                      item,
                                      onPress,
                                  }: {
    item: Person;
    onPress?: (p: Person) => void;
}) {
    return (
        <Pressable
            onPress={() => onPress?.(item)}
            className="flex-row items-center px-5 py-4 active:opacity-80"
        >
            <View className="h-12 w-12 rounded-full bg-neutral-700/60 overflow-hidden">
                {item.avatar ? (
                    <Image source={{uri: item.avatar}} className="h-full w-full"/>
                ) : (
                    <View className="h-full w-full"/>
                )}
            </View>

            <Text className="ml-4 text-white text-[16px] font-medium">{item.name}</Text>
        </Pressable>
    );
}
