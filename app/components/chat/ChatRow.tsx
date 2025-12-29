import {Pressable, View, Image, Text} from "react-native";
import StatusIcon, {ReadState} from "../icon/StatusIcon";
import {Message} from "../message/MessageRow";
import {useNavigation} from "@react-navigation/native";
import {Person} from '../people/PersonRow';
import ProfilePicDefault from "../people/ProfilePicDefault";

export type Chat = {
    id: string;
    name: string;
    lastMessage: Message,
    chatUsers: Person[],
    avatar?: string;
};

export default function ChatRow({item}: { item: Chat }) {
    const navigation = useNavigation();

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

    async function onChatRowPressed() {
        // @ts-ignore
        navigation.navigate('Chat', {id: item.id});
    }

    return <>
        <Pressable
            onPress={() => onChatRowPressed()}
            className="flex-row items-center px-5 py-3 active:opacity-80"
        >
            <View className="h-14 w-14 rounded-full bg-neutral-700/60 overflow-hidden">
                {item.avatar ? (
                    <Image source={{uri: item.avatar}} className="h-full w-full"/>
                ) : (
                    <ProfilePicDefault/>
                )}
            </View>

            <View className="flex-1 ml-4">
                <Text className="text-white text-[18px] font-semibold">{item.name}</Text>
                <View className="flex-row items-center mt-1">
                    {lastMessageText}
                </View>
            </View>

            <View className="ml-3">
                {/* todo do not handle the message icon right now */}
                {/*<StatusIcon state={item.state}/>*/}
            </View>
        </Pressable>
    </>
}