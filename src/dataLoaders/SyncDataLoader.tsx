import React, { useEffect } from 'react';

type SyncDataLoaderProps = {
    customUseContext: () => {
        dataLoaded: boolean;
        loadData: () => void;
        [key: string]: any;
    };
    children: React.ReactNode;
};

const SyncDataLoader = ({ customUseContext, children }: SyncDataLoaderProps) => {
    const { dataLoaded, loadData } = customUseContext();
    useEffect(() => {
        if (!dataLoaded) {
            loadData();
        }
    }, [dataLoaded]);

    const buildChild = () => {
        if (!dataLoaded) {
            return <div>Loading...</div>;
        }

        return children;
    };

    return <>{buildChild()}</>;
};

export default SyncDataLoader;
