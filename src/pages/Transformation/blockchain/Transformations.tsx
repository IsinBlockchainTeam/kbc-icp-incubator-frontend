import React, {useEffect, useState} from "react";
import {NotificationType, openNotification} from "../../../utils/notification";
import {TransformationService} from "../../../api/services/TransformationService";
import {ColumnsType} from "antd/es/table";
import {Table, TableProps} from "antd";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import {AssetOperationPresentable} from "../../../api/types/AssetOperationPresentable";
import {BlockchainAssetOperationStrategy} from "../../../api/strategies/asset_operation/BlockchainAssetOperationStrategy";

export const Transformations = () => {
    const [transformations, setTransformations] = useState<AssetOperationPresentable[]>();
    const loadData = async () => {
        try {
            const transformationService = new TransformationService(new BlockchainAssetOperationStrategy());
            const transformations = await transformationService.getTransformations();
            setTransformations(transformations.map(t => {
                // @ts-ignore
                t['key'] = t.id;
                return t;
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        }
    }

    const columns: ColumnsType<AssetOperationPresentable> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => a.id - b.id,
            sortDirections: ['descend']
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => (a.name || '').localeCompare((b.name || '')),
            sortDirections: ['descend']
        },
        {
            title: 'Material name',
            dataIndex: 'outputMaterial.name',
            render: (_, {outputMaterial}) => {
                return outputMaterial ? outputMaterial.name : 'No output material';
            }
        }
    ];

    const onChange: TableProps<AssetOperationPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <CardPage title="Transformations">
            <Table columns={columns} dataSource={transformations} onChange={onChange}/>
        </CardPage>
    )
}

export default Transformations;
