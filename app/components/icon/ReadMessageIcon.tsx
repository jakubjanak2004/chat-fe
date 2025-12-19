import ReadMessageSVG from "../../../assets/icons/read-message-icon.svg";
import {STATUS_ICON_DIAMETER} from "./StatusIcon";

export default function ReadMessageIcon() {
    return <>
        <ReadMessageSVG width={STATUS_ICON_DIAMETER} height={STATUS_ICON_DIAMETER} fill="white"/>
    </>
}