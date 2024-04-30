import React, {useEffect, useState} from "react";
import {Button, Table, TableProps} from "antd";
import {NotificationType, openNotification} from "../../utils/notification";
import {ColumnsType} from "antd/es/table";
import {MaterialPresentable} from "../../api/types/MaterialPresentable";
import {MaterialService} from "../../api/services/MaterialService";
import {BlockchainMaterialStrategy} from "../../api/strategies/material/BlockchainMaterialStrategy";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {PlusOutlined} from "@ant-design/icons";
import {paths} from "../../constants";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";

export const Materials = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<MaterialPresentable[]>();
    const dispatch = useDispatch();

    const loadData = async () => {
        try {
            dispatch(showLoading("Retrieving materials..."));
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
        } finally {
            dispatch(hideLoading())
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
        return () => {
            dispatch(hideLoading());
        }
    }, []);

    return (
        <CardPage title={<div
            style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            Materials
            <div>
            <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate(paths.PRODUCT_CATEGORY_NEW)} style={{marginRight: '16px'}}>
                New Product Category
            </Button>
            <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate(paths.MATERIAL_NEW)}>
                New Material
            </Button>
            </div>
        </div>}>
            <Table columns={columns} dataSource={materials} onChange={onChange}/>
        </CardPage>
    );
}

export default Materials;
