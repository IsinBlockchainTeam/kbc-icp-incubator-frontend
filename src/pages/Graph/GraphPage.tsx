import React, { memo, useEffect, useState } from 'react';
import Dagre from '@dagrejs/dagre';
import ReactFlow, { Background, BackgroundVariant, Node, Position, ReactFlowProvider, useEdgesState, useNodesState } from 'reactflow';
import { CardPage } from '@/components/CardPage/CardPage';
import styles from './Graph.module.scss';
import { Radio, RadioChangeEvent } from 'antd';
import 'reactflow/dist/style.css';
import { useParams } from 'react-router-dom';

const MapNode = memo(() => {
    return (
        <div
            style={{
                height: 666,
                width: 1010,
                backgroundImage: 'url(/world.svg)',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
            }}
        />
    );
});

const nodeTypes = {
    mapNode: MapNode
};

const nodeWidth = 172;
const nodeHeight = 36;

export const GraphPage = () => {
    // TODO: Retrieve it from icp
    // const computeGraph: any = async (n: number) => null;
    // const { materialId } = useParams();
    // const [graphType, setGraphType] = useState('simple');
    //
    // const [nodes, setNodes, onNodesChange] = useNodesState([]);
    // const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    //
    // useEffect(() => {
    //     const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    //     g.setGraph({ rankdir: 'LR' });
    //     (async () => {
    //         const result = await computeGraph(parseInt(materialId!));
    //         if (!result) return;
    //
    //         result.nodes.forEach((node: any) => {
    //             g.setNode(node.name, { width: nodeWidth, height: nodeHeight });
    //         });
    //         result.edges.forEach((edge: any) => {
    //             g.setEdge(edge.from, edge.to);
    //         });
    //
    //         if (!g.nodeCount()) return;
    //
    //         Dagre.layout(g);
    //
    //         const tempNodes: Array<Node> = result.nodes.map((node: any) => ({
    //             id: node.name,
    //             position: {
    //                 x: g.node(node.name).x,
    //                 y: g.node(node.name).y
    //             },
    //             style: {
    //                 background:
    //                     node.type === AssetOperationType.TRANSFORMATION ? '#ADD8E6' : '#90EE90'
    //             },
    //             data: { label: node.name },
    //             sourcePosition: Position.Right,
    //             targetPosition: Position.Left,
    //             zIndex: 2,
    //             draggable: graphType !== 'map'
    //         }));
    //         if (graphType === 'map') {
    //             tempNodes.push({
    //                 id: 'map',
    //                 type: 'mapNode',
    //                 position: { x: 0, y: -233 },
    //                 data: { label: 'map' },
    //                 draggable: false,
    //                 selectable: false,
    //                 zIndex: 1
    //             });
    //         }
    //         setNodes(tempNodes);
    //         setEdges(
    //             result.edges.map((edge: any) => ({
    //                 id: edge.from + '-' + edge.to,
    //                 source: edge.from,
    //                 target: edge.to,
    //                 animated: true,
    //                 zIndex: 2,
    //                 style: { stroke: '#ADD8E6', strokeWidth: 2 }
    //             }))
    //         );
    //     })();
    // }, [graphType]);
    //
    // const handleGraphTypeChange = (e: RadioChangeEvent) => {
    //     setGraphType(e.target.value);
    // };
    //
    // return (
    //     <>
    //         GraphPage type:{' '}
    //         <Radio.Group
    //             value={graphType}
    //             onChange={handleGraphTypeChange}
    //             style={{ marginBottom: 10 }}>
    //             <Radio.Button value="simple">Simple</Radio.Button>
    //             <Radio.Button value="map">Map</Radio.Button>
    //         </Radio.Group>
    //         <CardPage title="GraphPage">
    //             <div className={styles.GraphContainer}>
    //                 <ReactFlowProvider>
    //                     <Background color="#ccc" variant={BackgroundVariant.Dots} />
    //                     <ReactFlow
    //                         nodes={nodes}
    //                         edges={edges}
    //                         onNodesChange={onNodesChange}
    //                         onEdgesChange={onEdgesChange}
    //                         nodeTypes={nodeTypes}
    //                         fitView
    //                     />
    //                 </ReactFlowProvider>
    //             </div>
    //         </CardPage>
    //     </>
    // );
    return <h1>Not Available</h1>;
};

export default GraphPage;
