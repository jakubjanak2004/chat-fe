import {CONFIG} from "../../config/env";
import {Image} from "react-native";
import ProfilePicDefault from "./ProfilePicDefault";
import React from "react";
import {User} from "./PersonRow";

type Props = {
    user: User;
}

export default function ProfilePic({user}: Props) {
    if (user.hasProfilePicture) {
        const url = `${CONFIG.API_URL}/users/${user.username}/profile-picture`;
        return <Image source={{uri: url}} className="h-full w-full"/>;
    } else {
        return <ProfilePicDefault />
    }
}