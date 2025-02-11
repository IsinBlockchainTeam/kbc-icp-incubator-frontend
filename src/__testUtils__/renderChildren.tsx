import React from "react";

export const renderChildren = ({ children, ...props }: any) => (
    <div>
        {children}
        {props.footer}
    </div>
);