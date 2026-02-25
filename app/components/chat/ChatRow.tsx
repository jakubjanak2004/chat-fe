import {Pressable, View, Image, Text} from "react-native";
import {MessageDTO} from "../message/MessageRow";
import {useNavigation} from "@react-navigation/native";
import ProfilePicDefault from "../people/ProfilePicDefault";
import {ChatUserDTO} from "../../screens/people/PeopleScreen";

export type Chat = {
    id: string;
    name: string;
    lastMessage: MessageDTO,
    chatUsers: ChatUserDTO[],
    avatar?: string;
};

type Props = { chat: Chat; lastMessage?: any; unreadCount?: number; }


export default function ChatRow(item: Props) {
    const navigation = useNavigation();
    const chat = item.chat;

    let lastMessageText = <Text/>;
    if (item.lastMessage) {
        const lastMessage = item.lastMessage;
        const d = new Date(lastMessage.created);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");

        lastMessageText = <Text numberOfLines={1}>
            <Text className="text-neutral-400 text-[14px]">
                {lastMessage.content}
            </Text>
            <Text className="text-neutral-500 text-[14px]">{"  ·  "}</Text>
            <Text className="text-neutral-500 text-[14px]">
                {`${hh}:${mm}`}
            </Text>
        </Text>
    }

    let avatarImage = <ProfilePicDefault/>
    if (chat.avatar) {
        avatarImage = <Image source={{uri: chat.avatar}} className="h-full w-full"/>
    }

    async function onChatRowPressed() {
        // @ts-ignore
        navigation.navigate('Chat', {id: chat.id});
    }

    return <>
        <Pressable
            onPress={() => onChatRowPressed()}
            className="flex-row items-center px-5 py-3 active:opacity-80"
        >
            <View className="h-14 w-14 rounded-full bg-neutral-700/60 overflow-hidden">
                {avatarImage}
            </View>

            <View className="flex-1 ml-4">
                <Text className="text-white text-[18px] font-semibold">{chat.name}</Text>
                <View className="flex-row items-center mt-1">
                    {lastMessageText}
                </View>
            </View>
        </Pressable>
    </>
}