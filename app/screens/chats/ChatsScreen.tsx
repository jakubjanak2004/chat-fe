import React, {useMemo, useState} from "react";
import {ActivityIndicator, FlatList, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useDebounce} from "use-debounce";

import BottomTabBar from "../../components/BottomTabBar";
import ChatRow, {Chat} from "../../components/chat/ChatRow";
import SearchTextInput from "../../components/textInput/SearchTextInput";
import FlatListDivider from "../../components/divider/FlatListDivider";
import {http} from "../../hooks/Http";
import {CONFIG} from "../../config/Env";
import {usePagedList} from "../../hooks/UsePagedList";
import {useChatEvents} from "../../context/ChatsEventsContext";
import {paths} from "../../../api/schema";
import {useNetwork} from "../../context/NetworkContext";
import NoInternetConnection from "../../components/NoInternetConnection";
import BackendUnavailable from "../../components/BackendUnavailable";
import {useBackendStatus} from "../../hooks/UseBackendState";
import {useAuth} from "../../context/AuthContext";

type ChatQuery = NonNullable<paths["/chats/me"]["get"]["parameters"]["query"]>;
type ChatsPageResponse = paths["/chats/me"]["get"]["responses"]["200"]["content"]["application/json"];

export default function ChatsScreen() {
    const [query, setQuery] = useState("");
    const {isOffline} = useNetwork();
    const {isUnavailable} = useBackendStatus()
    const {accessToken} = useAuth();
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
        const res = await http.client.get<ChatsPageResponse>("/chats/me", {
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
    } = usePagedList<Chat>(fetchChatsPage, [normalizedQuery, accessToken], {
        autoFillIfNotScrollable: false,
    });

    if (isOffline) {
        return <>
            <NoInternetConnection />
            <BottomTabBar/>
        </>
    } else if (isUnavailable) {
        return <>
            <BackendUnavailable />
            <BottomTabBar />
        </>
    }

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
                onEndReached={chats.length >= CONFIG.PAGE_SIZE ? onEndReached : undefined}
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
