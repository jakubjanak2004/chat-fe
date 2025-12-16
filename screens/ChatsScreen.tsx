import React, { useMemo, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    Image,
    FlatList,
    Pressable,
    StatusBar,
    Platform,
} from "react-native";

import ChatIcon from "../assets/icons/message-icon.svg";
import PeopleIcon from "../assets/icons/people-icon.svg";
import SettingsIcon from "../assets/icons/settings-icon.svg";

type Chat = {
    id: string;
    name: string;
    preview: string;
    time: string;
    avatar?: string;
    unread?: boolean;
    read?: boolean;
};

const chatsMock: Chat[] = [
    {
        id: "1",
        name: "Jacob Stanley",
        preview: "You: What’s man!",
        time: "9:40 AM",
        avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        unread: true,
    },
    {
        id: "2",
        name: "Andrew Parker",
        preview: "You: Ok, thanks!",
        time: "9:25 AM",
        avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        read: true,
    },
    {
        id: "3",
        name: "Karen Castillo",
        preview: "You: Ok, See you in To…",
        time: "Fri",
        avatar:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
        read: true,
    },
    {
        id: "4",
        name: "Maisy Humphrey",
        preview: "Have a good day, Maisy!",
        time: "Fri",
        avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        read: true,
    },
    {
        id: "5",
        name: "Joshua Lawrence",
        preview: "The business plan loo…",
        time: "Thu",
        avatar:
            "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=80",
        read: false,
    },
];

function StatusIcon({ unread, read }: { unread?: boolean; read?: boolean }) {
    if (unread) {
        return (
            <View className="h-5 w-5 rounded-full border border-neutral-500/80" />
        );
    }

    if (read) {
        return <>
        </>
    }
    return <>
    </>
}

function ChatRow({
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
                    <Image source={{ uri: item.avatar }} className="h-full w-full" />
                ) : (
                    <View className="h-full w-full items-center justify-center">
                        {/*<Ionicons name="person" size={22} color="rgba(255,255,255,0.65)" />*/}
                    </View>
                )}
            </View>

            <View className="flex-1 ml-4">
                <Text className="text-white text-[18px] font-semibold">{item.name}</Text>
                <View className="flex-row items-center mt-1">
                    <Text className="text-neutral-400 text-[14px]" numberOfLines={1}>
                        {item.preview}
                    </Text>
                    <Text className="text-neutral-500 text-[14px]">{"  ·  "}</Text>
                    <Text className="text-neutral-500 text-[14px]">{item.time}</Text>
                </View>
            </View>

            <View className="ml-3">{/* right status icon */}
                <StatusIcon unread={item.unread} read={item.read} />
            </View>
        </Pressable>
    );
}

export default function ChatsScreen() {
    const [q, setQ] = useState("");

    const data = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return chatsMock;
        return chatsMock.filter(
            (c) =>
                c.name.toLowerCase().includes(s) ||
                c.preview.toLowerCase().includes(s)
        );
    }, [q]);

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" />

            {/* Top chrome (subtle fade like the screenshot) */}
            <View className="absolute top-0 left-0 right-0 h-40 bg-neutral-900/40" />

            {/* Header */}
            <View
                className={[
                    "pt-3 pb-4",
                    Platform.OS === "android" ? "pt-8" : "",
                ].join(" ")}
            >
                {/* Search */}
                <View className="px-5 mt-4">
                    <View className="flex-row items-center rounded-2xl bg-neutral-800/70 px-4 py-3">
                        {/*<Ionicons*/}
                        {/*    name="search"*/}
                        {/*    size={18}*/}
                        {/*    color="rgba(163,163,163,0.9)"*/}
                        {/*/>*/}
                        <TextInput
                            value={q}
                            onChangeText={setQ}
                            placeholder="Search"
                            placeholderTextColor="rgba(163,163,163,0.85)"
                            className="flex-1 ml-2 text-white text-base"
                            returnKeyType="search"
                        />
                    </View>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatRow item={item} />}
                ItemSeparatorComponent={() => (
                    <View className="h-[1px] bg-neutral-800/40 mx-5" />
                )}
                contentContainerStyle={{ paddingTop: 6, paddingBottom: 96 }}
                className="flex-1"
            />

            {/* Bottom tab bar */}
            <View className="absolute left-0 right-0 bottom-0">
                <View className="h-28 bg-neutral-900/60" />
                <View className="absolute left-0 right-0 bottom-0 px-10 pb-8 pt-4">
                    <View className="flex-row items-center justify-between">
                        <Pressable className="items-center justify-center">
                            <ChatIcon width={30} height={30} fill="white" />
                        </Pressable>

                        <Pressable className="items-center justify-center">
                            <PeopleIcon width={30} height={30} fill="white"/>
                        </Pressable>

                        <Pressable className="items-center justify-center">
                            <SettingsIcon width={30} height={30} fill="white"/>
                        </Pressable>
                    </View>

                    {/* iOS home indicator mock spacing */}
                    <View className="mt-5 h-1.5 w-36 self-center rounded-full bg-white/80" />
                </View>
            </View>
        </SafeAreaView>
    );
}
