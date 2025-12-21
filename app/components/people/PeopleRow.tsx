import React from "react";
import {View, Text, Image, Pressable} from "react-native";

export type Person = {
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
};

export default function PeopleRow({
                                      item,
                                      onPress,
                                  }: {
    item: Person;
    onPress?: (p: Person) => void;
}) {

    const name = `${item.firstName} ${item.lastName}`;
    // todo load the picture url dynamically
    const avatar =  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80";

    return (
        <Pressable
            onPress={() => onPress?.(item)}
            className="flex-row items-center px-5 py-4 active:opacity-80"
        >
            <View className="h-12 w-12 rounded-full bg-neutral-700/60 overflow-hidden">
                {avatar ? (
                    <Image source={{uri: avatar}} className="h-full w-full"/>
                ) : (
                    <View className="h-full w-full"/>
                )}
            </View>

            <Text className="ml-4 text-white text-[16px] font-medium">{name}</Text>
        </Pressable>
    );
}
