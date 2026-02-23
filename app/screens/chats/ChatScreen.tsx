import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    View,
    FlatList,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Pressable,
    ActivityIndicator,
} from "react-native";
import {useFocusEffect} from "@react-navigation/core";
// @ts-ignore
import {Ionicons} from "@expo/vector-icons";

import MessageRow, {RenderMessage} from "../../components/message/MessageRow";
import {useAuth} from "../../context/AuthContext";
import {http} from "../../hooks/http";
import {CONFIG} from "../../config/env";
import {useChatEvents} from "../../context/ChatsEventsContext";
import {usePagedList} from "../../hooks/usePagedList";
import {components, paths} from "../../../api/schema";

type PageMessageDTO = paths["/chats/{chatId}/messages"]["get"]["responses"]["200"]["content"]["application/json"];
type GetMessagesQuery = NonNullable<paths["/chats/{chatId}/messages"]["get"]["parameters"]["query"]>;
type MessageDTO = components["schemas"]["MessageDTO"];
type CreateChatDTO = paths["/chats/me"]["post"]["requestBody"]["content"]["application/json"];
type ChatDTO = paths["/chats/me"]["post"]["responses"]["200"]["content"]["application/json"];
type CreateMessageDTO = paths["/chats/{chatId}/messages"]["post"]["requestBody"]["content"]["application/json"];

function isDifferentDay(aMillis: number, bMillis: number) {
    const a = new Date(aMillis);
    const b = new Date(bMillis);
    return (
        a.getFullYear() !== b.getFullYear() ||
        a.getMonth() !== b.getMonth() ||
        a.getDate() !== b.getDate()
    );
}

function shouldShowTimeSeparator(messages: MessageDTO[], index: number) {
    const curr = messages[index];
    const nextOlder = messages[index + 1];
    if (!nextOlder) return true;

    const currMs = new Date(curr.created).getTime();
    const nextMs = new Date(nextOlder.created).getTime();

    if (isDifferentDay(currMs, nextMs)) return true;
    return (currMs - nextMs) / (1000 * 60) >= CONFIG.SEPARATOR_GAP_MIN;
}

