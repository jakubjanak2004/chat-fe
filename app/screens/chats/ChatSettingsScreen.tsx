import React, {useEffect, useMemo, useState} from "react";
import {http} from "../../hooks/Http";
import {paths} from "../../../api/schema";
import {
    ActivityIndicator,
    Alert,
    Pressable, ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import {useAuth} from "../../context/AuthContext";
import MembershipRow from "../../components/chat/MembershipRow";
import InvitePerson from "../../components/people/InvitePerson";
import InvitationManagement from "../../components/chat/InvitationManagement";
import {useNetwork} from "../../context/NetworkContext";
import NoInternetConnection from "../../components/NoInternetConnection";
import BackendUnavailable from "../../components/BackendUnavailable";
import BottomTabBar from "../../components/BottomTabBar";
import {useBackendStatus} from "../../hooks/UseBackendState";

type ChatResponse = paths["/chats/{chatId}"]["get"]["responses"]["200"]["content"]["application/json"];
type MembershipsResponse = paths["/chats/{chatId}/memberships"]["get"]["responses"]["200"]["content"]["application/json"];
export type ActiveMembershipResponse = MembershipsResponse[number];
export type MembershipType = NonNullable<ActiveMembershipResponse["membershipType"]>;
export type InvitationsResponse = paths["/chats/{chatId}/invitations"]["get"]["responses"]["200"]["content"]["application/json"];
type ActiveMembershipUpdateRequest = paths["/chats/{chatId}/memberships/{username}"]["put"]["requestBody"]["content"]["application/json"];
type TransferAdminRequest = paths["/chats/{chatId}/admin/transfer"]["post"]["requestBody"]["content"]["application/json"];
type UsersResponse = paths["/users"]["get"]["responses"]["200"]["content"]["application/json"];
type UserResponse = NonNullable<UsersResponse["content"]>[number];
type UsersQuery = NonNullable<paths["/users"]["get"]["parameters"]["query"]>;

const CONFIG = {
    PAGE_SIZE: 10,
};

export default function ChatSettings({route}: any) {
    const {user} = useAuth();
    const {isOffline} = useNetwork();
    const {isUnavailable} = useBackendStatus()
    const {id: chatId} = route.params;

    const [chat, setChat] = useState<ChatResponse>();
    const [memberships, setMemberships] = useState<ActiveMembershipResponse[]>([]);
    const [invitations, setInvitations] = useState<InvitationsResponse>([]);
    const [loading, setLoading] = useState(false);

    const myUsername = user.username;

    const [inviteQuery, setInviteQuery] = useState("");
    const normalizedQuery = inviteQuery.trim();

    const [people, setPeople] = useState<UserResponse[]>([]);
    const [peoplePage, setPeoplePage] = useState(0);
    const [peopleLast, setPeopleLast] = useState(true);
    const [peopleLoading, setPeopleLoading] = useState(false);

    const [invitingUser, setInvitingUser] = useState<string | null>(null);

    const myMembership = useMemo(
        () => memberships.find((m) => m.chatUser?.username === myUsername),
        [memberships, myUsername]
    );

    const isAdmin = myMembership?.membershipType === "ADMIN";

    const memberUsernames = useMemo(() => {
        return new Set(
            memberships
                .map((m) => m.chatUser.username)
                .filter(Boolean) as string[]
        );
    }, [memberships]);

    const invitedUsernames = useMemo(() => {
        return new Set(
            invitations
                .map((i) => i.chatUser.username)
                .filter(Boolean) as string[]
        );
    }, [invitations])

    async function fetchAll() {
        setLoading(true);
        try {
            const [chatRes, membershipsRes, invitationsRes] = await Promise.all([
                http.client.get<ChatResponse>(`/chats/${chatId}`),
                http.client.get<MembershipsResponse>(`/chats/${chatId}/memberships`),
                http.client.get<InvitationsResponse>(`/chats/${chatId}/invitations`),
            ]);

            setChat(chatRes.data);
            setMemberships(membershipsRes.data);
            setInvitations(invitationsRes.data);
        } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Failed to load chat settings");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAll();
    }, [chatId]);

    const fetchPeoplePage = async (page: number) => {
        const params: UsersQuery = {
            query: normalizedQuery,
            page,
            size: CONFIG.PAGE_SIZE,
            sort: ["username,asc"],
        };

        const res = await http.client.get<UsersResponse>("/users", {
            params,
            paramsSerializer: {indexes: null},
        });

        const data = res.data;
        return {
            content: (data.content ?? []) as UserResponse[],
            number: data.number ?? page,
            last: data.last ?? false,
        };
    };

    useEffect(() => {
        if (!isAdmin) return;

        if (normalizedQuery.length < 2) {
            setPeople([]);
            setPeoplePage(0);
            setPeopleLast(true);
            return;
        }

        let cancelled = false;
        const timer = setTimeout(async () => {
            setPeopleLoading(true);
            try {
                const first = await fetchPeoplePage(0);
                if (cancelled) return;

                const filtered = first.content.filter((u) => u.username !== myUsername);

                setPeople(filtered);
                setPeoplePage(first.number);
                setPeopleLast(first.last);
            } catch {
                if (!cancelled) {
                    setPeople([]);
                    setPeoplePage(0);
                    setPeopleLast(true);
                }
            } finally {
                if (!cancelled) setPeopleLoading(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [normalizedQuery, isAdmin, myUsername]);

    async function loadMorePeople() {
        if (peopleLoading || peopleLast) return;

        setPeopleLoading(true);
        try {
            const nextPage = peoplePage + 1;
            const next = await fetchPeoplePage(nextPage);

            const nextFiltered = next.content.filter((u) => u.username !== myUsername);

            setPeople((prev) => {
                const seen = new Set(prev.map((p) => p.username));
                const merged = [...prev];
                for (const u of nextFiltered) {
                    if (!seen.has(u.username)) merged.push(u);
                }
                return merged;
            });

            setPeoplePage(next.number);
            setPeopleLast(next.last);
        } finally {
            setPeopleLoading(false);
        }
    }

    async function inviteByUsername(username: string) {
        const u = username.trim();
        if (!u) return;

        setInvitingUser(u);
        try {
            await http.client.post(`/chats/${chatId}/memberships/${u}`);

            await fetchAll();
            Alert.alert("Invited", `${u} was added to the chat.`);

            // Clear search UI
            setInviteQuery("");
            setPeople([]);
            setPeoplePage(0);
            setPeopleLast(true);
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 404) Alert.alert("Not found", "User does not exist.");
            else if (status === 409) Alert.alert("Already a member", "That user is already in this chat.");
            else if (status === 403) Alert.alert("Forbidden", "Only admins can invite members.");
            else Alert.alert("Error", e?.message ?? "Failed to invite member");
        } finally {
            setInvitingUser(null);
        }
    }

    async function handleChangeRole(username: string, membershipType: MembershipType) {
        const payload: ActiveMembershipUpdateRequest = {membershipType};

        await http.client.put(`/chats/${chatId}/memberships/${username}`, payload);

        setMemberships((prev) =>
            prev.map((m) =>
                m.chatUser?.username === username ? {...m, membershipType} : m
            )
        );
    }

    async function handleInvitationDelete(username: string) {
        await http.client.delete(`/chats/${chatId}/invitations/${username}`);

        setInvitations((prev) =>
            prev.filter(invitation => invitation.chatUser.username !== username)
        )
    }

    async function giveUpAdmin(successorUsername?: string) {
        const payload: TransferAdminRequest = {
            successorUsername,
        };
        await http.client.post(`/chats/${chatId}/admin/transfer`, payload);
    }

    async function handleGiveUpAdmin() {
        if (!isAdmin) return;

        Alert.alert("Give up admin?", "You will lose admin permissions for this chat.", [
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
        ]);
    }

    async function memberDelete(username: string) {
        await http.client.delete(`/chats/${chatId}/memberships/${username}`);
        setMemberships((prev) => prev.filter((m) => m.chatUser?.username !== username));
    }

    async function handleMemberDelete(username: string) {
        Alert.alert(`Delete ${username}?`, "Are you sure you want to delete this user from chat?", [
            {text: "Cancel", style: "cancel"},
            {text: "Delete", style: "destructive", onPress: () => memberDelete(username)},
        ]);
    }

    if (isOffline) {
        return <NoInternetConnection />
    } else if (isUnavailable) {
        return <>
            <BackendUnavailable />
        </>
    }

    return (
        <View className="flex-1 bg-black">
            <View className="px-4 pt-4 pb-3 border-b border-white/10">
                <Text className="text-white text-xl font-semibold">{chat?.name ?? "Chat"}</Text>
                <Text className="text-white/60 mt-1">
                    {loading ? "Loading…" : `${memberships.length} members`}
                </Text>
            </View>

            <ScrollView className="flex-1">
                {isAdmin && (
                    <>
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

                        {/* Invite Members */}
                        <View className="px-4 py-4">
                            <Text className="text-white/80 mb-2 font-semibold">Invite Members</Text>

                            <View className="rounded-2xl border border-white/10 p-3 bg-white/5">
                                <Text className="text-white/60 text-xs mb-2">Search users</Text>

                                <View className="flex-row items-center gap-2">
                                    <TextInput
                                        value={inviteQuery}
                                        onChangeText={setInviteQuery}
                                        placeholder="Type at least 2 characters…"
                                        placeholderTextColor="rgba(255,255,255,0.35)"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        className="flex-1 rounded-xl border border-white/15 px-3 py-2 text-white"
                                    />
                                    {peopleLoading ? <ActivityIndicator /> : null}
                                </View>

                                {normalizedQuery.length >= 2 && (
                                    <View className="mt-3 rounded-xl border border-white/10 overflow-hidden">
                                        {people.length === 0 && !peopleLoading ? (
                                            <View className="px-3 py-3">
                                                <Text className="text-white/50 text-sm">No users found.</Text>
                                            </View>
                                        ) : (
                                            <>
                                                {people.map((u) =>
                                                    <InvitePerson
                                                        u={u}
                                                        isMember={memberUsernames.has(u.username)}
                                                        isInvited={invitedUsernames.has(u.username)}
                                                        invitingUsername={invitingUser}
                                                        inviteUser={(user) => inviteByUsername(user.username)}
                                                    />
                                                )}

                                                {!peopleLast && (
                                                    <Pressable disabled={peopleLoading} onPress={loadMorePeople} className="px-3 py-3">
                                                        <Text className="text-white/70 text-sm">
                                                            {peopleLoading ? "Loading…" : "Load more"}
                                                        </Text>
                                                    </Pressable>
                                                )}
                                            </>
                                        )}
                                    </View>
                                )}

                                <Text className="text-white/50 text-xs mt-2">
                                    Admins can add members to this chat.
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                {/* Members list */}
                <View className="px-4 pb-8">
                    <Text className="text-white/80 mb-2 font-semibold">Members</Text>

                    <View className="rounded-2xl border border-white/10 overflow-hidden">
                        {memberships.map((m) => {
                            const username = m.chatUser?.username ?? "unknown";
                            const isMe = username === myUsername;

                            return (
                                <MembershipRow
                                    key={(m as any).id ?? username}
                                    m={m}
                                    isMe={isMe}
                                    isSignedUserAdmin={isAdmin}
                                    onChangeRole={(u, targetRole) => handleChangeRole(u, targetRole)}
                                    onMemberDelete={handleMemberDelete}
                                />
                            );
                        })}
                    </View>

                    {/* Invitees list */}
                    <Text className="text-white/80 mt-6 mb-2 font-semibold">Invitees</Text>

                    <View className="rounded-2xl border border-white/10 overflow-hidden">
                        {invitations.length === 0 ? (
                            <View className="px-3 py-3">
                                <Text className="text-white/50 text-sm">No pending invitations.</Text>
                            </View>
                        ) : (
                            invitations.map((i) =>
                                <InvitationManagement
                                    invitation={i}
                                    canUpdate={isAdmin}
                                    handleInvitationDelete={(invitation) => handleInvitationDelete(invitation.chatUser.username)}
                                />
                            )
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}