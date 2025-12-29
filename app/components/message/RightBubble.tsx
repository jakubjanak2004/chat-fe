import React from "react";
import { View, Text } from "react-native";
import { Message } from "../message/MessageRow";

type Props = {
    item: Message;
};

function RightBubble({ item }: Props) {
    return (
        <View className="flex-row justify-end items-end px-4 mb-3">
            <View className="max-w-[78%] bg-blue-500 rounded-2xl px-4 py-3">
                <Text className="text-white text-[15px] leading-5">{item.content}</Text>
            </View>
        </View>
    );
}

export default React.memo(
    RightBubble,
    (prev, next) =>
        prev.item.id === next.item.id &&
        prev.item.content === next.item.content &&
        prev.item.created === next.item.created
);
