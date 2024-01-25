import React from "react";
import {isBlockchainViewMode} from "../utils/storage";

type Props = {
    component: any,
    blockchainComponent: any,
}

export default (props: Props) => {
    const Component = props.component;
    const BlockchainComponent = props.blockchainComponent;
    if (isBlockchainViewMode())
        return <BlockchainComponent />

    return <Component />
}
