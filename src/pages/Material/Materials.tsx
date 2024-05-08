import React, {useEffect, useState} from "react";
import {Button, Table, TableProps} from "antd";
import {NotificationType, openNotification} from "../../utils/notification";
import {ColumnsType} from "antd/es/table";
import {MaterialPresentable} from "../../api/types/MaterialPresentable";
import {EthMaterialService} from "../../api/services/EthMaterialService";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {PlusOutlined} from "@ant-design/icons";
import {paths} from "../../constants";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {ProductCategoryPresentable} from "../../api/types/ProductCategoryPresentable";

export const Materials = () => {
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<MaterialPresentable[]>();
    const [productCategories, setProductCategories] = useState<ProductCategoryPresentable[]>();
    const dispatch = useDispatch();

    const loadData = async () => {
        try {
            dispatch(showLoading("Retrieving product categories and materials..."));
            const materialService = new EthMaterialService();
            const productCategories = await materialService.getProductCategories();
            setProductCategories(productCategories);
            const materials = await materialService.getMaterials();
            setMaterials(materials);
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const productCategoriesColumns: ColumnsType<ProductCategoryPresentable> = [
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
        {
            title: 'Quality',
            dataIndex: 'quality',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
    ];

    const materialsColumns: ColumnsType<MaterialPresentable> = [
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

    const onProductCategoriesChange: TableProps<ProductCategoryPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };
    const onMaterialsChange: TableProps<MaterialPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    useEffect(() => {
        loadData();
        return () => {
            dispatch(hideLoading());
        }
    }, []);

    return (
        <>
            <CardPage title={<div
                style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center',}}>
                Product Categories
                <div>
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate(paths.PRODUCT_CATEGORY_NEW)} style={{marginRight: '16px'}}>
                        New Product Category
                    </Button>
                </div>
            </div>
            }>
                <Table columns={productCategoriesColumns} dataSource={productCategories} onChange={onProductCategoriesChange} rowKey="id"/>
            </CardPage>
            <div style={{height: '16px'}}/>
            <CardPage
                title={<div
                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    Materials
                    <div>
                        <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate(paths.MATERIAL_NEW)}>
                            New Material
                        </Button>
                    </div>
                </div>
                }>
                <Table columns={materialsColumns} dataSource={materials} onChange={onMaterialsChange} rowKey="id"/>
            </CardPage>
        </>
    );
}

export default Materials;
