import React from "react";
import {BaseButton, SimpleButtonProps} from "./BaseButton";

export default function BlueButton(props: SimpleButtonProps)  {
    return <BaseButton
            {...props}
            className="bg-blue-500"
        />
}