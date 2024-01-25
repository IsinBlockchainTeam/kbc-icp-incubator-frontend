import {Service} from "./Service";
import {GraphStrategy} from "../strategies/graph/GraphStrategy";

export class GraphService<T> extends Service {
    private readonly _strategy: GraphStrategy<T>;

    constructor(graphStrategy: GraphStrategy<T>) {
        super();
        this._strategy = graphStrategy;
    }

    async computeGraph(materialId: number, additionalInfo?: any): Promise<T> {
        return this._strategy.computeGraph(materialId, additionalInfo);
    }
}
