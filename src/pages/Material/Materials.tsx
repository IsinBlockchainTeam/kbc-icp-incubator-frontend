import React, {useContext, useEffect, useState} from "react";
import {Button, Table} from "antd";
import {NotificationType, openNotification} from "../../utils/notification";
import {ColumnsType} from "antd/es/table";
import {CardPage} from "../../components/structure/CardPage/CardPage";
import {PlusOutlined} from "@ant-design/icons";
import {paths} from "../../constants";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {hideLoading, showLoading} from "../../redux/reducers/loadingSlice";
import {Material, ProductCategory} from "@kbc-lib/coffee-trading-management-lib";
import {EthServicesContext} from "../../providers/EthServicesProvider";

export const Materials = () => {
    const {ethMaterialService} = useContext(EthServicesContext);
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<Material[]>();
    const [productCategories, setProductCategories] = useState<ProductCategory[]>();
    const dispatch = useDispatch();

    const loadData = async () => {
        if (!ethMaterialService) {
            console.error("EthMaterialService not found");
            return;
        }
        try {
            dispatch(showLoading("Retrieving product categories and materials..."));
            setProductCategories(await ethMaterialService.getProductCategories());
            setMaterials(await ethMaterialService.getMaterials());
        } catch (e: any) {
            console.log("error: ", e);
            openNotification("Error", e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading())
        }
    }

    const productCategoriesColumns: ColumnsType<ProductCategory> = [
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

    const materialsColumns: ColumnsType<Material> = [
        {
            title: 'Id',
            dataIndex: 'id',
            sorter: (a, b) => (a.id && b.id) ? a.id - b.id : 0,
            sortDirections: ['descend']
        },
        {
            title: 'Product category',
            dataIndex: 'name',
            render: (_, {productCategory}) => productCategory.name,
            sorter: (a, b) => a.productCategory.name.localeCompare(b.productCategory.name),
        },
    ];

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
                <Table columns={productCategoriesColumns} dataSource={productCategories} rowKey="id"/>
            </CardPage>
            <div style={{height: '16px'}}/>
            <CardPage
                title={<div
                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    Your Materials
                    <div>
                        <Button type="primary" icon={<PlusOutlined/>} onClick={() => navigate(paths.MATERIAL_NEW)}>
                            New Material
                        </Button>
                    </div>
                </div>
                }>
                <Table columns={materialsColumns} dataSource={materials} rowKey="id"/>
            </CardPage>
        </>
    );
}

export default Materials;
