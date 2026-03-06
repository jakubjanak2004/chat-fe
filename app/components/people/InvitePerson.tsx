import {ActivityIndicator, Pressable, View, Text} from "react-native";
import {ChatUserDTO} from "../../screens/people/PeopleScreen";

type Props = {
    u: ChatUserDTO
    isMember: boolean
    isInvited: boolean
    invitingUsername: string | null
    inviteUser: (user: ChatUserDTO) => void
}

export default function InvitePerson({u, isMember, isInvited, invitingUsername, inviteUser}: Props) {
    const username = u.username;
    const alreadyMember = isMember;
    const alreadyInvited = isInvited
    const inviting = invitingUsername === username;

    const disabled = alreadyMember || alreadyInvited || inviting;

    const buttonClasses = `rounded-lg px-3 py-2 border ${
        disabled
            ? "border-white/10 bg-white/5"
            : "border-white/15 bg-white/10 active:bg-white/15"
    }`;

    const labelColor = disabled ? "text-white/40" : "text-white";
    const labelText = alreadyMember ? "Member" : alreadyInvited ? "Invited" : "Invite";

    return (
        <View
            key={username}
            className="flex-row items-center justify-between px-3 py-3 border-b border-white/10"
        >
            <View className="flex-1 pr-3">
                <Text className="text-white text-sm font-medium">{username}</Text>

                {"displayName" in (u as any) && (u as any).displayName ? (
                    <Text className="text-white/50 text-xs mt-0.5">
                        {(u as any).displayName}
                    </Text>
                ) : null}
            </View>

            <Pressable
                disabled={disabled}
                onPress={() => inviteUser(u)}
                className={buttonClasses}
            >
                {inviting ? (
                    <ActivityIndicator />
                ) : (
                    <Text className={`${labelColor} text-sm font-medium`}>
                        {labelText}
                    </Text>
                )}
            </Pressable>
        </View>
    );
}