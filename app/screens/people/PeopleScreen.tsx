import React, { useLayoutEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "use-debounce";
import { CONFIG } from "../../config/env";

import BottomTabBar from "../../components/BottomTabBar";
import SearchTextInput from "../../components/textInput/SearchTextInput";
import PersonRow, { Person } from "../../components/people/PersonRow";
import FlatListDivider from "../../components/divider/FlatListDivider";
import { http } from "../../hooks/http";
import { useNavigation } from "@react-navigation/native";
import AddGroupIcon from "../../components/icon/AddGroupIcon";
import {usePagedList} from "../../hooks/usePagedList";

export default function PeopleScreen() {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 350);
    const normalizedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

    const navigation = useNavigation<any>();

    const fetchPeoplePage = async (page: number) => {
        const res = await http.client.get("/users", {
            params: {
                query: normalizedQuery,
                page,
                size: CONFIG.PAGE_SIZE,
            },
        });
        return res.data; // expects Spring Page: {content, number, last, ...}
    };

    const {
        items: people,
        loading,
        loadingMore,
        onEndReached,
        onLayout,
        onContentSizeChange,
    } = usePagedList<Person>(fetchPeoplePage, [normalizedQuery]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9999,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onPress={() => navigation.navigate("CreateGroup")}
                >
                    <AddGroupIcon />
                </Pressable>
            ),
        });
    }, [navigation]);

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            {/* Search */}
            <SearchTextInput value={query} onChangeText={setQuery} />

            {/* List */}
            <FlatList
                data={people}
                keyExtractor={(item) => item.username}
                renderItem={({ item }) => <PersonRow item={item} />}
                ItemSeparatorComponent={() => <FlatListDivider />}
                className="flex-1"
                onEndReached={onEndReached}
                onEndReachedThreshold={0.6}
                onLayout={onLayout}
                onContentSizeChange={onContentSizeChange}
                ListEmptyComponent={
                    loading ? (
                        <View className="items-center justify-center py-10">
                            <ActivityIndicator />
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
                    loadingMore ? (
                        <View className="py-4">
                            <ActivityIndicator />
                        </View>
                    ) : null
                }
            />

            <BottomTabBar />
        </SafeAreaView>
    );
}
