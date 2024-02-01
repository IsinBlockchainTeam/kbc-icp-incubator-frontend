import React, {memo, useEffect, useState} from "react";
import Dagre from '@dagrejs/dagre';
import ReactFlow, {
    Background, BackgroundVariant,
    Position,
    ReactFlowProvider,
    useEdgesState,
    useNodesState,
    Node
} from 'reactflow';
import {CardPage} from "../../../components/structure/CardPage/CardPage";
import styles from "./Graph.module.scss";
import {Radio, RadioChangeEvent} from 'antd';
import 'reactflow/dist/style.css';
import {useLocation, useParams} from "react-router-dom";
import {BlockchainGraphStrategy} from "../../../api/strategies/graph/BlockchainGraphStrategy";
import {GraphService} from "../../../api/services/GraphService";

const MapNode = memo(() => {
    return (
        <div
            style={{height: 666, width: 1010, backgroundImage: 'url(/world.svg)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}
        />
    );
});

const nodeTypes = {
    mapNode: MapNode,
};

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

export const GraphPage = () => {
    const { materialId } = useParams();
    const location = useLocation();
    const [graphType, setGraphType] = useState('simple');

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const supplier = new URLSearchParams(location.search).get('supplier');

    useEffect(() => {
        g.setGraph({ rankdir: 'LR' });
        (async () => {
            const graphService = new GraphService(new BlockchainGraphStrategy());
            console.log("Requesting graph for material", materialId);
            const result = await graphService.computeGraph(parseInt(materialId!));
            console.log("GRAPH", result)

            result.nodes.forEach(node => {
                g.setNode(node.resourceId, {width: nodeWidth, height: nodeHeight});
            });
            result.edges.forEach(edge => {
                g.setEdge(edge.from, edge.to);
            });

            if (!g.nodeCount()) return;

            Dagre.layout(g);

            const tempNodes: Array<Node> = result.nodes.map(node => ({
                id: node.resourceId,
                position: {
                    x: g.node(node.resourceId).x,
                    y: g.node(node.resourceId).y
                },
                data: {label: node.resourceId},
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
                zIndex: 2,
                draggable: graphType !== 'map',
                style: {background: '#ADD8E6'},
            }))
            if (graphType === 'map') {
                tempNodes.push({
                    id: 'map',
                    type: 'mapNode',
                    position: {x: 0, y: -233},
                    data: {label: 'map'},
                    draggable: false,
                    selectable: false,
                    zIndex: 1,
                })
            }
            setNodes(tempNodes);
            setEdges(result.edges.map(edge => ({
                id: edge.from + '-' + edge.to,
                source: edge.from,
                target: edge.to,
                animated: true,
                zIndex: 2,
                style: {stroke: '#ADD8E6', strokeWidth: 2},
            })));
        })();
    }, [graphType]);

    const handleGraphTypeChange = (e: RadioChangeEvent) => {
        setGraphType(e.target.value);
    };

    return (
        <>
            GraphPage type: <Radio.Group value={graphType} onChange={handleGraphTypeChange} style={{marginBottom: 10}}>
                <Radio.Button value="simple">Simple</Radio.Button>
                <Radio.Button value="map">Map</Radio.Button>
            </Radio.Group>
            <CardPage title="GraphPage">

                <div className={styles.GraphContainer}>
                    <ReactFlowProvider>
                        <Background
                            color="#ccc"
                            variant={BackgroundVariant.Dots}
                        />
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            nodeTypes={nodeTypes}
                            fitView/>
                    </ReactFlowProvider>
                </div>
            </CardPage>
        </>
    )
}

export default GraphPage;
