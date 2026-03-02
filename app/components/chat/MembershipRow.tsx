import {Alert, Pressable, Text, View} from "react-native";
import React from "react";
import {ActiveMembershipDTO, MembershipType} from "../../screens/chats/ChatSettings";

function displayName(m: ActiveMembershipDTO) {
    const u = m.chatUser;
    if (!u) return "Unknown";
    return u.username;
}

const ROLE_LABEL: Record<MembershipType, string> = {
    ADMIN: "Admin",
    EDITOR: "Editor",
    MEMBER: "Member",
};

function getRoleOptions(current: MembershipType): MembershipType[] {
    // return only roles different from current
    if (current === "MEMBER") return ["EDITOR", "ADMIN"];
    if (current === "EDITOR") return ["MEMBER", "ADMIN"];
    // if current is ADMIN, we won't show controls anyway
    return ["EDITOR", "MEMBER"];
}

type Props = {
    m: ActiveMembershipDTO
    isMe: boolean
    isSignedUserAdmin: boolean
    onChangeRole: (username: string, targetRole: MembershipType) => void
    onMemberDelete: (username: string) => void
}

export default function MembershipRow({m, isMe, isSignedUserAdmin, onChangeRole, onMemberDelete}: Props) {
    const username = m.chatUser.username;
    const memberIsAdmin = m.membershipType === "ADMIN";

    const canChange = isSignedUserAdmin && !isMe && !memberIsAdmin; // can't change self here; can't change other admins

    function handleRoleChange(currentRole: MembershipType, targetRole: MembershipType) {
        return () =>
            Alert.alert(
                "Change role?",
                `Change ${username} from ${ROLE_LABEL[currentRole]} to ${ROLE_LABEL[targetRole]}?`,
                [
                    {text: "Cancel", style: "cancel"},
                    {
                        text: "Confirm",
                        onPress: () => onChangeRole(username, targetRole)
                    },
                ]
            );
    }

    return (
        <View
            key={username}
            className="px-4 pt-3 pb-16 border-t border-white/10 first:border-t-0"
        >
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-white">
                        {displayName(m)} {isMe ? "(you)" : ""}
                    </Text>
                    <Text className="text-white/60 text-xs mt-1">
                        Role: {m.membershipType}
                    </Text>
                </View>

                {canChange ? (
                    (() => {
                        const currentRole = m.membershipType;
                        const options = getRoleOptions(currentRole);

                        return (
                            <View className="items-end">
                                {/* Role change section */}
                                <View className="items-end mb-3">
                                    <Text className="text-white/50 text-xs mb-2">
                                        Change role
                                    </Text>

                                    <View className="flex-row gap-2">
                                        {options.map((targetRole) => (
                                            <Pressable
                                                key={targetRole}
                                                className="rounded-lg px-3 py-2 border border-white/15 bg-white/5 active:bg-white/10"
                                                onPress={handleRoleChange(currentRole, targetRole)}
                                            >
                                                <Text className="text-white text-sm">
                                                    {ROLE_LABEL[targetRole]}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                {/* Delete section */}
                                <View className="items-end">
                                    <Text className="text-red-400/70 text-xs mb-2">
                                        Danger zone
                                    </Text>

                                    <Pressable
                                        className="rounded-lg px-3 py-2 border border-red-500/40 bg-red-500/10 active:bg-red-500/20"
                                        onPress={() => onMemberDelete(username)}
                                    >
                                        <Text className="text-red-400 text-sm font-medium">
                                            Remove member
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })()
                ) : (
                    isSignedUserAdmin && memberIsAdmin && !isMe ? (
                        <Text className="text-white/40 text-xs">
                            You can’t change another admin
                        </Text>
                    ) : null
                )}
            </View>
        </View>
    );
}