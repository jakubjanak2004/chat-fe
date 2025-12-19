import React from "react";
import {BaseButton, SimpleButtonProps} from "./BaseButton";

export function GreenButton(props: SimpleButtonProps) {
    return <>
        <BaseButton
            {...props}
            className="bg-green-500"
        />
    </>
}