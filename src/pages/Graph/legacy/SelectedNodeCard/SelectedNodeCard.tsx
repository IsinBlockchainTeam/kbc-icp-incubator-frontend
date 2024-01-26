import React from "react";
import styles from "./SelectedNodeCard.module.scss";
import {DoubleLeftOutlined, DoubleRightOutlined, InfoCircleOutlined,
    CloseCircleFilled, CheckCircleFilled, ClockCircleFilled} from "@ant-design/icons";
import {SustainabilityCriterionPresentable} from "@unece/cotton-fetch";
import Transformation from "../../../../models/Transformation";
import {downloadFile} from "../../../../utils/utils";
import Certificate from "../../../../models/Certificate";
import {Tooltip} from "antd";

export type FacilityInfo = {
    name: string | null,
    location: string | null,
    country: string | null,
    region: string | null,
    certificates: string[] | null,
    partnerTyp: string | null
}
export type SelectedNode = {
    materialName: string | null,
    materialCategory: string | null,
    facilityInfo: FacilityInfo | null,
    processName: string | null,
    processTypes: string[] | null,
    processingStandards: string[] | null,
    certificates: Certificate[] | null,
    transformationId: number | null
}
export type SelectedEdgeTrade = {
    tradeName: string | null,
    tradeRefNumber: string | null,
    date: string | null,
    processingStandards: string[] | null,
    tradeCertificates: Certificate[] | null,
}
export type SelectedEdge = {
    fromFacilityInfo: FacilityInfo | null,
    toFacilityInfo: FacilityInfo | null,
    trades: SelectedEdgeTrade[]
}
type Props = {
    selectedNode: SelectedNode | null,
    selectedEdge: SelectedEdge | null,
    selectedSustainabilityCriterion: SustainabilityCriterionPresentable | undefined;
    onClose: () => void,
    transformations: Transformation[]
};

