import React, {useEffect, useState} from "react";
import {Table, TableProps} from "antd";
import {NotificationType, openNotification} from "../../utils/notification";
import {ColumnsType} from "antd/es/table";
import {MaterialPresentable} from "../../api/types/MaterialPresentable";
import {MaterialService} from "../../api/services/MaterialService";
import {BlockchainMaterialStrategy} from "../../api/strategies/material/BlockchainMaterialStrategy";
import {CardPage} from "../../components/structure/CardPage/CardPage";

export const Materials = () => {
    const [materials, setMaterials] = useState<MaterialPresentable[]>();
    const loadData = async () => {
        try {
            const materialService = new MaterialService(new BlockchainMaterialStrategy());
            const materials = await materialService.getMaterials();
            setMaterials(materials.map(m => {
                // @ts-ignore
                m['key'] = m.id;
                return m;
            }));
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        }
    }

    const columns: ColumnsType<MaterialPresentable> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => (a.id && b.id) ? a.id - b.id : 0,
            sortDirections: ['descend']
        },
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
    ];

    const onChange: TableProps<MaterialPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <CardPage title="Materials">
            <Table columns={columns} dataSource={materials} onChange={onChange}/>
        </CardPage>
    );
}

export default Materials;
