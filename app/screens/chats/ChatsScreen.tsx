import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";
import { useFocusEffect } from "@react-navigation/core";

import BottomTabBar from "../../components/BottomTabBar";
import ChatRow, { Chat } from "../../components/chat/ChatRow";
import SearchTextInput from "../../components/textInput/SearchTextInput";
import FlatListDivider from "../../components/divider/FlatListDivider";
import { http } from "../../hooks/http";
import { CONFIG } from "../../config/env";
import { usePagedList } from "../../hooks/usePagedList";
import { useChatEvents } from "../../context/ChatsEventsContext";

export default function ChatsScreen() {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 350);
    const normalizedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

    const { lastMessageByChatId, unreadByChatId } = useChatEvents();

    const fetchChatsPage = async (page: number) => {
        const res = await http.client.get("/chats/me", {
            params: { query: normalizedQuery, page, size: CONFIG.PAGE_SIZE },
        });
        return res.data;
    };

    const {
        items: chats,
        loading,
        loadingMore,
        onEndReached,
        onLayout,
        onContentSizeChange,
        loadAndReplacePage,
    } = usePagedList<Chat>(fetchChatsPage, [normalizedQuery]);

    useFocusEffect(
        useCallback(() => {
            loadAndReplacePage(0);
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            <SearchTextInput value={query} onChangeText={setQuery} />

            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatRow
                        item={item}
                        // add these props to ChatRow (recommended)
                        lastMessage={lastMessageByChatId[item.id] ?? item.lastMessage}
                        unreadCount={unreadByChatId[item.id] ?? 0}
                    />
                )}
                ItemSeparatorComponent={() => <FlatListDivider />}
                className="flex-1"
                onEndReached={onEndReached}
                onEndReachedThreshold={0.6}
                onLayout={onLayout}
                onContentSizeChange={onContentSizeChange}
                ListEmptyComponent={
                    loading ? (
                        <View className="items-center justify-center py-10">
                            <ActivityIndicator />
                        </View>
                    ) : (
                        <View className="items-center justify-center py-10">
                            <Text className="text-gray-400">
                                {normalizedQuery ? "No chats found." : "No chats yet."}
                            </Text>
                        </View>
                    )
                }
                ListFooterComponent={
                    loadingMore ? (
                        <View className="py-4">
                            <ActivityIndicator />
                        </View>
                    ) : null
                }
            />

            <BottomTabBar />
        </SafeAreaView>
    );
}