export const SelectedNodeCard = (props: Props) => {
    const [expanded, setExpanded] = React.useState<boolean>();
    const toggleExpand = () => setExpanded(e => !e);

    const isNodeSelected = props.selectedNode !== null;
    const isEdgeSelected = props.selectedEdge !== null;

    React.useEffect(() => {
        if(props.selectedNode || props.selectedEdge)
            setExpanded(true);
    }, [props.selectedNode, props.selectedEdge])

    const contractor = isNodeSelected ? props.selectedNode?.facilityInfo : props.selectedEdge?.fromFacilityInfo;
    const contractorInfo = <div className={styles.Topic}>
        <h1>Company</h1>
        <div className={styles.InfoRow}>
            <div className={styles.InfoLeftContainer}>Name:</div>
            <div className={styles.InfoRightContainer}>{contractor?.name || '-'}</div>
        </div>
        <div className={styles.InfoRow}>
            <div className={styles.InfoLeftContainer}>Address:</div>
            <div className={styles.InfoRightContainer}>{contractor?.location || '-'}</div>
        </div>
        <div className={styles.InfoRow}>
            <div className={styles.InfoLeftContainer}>Region:</div>
            <div className={styles.InfoRightContainer}>{contractor?.region || '-'}</div>
        </div>
        <div className={styles.InfoRow}>
            <div className={styles.InfoLeftContainer}>State:</div>
            <div className={styles.InfoRightContainer}>{contractor?.country || '-'}</div>
        </div>
        <div className={styles.InfoRow}>
            <div className={styles.InfoLeftContainer}>Role:</div>
            <div className={styles.InfoRightContainer}>{contractor?.partnerTyp || '-'}</div>
        </div>
    </div>;
    const processInfo = <div className={styles.Topic}>
        <h1>Process</h1>
        <div className={styles.InfoRow}>
            <div className={styles.InfoLeftContainer}>Name:</div>
            <div className={styles.InfoRightContainer}>{props.selectedNode?.processName || '-'}</div>
        </div>
        <div className={styles.InfoRow}>
            <div className={styles.InfoLeftContainer}>Type:</div>
            <div className={styles.InfoRightContainer}>{(props.selectedNode?.processTypes || []).join(', ') || '-'}</div>
        </div>
        <div className={styles.InfoRow}>
            <div className={styles.InfoLeftContainer}>Material name:</div>
            <div className={styles.InfoRightContainer}>{props.selectedNode?.materialName || '-'}</div>
        </div>
        {/*<div className={styles.InfoRow}>*/}
        {/*    <div className={styles.InfoLeftContainer}>MaterialPresentable Category:</div>*/}
        {/*    <div className={styles.InfoRightContainer}>{props.selectedNode?.materialCategory || '-'}</div>*/}
        {/*</div>*/}
    </div>;

    const certificateInteraction = async (certificate: Certificate | undefined) => {
        if (certificate)
            if (certificate.certificatePageURL)
                window.open(certificate.certificatePageURL, "_blank");
            else if (certificate.documentId && certificate.documentFileName)
                await downloadFile("/documents/" + certificate.documentId, certificate?.documentFileName, ()=>console.error('Error while downloading certificate PDF'))
    }

    const certificateList = props.selectedNode?.processingStandards
        ?.filter(p => (props.selectedSustainabilityCriterion?.processingStandardNames || []).includes(p))
        // ?.flatMap(p => props.selectedNode?.certificates?.filter(c => c?.processStandardName === p))
        ?.flatMap((p, id) =>{

        let certificates = [];
        certificates = props.selectedNode?.certificates?.filter(c => {
            return c.processStandardName === p &&
                (
                    c.processTypes && c.processTypes.length > 0
                        ? c.processTypes.some(x => props.selectedNode?.processTypes?.includes(x))
                        : true
                )
            }
        ) || [];
        let rows = [];
        rows = certificates.map(c => {
            const nonValidMaterialCertificate = c?.subject === 'MATERIAL' &&
                props.transformations
                    .filter(t => t.id!==props.selectedNode?.transformationId)
                    .flatMap(t => t.certificates)
                    .filter(otherCert => otherCert.subject === 'SELF' && otherCert.status === 'ACCEPTED' && otherCert.id === c.id)
                    .length === 0;
            return (
                <Tooltip id='tooltip' placement="left" className={styles.Tooltip} title={c?.certificatePageURL ? 'Click to open the certificate website' : 'Click to download certificate\'s PDF'} >
                    <div className={`${styles.CertificateRow} ${c?.documentId || c?.certificatePageURL && styles.CertificateRowClickable}`} key={id} onClick={async () => await certificateInteraction(c)}>
                        <div className={styles.IconLinkContainer}>
                            {nonValidMaterialCertificate || c.status === 'REFUSED'
                                ? <CloseCircleFilled className={styles.CertNonOk} />
                                : c.status === 'PENDING'
                                    ? <ClockCircleFilled className={styles.CertPending} />
                                    : <CheckCircleFilled className={styles.CertOk} />
                            }
                        </div>
                        <div className={styles.CertContainer}>
                            <div className={styles.CertificationInfoContainer}>
                                <div><b>Cert. ID: </b>{c.id}</div>
                                <div><b>Certifier</b>{c.certifierCompanyName}</div>
                                <div><b>Processing Std.: </b>{c.processStandardName}</div>
                                <div><b>Issue date: </b>{c.validFrom}</div>
                                <div><b>Valid until: </b>{c.validUntil}</div>
                                <div><b>Cert. Type: </b>{c.certificateTypeName}</div>
                                <div><b>Assessment level: </b>{c.assessmentLevelName}</div>
                                <div className={c.status === 'PENDING' ? styles.CertPending : undefined}><b>Status: </b>{c.status}</div>
                            </div>

                            <div className={styles.CertificationIconContainer}>
                                <a href={c.processingStandardSiteUrl} target={"_blank"} rel="noreferrer">
                                    <img src={c.processingStandardLogoPath} />
                                </a>
                            </div>
                        </div>
                    </div>
                </Tooltip>
            );
        }) || [];
        rows.length === 0 && rows.push(
                <div className={`${styles.CertificateRow}`} key={id} >
                    <div className={styles.IconLinkContainer}>
                        <CloseCircleFilled className={styles.CertNonOk}/>
                    </div>
                    <div className={styles.CertContainer}>
                        <div className={styles.CertificationInfoContainer}>
                            <div><b>Processing Std.: </b>{p}</div>
                            <div><b>Certificate not available</b></div>
                        </div>
                    </div>
                </div>
        )
        return rows;
    })

    const certificates = <div className={styles.Topic}>
        <h1>Assessment Reference Standard</h1>
        <div className={styles.CertificateListContainer}>
            {certificateList && certificateList?.length > 0
                ? certificateList
                : 'No certificates available'}
        </div>
    </div>;

    const transactionList = (props.selectedEdge?.trades || []).map((trade, id) => {
        const certificateList = (trade?.processingStandards || []).map((p, id) => {
            const certificate = trade.tradeCertificates?.find(c => c.processStandardName === p);
            return (
                <Tooltip id='tooltip' placement="left" className={styles.Tooltip} title={certificate?.certificatePageURL ? 'Click to open the certificate website' : 'Click to download certificate\'s PDF'} >
                    <div className={`${styles.CertificateRow} ${certificate?.documentId || certificate?.certificatePageURL && styles.CertificateRowClickable}`} key={id} onClick={async () => await certificateInteraction(certificate)}>
                        {
                            certificate
                                ?
                                <>
                                    <div className={styles.IconLinkContainer}>
                                        {certificate.status === 'PENDING'
                                            ? <ClockCircleFilled className={styles.CertPending} />
                                            : <CheckCircleFilled className={styles.CertOk} />
                                        }
                                    </div>
                                    <div className={styles.CertContainer}>
                                        <div className={styles.CertificationInfoContainer}>
                                            <div><b>Cert. ID: </b>{certificate.id}</div>
                                            <div><b>Processing Std.: </b>{certificate.processStandardName}</div>
                                            <div><b>Issue date: </b>{certificate.validFrom}</div>
                                            <div><b>Cert. Type: </b>{certificate.certificateTypeName}</div>
                                            <div className={certificate.status === 'PENDING' ? styles.CertPending : undefined}><b>Status: </b>{certificate.status}</div>
                                        </div>

                                        <div className={styles.CertificationIconContainer}>
                                            <a href={certificate.processingStandardSiteUrl} target={"_blank"} rel="noreferrer">
                                                <img src={certificate.processingStandardLogoPath} />
                                            </a>
                                        </div>
                                    </div>
                                </>
                                :
                                <>
                                    <div className={styles.IconLinkContainer}>
                                        <CloseCircleFilled className={styles.CertNonOk}/>
                                    </div>
                                    <div className={styles.MainLinkContainer}>
                                        {p}
                                    </div>
                                </>
                        }
                    </div>
                </Tooltip>
            );
        });

        return (
            <div key={id}>
                <div className={styles.InfoRow}>
                    <div className={styles.InfoLeftContainer}>Type: </div>
                    <div className={styles.InfoRightContainer}>{trade.tradeName || '-'}</div>
                </div>
                <div className={styles.InfoRow}>
                    <div className={styles.InfoLeftContainer}>Ref. Number: </div>
                    <div className={styles.InfoRightContainer}>{trade.tradeRefNumber || '-'}</div>
                </div>
                <div className={styles.InfoRow}>
                    <div className={styles.InfoLeftContainer}>Date: </div>
                    <div className={styles.InfoRightContainer}>{trade.date || '-'}</div>
                </div>
                <div className={styles.InfoRow}>
                    <div className={styles.InfoLeftContainer}>Assessment Reference Standard: </div>
                </div>
                <div className={styles.CertificateListContainer}>
                    {certificateList.length > 0
                        ? certificateList
                        : 'No certificates available'
                    }
                </div>
                <div className={styles.Divider}/>
            </div>
        )

    });
    const transactions = <div className={styles.Topic}>
        <h1>Transactions</h1>
        <div className={styles.TradeListContainer}>
            {transactionList.length > 0
                ? transactionList
                : 'No transaction available'}
        </div>
    </div>;

    if(!isNodeSelected && !isEdgeSelected) {//Nothing selected
        return (
            <div className={`${styles.Card} ${styles.CardCompressed}`}>
                <Tooltip placement="top" className={styles.Tooltip} title="Click on a node or edge to view more details" >
                    <span className={styles.InfoContainer}>
                        <InfoCircleOutlined />
                    </span>
                </Tooltip>
            </div>
        )
    }
    if(!expanded){
        return (
            <div className={`${styles.Card} ${styles.CardCompressed}`}>
                <Tooltip id='tooltip' placement="left" className={styles.Tooltip} title={isNodeSelected ? 'Selected MaterialPresentable Information' : 'Selected TradePresentable(s) Information'} >
                        <span className={styles.InfoContainer}>
                            <InfoCircleOutlined />
                        </span>
                </Tooltip>
                <Tooltip id='tooltip' placement="left" className={styles.Tooltip} title="Expand" >
                    <span className={styles.ResizeContainer} onClick={toggleExpand}>
                        <DoubleLeftOutlined />
                    </span>
                </Tooltip>
            </div>
        )
    }

    return (
        <div className={`${styles.Card} ${styles.CardExpanded}`}>
            <div className={styles.CardContent}>
                {contractorInfo}
                {isNodeSelected && processInfo}
                {isNodeSelected && certificates}
                {isEdgeSelected && transactions}
            </div>
            <Tooltip id='tooltip' placement="left" className={styles.Tooltip} title="Collapse" >
                <span className={styles.ResizeContainer} onClick={toggleExpand}>
                    <DoubleRightOutlined />
                </span>
            </Tooltip>
        </div>
    )
}
