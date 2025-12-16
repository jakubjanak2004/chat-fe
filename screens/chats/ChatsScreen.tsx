import React, {useMemo, useState} from "react";
import {
    View,
    FlatList,

} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import BottomTabBar from "../../components/BottomTabBar";
import ChatRow, {Chat} from "./ChatRow";
import {ReadState} from "../../components/icon/StatusIcon";
import SearchTextInput from "../../components/textInput/SearchTextInput";

// todo these are mocked data, will be removed by real backend data
const chatsMock: Chat[] = [
    {
        id: "1",
        name: "Jacob Stanley",
        preview: "You: What’s man!",
        time: "9:40 AM",
        avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        state: ReadState.Delivered
    },
    {
        id: "2",
        name: "Andrew Parker",
        preview: "You: Ok, thanks!",
        time: "9:25 AM",
        avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        state: ReadState.Delivered
    },
    {
        id: "3",
        name: "Karen Castillo",
        preview: "You: Ok, See you in To…",
        time: "Fri",
        avatar:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
        state: ReadState.Sending
    },
    {
        id: "4",
        name: "Maisy Humphrey",
        preview: "Have a good day, Maisy!",
        time: "Fri",
        avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        state: ReadState.Read
    },
    {
        id: "5",
        name: "Joshua Lawrence",
        preview: "The business plan loo…",
        time: "Thu",
        avatar:
            "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=80",
        state: ReadState.Sending
    },
];

export default function ChatsScreen() {
    const [q, setQ] = useState("");

    // todo load data from REST backend
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
        <SafeAreaView className="flex-1 bg-black justify-start" edges={["bottom"]}>
            {/* Search Bar */}
            <View className="pt-5 pl-3 pr-3">
                <SearchTextInput />
            </View>

            {/* List of chats */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => <ChatRow item={item}/>}
                ItemSeparatorComponent={() => (
                    <View className="h-[1px] bg-neutral-800/40 mx-5"/>
                )}
                className="flex-1"
            />

            <BottomTabBar/>
        </SafeAreaView>
    );
}
