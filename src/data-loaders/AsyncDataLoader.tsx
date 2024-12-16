import React, { useEffect } from 'react';

type AsyncDataLoaderProps = {
    customUseContext: () => {
        dataLoaded: boolean;
        loadData: () => void;
        [key: string]: any;
    };
    children: React.ReactNode;
};

const AsyncDataLoader = ({ customUseContext, children }: AsyncDataLoaderProps) => {
    const { dataLoaded, loadData } = customUseContext();
    useEffect(() => {
        if (!dataLoaded) {
            loadData();
        }
    }, [dataLoaded]);

    return <>{children}</>;
};

export default AsyncDataLoader;
