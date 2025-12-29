import React from "react";
import { View, Text, Image } from "react-native";
import { Message } from "./MessageRow";
import { CONFIG } from "../../config/env";
import ProfilePicDefault from "../people/ProfilePicDefault";

type Props = {
    item: Message;
};

function LeftBubble({ item }: Props) {
    let profilePic = <ProfilePicDefault />;
    if (item.sender.hasProfilePicture) {
        profilePic = <Image
            source={{
                uri: `${CONFIG.API_URL}/users/${item.sender.username}/profile-picture`,
            }}
            className="rounded-full"
        />
    }

    return (
        <View className="flex-row items-end px-4 mb-3">
            <View className="w-11 h-8 pr-3">{profilePic}</View>
            <View className="max-w-[78%] bg-white/15 rounded-2xl px-4 py-3">
                <Text className="text-white text-[15px] leading-5">
                    {item.content}
                </Text>
            </View>
        </View>
    );
}

export default React.memo(
    LeftBubble,
    (prev, next) =>
        prev.item.id === next.item.id &&
        prev.item.content === next.item.content &&
        prev.item.created === next.item.created &&
        prev.item.sender.username === next.item.sender.username &&
        prev.item.sender.hasProfilePicture ===
        next.item.sender.hasProfilePicture
);
