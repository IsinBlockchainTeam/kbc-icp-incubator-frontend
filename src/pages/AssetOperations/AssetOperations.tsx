import React, {useEffect, useState} from "react";
import {NotificationType, openNotification} from "../../utils/notification";
import {EthAssetOperationService} from "../../api/services/EthAssetOperationService";
import {ColumnsType} from "antd/es/table";
import {Button, Table, TableProps} from "antd";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {AssetOperation} from "@kbc-lib/coffee-trading-management-lib";
import {PlusOutlined} from "@ant-design/icons";
import {paths} from "../../constants";
import {useNavigate} from "react-router-dom";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {useDispatch} from "react-redux";

export const AssetOperations = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [assetOperations, setAssetOperations] = useState<AssetOperation[]>();
    const loadData = async () => {
        try {
            dispatch(showLoading("Retrieving asset operations..."))
            const assetOperationService = new EthAssetOperationService();
            const assetOperations = await assetOperationService.getAssetOperations();
            setAssetOperations(assetOperations.map(t => {
                // @ts-ignore
                t['key'] = t.id;
                return t;
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const columns: ColumnsType<AssetOperation> = [
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
                return outputMaterial ? outputMaterial.productCategory.name : 'No output material';
            }
        }
    ];

    const onChange: TableProps<AssetOperation>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect(() => {
        loadData();
        return () => {
            dispatch(hideLoading())
        }
    }, []);

    return (
        <CardPage title={<div
            style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            Asset Operations
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate(paths.ASSET_OPERATIONS_NEW)}
                        style={{marginRight: '16px'}}>
                    New Asset Operation
                </Button>
        </div>}>
            <Table columns={columns} dataSource={assetOperations} onChange={onChange}/>
        </CardPage>
    )
}

export default AssetOperations;
