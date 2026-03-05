import React, {useEffect, useMemo, useState} from "react";
import {View, Text, Image, Pressable, Alert, ActivityIndicator, Animated} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import BottomTabBar from "../../components/BottomTabBar";
import FormTextInput from "../../components/textInput/FormTextInput";
import LinkButton from "../../components/button/LinkButton";
import {useAuth, User} from "../../context/AuthContext";
import {RedButton} from "../../components/button/RedButton";
import * as ImagePicker from "expo-image-picker";
import {http} from "../../hooks/http";
import {CONFIG} from "../../config/env";
import ProfilePicDefault from "../../components/people/ProfilePicDefault";
import {paths} from "../../../api/schema";
import ScrollView = Animated.ScrollView;

type UpdateMyProfilePictureOp = paths["/users/me/profile-picture"]["put"];
type ProfilePictureUpdate =
    NonNullable<UpdateMyProfilePictureOp["requestBody"]>["content"]["multipart/form-data"];

type Invitations =
    paths["/chats/me/invitations"]["get"]["responses"]["200"]["content"]["application/json"];

function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function SettingsScreen() {
    const {user, logout, updateUser, updateProfilePicture} = useAuth();

    const [invitations, setInvitations] = useState<Invitations>([]);
    const [loadingInvites, setLoadingInvites] = useState(false);

    // Track per-invite action state
    const [inviteActionId, setInviteActionId] = useState<string | null>(null); // invitation id

    const [draft, setDraft] = useState<User>(user);
    const [saving, setSaving] = useState(false);

    const fullName = `${draft.firstName} ${draft.lastName}`.trim();

    const dirty =
        draft.firstName !== user.firstName ||
        draft.lastName !== user.lastName ||
        draft.email !== user.email;

    const emailOk = isValidEmail(draft.email);

    const onSave = async () => {
        if (!emailOk) {
            Alert.alert("Invalid email", "Please enter a valid email address.");
            return;
        }
        setSaving(true);
        try {
            await updateUser(draft);
            Alert.alert("Saved", "Your profile was updated.");
        } catch (error: any) {
            Alert.alert("Error", error?.message ?? "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const onCancel = () => setDraft(user);

    async function pickAndUploadProfilePicture() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
        });

        if (result.canceled) return;

        const asset = result.assets[0];
        const uri = asset.uri;

        const form = new FormData();
        form.append(
            "file",
            {
                uri,
                name: "profile.jpg",
                type: asset.mimeType ?? "image/jpeg",
            } as any
        );

        try {
            await http.client.put<ProfilePictureUpdate>("/users/me/profile-picture", form, {
                headers: {"Content-Type": "multipart/form-data"},
            });
            updateProfilePicture({hasProfilePicture: true});
        } catch (error: any) {
            Alert.alert("Error", error?.message ?? "Failed to upload profile picture");
        }
    }

    const [profilePic, setProfilePic] = useState(<ProfilePicDefault/>);
    const [version, setVersion] = useState<number>(0);

    useEffect(() => {
        if (user.hasProfilePicture) {
            const url = `${CONFIG.API_URL}/users/${user.username}/profile-picture?v=${version}`;
            setProfilePic(
                <Image
                    source={{uri: url}}
                    style={{width: "100%", height: "100%"}}
                    resizeMode="cover"
                />
            );
            setVersion((prev) => prev + 1);
        } else {
            setProfilePic(<ProfilePicDefault/>);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.hasProfilePicture, user.username]);

    async function loadInvitations() {
        setLoadingInvites(true);
        try {
            const res = await http.client.get<Invitations>("/chats/me/invitations");
            setInvitations(res.data ?? []);
        } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Failed to load invitations");
        } finally {
            setLoadingInvites(false);
        }
    }

    // ✅ Adjust these endpoints to your backend
    async function cancelInvitation(invitation: Invitations[number]) {
        const id = invitation.id;
        setInviteActionId(id);

        // Optimistic remove
        const prev = invitations;
        setInvitations((cur) => cur.filter((i) => i.id !== id));

        try {
            // Option: POST cancel
            await http.client.delete(`/chats/me/invitations/${id}`);
            // If your backend uses DELETE:
            // await http.client.delete(`/chats/me/invitations/${id}`);
        } catch (e: any) {
            // revert on failure
            setInvitations(prev);
            Alert.alert("Error", e?.message ?? "Failed to cancel invitation");
        } finally {
            setInviteActionId(null);
        }
    }

    async function acceptInvitation(invitation: Invitations[number]) {
        const id = invitation.id;
        setInviteActionId(id);

        // Optimistic remove
        const prev = invitations;
        setInvitations((cur) => cur.filter((i) => i.id !== id));

        try {
            // Option: POST confirm
            await http.client.post(`/chats/me/invitations/${id}/accept`);
            // If your backend uses /accept:
            // await http.client.post(`/chats/me/invitations/${id}/accept`);
        } catch (e: any) {
            // revert on failure
            setInvitations(prev);
            Alert.alert("Error", e?.message ?? "Failed to confirm invitation");
        } finally {
            setInviteActionId(null);
        }
    }

    useEffect(() => {
        loadInvitations();
    }, []);

    function onLogOut() {
        Alert.alert(
            "Log out?",
            "Are you sure you want to log out?",
            [
                {text: "No", style: "cancel"},
                {text: "Yes", style: "destructive", onPress: () => logout()},
            ],
            {cancelable: true}
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            <ScrollView
                className="flex-1 pb-16"
                keyboardShouldPersistTaps="handled"
            >
                <View className="pt-2">
                    <View className="items-center mt-4">
                        <View className="h-24 w-24 rounded-full overflow-hidden bg-neutral-700/60">
                            {profilePic}
                        </View>

                        <Text className="mt-4 text-white text-[22px] font-semibold">
                            {fullName || "Your Name"}
                        </Text>
                    </View>

                    {dirty ? (
                        <View className="mt-4 px-5 flex-row items-center justify-end gap-3">
                            <Pressable
                                onPress={onCancel}
                                className="px-4 py-2 rounded-xl bg-neutral-800/70 active:opacity-80"
                                disabled={saving}
                            >
                                <Text className="text-white/80 font-medium">Cancel</Text>
                            </Pressable>

                            <Pressable
                                onPress={onSave}
                                className={[
                                    "px-4 py-2 rounded-xl active:opacity-80",
                                    emailOk ? "bg-white" : "bg-white/40",
                                ].join(" ")}
                                disabled={saving || !emailOk}
                            >
                                <Text className="text-black font-semibold">
                                    {saving ? "Saving…" : "Save"}
                                </Text>
                            </Pressable>
                        </View>
                    ) : null}

                    <View className="mt-6">
                        {/* ✅ Invitations */}
                        <View className="px-5 mb-6">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-white/80 font-semibold">Invitations</Text>
                                <Pressable onPress={loadInvitations} className="px-2 py-1">
                                    <Text className="text-white/60 text-xs">
                                        {loadingInvites ? "Refreshing…" : "Refresh"}
                                    </Text>
                                </Pressable>
                            </View>

                            <View className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                                {loadingInvites ? (
                                    <View className="px-4 py-4 flex-row items-center gap-2">
                                        <ActivityIndicator/>
                                        <Text className="text-white/60">Loading invitations…</Text>
                                    </View>
                                ) : invitations.length === 0 ? (
                                    <View className="px-4 py-4">
                                        <Text className="text-white/50 text-sm">No invitations.</Text>
                                    </View>
                                ) : (
                                    invitations.map((inv) => {
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
                                                                        onPress: () => cancelInvitation(inv)
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
                                                        onPress={() => acceptInvitation(inv)}
                                                        className={`rounded-xl px-3 py-2 border ${
                                                            busy ? "border-white/10 bg-white/5" : "border-white/15 bg-white/10 active:bg-white/15"
                                                        }`}
                                                    >
                                                        {busy ? (
                                                            <ActivityIndicator/>
                                                        ) : (
                                                            <Text
                                                                className="text-white text-sm font-medium">Accept</Text>
                                                        )}
                                                    </Pressable>
                                                </View>
                                            </View>
                                        );
                                    })
                                )}
                            </View>

                            <Text className="text-white/40 text-xs mt-2">
                                Accepting adds you to the chat. Declining removes the invite.
                            </Text>
                        </View>

                        {/* Profile fields */}
                        <FormTextInput
                            label="First Name"
                            value={draft.firstName}
                            onChangeText={(v) => setDraft((p) => ({...p, firstName: v}))}
                            autoCapitalize="words"
                        />
                        <FormTextInput
                            label="Last Name"
                            value={draft.lastName}
                            onChangeText={(v) => setDraft((p) => ({...p, lastName: v}))}
                            autoCapitalize="words"
                        />
                        <FormTextInput
                            label="Email"
                            value={draft.email}
                            onChangeText={(v) => setDraft((p) => ({...p, email: v}))}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <LinkButton
                            label="Change Profile Picture"
                            onPress={() => pickAndUploadProfilePicture()}
                        />

                        <LinkButton
                            label="Message Requests"
                            onPress={() => {
                                Alert.alert("TODO", "Open Message Requests");
                            }}
                        />

                        <View className="mt-12 flex-row justify-center">
                            <RedButton className="w-28" value="Log Out" onPress={onLogOut}/>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <BottomTabBar/>
        </SafeAreaView>
    );
}