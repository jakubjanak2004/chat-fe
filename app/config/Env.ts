export const CONFIG = {
    // paging
    PAGE_SIZE: 20,
    // rest
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    TIMEOUT_MS: 10_000,
    SEPARATOR_GAP_MIN: 15,
    // ws
    WS_URL: process.env.EXPO_PUBLIC_WS_URL,
    WS_RECONNECT_DELAY:  10_000,
    WS_HEARTBEAT_INCOMING: 10_000,
    WS_HEARTBEAT_OUTGOING: 10_000,

    // bottom bar height
    TAB_BAR_HEIGHT: 112,

    // refresh token
    REFRESH_TOKEN_KEY: 'refreshToken',
};
