import React, {createContext, useContext, useEffect, useMemo, useRef, useState, useCallback} from "react";
import {stompService} from "../ws/stompService";
import {notifyMessage} from "../notifications/notifications";
import {Message} from "../components/message/MessageRow";

type Incoming = { chatId: string; message: any };

type ChatEventsCtx = {
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;

    lastMessageByChatId: Record<string, any>;
    unreadByChatId: Record<string, number>;

    messagesByChatId: Record<string, any[]>;
    upsertMessages: (chatId: string, msgs: any[], mode: "replace" | "prepend" | "append") => void;
    pushMessage: (chatId: string, msg: any) => void;
    markChatRead: (chatId: string) => void;
};

const Ctx = createContext<ChatEventsCtx | null>(null);

function dedupeNewestFirst(arr: any[]) {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const m of arr) {
        if (!m?.id) continue;
        if (seen.has(m.id)) continue;
        seen.add(m.id);
        out.push(m);
    }
    return out;
}

export function ChatEventsProvider({ children, getToken }: { children: React.ReactNode; getToken: () => string | null }) {
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [lastMessageByChatId, setLastMessageByChatId] = useState<Record<string, any>>({});
    const [unreadByChatId, setUnreadByChatId] = useState<Record<string, number>>({});
    const [messagesByChatId, setMessagesByChatId] = useState<Record<string, any[]>>({});

    const activeChatIdRef = useRef<string | null>(null);
    useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

    const upsertMessages = useCallback((chatId: string, msgs: any[], mode: "replace" | "prepend" | "append") => {
        setMessagesByChatId(prev => {
            const existing = prev[chatId] ?? [];

            if (mode === "replace") return { ...prev, [chatId]: dedupeNewestFirst(msgs) };
            if (mode === "prepend") return { ...prev, [chatId]: dedupeNewestFirst([...msgs, ...existing]) };

            // append older
            return { ...prev, [chatId]: dedupeNewestFirst([...existing, ...msgs]) };
        });
    }, []);

    const pushMessage = useCallback((chatId: string, msg: Message) => {
        setMessagesByChatId(prev => {
            console.log('message:', msg);
            const chatId = msg.chatId;
            const existing = prev[chatId] ?? [];
            if (existing[0]?.id === msg.id) return prev;
            return { ...prev, [chatId]: dedupeNewestFirst([msg, ...existing]) };
        });
    }, []);

    const markChatRead = useCallback((chatId: string) => {
        setUnreadByChatId(prev => ({ ...prev, [chatId]: 0 }));
    }, []);

    useEffect(() => {
        stompService.connect(getToken, () => {
            stompService.subscribe(`/user/queue/messages`, (frame) => {
                const message: Message = JSON.parse(frame.body);
                const chatId = message.chatId;

                pushMessage(chatId, message);
                setLastMessageByChatId(prev => ({ ...prev, [chatId]: message }));

                if (activeChatIdRef.current !== chatId) {
                    setUnreadByChatId(prev => ({ ...prev, [chatId]: (prev[chatId] ?? 0) + 1 }));
                    notifyMessage(message, chatId);
                }
            });
        });

        return () => stompService.disconnect(false);
    }, [getToken, pushMessage]);

    const value = useMemo(() => ({
        activeChatId,
        setActiveChatId,
        lastMessageByChatId,
        unreadByChatId,
        messagesByChatId,
        upsertMessages,
        pushMessage,
        markChatRead,
    }), [
        activeChatId,
        lastMessageByChatId,
        unreadByChatId,
        messagesByChatId,
        upsertMessages,
        pushMessage,
        markChatRead,
    ]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChatEvents() {
    const v = useContext(Ctx);
    if (!v) throw new Error("useChatEvents must be used within ChatEventsProvider");
    return v;
}
