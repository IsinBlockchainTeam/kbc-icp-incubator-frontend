import {Strategy} from "../Strategy";
import {ProcessTypeStrategy} from "./ProcessTypeStrategy";
import {EnumerableTypeService} from "@blockchain-lib/common";
import {BlockchainLibraryUtils} from "../../BlockchainLibraryUtils";

export class BlockchainProcessTypeStrategy extends Strategy implements ProcessTypeStrategy {
    private readonly _processTypesReadService: EnumerableTypeService;

    constructor() {
        super(true);
        this._processTypesReadService = BlockchainLibraryUtils.getEnumerableTypeService();
    }

    getAllProcessTypes(): Promise<string[]> {
        return this._processTypesReadService.getTypesList();
    }
}
