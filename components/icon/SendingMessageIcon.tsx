import SendingMessageSVG from "../../assets/icons/sending-message-icon.svg";
import React from "react";
import {STATUS_ICON_DIAMETER} from "./StatusIcon";

export default function SendingMessageIcon() {
    return <>
        <SendingMessageSVG width={STATUS_ICON_DIAMETER} height={STATUS_ICON_DIAMETER} stroke="white"/>
    </>
}