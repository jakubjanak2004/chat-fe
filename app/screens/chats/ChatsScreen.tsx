import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ActivityIndicator, FlatList, Text, View} from "react-native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {useDebounce} from "use-debounce";
import {useFocusEffect} from "@react-navigation/core";

import BottomTabBar from "../../components/BottomTabBar";
import ChatRow, {Chat} from "../../components/chat/ChatRow";
import SearchTextInput from "../../components/textInput/SearchTextInput";
import FlatListDivider from "../../components/divider/FlatListDivider";
import {http} from "../../hooks/http";
import {CONFIG} from "../../config/env";
import {usePagedList} from "../../hooks/usePagedList";
import {useChatEvents} from "../../context/ChatsEventsContext";
import {paths} from "../../../api/schema";

type ChatQuery = NonNullable<paths["/chats/me"]["get"]["parameters"]["query"]>;
type PageChatDTO = paths["/chats/me"]["get"]["responses"]["200"]["content"]["application/json"];

export default function ChatsScreen() {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 350);
    const normalizedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

    const {lastMessageByChatId, unreadByChatId} = useChatEvents();

    const fetchChatsPage = async (page: number) => {
        const params: ChatQuery = {
            query: normalizedQuery,
            page,
            size: CONFIG.PAGE_SIZE,
            sort: ["name,asc"]
        }
        const res = await http.client.get<PageChatDTO>("/chats/me", {
            params,
            paramsSerializer: {indexes: null},
        });
        const data = res.data;

        return {
            content: (data.content ?? []) as Chat[],
            number: data.number ?? page,
            last: data.last ?? false,
        };
    };

    const {
        items: chats,
        loading,
        loadingMore,
        onEndReached,
        onLayout,
        onContentSizeChange,
    } = usePagedList<Chat>(fetchChatsPage, [normalizedQuery], {
        autoFillIfNotScrollable: false,
    });

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            <SearchTextInput value={query} onChangeText={setQuery}/>

            <FlatList
                data={chats}
                extraData={{lastMessageByChatId, unreadByChatId}}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                    <ChatRow
                        chat={item}
                        lastMessage={lastMessageByChatId[item.id] ?? item.lastMessage}
                        unreadCount={unreadByChatId[item.id] ?? 0}
                    />
                )}
                ItemSeparatorComponent={() => <FlatListDivider/>}
                className="flex-1"
                onEndReached={onEndReached}
                onEndReachedThreshold={0.6}
                onLayout={onLayout}
                onContentSizeChange={onContentSizeChange}
                ListEmptyComponent={
                    loading ? (
                        <View className="items-center justify-center py-10">
                            <ActivityIndicator/>
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
                    <>
                        {loadingMore ? (
                            <View className="py-4">
                                <ActivityIndicator/>
                            </View>
                        ) : null}

                        {/* spacer so last item can scroll under BottomTabBar */}
                        <View style={{height: CONFIG.TAB_BAR_HEIGHT}}/>
                    </>
                }
            />

            <BottomTabBar/>
        </SafeAreaView>
    )
        ;
}
