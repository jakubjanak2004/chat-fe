import React from "react";
import {View, Text, Image, Pressable} from "react-native";
import {CONFIG} from "../../config/env";
import ProfilePicDefault from "./ProfilePicDefault";
import ProfilePic from "./ProfilePic";
import {ChatUserDTO} from "../../screens/people/PeopleScreen";

type Props = {
    person: ChatUserDTO
    onPress?: (p: ChatUserDTO) => void
    selectable: boolean
    selected: boolean
}

export default function PersonRow({person, onPress, selectable, selected}: Props) {
    // name parsing
    const name = `${person.firstName} ${person.lastName}`;

    return (
        <Pressable
            onPress={() => onPress?.(person)}
            className="flex-row items-center px-5 py-4 active:opacity-80 border"
        >
            <View className="h-12 w-12 rounded-full overflow-hidden">
                {<ProfilePic user={person}/>}
            </View>

            <Text className="ml-4 flex-1 text-white text-[16px] font-medium">{name}</Text>

            {/* selection indicator */}
            {selectable && (
                <View
                    className={
                        selected
                            ? "w-[18px] h-[18px] rounded-full border-2 border-white items-center justify-center"
                            : "w-[18px] h-[18px] rounded-full border-2 border-neutral-700"
                    }
                >
                    {selected ? <View className="w-2 h-2 rounded-full bg-white"/> : null}
                </View>
            )}
        </Pressable>
    );
}
