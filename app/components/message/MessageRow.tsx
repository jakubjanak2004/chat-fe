import {Pressable, View} from "react-native";
import TimeSeparator from "./TimeSeparator";
import React from "react";
import RightBubble from "./RightBubble";
import LeftBubble from "./LeftBubble";
import {components} from "../../../api/schema";

export type MessageDTO = components["schemas"]["MessageDTO"];

export type RenderMessage = {
    msg: MessageDTO;
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

type Props = {
    row: RenderMessage,
    onPress: (message: MessageDTO) => void,
}

function MessageRow({row, onPress}: Props) {
    const createdDate = formatTimeLabel(new Date(row.created).getTime())
    let bubble;
    if (row.isMine) {
        bubble = <RightBubble item={row.msg}/>;
    } else {
        bubble = <LeftBubble item={row.msg}/>;
    }
    return <>
        <View>
            {row.showSep && <TimeSeparator label={createdDate}/>}
            <Pressable onPress={() => onPress(row.msg)}>
                {bubble}
            </Pressable>
        </View>
    </>;
}

export default React.memo(MessageRow);