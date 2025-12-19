import React, {useMemo, useState} from "react";
import {View, Text, Image, Pressable, Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import BottomTabBar from "../../components/BottomTabBar";
import FormTextInput from "../../components/textInput/FormTextInput";
import LinkButton from "../../components/button/LinkButton";
import {useAuth, User} from "../../context/AuthContext";

type Profile = {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
};

function isValidEmail(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function SettingsScreen() {
    const {user} = useAuth();

    const initial: Profile = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    }

    const [draft, setDraft] = useState<Profile>(initial);
    const [saving, setSaving] = useState(false);

    const fullName = `${draft.firstName} ${draft.lastName}`.trim();

    const dirty =
        draft.firstName !== initial.firstName ||
        draft.lastName !== initial.lastName ||
        draft.email !== initial.email;

    const emailOk = isValidEmail(draft.email);

    const onSave = async () => {
        if (!emailOk) {
            Alert.alert("Invalid email", "Please enter a valid email address.");
            return;
        }
        setSaving(true);
        try {
            // TODO: call backend PUT /me
            await new Promise((r) => setTimeout(r, 450));
            Alert.alert("Saved", "Your profile was updated.");
        } finally {
            setSaving(false);
        }
    };

    const onCancel = () => setDraft(initial);

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            {/* Header */}
            <View className="pt-2">

                <View className="items-center mt-4">
                    <View className="h-24 w-24 rounded-full overflow-hidden bg-neutral-700/60">
                        {draft.avatarUrl ? (
                            <Image source={{uri: draft.avatarUrl}} className="h-full w-full"/>
                        ) : null}
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
                        label="Message Requests"
                        onPress={() => {
                            // TODO navigate to MessageRequests screen
                            Alert.alert("TODO", "Open Message Requests");
                        }}
                    />
                </View>
            </View>

            <BottomTabBar/>
        </SafeAreaView>
    );
}
