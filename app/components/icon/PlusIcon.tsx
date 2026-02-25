import PlusIconSVG from "../../../assets/icons/plus-icon.svg";
import {STATUS_ICON_DIAMETER} from "./StatusIcon";

export default function PlusIcon() {
    return <>
        <PlusIconSVG width={STATUS_ICON_DIAMETER} height={STATUS_ICON_DIAMETER} stroke="white"/>
    </>
}