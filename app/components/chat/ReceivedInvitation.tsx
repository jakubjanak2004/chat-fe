import {ActivityIndicator, Alert, Pressable, View, Text} from "react-native";
import {Invitations} from "../../screens/settings/SettingsScreen";

type Invitation = Invitations[number];

type Props = {
    inv: Invitation
    inviteActionId: string | null
    onCancelInvitation: (invitation: Invitation) => void
    onAcceptInvitation: (invitation: Invitation) => void
}

export default function ReceivedInvitation({inv, inviteActionId, onCancelInvitation, onAcceptInvitation}: Props) {
    const busy = inviteActionId === inv.id;

    return (
        <View key={inv.id} className="px-4 py-3 border-b border-white/10">
            <Text className="text-white font-semibold">
                {inv.chatName}
            </Text>

            <Text className="text-white/50 text-xs mt-1">
                Members: {inv.chatUsers?.slice(0, 4).map((u) => u.username).join(", ")}
                {inv.chatUsers && inv.chatUsers.length > 4 ? ` +${inv.chatUsers.length - 4} more` : ""}
            </Text>

            <View className="flex-row gap-2 mt-3 justify-end">
                <Pressable
                    disabled={busy}
                    onPress={() =>
                        Alert.alert(
                            "Cancel invitation?",
                            `Decline invite to "${inv.chatName}"?`,
                            [
                                {text: "No", style: "cancel"},
                                {
                                    text: "Decline",
                                    style: "destructive",
                                    onPress: () => onCancelInvitation(inv)
                                },
                            ]
                        )
                    }
                    className={`rounded-xl px-3 py-2 border ${
                        busy ? "border-white/10 bg-white/5" : "border-red-500/40 bg-red-500/10 active:bg-red-500/20"
                    }`}
                >
                    <Text
                        className={`text-sm font-medium ${busy ? "text-white/40" : "text-red-400"}`}>
                        Decline
                    </Text>
                </Pressable>

                <Pressable
                    disabled={busy}
                    onPress={() => onAcceptInvitation(inv)}
                    className={`rounded-xl px-3 py-2 border ${
                        busy ? "border-white/10 bg-white/5" : "border-white/15 bg-white/10 active:bg-white/15"
                    }`}
                >
                    {busy ? (
                        <ActivityIndicator/>
                    ) : (
                        <Text className="text-white text-sm font-medium">Accept</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}