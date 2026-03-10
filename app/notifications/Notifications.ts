import * as Notifications from "expo-notifications";

let initialized = false;

export async function initNotifications() {
    if (initialized) return;
    initialized = true;

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });

    const {status} = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
        await Notifications.requestPermissionsAsync();
    }
}

export async function notifyNow(params: {
    title: string;
    body: string;
    data?: Record<string, any>;
}) {
    // safe: if you forget to call init, this still works but may not show in foreground depending on handler
    await Notifications.scheduleNotificationAsync({
        content: {
            title: params.title,
            body: params.body,
            data: params.data ?? {},
        },
        trigger: null,
    });
}

export async function notifyMessage(msg: any, chatId: string) {
    await notifyNow({
        title: msg?.sender?.username ?? "New message",
        body: msg?.content ?? "You have a new message",
        data: {type: "message", chatId},
    });
}
