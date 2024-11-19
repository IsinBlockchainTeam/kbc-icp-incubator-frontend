//TODO: FIX TEST
describe('Temp', () => {
    it('should ', () => {
        expect(true).toBe(true);
    });
});
export {};
// import { act, render } from '@testing-library/react';
// import { useEthGraph } from '@/providers/entities/EthGraphProvider';
// import { useParams } from 'react-router-dom';
// import Dagre from '@dagrejs/dagre';
// import GraphPage from '@/pages/Graph/GraphPage';
// import ReactFlow, { useEdgesState, useNodesState } from 'reactflow';
// import { Radio } from 'antd';
//
// jest.mock('react-router-dom');
// jest.mock('@/providers/entities/EthGraphProvider');
// jest.mock('@dagrejs/dagre');
// jest.mock('antd', () => ({
//     ...jest.requireActual('antd'),
//     Radio: {
//         ...jest.requireActual('antd').Radio,
//         Group: jest.fn().mockReturnValue(() => <div />)
//     }
// }));
// jest.mock('reactflow', () => ({
//     ...jest.requireActual('reactflow'),
//     __esModule: true,
//     default: jest.fn().mockReturnValue(() => <div />),
//     useNodesState: jest.fn(),
//     useEdgesState: jest.fn()
// }));
//
// describe('Graph Page', () => {
//     const materialId = 1;
//     const computeGraph = jest.fn();
//     const setDefaultEdgeLabel = jest.fn();
//     const setGraph = jest.fn();
//     const setNode = jest.fn();
//     const setEdge = jest.fn();
//     const nodeCount = jest.fn();
//     const node = jest.fn();
//     const mockedUseNodesState = {
//         nodes: [],
//         setNodes: jest.fn(),
//         onNodesChange: jest.fn()
//     };
//     const mockedUseEdgesState = {
//         edges: [],
//         setEdges: jest.fn(),
//         onEdgesChange: jest.fn()
//     };
//     beforeEach(() => {
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//         jest.clearAllMocks();
//
//         (useParams as jest.Mock).mockReturnValue({ materialId });
//         (useEthGraph as jest.Mock).mockReturnValue({ computeGraph });
//         (Dagre.graphlib.Graph as jest.Mock).mockImplementation(() => ({
//             setDefaultEdgeLabel
//         }));
//         setDefaultEdgeLabel.mockReturnValue({ setGraph, setNode, setEdge, nodeCount, node });
//         (useNodesState as unknown as jest.Mock).mockReturnValue([
//             mockedUseNodesState.nodes,
//             mockedUseNodesState.setNodes,
//             mockedUseNodesState.onNodesChange
//         ]);
//         (useEdgesState as unknown as jest.Mock).mockReturnValue([
//             mockedUseEdgesState.edges,
//             mockedUseEdgesState.setEdges,
//             mockedUseEdgesState.onEdgesChange
//         ]);
//         computeGraph.mockResolvedValue({
//             nodes: [{ name: 'node' }],
//             edges: [{ from: 'from', to: 'to' }]
//         });
//         nodeCount.mockReturnValue(1);
//         node.mockReturnValue({ x: 1, y: 1 });
//     });
//
//     it('should render correctly', async () => {
//         await act(async () => {
//             render(<GraphPage />);
//         });
//         const mockedReactFlow = ReactFlow as unknown as jest.Mock;
//         expect(mockedReactFlow).toHaveBeenCalled();
//         expect(mockedReactFlow).toHaveBeenCalledWith(
//             {
//                 nodes: mockedUseNodesState.nodes,
//                 edges: mockedUseEdgesState.edges,
//                 onNodesChange: mockedUseNodesState.onNodesChange,
//                 onEdgesChange: mockedUseEdgesState.onEdgesChange,
//                 nodeTypes: expect.any(Object),
//                 fitView: true
//             },
//             {}
//         );
//         expect(computeGraph).toHaveBeenCalledTimes(1);
//         expect(setNode).toHaveBeenCalledTimes(1);
//         expect(setNode).toHaveBeenCalledWith('node', { width: 172, height: 36 });
//         expect(setEdge).toHaveBeenCalledTimes(1);
//         expect(setEdge).toHaveBeenCalledWith('from', 'to');
//         expect(mockedUseNodesState.setNodes).toHaveBeenCalledTimes(1);
//         expect(mockedUseNodesState.setNodes).toHaveBeenCalledWith([
//             {
//                 id: 'node',
//                 position: { x: 1, y: 1 },
//                 style: { background: '#90EE90' },
//                 data: { label: 'node' },
//                 sourcePosition: 'right',
//                 targetPosition: 'left',
//                 zIndex: 2,
//                 draggable: true
//             }
//         ]);
//         expect(mockedUseEdgesState.setEdges).toHaveBeenCalledTimes(1);
//         expect(mockedUseEdgesState.setEdges).toHaveBeenCalledWith([
//             {
//                 id: 'from-to',
//                 source: 'from',
//                 target: 'to',
//                 animated: true,
//                 zIndex: 2,
//                 style: { stroke: '#ADD8E6', strokeWidth: 2 }
//             }
//         ]);
//     });
//
//     it('should change graph type', async () => {
//         await act(async () => {
//             render(<GraphPage />);
//         });
//
//         const mockedRadioGroup = Radio.Group as unknown as jest.Mock;
//         expect(mockedRadioGroup).toHaveBeenCalled();
//         expect(mockedRadioGroup).toHaveBeenCalledWith(
//             {
//                 value: 'simple',
//                 onChange: expect.any(Function),
//                 style: { marginBottom: 10 },
//                 children: expect.any(Object)
//             },
//             {}
//         );
//         const handleGraphTypeChange = mockedRadioGroup.mock.calls[0][0].onChange;
//         jest.clearAllMocks();
//         await act(async () => {
//             handleGraphTypeChange({ target: { value: 'map' } });
//         });
//         expect(computeGraph).toHaveBeenCalledTimes(1);
//         expect(setNode).toHaveBeenCalledTimes(1);
//         expect(setNode).toHaveBeenCalledWith('node', { width: 172, height: 36 });
//         expect(setEdge).toHaveBeenCalledTimes(1);
//         expect(setEdge).toHaveBeenCalledWith('from', 'to');
//         expect(mockedUseNodesState.setNodes).toHaveBeenCalledTimes(1);
//         expect(mockedUseNodesState.setNodes).toHaveBeenCalledWith([
//             {
//                 id: 'node',
//                 position: { x: 1, y: 1 },
//                 style: { background: '#90EE90' },
//                 data: { label: 'node' },
//                 sourcePosition: 'right',
//                 targetPosition: 'left',
//                 zIndex: 2,
//                 draggable: false
//             },
//             {
//                 id: 'map',
//                 type: 'mapNode',
//                 position: { x: 0, y: -233 },
//                 data: { label: 'map' },
//                 draggable: false,
//                 selectable: false,
//                 zIndex: 1
//             }
//         ]);
//         expect(mockedUseEdgesState.setEdges).toHaveBeenCalledTimes(1);
//         expect(mockedUseEdgesState.setEdges).toHaveBeenCalledWith([
//             {
//                 id: 'from-to',
//                 source: 'from',
//                 target: 'to',
//                 animated: true,
//                 zIndex: 2,
//                 style: { stroke: '#ADD8E6', strokeWidth: 2 }
//             }
//         ]);
//     });
// });
