import {Strategy} from "../Strategy";
import {GraphData, GraphStrategy} from "./GraphStrategy";
import SupplyChainInfo from "../../../models/SupplyChainInfo";
import Node from "../../../models/Node";
import Edge from "../../../models/Edge";
import {expandTransformation, findTransformation} from "../../../utils/supplyChainGraphUtils";


export class LegacyGraphStrategy extends Strategy implements GraphStrategy<GraphData> {
    constructor() {
        super(false);
    }

    async computeGraph(materialId: number, chainInfo: SupplyChainInfo): Promise<GraphData> {
        const transformation = findTransformation(materialId, chainInfo)
        if (!transformation) {
            console.log('For the material ' + materialId + ' we cannot find a transformation in our supply chain');
            return {"nodes": [], "edges": []};
        }
        const toNode: Node = new Node(
            transformation?.id,
            (transformation.processesNames || []).join(', ') + '\n' + transformation?.name,
        )
        let myNodes: Node[] = [toNode]
        let myEdges: Edge[] = []
        const nextStep = await expandTransformation(transformation, toNode, chainInfo);
        const finalNodes = myNodes.concat(nextStep.nodes);
        const finalEdges = myEdges.concat(nextStep.edges);
        return {"nodes": finalNodes, "edges": finalEdges}
    }

}
