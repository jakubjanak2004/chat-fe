import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {ActivityIndicator, FlatList, Pressable, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useDebounce} from "use-debounce";
import {CONFIG} from '../../config/env'

import BottomTabBar from "../../components/BottomTabBar";
import SearchTextInput from "../../components/textInput/SearchTextInput";
import PersonRow, {Person} from "../../components/people/PersonRow";
import FlatListDivider from "../../components/divider/FlatListDivider";
import {http} from "../../lib/http";
import {useNavigation} from "@react-navigation/native";
import AddGroupIcon from "../../components/icon/AddGroupIcon";

// todo refactor the similar code with the chats page into common Hook
export default function PeopleScreen() {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 350);

    const normalizedQuery = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);

    const [people, setPeople] = useState<Person[]>([]);
    const [page, setPage] = useState(0);
    const [last, setLast] = useState(false);

    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const [listHeight, setListHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    // increasing number; responses that aren't the latest get ignored
    const requestSeq = useRef(0);

    const navigation = useNavigation();

    async function loadAndReplacePage(pageToLoad: number) {
        if (loading) return;

        const seq = ++requestSeq.current;

        try {
            setLoading(true)

            const res = await http.client.get("/users", {
                params: {
                    query: normalizedQuery,
                    page: pageToLoad,
                    size: CONFIG.PAGE_SIZE,
                },
            });

            if (seq !== requestSeq.current) return;

            const data = res.data;

            setPage(data.number);
            setLast(data.last);

            setPeople((prev) => (data.content));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function loadPage(pageToLoad: number) {
        if (loadingMore || last) return;

        const seq = ++requestSeq.current;

        try {
            setLoadingMore(true);

            const res = await http.client.get("/users", {
                params: {
                    query: normalizedQuery,
                    page: pageToLoad,
                    size: CONFIG.PAGE_SIZE,
                },
            });

            if (seq !== requestSeq.current) return;

            const data = res.data;

            setPage(data.number);
            setLast(data.last);

            setPeople((prev) => ([...prev, ...data.content]));
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMore(false);
        }
    }


    const maybeLoadMore = () => {
        // if list is not scrollable and more pages exist -> load next
        const notScrollable = contentHeight > 0 && contentHeight <= listHeight;

        if (notScrollable && !loading && !loadingMore && !last) {
            loadPage(page + 1);
        }
    };

    // when query changes (debounced) -> reset and load first page
    const onEndReached = () => {
        if (loading || loadingMore || last) return;
        loadPage(page + 1);
    };

    useEffect(() => {
        setPeople([]);
        setPage(0);
        setLast(false);
        loadAndReplacePage(0);
    }, [normalizedQuery]);


    useEffect(() => {
        maybeLoadMore();
    }, [listHeight, contentHeight, last, loading, loadingMore, page]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    // todo for some reason the styles do not work here
                    // className="mr-4 h-100 w-100 items-center justify-center rounded-full"
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9999,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onPress={() => navigation.navigate("CreateGroup")}
                >
                    <AddGroupIcon/>
                </Pressable>
            ),
        });
    }, [navigation]);


    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            {/* Search */}
            <SearchTextInput value={query} onChangeText={setQuery}/>

            {/* List */}
            <FlatList
                data={people}
                keyExtractor={(item) => item.username}
                renderItem={({item}) => <PersonRow item={item}/>}
                ItemSeparatorComponent={() => <FlatListDivider/>}
                className="flex-1"
                onEndReached={onEndReached}
                onEndReachedThreshold={0.6}
                onLayout={(e) => {
                    setListHeight(e.nativeEvent.layout.height);
                }}
                onContentSizeChange={(_, h) => {
                    setContentHeight(h);
                }}
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
                    loadingMore ? (
                        <View className="py-4">
                            <ActivityIndicator/>
                        </View>
                    ) : null
                }
            />

            <BottomTabBar/>
        </SafeAreaView>
    );
}
