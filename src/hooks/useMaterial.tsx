import { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '@/redux/reducers/loadingSlice';
import { EthContext } from '@/providers/EthProvider';
import { NotificationType, openNotification } from '@/utils/notification';
import { Material, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';

export default function useMaterial() {
    const dispatch = useDispatch();
    const { ethMaterialService } = useContext(EthContext);

    const [dataLoaded, setDataLoaded] = useState<boolean>(false);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);

    const loadData = async () => {
        try {
            dispatch(showLoading('Retrieving data...'));
            const productCategories = await ethMaterialService.getProductCategories();
            setProductCategories(productCategories);
            setDataLoaded(true);
        } catch (e: any) {
            openNotification('Error', e.message, NotificationType.ERROR);
        } finally {
            dispatch(hideLoading());
        }
    };

    return {
        loadData,
        dataLoaded,
        materials,
        productCategories
    };
}
