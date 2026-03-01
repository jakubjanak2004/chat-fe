import React, {useEffect, useLayoutEffect, useMemo, useState} from "react";
import {http} from "../../hooks/http";
import {paths} from "../../../api/schema";
import {Alert, Animated, Pressable, Text, View} from "react-native";
import {useAuth} from "../../context/AuthContext";
import ScrollView = Animated.ScrollView;

type ChatDTO = paths["/chats/{chatId}"]["get"]["responses"]["200"]["content"]["application/json"];
type MembershipList = paths["/chats/{chatId}/memberships"]["get"]["responses"]["200"]["content"]["application/json"];
type ActiveMembershipDTO = MembershipList[number];
type MembershipType = NonNullable<ActiveMembershipDTO["membershipType"]>;
type ActiveMembershipUpdateDTO = paths['/chats/{chatId}/memberships/{username}']["put"]["requestBody"]["content"]["application/json"]
type GiveUpAdminDTO = paths["/chats/{chatId}/admin/transfer"]["post"]["requestBody"]["content"]["application/json"]

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
    // if current is ADMIN, we won't show controls anyway (but keep safe fallback)
    return ["EDITOR", "MEMBER"];
}

export default function ChatSettings({route}: any) {
    const {user} = useAuth()
    const {id: chatId} = route.params
    const [role, setRole] = useState()
    const [chat, setChat] = useState<ChatDTO>()
    const [memberships, setMemberships] = useState<ActiveMembershipDTO[]>([])
    const [loading, setLoading] = useState(false);

    const myUsername = user.username

    const myMembership = useMemo(
        () => memberships.find((m) => m.chatUser?.username === myUsername),
        [memberships, myUsername]
    );

    const isAdmin = myMembership?.membershipType === "ADMIN";

    async function fetchAll() {
        setLoading(true);
        try {
            const [chatRes, membershipsRes] = await Promise.all([
                http.client.get<ChatDTO>(`/chats/${chatId}`),
                http.client.get<MembershipList>(`/chats/${chatId}/memberships`),
            ]);

            setChat(chatRes.data);
            setMemberships(membershipsRes.data);
        } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Failed to load chat settings");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAll();
    }, [chatId]);

    async function changeRole(username: string, membershipType: MembershipType) {
        const payload: ActiveMembershipUpdateDTO = { membershipType };

        await http.client.put(`/chats/${chatId}/memberships/${username}`, payload);

        setMemberships((prev) =>
            prev.map((m) =>
                m.chatUser?.username === username
                    ? { ...m, membershipType }
                    : m
            )
        );
    }

    async function giveUpAdmin(successorUsername?: string) {
        const payload: GiveUpAdminDTO = {
            successorUsername: successorUsername
        }
        await http.client.post(`/chats/${chatId}/admin/transfer`, payload)
    }

    async function onGiveUpAdminPress() {
        if (!isAdmin) return;

        Alert.alert(
            "Give up admin?",
            "You will lose admin permissions for this chat.",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Give up",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const successorUsername = memberships
                                .map((m) => m.chatUser?.username)
                                .find((u): u is string => !!u && u !== myUsername);

                            if (!successorUsername) {
                                Alert.alert(
                                    "No successor available",
                                    "You are the only member in this chat. Add another member first."
                                );
                                return;
                            }

                            await giveUpAdmin(successorUsername);
                            await fetchAll();
                        } catch (e: any) {
                            Alert.alert("Failed", e?.message ?? "Could not give up admin.");
                        }
                    },
                },
            ]
        );
    }

    return <>
        <View className="flex-1 bg-black">
            <View className="px-4 pt-4 pb-3 border-b border-white/10">
                <Text className="text-white text-xl font-semibold">
                    {chat?.name ?? "Chat"}
                </Text>
                <Text className="text-white/60 mt-1">
                    {loading ? "Loading…" : `${memberships.length} members`}
                </Text>
            </View>

            <ScrollView className="flex-1">
                {isAdmin && (
                    <View className="px-4 py-4">
                        <Text className="text-white/80 mb-2 font-semibold">Admin</Text>

                        <Pressable
                            className="rounded-xl border border-white/15 px-4 py-3"
                            onPress={onGiveUpAdminPress}
                        >
                            <Text className="text-white">Give up admin</Text>
                            <Text className="text-white/60 mt-1 text-xs">
                                If you are the only admin, you’ll need to pick a successor.
                            </Text>
                        </Pressable>
                    </View>
                )}

                <View className="px-4 pb-8">
                    <Text className="text-white/80 mb-2 font-semibold">Members</Text>

                    <View className="rounded-2xl border border-white/10 overflow-hidden">
                        {memberships.map((m) => {
                            const username = m.chatUser?.username ?? "unknown";
                            const isMe = username === myUsername;
                            const memberIsAdmin = m.membershipType === "ADMIN";

                            const canChange =
                                isAdmin && !isMe && !memberIsAdmin; // can't change self here; can't change other admins

                            return (
                                <View
                                    key={username}
                                    className="px-4 py-3 border-t border-white/10 first:border-t-0"
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
                                                const currentRole = (m.membershipType ?? "MEMBER") as MembershipType;
                                                const options = getRoleOptions(currentRole);

                                                return (
                                                    <View className="items-end">
                                                        <Text className="text-white/50 text-xs mb-2">
                                                            Change role to:
                                                        </Text>

                                                        <View className="flex-row gap-2">
                                                            {options.map((targetRole) => (
                                                                <Pressable
                                                                    key={targetRole}
                                                                    className="rounded-lg px-3 py-2 border border-white/15"
                                                                    onPress={() =>
                                                                        Alert.alert(
                                                                            "Change role?",
                                                                            `Change ${username} from ${ROLE_LABEL[currentRole]} to ${ROLE_LABEL[targetRole]}?`,
                                                                            [
                                                                                {text: "Cancel", style: "cancel"},
                                                                                {
                                                                                    text: "Confirm",
                                                                                    onPress: () => changeRole(username, targetRole)
                                                                                },
                                                                            ]
                                                                        )
                                                                    }
                                                                >
                                                                    <Text
                                                                        className="text-white">{ROLE_LABEL[targetRole]}</Text>
                                                                </Pressable>
                                                            ))}
                                                        </View>
                                                    </View>
                                                );
                                            })()
                                        ) : (
                                            isAdmin && memberIsAdmin && !isMe ? (
                                                <Text className="text-white/40 text-xs">
                                                    You can’t change another admin
                                                </Text>
                                            ) : null
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    </>
}