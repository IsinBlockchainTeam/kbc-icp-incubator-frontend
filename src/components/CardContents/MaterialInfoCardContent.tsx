import { Material } from '@kbc-lib/coffee-trading-management-lib';
import { Empty, Flex } from 'antd';
import React from 'react';

type Props = {
    material: Material | undefined;
};
export const MaterialInfoCardContent = ({ material }: Props) => {
    if (!material) return <Empty />;
    return (
        <Flex vertical>
            <div>
                <span style={{ fontWeight: 'bold' }}>Name: </span>
                <span>{material.name}</span>
            </div>
            <div>
                <span style={{ fontWeight: 'bold' }}>Product category: </span>
                <span>{material.productCategory.name}</span>
            </div>
            <div>
                <span style={{ fontWeight: 'bold' }}>Typology: </span>
                <span>{material.typology}</span>
            </div>
            <div>
                <span style={{ fontWeight: 'bold' }}>Quality: </span>
                <span>{material.quality}</span>
            </div>
            <div>
                <span style={{ fontWeight: 'bold' }}>Moisture: </span>
                <span>{material.moisture}</span>
            </div>
        </Flex>
    );
};
