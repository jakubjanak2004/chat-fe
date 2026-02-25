import React, {useLayoutEffect, useMemo, useState} from "react";
import {ActivityIndicator, Animated, FlatList, Pressable, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useDebounce} from "use-debounce";
import {CONFIG} from "../../config/env";

import BottomTabBar from "../../components/BottomTabBar";
import SearchTextInput from "../../components/textInput/SearchTextInput";
import PersonRow from "../../components/people/PersonRow";
import FlatListDivider from "../../components/divider/FlatListDivider";
import {http} from "../../hooks/http";
import {useNavigation} from "@react-navigation/native";
import AddGroupIcon from "../../components/icon/AddGroupIcon";
import {usePagedList} from "../../hooks/usePagedList";
import {paths} from "../../../api/schema";
import ProfilePic from "../../components/people/ProfilePic";
import GrayTextInput from "../../components/textInput/GrayTextInput";
import ScrollView = Animated.ScrollView;

type UsersQuery = NonNullable<paths["/users"]["get"]["parameters"]["query"]>;
type PageChatUserDTO = paths["/users"]["get"]["responses"]["200"]["content"]["application/json"];
export type ChatUserDTO = NonNullable<PageChatUserDTO["content"]>[number];
type ChatDTO = paths["/chats/me/person/{username}"]["get"]["responses"]["200"]["content"]["application/json"];
type CreateChatDTO = paths["/chats/me"]["post"]["requestBody"]["content"]["application/json"]

export default function PeopleScreen() {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 350);
    const normalizedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

    // group creation handling
    const [createGroupMode, setCreateGroupMode] = useState(false);
    const [groupName, setGroupName] = useState<string>("");
    const [selected, setSelected] = useState<Map<string, ChatUserDTO>>(new Map());
    const selectedUsers = useMemo(() => Array.from(selected.values()), [selected]);
    const selectedCount = selected.size;

    const navigation = useNavigation<any>();

    const fetchPeoplePage = async (page: number) => {
        const params: UsersQuery = {
            query: normalizedQuery,
            page,
            size: CONFIG.PAGE_SIZE,
            sort: ["username,asc"]
        };
        const res = await http.client.get<PageChatUserDTO>("/users", {
            params,
            paramsSerializer: {indexes: null},
        });
        const data = res.data;
        return {
            content: (data.content ?? []) as ChatUserDTO[],
            number: data.number ?? page,
            last: data.last ?? false,
        }
    };

    const {
        items: people,
        loading,
        loadingMore,
        onEndReached,
        onLayout,
        onContentSizeChange,
    } = usePagedList<ChatUserDTO>(fetchPeoplePage, [normalizedQuery]);


    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: createGroupMode ? "Create Group" : "Profile",
            headerLeft: createGroupMode
                ? () => (
                    <Pressable onPress={cleanGroupSelection} className="px-3 py-2">
                        <Text className="text-white text-base">Cancel</Text>
                    </Pressable>
                )
                : undefined,
            headerRight: () => {
                if (!createGroupMode) {
                    return (
                        <Pressable
                            onPress={() => setCreateGroupMode(true)}
                            className="h-8 aspect-square rounded-full items-center justify-center self-center shrink-0"
                            hitSlop={8}
                        >
                            <AddGroupIcon/>
                        </Pressable>
                    );
                }

                const createButtonDisabled = !canCreateGroup();
                return (
                    <Pressable
                        onPress={proceedCreateGroup}
                        disabled={createButtonDisabled}
                        className={`px-3 py-2 ${createButtonDisabled && "opacity-40"}`}
                    >
                        <Text className="text-white text-base">Create</Text>
                    </Pressable>
                );
            },
        });
    }, [navigation, createGroupMode, selectedCount, groupName]);

    function canCreateGroup() {
        return selectedCount >= 2 && groupName.trim().length > 0
    }

    const cleanGroupSelection = () => {
        setGroupName("");
        setCreateGroupMode(false);
        setSelected(new Map());
    };

    const proceedCreateGroup = async () => {
        console.log(groupName);
        if (!groupName) {
            // todo handle blank group name
            return;
        }
        const members = Array.from(selected.keys());
        cleanGroupSelection();
        const payload: CreateChatDTO = {
            name: groupName,
            membersList: members
        }
        const res = await http.client.post<ChatDTO>("/chats/me", payload)
        const chat = res.data;
        navigation.navigate("Chat", {id: chat.id})
    };

    const openOrCreateChat = async (user: ChatUserDTO) => {
        try {
            const res = await http.client.get<ChatDTO>(`/chats/me/person/${user.username}`);
            navigation.navigate("Chat", {id: res.data.id});
        } catch {
            navigation.navigate("Chat", {personUsernameFallback: user.username});
        }
    };

    const onPersonPress = (user: ChatUserDTO) => {
        if (createGroupMode) toggleSelect(user);
        else void openOrCreateChat(user);
    };

    const toggleSelect = (user: ChatUserDTO) => {
        setSelected(prev => {
            const next = new Map(prev);
            if (next.has(user.username)) next.delete(user.username);
            else next.set(user.username, user);
            return next;
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            {/* Search */}
            <SearchTextInput value={query} onChangeText={setQuery}/>

            {createGroupMode && (
                <GrayTextInput
                    className="mx-10"
                    placeholder="Group Name"
                    value={groupName}
                    onChangeText={setGroupName}
                />
            )}

            {/* showing selected users */}
            {createGroupMode && selectedUsers.length > 0 ? (
                <View>
                    <ScrollView
                        horizontal showsHorizontalScrollIndicator={false}
                        className="px-3 py-2"
                    >
                        {selectedUsers.map(u => (
                            <Pressable
                                key={u.username}
                                onPress={() => toggleSelect(u)}
                                className="mr-3 items-center"
                            >
                                <View className="w-11 h-11 rounded-full overflow-hidden bg-neutral-800">
                                    {/* adapt field name if yours differs */}
                                    <ProfilePic user={u}/>
                                </View>

                                <Text className="text-white text-xs mt-1 max-w-[64px]" numberOfLines={1}>
                                    {u.username}
                                </Text>

                                {/* small X badge */}
                                <View
                                    className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-neutral-950 border border-neutral-700 items-center justify-center">
                                    <Text className="text-white text-xs leading-[12px]">×</Text>
                                </View>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            ) : null}

            {/* List */}
            <FlatList
                data={people}
                keyExtractor={(item) => {
                    return item.username
                }}
                renderItem={({item}) =>
                    <PersonRow
                        person={item}
                        onPress={onPersonPress}
                        selectable={createGroupMode}
                        selected={selected.has(item.username)}
                    />
                }
                ItemSeparatorComponent={() => <FlatListDivider/>}
                className="flex-1"
                onEndReached={onEndReached}
                onEndReachedThreshold={0.6}
                onLayout={onLayout}
                onContentSizeChange={onContentSizeChange}
                ListEmptyComponent={
                    loading ? (
                        <View className="items-center justify-center py-10">
                            <ActivityIndicator/>
                        </View>
                    ) : (
                        <View className="items-center justify-center py-10">
                            <Text className="text-gray-400">
                                {normalizedQuery ? "No users found." : "No users yet."}
                            </Text>
                        </View>
                    )
                }
                ListFooterComponent={
                    <>
                        {loadingMore ? (
                            <View className="py-4">
                                <ActivityIndicator/>
                            </View>
                        ) : null}

                        {/* spacer so last item can scroll under the bottom bar */}
                        <View style={{height: CONFIG.TAB_BAR_HEIGHT}}/>
                    </>
                }
            />

            <BottomTabBar/>
        </SafeAreaView>
    );
}
