import DeliveredMessageSVG from "../../../assets/icons/delivered-message-icon.svg";
import {STATUS_ICON_DIAMETER} from "./StatusIcon";

export default function DeliveredMessageIcon() {
    return <>
        <DeliveredMessageSVG width={STATUS_ICON_DIAMETER} height={STATUS_ICON_DIAMETER} stroke="white"/>
    </>
}