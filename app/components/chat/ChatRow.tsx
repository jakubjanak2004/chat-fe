import {Pressable, View, Image, Text} from "react-native";
import StatusIcon, {ReadState} from "../icon/StatusIcon";
import {Message} from "../message/MessageRow";

export type Chat = {
    id: string;
    name: string;
    lastMessage: Message,
    avatar?: string;
};

export default function ChatRow({
                                    item,
                                    onPress,
                                }: {
    item: Chat;
    onPress?: (chat: Chat) => void;
}) {
    return (
        <Pressable
            onPress={() => onPress?.(item)}
            className="flex-row items-center px-5 py-3 active:opacity-80"
        >
            <View className="h-14 w-14 rounded-full bg-neutral-700/60 overflow-hidden">
                {item.avatar ? (
                    <Image source={{uri: item.avatar}} className="h-full w-full"/>
                ) : (
                    <View className="h-full w-full items-center justify-center">
                        {/* todo add person icon here for people with no profile pic */}
                        {/*<Ionicons name="person" size={22} color="rgba(255,255,255,0.65)" />*/}
                    </View>
                )}
            </View>

            <View className="flex-1 ml-4">
                <Text className="text-white text-[18px] font-semibold">{item.name}</Text>
                <View className="flex-row items-center mt-1">
                    <Text className="text-neutral-400 text-[14px]" numberOfLines={1}>
                        {item.lastMessage?.content}
                    </Text>
                    <Text className="text-neutral-500 text-[14px]">{"  ·  "}</Text>
                    <Text className="text-neutral-500 text-[14px]">{item.lastMessage?.created}</Text>
                </View>
            </View>

            <View className="ml-3">
                {/* todo do not handle the message icon right now */}
                {/*<StatusIcon state={item.state}/>*/}
            </View>
        </Pressable>
    );
}