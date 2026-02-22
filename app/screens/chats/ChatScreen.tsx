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

import MessageRow, {Message, RenderMessage} from "../../components/message/MessageRow";
import {useAuth} from "../../context/AuthContext";
import {http} from "../../hooks/http";
import {CONFIG} from "../../config/env";
import {useChatEvents} from "../../context/ChatsEventsContext";
import {usePagedList} from "../../hooks/usePagedList";
import {Chat} from "../../components/chat/ChatRow"; // <- adjust import path

function isDifferentDay(aMillis: number, bMillis: number) {
    const a = new Date(aMillis);
    const b = new Date(bMillis);
    return (
        a.getFullYear() !== b.getFullYear() ||
        a.getMonth() !== b.getMonth() ||
        a.getDate() !== b.getDate()
    );
}

function shouldShowTimeSeparator(messages: Message[], index: number) {
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
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const listRef = useRef<FlatList<RenderMessage>>(null);
    const lastLatestIdRef = useRef<string | null>(null);

    // Messages live in global context (WS updates go there)
    const messages: Message[] = useMemo(() => {
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
        if (!chatId) return
        const res = await http.client.get(`/chats/${chatId}/messages`, {
            params: {page, size: CONFIG.PAGE_SIZE, sort: "created,desc"},
        });
        return {
            content: res.data?.content ?? [],
            number: res.data?.number ?? page,
            last: res.data?.last ?? true,
        };
    }, [chatId]);

    const {
        items: pagedItems,
        loading,
        loadingMore,
        onEndReached,
        onLayout,
        onContentSizeChange,
    } = usePagedList<Message>(
        fetchPage,
        [chatId],
        {
            mergeReplace: (incoming) => incoming,
            mergeAppend: (prev, incoming) => [...prev, ...incoming],
            autoFillIfNotScrollable: false,
        }
    );

    useEffect(() => {
        // todo logging the pagedItems messages
        // for(const item of pagedItems) {
        //     console.log(item);
        //     console.log()
        // }
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

        if (!chatId && !personUsernameFallback) return;

        let targetChatId = chatId;

        if (!targetChatId) {
            const res = await http.client.post("/chats/me", {
                name: personUsernameFallback,
                membersList: [personUsernameFallback],
            });

            const chat: Chat = res.data;
            targetChatId = chat.id;

            setChatId(targetChatId);
        }

        try {
            await http.client.post(`/chats/${targetChatId}/messages`, {
                content: text,
                replyToId: replyingTo?.id,
            });
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
