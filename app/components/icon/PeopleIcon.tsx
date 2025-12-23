import PeopleIconSVG from "../../../assets/icons/people-icon.svg";
import {STATUS_ICON_DIAMETER} from "./StatusIcon";

export default function PeopleIcon() {
    return <>
        <PeopleIconSVG width={STATUS_ICON_DIAMETER} height={STATUS_ICON_DIAMETER} stroke="white"/>
    </>
}