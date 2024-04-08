import {Service} from "./Service";
import {ProcessTypeStrategy} from "../strategies/process_type/ProcessTypeStrategy";

export class ProcessTypeService extends Service {
    private readonly _strategy: ProcessTypeStrategy;

    constructor(strategy: ProcessTypeStrategy) {
        super();
        this._strategy = strategy;
    }

    async getAllProcessTypes(): Promise<string[]> {
        return this._strategy.getAllProcessTypes();
    }
}