export default function ChatScreen({route}: any) {
    const {user} = useAuth();
    const {id, personUsernameFallback} = route.params as { id?: string, personUsernameFallback?: string };
    const {
        setActiveChatId,
        markChatRead,
        messagesByChatId,
        upsertMessages
    } = useChatEvents();


    const [chatId, setChatId] = useState<string | null>(id ?? null);
    const [input, setInput] = useState("");
    const [replyingTo, setReplyingTo] = useState<MessageDTO | null>(null);
    const listRef = useRef<FlatList<RenderMessage>>(null);
    const lastLatestIdRef = useRef<string | null>(null);

    // Messages live in global context (WS updates go there)
    const messages: MessageDTO[] = useMemo(() => {
            if (!chatId) return []
            return (messagesByChatId[chatId] ?? [])
        },
        [messagesByChatId, chatId]
    );

    // focus: active chat + clear unread
    useFocusEffect(
        useCallback(() => {
            if (!chatId) return;
            setActiveChatId(chatId);
            markChatRead(chatId);
            return () => setActiveChatId(null);
        }, [chatId])
    );

    /**
     * Paging hook drives REST loads, but we "materialize" results into the global store
     * via mergeReplace/mergeAppend.
     *
     * IMPORTANT: fetchPage MUST return Spring {content, number, last}
     */
    const fetchPage = useCallback(async (page: number) => {
        if (!chatId) {
            return {content: [], number: page, last: true}
        }
        const params: GetMessagesQuery = {
            page,
            size: CONFIG.PAGE_SIZE,
            sort: ["created,desc"],
        };
        const res = await http.client.get<PageMessageDTO>(`/chats/${chatId}/messages`, {params});
        const data = res.data;
        return {
            content: (data.content ?? []) as MessageDTO[],
            number: data.number ?? page,
            last: data.last ?? false,
        };
    }, [chatId]);

    const {
        items: pagedItems,
        loading,
        loadingMore,
        onEndReached,
        onLayout,
        onContentSizeChange,
    } = usePagedList<MessageDTO>(
        fetchPage,
        [chatId],
        {
            mergeReplace: (incoming) => incoming,
            mergeAppend: (prev, incoming) => [...prev, ...incoming],
            autoFillIfNotScrollable: false,
        }
    );

    useEffect(() => {
        if (!chatId) return;
        upsertMessages(chatId, pagedItems, "replace");
    }, [chatId, pagedItems]);


    // stay scrolled down when newest message changes
    useEffect(() => {
        if (messages.length === 0) return;
        if (!listRef.current) return;

        const latestId = messages[0].id;
        if (lastLatestIdRef.current && lastLatestIdRef.current !== latestId) {
            listRef.current.scrollToOffset({offset: 0, animated: true});
        }
        lastLatestIdRef.current = latestId;
    }, [messages]);

    async function sendMessage() {
        const text = input.trim();
        if (!text) return;
        setInput("");

        let targetChatId = chatId;

        if (!targetChatId && !!personUsernameFallback) {
            const payload: CreateChatDTO = {
                name: personUsernameFallback,
                membersList: [personUsernameFallback],
            }
            const res = await http.client.post<ChatDTO>("/chats/me", payload);

            const chat = res.data;
            targetChatId = chat.id;

            setChatId(targetChatId);
        }

        try {
            const payload: CreateMessageDTO = {
                content: text,
                replyToId: replyingTo?.id,
            }
            await http.client.post<MessageDTO>(`/chats/${targetChatId}/messages`, payload);
            setReplyingTo(null);
        } catch (error) {
            console.error("message posting failed", error);
        }
    }

    // rows for rendering
    const rows: RenderMessage[] = useMemo(() => {
        const myUsername = user.username;
        return messages.map((msg, index) => ({
            msg,
            showSep: shouldShowTimeSeparator(messages, index),
            created: msg.created,
            isMine: msg.sender.username === myUsername,
        }));
    }, [messages, user.username]);

    const renderItem = useCallback(
        ({item}: { item: RenderMessage }) =>
            <MessageRow row={item} onPress={(message) => setReplyingTo(message)}/>,
        []
    );

    return (
        <View className="flex-1 bg-black">
            <KeyboardAvoidingView className="flex-1" behavior="padding" keyboardVerticalOffset={88}>
                <FlatList
                    ref={listRef}
                    inverted
                    data={rows}
                    keyExtractor={(row) => row.msg.id}
                    contentContainerStyle={{paddingTop: 8, paddingBottom: 12}}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.2}
                    onLayout={onLayout}
                    onContentSizeChange={onContentSizeChange}
                    maintainVisibleContentPosition={{minIndexForVisible: 1, autoscrollToTopThreshold: 50}}
                    renderItem={renderItem}
                    removeClippedSubviews
                    windowSize={10}
                    initialNumToRender={12}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    ListFooterComponent={
                        loadingMore ? (
                            <View className="py-3">
                                <ActivityIndicator/>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        loading ? (
                            <View className="py-6">
                                <ActivityIndicator/>
                            </View>
                        ) : null
                    }
                />

                {/* Input bar */}
                <View className="px-4 pb-6 pt-2 border-t border-white/10 bg-black">
                    <View className="flex-row items-end">
                        <View className="flex-1 mx-2 bg-white/10 rounded-2xl px-4 py-3">
                            {!!replyingTo && (
                                <View className="mb-2">
                                    <View className="flex-row items-start">
                                        {/* Reply preview */}
                                        <View
                                            className="flex-1 px-3 py-2 rounded-xl bg-white/10 border-l-4 border-blue-400">
                                            <Text className="text-white/90 text-[12px] font-semibold mb-0.5">
                                                Replying to {replyingTo.sender.username}
                                            </Text>

                                            <Text
                                                className="text-white/75 text-[13px] leading-4"
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {replyingTo.content}
                                            </Text>
                                        </View>

                                        {/* Cancel button */}
                                        <Pressable
                                            onPress={() => setReplyingTo(null)}
                                            hitSlop={10}
                                            className="ml-2 w-8 h-8 items-center justify-center rounded-full bg-white/10"
                                        >
                                            <Text className="text-white/70 text-[14px]">✕</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            <TextInput
                                value={input}
                                multiline
                                onChangeText={setInput}
                                placeholder="Aa"
                                placeholderTextColor="rgba(255,255,255,0.45)"
                                className="text-white text-[16px]"
                            />
                        </View>

                        <Pressable
                            onPress={sendMessage}
                            disabled={!input.trim()}
                            className={`
                                ml-2 w-11 h-11 items-center justify-center rounded-full
                                ${input.trim() ? "bg-blue-500" : "bg-blue-500/40"}
                              `}
                        >
                            <Ionicons
                                name="paper-plane"
                                size={18}
                                color={input.trim() ? "white" : "rgba(255,255,255,0.6)"}
                                style={{transform: [{rotate: "-20deg"}]}}
                            />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
