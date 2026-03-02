import React, {useEffect, useMemo, useState} from "react";
import {http} from "../../hooks/http";
import {paths} from "../../../api/schema";
import {Alert, Animated, Pressable, Text, View} from "react-native";
import {useAuth} from "../../context/AuthContext";
import ScrollView = Animated.ScrollView;
import MembershipRow from "../../components/chat/MembershipRow";

type ChatDTO = paths["/chats/{chatId}"]["get"]["responses"]["200"]["content"]["application/json"];
type MembershipList = paths["/chats/{chatId}/memberships"]["get"]["responses"]["200"]["content"]["application/json"];
export type ActiveMembershipDTO = MembershipList[number];
export type MembershipType = NonNullable<ActiveMembershipDTO["membershipType"]>;
type ActiveMembershipUpdateDTO = paths['/chats/{chatId}/memberships/{username}']["put"]["requestBody"]["content"]["application/json"]
type GiveUpAdminDTO = paths["/chats/{chatId}/admin/transfer"]["post"]["requestBody"]["content"]["application/json"]

export default function ChatSettings({route}: any) {
    const {user} = useAuth()
    const {id: chatId} = route.params
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

    async function handleChangeRole(username: string, membershipType: MembershipType) {
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

    async function handleGiveUpAdmin() {
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

    async function memberDelete(username: string) {
        await http.client.delete(`/chats/${chatId}/memberships/${username}`)
        setMemberships((prev) => prev.filter(m => m.chatUser.username !== username))
    }

    async function handleMemberDelete(username: string) {
        Alert.alert(`Delete ${username}?`,
            "Are you sure you want to delete this user from chat?",
            [
                {text: "Cancel", style: "cancel"},
                {text: "Delete", style: "destructive",
                onPress: () => memberDelete(username)},
            ]);
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
                            onPress={handleGiveUpAdmin}
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
                            return <MembershipRow
                                m={m}
                                isMe={isMe}
                                isSignedUserAdmin={isAdmin}
                                onChangeRole={(username, targetRole) => handleChangeRole(username, targetRole)}
                                onMemberDelete={handleMemberDelete}
                            />
                        })}
                    </View>
                </View>
            </ScrollView>
        </View>
    </>
}