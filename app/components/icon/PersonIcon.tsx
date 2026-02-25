import PersonIconSVG from "../../../assets/icons/person-icon.svg";

export default function PersonIcon({ className }: { className?: string }) {
    return <PersonIconSVG className={className} width="100%" height="100%" stroke="white"/>;
}