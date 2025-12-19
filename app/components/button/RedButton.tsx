import {BaseButton, SimpleButtonProps} from "./BaseButton";
import React from "react";

export function RedButton(props: SimpleButtonProps) {
    return <>
        <BaseButton
            {...props}
            className={`bg-red-500 ${props.className ?? ""}`}
        />
    </>
}