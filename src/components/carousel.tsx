import React from "react";
import { type ArrowProps } from "react-multi-carousel";

export function ArrowFix (props: ArrowProps & {
    children: React.ReactNode
}) {
    const {children, onClick} = props;

    return (
        <span onClick={onClick}>
            {children}
        </span>
    )
}