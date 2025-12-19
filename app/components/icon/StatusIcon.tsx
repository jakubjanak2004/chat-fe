import SendingMessageIcon from "./SendingMessageIcon";
import DeliveredMessageIcon from "./DeliveredMessageIcon";
import ReadMessageIcon from "./ReadMessageIcon";
import React from "react";

export const STATUS_ICON_DIAMETER = 18;

export enum ReadState {
    Sending = "Sending",
    Delivered = "Delivered",
    Read = "Read",
}

export default function StatusIcon({state}: { state: ReadState; }) {
    if (state === ReadState.Sending) {
        return <SendingMessageIcon/>
    }
    if (state === ReadState.Delivered) {
        return <DeliveredMessageIcon/>
    }
    if (state === ReadState.Read) {
        return <ReadMessageIcon/>
    }
}