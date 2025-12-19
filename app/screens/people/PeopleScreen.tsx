import React, {useMemo, useState} from "react";
import {View, FlatList} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

import BottomTabBar from "../../components/BottomTabBar";
import SearchTextInput from "../../components/textInput/SearchTextInput";
import PeopleRow, {Person} from "../../components/people/PeopleRow";
import FlatListDivider from "../../components/divider/FlatListDivider";

// mock data
const peopleMock: Person[] = [
    {
        id: "1",
        name: "Jacob Stanley",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
    {
        id: "2",
        name: "Andrew Parker",
        avatar: "https://images.unsplash.com/photo-1520975958225-d76d5b8b4b3a?auto=format&fit=crop&w=200&q=80",
    },
    {
        id: "3",
        name: "Karen Castillo",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    },
    {
        id: "4",
        name: "Maisy Humphrey",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
        id: "5",
        name: "Joshua Lawrence",
        avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=80",
    },
];

export default function PeopleScreen() {
    const [q, setQ] = useState("");

    const data = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return peopleMock;
        return peopleMock.filter((p) => p.name.toLowerCase().includes(s));
    }, [q]);

    return (
        <SafeAreaView className="flex-1 bg-black" edges={["bottom"]}>
            {/* Search */}
            <SearchTextInput/>

            {/* List */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => <PeopleRow item={item}/>}
                ItemSeparatorComponent={() => (
                    <FlatListDivider />
                )}
                className="flex-1"
            />

            <BottomTabBar/>
        </SafeAreaView>
    );
}
