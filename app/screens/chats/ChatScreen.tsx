import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    View,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Pressable,
    ActivityIndicator,
} from "react-native";
import MessageRow, { Message, RenderMessage } from "../../components/message/MessageRow";
import { useAuth } from "../../context/AuthContext";
import { http } from "../../hooks/http";
import { CONFIG } from "../../config/env";
// @ts-ignore
import { Ionicons } from "@expo/vector-icons";

import { usePagedList } from "../../hooks/usePagedList";

function isDifferentDay(aMs: number, bMs: number) {
    const a = new Date(aMs);
    const b = new Date(bMs);
    return (
        a.getFullYear() !== b.getFullYear() ||
        a.getMonth() !== b.getMonth() ||
        a.getDate() !== b.getDate()
    );
}

function formatTimeLabel(ms: number) {
    const d = new Date(ms);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
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

export default function ChatScreen({ route }: any) {
    const { user } = useAuth();
    const { id } = route.params as { id: string };
    const [input, setInput] = useState("");
    const listRef = useRef<FlatList<RenderMessage>>(null);
    const lastLatestIdRef = useRef<string | null>(null);

    const fetchMessagesPage = async (page: number) => {
        const res = await http.client.get(`/chats/${id}/messages`, {
            params: {
                page,
                size: CONFIG.PAGE_SIZE,
                sort: "created,desc",
            },
        });
        return res.data;
    };

    const {
        items: messages,
        setItems: setMessages,
        loading,
        loadingMore,
        onEndReached,
        onLayout,
        onContentSizeChange,
    } = usePagedList<Message>(fetchMessagesPage, [id], {
        mergeAppend: (prev, incoming) => {
            const seen = new Set(prev.map((m) => m.id));
            const filtered = incoming.filter((m) => !seen.has(m.id));
            return [...prev, ...filtered];
        },
    });

    // always stay scrolled down when messages change
    useEffect(() => {
        if (messages.length === 0) return;

        const latestId = messages[0].id;

        if (lastLatestIdRef.current && lastLatestIdRef.current !== latestId) {
            listRef.current?.scrollToOffset({ offset: 0, animated: true });
        }

        lastLatestIdRef.current = latestId;
    }, [messages]);

    async function sendMessage() {
        const text = input.trim();
        if (!text) return;

        const tempId = `temp-${Date.now()}`;

        const optimistic: Message = {
            id: tempId,
            responseToId: null,
            content: text,
            created: new Date().toISOString(),
            sender: user,
        };

        setMessages((prev) => [optimistic, ...prev]);
        setInput("");

        try {
            const res = await http.client.post(`/chats/${id}/messages`, {
                content: text,
            });

            setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? res.data : m))
            );
        } catch {
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
    }

    const rows: RenderMessage[] = useMemo(() => {
        const myUsername = user.username;
        return messages.map((msg, index) => ({
            msg,
            showSep: shouldShowTimeSeparator(messages, index),
            label: formatTimeLabel(new Date(msg.created).getTime()),
            isMine: msg.sender.username === myUsername,
        }));
    }, [messages, user.username]);

    const renderItem = useCallback(
        ({ item }: { item: RenderMessage }) => <MessageRow row={item} />,
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
                    contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.2}
                    onLayout={onLayout}
                    onContentSizeChange={onContentSizeChange}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 1,
                        autoscrollToTopThreshold: 50,
                    }}
                    renderItem={renderItem}
                    removeClippedSubviews
                    windowSize={10}
                    initialNumToRender={12}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    ListFooterComponent={
                        loadingMore ? (
                            <View className="py-3">
                                <ActivityIndicator />
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        loading ? (
                            <View className="py-6">
                                <ActivityIndicator />
                            </View>
                        ) : null
                    }
                />

                {/* Input bar */}
                <View className="px-4 pb-6 pt-2 border-t border-white/10 bg-black">
                    <View className="flex-row items-center">
                        <View className="flex-1 mx-2 bg-white/10 rounded-2xl px-4 py-3">
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
                                style={{ transform: [{ rotate: "-45deg" }] }}
                            />
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
