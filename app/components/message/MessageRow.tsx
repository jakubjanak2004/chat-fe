import {Person} from '../people/PersonRow';
import {View} from "react-native";
import TimeSeparator from "./TimeSeparator";
import React from "react";
import RightBubble from "./RightBubble";
import LeftBubble from "./LeftBubble";

export type Message = {
    id: string,
    responseToId: string | null,
    sender: Person,
    created: string,
    content: string,
}

export type RenderMessage = {
    msg: Message;
    showSep: boolean;
    label: string;
    isMine: boolean;
};

function MessageRow({row}: { row: RenderMessage }) {
    return <>
        <View>
            {row.showSep && <TimeSeparator label={row.label}/>}
            {row.isMine ? <RightBubble item={row.msg}/> : <LeftBubble item={row.msg}/>}
        </View>
    </>;
}

export default React.memo(MessageRow);