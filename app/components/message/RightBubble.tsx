import React from "react";
import { View, Text } from "react-native";
import { Message } from "./MessageRow";

type Props = {
    item: Message;
};

function RightBubble({ item }: Props) {
    const showReply = !!item.responseToId

    return (
        <View className="flex-row justify-end items-end px-4 mb-3">
            <View className="max-w-[78%] bg-blue-500 rounded-2xl px-4 py-3">
                {showReply && (
                    <View className="mb-2 px-3 py-2 rounded-xl bg-white/10 border-l-4 border-white/60">
                        <Text className="text-white/90 text-[12px] mb-1 font-semibold">
                            Replying to {item.responseToSender?.username ?? "message"}
                        </Text>

                        {!!item.responseToContent && (
                            <Text
                                className="text-white/75 text-[13px] leading-4"
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {item.responseToContent}
                            </Text>
                        )}
                    </View>
                )}

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
        prev.item.created === next.item.created &&
        prev.item.responseToId === next.item.responseToId &&
        prev.item.responseToContent === next.item.responseToContent &&
        prev.item.responseToSender?.username === next.item.responseToSender?.username
);