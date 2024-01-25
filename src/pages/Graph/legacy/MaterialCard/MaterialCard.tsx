import React, {useEffect} from "react";
import styles from './MaterialCard.module.scss';
import {DoubleLeftOutlined, DoubleRightOutlined, InfoCircleOutlined, PushpinFilled, FileFilled} from "@ant-design/icons";
import {SustainabilityCriterionPresentable} from "@unece/cotton-fetch";
import {useNavigate, useParams} from "react-router-dom";
import CompanyInfo from "../../../../models/CompanyInfo";
import SupplyChainInfo from "../../../../models/SupplyChainInfo";
import Edge from "../../../../models/Edge";
import {
    defaultNodeEdgeColor,
    getEdgeColor,
    getNodeColor,
    getTradesFromEdge,
    invalidNodeEdgeColor, partialValidNodeEdgeColor, validNodeEdgeColor
} from "../../../../utils/supplyChainGraphUtils";
import {Tooltip} from "antd";

type SustainabilityCriterion = {
    value: SustainabilityCriterionPresentable | undefined
    selected: boolean,
    onClick: ()=>void
};
type Props = {
    materialName: string,
    processes: string[],
    productCategory: string,
    sustainabilityCriteria: SustainabilityCriterion[]
    company: CompanyInfo,
    supplyChain: SupplyChainInfo | null,
    edges: Edge[]
};

export const criterionColor = (criterion: SustainabilityCriterionPresentable | undefined, supplyChain: SupplyChainInfo | null, edges: Edge[]) => {
    if (criterion){
        const nodesColor = supplyChain?.transformations.map(t => getNodeColor(criterion, t, supplyChain?.transformations || [])) || [];
        const edgesColor = edges.map(e => getEdgeColor(criterion, (getTradesFromEdge(supplyChain, e) || []).filter(t => t.name === 'Shipping')));
        let color = invalidNodeEdgeColor;
        //Grey dot: all nodes and trades are grey
        if(nodesColor.length == 0 || (nodesColor.every(v => v === defaultNodeEdgeColor) && edgesColor.every(v => v === defaultNodeEdgeColor)))
            color = defaultNodeEdgeColor;
        //Green dot: all nodes and trades are green and grey (at least one green)
        else if(nodesColor.every(v => v === validNodeEdgeColor || v === defaultNodeEdgeColor) && edgesColor.every(v => v === validNodeEdgeColor || v === defaultNodeEdgeColor))
            color = validNodeEdgeColor;
        //Yellow dot: all nodes are green, grey and yellow (at least one yellow)
        else if(nodesColor.every(v => v === validNodeEdgeColor || v === defaultNodeEdgeColor || v === partialValidNodeEdgeColor) && edgesColor.every(v => v === validNodeEdgeColor || v === defaultNodeEdgeColor || v === partialValidNodeEdgeColor))
            color = partialValidNodeEdgeColor;
        //Else red dot: at least one red node

        return color;
    }
    return "";
}

export const MaterialCard = (props: Props) => {
    const navigate = useNavigate();
    const {id: idParam} = useParams();

    const [expanded, setExpanded] = React.useState<boolean>();
    const [selectedSustainabilityCriterion, setSelectedSustainabilityCriterion] = React.useState<SustainabilityCriterion | undefined>(undefined);

    useEffect(() => {
        if (selectedSustainabilityCriterion === undefined)
            setSelectedSustainabilityCriterion(props.sustainabilityCriteria[0]);
    }, [props.sustainabilityCriteria]);

    const toggleExpand = () => setExpanded(e => !e);

    const criteriaList = props.sustainabilityCriteria.map((s, id) => {
        const color = criterionColor(s.value, props.supplyChain, props.edges);

        const onClick = () => {
            setSelectedSustainabilityCriterion(s);
            s.onClick();
            toggleExpand();
        }
        return (
            <div className={`${styles.SCRow} ${s.selected && styles.SelectedRow}`} onClick={onClick} key={id}>
                <div className={styles.IconLinkContainer} style={{color}}>
                    <PushpinFilled />
                </div>
                <div className={styles.MainLinkContainer}>
                    {s?.value?.name || '-'}
                </div>
            </div>
        )
    })

    if(!expanded){
        return (
            <div className={`${styles.Card} ${styles.CardCompressed}`}>
                <Tooltip id='tooltip' placement="right" className={styles.Tooltip} title="Sustainability Criteria, Documents & Producer Information">
                    <span className={styles.InfoContainer}>
                        <InfoCircleOutlined />
                    </span>
                </Tooltip>
                <Tooltip placement="right" id='tooltip' className={styles.Tooltip} title="Expand">
                    <span className={styles.ResizeContainer} onClick={toggleExpand}>
                        <DoubleRightOutlined />
                    </span>
                </Tooltip>
            </div>
        )
    }
    return (
        <div className={`${styles.Card} ${styles.CardExpanded}`}>
            <div className={styles.CardContent}>
                <div className={styles.Topic}>
                    <h1>Sustainability Criteria</h1>
                    <div>
                        {criteriaList}
                    </div>
                </div>
                <div className={styles.Topic}>
                    <h1>Documents</h1>
                    <button onClick={()=>{navigate(`/documentsHistory/${idParam}?material_name=${props.materialName}`)}} className={styles.Button}>
                        <div className={styles.IconLinkContainer}><FileFilled /></div>
                        <div className={styles.MainLinkContainer}>Document History</div>
                    </button>
                </div>
                <div className={styles.Topic}>
                    <h1>Producer</h1>
                    <div className={styles.InfoRow}>
                        <div className={styles.InfoLeftContainer}>Name:</div>
                        <div className={styles.InfoRightContainer}>{props.company?.visibleName || '-'}</div>
                    </div>
                    <div className={styles.InfoRow}>
                        <div className={styles.InfoLeftContainer}>Address:</div>
                        <div className={styles.InfoRightContainer}>{props.company?.location || '-'}</div>
                    </div>
                    <div className={styles.InfoRow}>
                        <div className={styles.InfoLeftContainer}>Region:</div>
                        <div className={styles.InfoRightContainer}>{props.company?.region || '-'}</div>
                    </div>
                    <div className={styles.InfoRow}>
                        <div className={styles.InfoLeftContainer}>State:</div>
                        <div className={styles.InfoRightContainer}>{props.company?.country || '-'}</div>
                    </div>
                </div>
            </div>
            <Tooltip id='tooltip' placement="right" className={styles.Tooltip} title="Collapse" >
                <span className={styles.ResizeContainer} onClick={toggleExpand}>
                    <DoubleLeftOutlined />
                </span>
            </Tooltip>
        </div>
    )
}

export default MaterialCard;
