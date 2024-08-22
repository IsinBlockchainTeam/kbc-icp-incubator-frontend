import React, { JSX, useEffect } from 'react';
import { Spin } from 'antd';

export type AsyncComponentProps<T> = {
    asyncFunction: () => Promise<T>;
    defaultElement: JSX.Element;
};
export const AsyncComponent = <T,>(props: AsyncComponentProps<T>) => {
    const [loading, setLoading] = React.useState(false);
    const [value, setValue] = React.useState<T | null>(null);

    useEffect(() => {
        setLoading(true);
        props
            .asyncFunction()
            .then((t) => {
                setValue(t);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <Spin />;
    return value ? <>{value}</> : <>{props.defaultElement}</>;
};
