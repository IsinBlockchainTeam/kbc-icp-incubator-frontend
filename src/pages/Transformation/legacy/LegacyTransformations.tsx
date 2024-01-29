import React, {useEffect, useState} from "react";
import {TransformationPlanPresentable} from "@unece/cotton-fetch";
import {NotificationType, openNotification} from "../../../utils/notification";
import {TransformationService} from "../../../api/services/TransformationService";
import {LegacyAssetOperationStrategy} from "../../../api/strategies/asset_operation/LegacyAssetOperationStrategy";
import {ColumnsType} from "antd/es/table";
import {Table, TableProps} from "antd";
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import {Link} from "react-router-dom";
import {setParametersPath} from "../../../utils/utils";
import {paths} from "../../../constants";

export const LegacyTransformations = () => {
    const [transformations, setTransformations] = useState<TransformationPlanPresentable[]>();
    const loadData = async () => {
        try {
            const transformationService = new TransformationService(new LegacyAssetOperationStrategy());
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

    const columns: ColumnsType<TransformationPlanPresentable> = [
        {
            title: 'Name',
            dataIndex: 'name',
            sorter: (a, b) => (a.name || '').localeCompare((b.name || '')),
            sortDirections: ['descend'],
            render: ((name, {id}) => {
                return (
                    <Link to={setParametersPath(paths.TRANSFORMATION_VIEW, {id})}>{name}</Link>
                )
            })
        },
        {
            title: 'Material name',
            dataIndex: 'outputMaterial.name',
            render: (_, {outputMaterial}) => {
                return outputMaterial ? outputMaterial.name : 'No output material';
            }
        },
        {
            title: 'Valid From',
            dataIndex: 'validFrom',
            sorter: (a, b) => (a.validFrom?.getTime() || 0) - (b.validFrom?.getTime() || 0),
            render: (_, {validFrom}) => {
                return validFrom ? new Date(validFrom).toLocaleDateString() : '-';
            }
        },
        {
            title: 'Valid Until',
            dataIndex: 'validUntil',
            sorter: (a, b) => (a.validFrom?.getTime() || 0) - (b.validFrom?.getTime() || 0),
            render: (_, {validFrom}) => {
                return validFrom ? new Date(validFrom).toLocaleDateString() : '-';
            }
        },
    ];

    const onChange: TableProps<TransformationPlanPresentable>['onChange'] = (pagination, filters, sorter, extra) => {
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

export default LegacyTransformations;
