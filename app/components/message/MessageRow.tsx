import {Person} from '../people/PersonRow';
import {View} from "react-native";
import TimeSeparator from "./TimeSeparator";
import React, {useEffect, useState} from "react";
import RightBubble from "./RightBubble";
import LeftBubble from "./LeftBubble";
import {useChatEvents} from "../../context/ChatsEventsContext";

export type Message = {
    id: string,
    responseToId: string | null,
    responseToSender: Person | null,
    responseToContent: string | null,
    chatId: string,
    sender: Person,
    created: string,
    content: string,
}

export type RenderMessage = {
    msg: Message;
    showSep: boolean;
    created: string;
    isMine: boolean;
};

function formatTimeLabel(ms: number) {
    const d = new Date(ms);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
}

function MessageRow({row}: { row: RenderMessage }) {
    const createdDate = formatTimeLabel(new Date(row.created).getTime())
    let bubble;
    if (row.isMine) {
        bubble = <RightBubble item={row.msg} />;
    } else {
        bubble = <LeftBubble item={row.msg} />;
    }
    return <>
        <View>
            {row.showSep && <TimeSeparator label={createdDate}/>}
            {bubble}
        </View>
    </>;
}

export default React.memo(MessageRow);