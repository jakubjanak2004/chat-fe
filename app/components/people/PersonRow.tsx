import React from "react";
import {View, Text, Image, Pressable} from "react-native";
import {CONFIG} from "../../config/env";
import ProfilePicDefault from "./ProfilePicDefault";

export type Person = {
    username: string;
    firstName: string;
    lastName: string;
    hasProfilePicture: boolean,
};

export default function PersonRow({
                                      item,
                                      onPress,
                                  }: {
    item: Person;
    onPress?: (p: Person) => void;
}) {
    // name parsing
    const name = `${item.firstName} ${item.lastName}`;


    let profilePic;
    if (item.hasProfilePicture) {
        const url = `${CONFIG.API_URL}/users/${item.username}/profile-picture`;
        profilePic = <Image source={{uri: url}} className="h-full w-full"/>;
    } else {
        profilePic = <ProfilePicDefault />
    }

    return (
        <Pressable
            onPress={() => onPress?.(item)}
            className="flex-row items-center px-5 py-4 active:opacity-80"
        >
            <View className="h-12 w-12 rounded-full overflow-hidden">
                {profilePic}
            </View>

            <Text className="ml-4 text-white text-[16px] font-medium">{name}</Text>
        </Pressable>
    );
}
