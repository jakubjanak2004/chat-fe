import {Pressable, View, Text} from "react-native";
import {InvitationList} from "../../screens/chats/ChatSettingsScreen";

type Invitation = InvitationList[number]

type Props = {
    invitation: Invitation
    canUpdate: boolean
    handleInvitationDelete: (invitation: Invitation) => void
}

export default function InvitationManagement({invitation, canUpdate, handleInvitationDelete}: Props) {
    const username = invitation.chatUser?.username ?? "unknown";
    // todo determine if isMe is needed, as amongst the invitations I should never be
    const isMe = false // username === myUsername;

    return (
        <View
            key={invitation.id}
            className="flex-row items-center justify-between px-3 py-3 border-b border-white/10"
        >
            <View className="flex-1 pr-3">
                <Text className="text-white text-sm font-medium">{username}</Text>

                {"displayName" in (invitation.chatUser as any) && (invitation.chatUser as any)?.displayName ? (
                    <Text className="text-white/50 text-xs mt-0.5">
                        {(invitation.chatUser as any).displayName}
                    </Text>
                ) : null}
            </View>

            {canUpdate && !isMe ? (
                <Pressable
                    onPress={() => handleInvitationDelete(invitation)}
                    className="rounded-lg px-3 py-2 border border-red-500/40 bg-red-500/10 active:bg-red-500/20"
                >
                    <Text className="text-red-400 text-sm font-medium">
                        Remove Invitation
                    </Text>
                </Pressable>
            ) : (
                <View className="rounded-lg px-3 py-2 border border-white/10 bg-white/5">
                    <Text className="text-white/40 text-sm font-medium">—</Text>
                </View>
            )}
        </View>
    );
}