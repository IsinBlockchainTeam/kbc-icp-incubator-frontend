import React, { useEffect } from 'react';

type DataLoaderProps = {
    customUseContext: () => {
        dataLoaded: boolean;
        loadData: () => void;
        [key: string]: any;
    };
    children: React.ReactNode;
};

const DataLoader = ({ customUseContext, children }: DataLoaderProps) => {
    const { dataLoaded, loadData } = customUseContext();
    useEffect(() => {
        if (!dataLoaded) {
            loadData();
        }
    }, [dataLoaded]);

    return <>{children}</>;
};

export default DataLoader;
