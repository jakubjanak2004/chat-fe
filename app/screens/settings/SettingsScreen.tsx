import React, {useEffect, useState} from "react";
import {View, Text, Image, Pressable, Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import BottomTabBar from "../../components/BottomTabBar";
import FormTextInput from "../../components/textInput/FormTextInput";
import LinkButton from "../../components/button/LinkButton";
import {useAuth, User} from "../../context/AuthContext";
import {RedButton} from "../../components/button/RedButton";
import * as ImagePicker from "expo-image-picker";
import {http} from "../../hooks/http";
import {CONFIG} from "../../config/env";
import PersonIcon from "../../components/icon/PersonIcon";
import ProfilePicDefault from "../../components/people/ProfilePicDefault";
import {paths} from "../../../api/schema";

type UpdateMyProfilePictureOp = paths["/users/me/profile-picture"]["put"];
type ProfilePictureUpdate = NonNullable<UpdateMyProfilePictureOp["requestBody"]>["content"]["multipart/form-data"];

function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function SettingsScreen() {
    const {user, logout, updateUser, updateProfilePicture} = useAuth();

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
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const onCancel = () => setDraft(user);

    // todo, later move the request to the auth context, just testing it
    async function pickAndUploadProfilePicture() {
        // 1) pick image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
        });

        if (result.canceled) return;

        const asset = result.assets[0];

        const uri = asset.uri;

        // 2) build form data
        const form = new FormData();
        form.append("file", {
            uri,
            // todo I dont like the naming here with the type
            name: "profile.jpg", // can be anything
            type: asset.mimeType ?? "image/jpeg",
        } as any);

        // 3) send
        try {
            await http.client.put<ProfilePictureUpdate>("/users/me/profile-picture", form, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            updateProfilePicture({hasProfilePicture: true});
        } catch (error) {
            console.error(error);
        }
    }

    const [profilePic, setProfilePic] = useState(<ProfilePicDefault />);
    // todo the version is not used by backend, is here just to force reload
    const [version, setVersion] = useState<number>(0);

    useEffect(() => {
        if (user.hasProfilePicture) {
            const url = `${CONFIG.API_URL}/users/${user.username}/profile-picture?v=${version}`;
            setProfilePic(<Image
                source={{uri: url}}
                style={{width: "100%", height: "100%"}}
                resizeMode="cover"
            />);
            setVersion((prev) => prev + 1);
        }
    }, [user]);

    function onLogOut() {
        Alert.alert(
            "Log out?",
            "Are you sure you want to log out?",
            [
                {text: "No", style: "cancel"},
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => logout(),
                },
            ],
            {cancelable: true}
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            {/* Header */}
            <View className="pt-2">

                <View className="items-center mt-4">
                    <View className="h-24 w-24 rounded-full overflow-hidden bg-neutral-700/60">
                        {profilePic}
                    </View>

                    <Text className="mt-4 text-white text-[22px] font-semibold">
                        {fullName || "Your Name"}
                    </Text>
                </View>

                {/* Save / Cancel (only when changed) */}
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
                            // TODO navigate to MessageRequests screen
                            Alert.alert("TODO", "Open Message Requests");
                        }}
                    />

                    <View className="mt-12 flex-row justify-center">
                        <RedButton
                            className="w-28"
                            value="Log Out"
                            onPress={() => onLogOut()}
                        />
                    </View>
                </View>
            </View>

            <BottomTabBar/>
        </SafeAreaView>
    );
}
