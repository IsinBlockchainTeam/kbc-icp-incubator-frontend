import React from 'react';
import { CardPage } from '@/components/structure/CardPage/CardPage';
import { ColumnsType } from 'antd/es/table';
import { RawTrade } from '@/providers/entities/EthRawTradeProvider';
import { Link, useNavigate } from 'react-router-dom';
import { setParametersPath } from '@/utils/page';
import { paths } from '@/constants/paths';
import { AsyncComponent } from '@/components/AsyncComponent/AsyncComponent';
import { TradeType } from '../../../../coffee-trading-management-lib/src/types/TradeType';
import { Tag } from 'antd';
import { NegotiationStatus } from '../../../../coffee-trading-management-lib/src/types/NegotiationStatus';
import { ShipmentPhaseDisplayName } from '@/constants/shipmentPhase';
import { useEthCertificate } from '@/providers/entities/EthCertificateProvider';
import { useEthRawCertificate } from '@/providers/entities/EthRawCertificateProvider';
import DropdownButton from 'antd/es/dropdown/dropdown-button';
import { PlusOutlined } from '@ant-design/icons';
import { CertificateType } from '@kbc-lib/coffee-trading-management-lib';

export const Certifications = () => {
    const navigate = useNavigate();
    const { rawCertificates } = useEthRawCertificate();
    console.log('rawCertificates', rawCertificates);
    // const columns: ColumnsType<RawTrade> = [
    //     {
    //         title: 'Id',
    //         dataIndex: 'id',
    //         sorter: (a, b) => a.id - b.id,
    //         sortDirections: ['descend'],
    //         render: (id, { type }) => (
    //             <Link to={setParametersPath(`${paths.TRADE_VIEW}?type=:type`, { id }, { type })}>
    //                 {id}
    //             </Link>
    //         )
    //     },
    //     {
    //         title: 'Supplier',
    //         dataIndex: 'supplier',
    //         render: (_, { id }) => (
    //             <AsyncComponent
    //                 asyncFunction={async () => getCompany(await getSupplierAsync(id)).legalName}
    //                 defaultElement={<>Unknown</>}
    //             />
    //         )
    //     },
    //     {
    //         title: 'Commissioner',
    //         dataIndex: 'commissioner',
    //         render: (_, { id }) => (
    //             <AsyncComponent
    //                 asyncFunction={async () => getCompany(await getCustomerAsync(id)).legalName}
    //                 defaultElement={<>Unknown</>}
    //             />
    //         )
    //     },
    //     {
    //         title: 'Type',
    //         dataIndex: 'type',
    //         render: (type) => {
    //             return TradeType[type];
    //         }
    //     },
    //     {
    //         title: 'Negotiation status',
    //         dataIndex: 'negotiationStatus',
    //         render: (_, { id }) => (
    //             <Tag color="geekblue">
    //                 <AsyncComponent
    //                     asyncFunction={async () =>
    //                         NegotiationStatus[await getNegotiationStatusAsync(id)]
    //                     }
    //                     defaultElement={<>UNKNOWN</>}
    //                 />
    //             </Tag>
    //         )
    //     },
    //     {
    //         title: 'Shipment phase',
    //         dataIndex: 'shipmentPhase',
    //         render: (_, { id }) => (
    //             <Tag color="geekblue">
    //                 <AsyncComponent
    //                     asyncFunction={async () =>
    //                         ShipmentPhaseDisplayName[await getShipmentPhaseAsync(id)]
    //                     }
    //                     defaultElement={<>NOT CREATED</>}
    //                 />
    //             </Tag>
    //         )
    //     }
    // ];

    const newCertificationsType = [
        {
            key: setParametersPath(paths.CERTIFICATION_NEW, {
                type: CertificateType.COMPANY.toString()
            }),
            label: 'Company Certification'
        },
        {
            key: setParametersPath(paths.CERTIFICATION_NEW, {
                type: CertificateType.SCOPE.toString()
            }),
            label: 'Scope Certification'
        },
        {
            key: setParametersPath(paths.CERTIFICATION_NEW, {
                type: CertificateType.MATERIAL.toString()
            }),
            label: 'Material Certification'
        }
    ];

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    Certifications
                    <div>
                        <DropdownButton
                            type="primary"
                            menu={{ items: newCertificationsType, onClick: (e) => navigate(e.key) }}
                            icon={<PlusOutlined />}>
                            New Certification
                        </DropdownButton>
                    </div>
                </div>
            }></CardPage>
    );
};
