import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";

import BottomTabBar from "../../components/BottomTabBar";
import ChatRow, { Chat } from "../../components/chat/ChatRow";
import SearchTextInput from "../../components/textInput/SearchTextInput";
import FlatListDivider from "../../components/divider/FlatListDivider";
import { http } from "../../lib/http";
import { CONFIG } from "../../config/env";

export default function ChatsScreen() {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 350);
    const normalizedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

    const [chats, setChats] = useState<Chat[]>([]);
    const [page, setPage] = useState(0);
    const [last, setLast] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const [listHeight, setListHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    // increasing number; responses that aren't the latest get ignored
    const requestSeq = useRef(0);

    async function loadAndReplacePage(pageToLoad: number) {
        if (loading) return;

        const seq = ++requestSeq.current;

        try {
            setLoading(true);

            const res = await http.client.get("/chats/me", {
                params: {
                    query: normalizedQuery, // backend should search chat.name by this
                    page: pageToLoad,
                    size: CONFIG.PAGE_SIZE,
                },
            });

            if (seq !== requestSeq.current) return;

            const data = res.data;
            setPage(data.number);
            setLast(data.last);
            setChats(data.content);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function loadPage(pageToLoad: number) {
        if (loadingMore || last) return;

        const seq = ++requestSeq.current;

        try {
            setLoadingMore(true);

            const res = await http.client.get("/chats/me", {
                params: {
                    query: normalizedQuery,
                    page: pageToLoad,
                    size: CONFIG.PAGE_SIZE,
                },
            });

            if (seq !== requestSeq.current) return;

            const data = res.data;
            setPage(data.number);
            setLast(data.last);

            setChats((prev) => [...prev, ...data.content]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMore(false);
        }
    }

    const maybeLoadMore = () => {
        // if list is not scrollable and more pages exist -> load next
        const notScrollable = contentHeight > 0 && contentHeight <= listHeight;

        if (notScrollable && !loading && !loadingMore && !last) {
            loadPage(page + 1);
        }
    };

    const onEndReached = () => {
        if (loading || loadingMore || last) return;
        loadPage(page + 1);
    };

    // when query changes -> reset and load first page
    useEffect(() => {
        setChats([]);
        setPage(0);
        setLast(false);
        loadAndReplacePage(0);
    }, [normalizedQuery]);

    useEffect(() => {
        maybeLoadMore();
    }, [listHeight, contentHeight, last, loading, loadingMore, page]);

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            {/* Search */}
            <SearchTextInput value={query} onChangeText={setQuery} />

            {/* List */}
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatRow item={item} />}
                ItemSeparatorComponent={() => <FlatListDivider />}
                className="flex-1"
                onEndReached={onEndReached}
                onEndReachedThreshold={0.6}
                onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
                onContentSizeChange={(_, h) => setContentHeight(h)}
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
