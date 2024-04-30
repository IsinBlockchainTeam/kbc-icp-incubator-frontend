import {Service} from "./Service";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";
import {EnumerableTypeService} from "@blockchain-lib/common";

export class EthProcessTypeService extends Service {
    private readonly _processTypesReadService: EnumerableTypeService;

    constructor() {
        super();
        this._processTypesReadService = BlockchainLibraryUtils.getEnumerableTypeService();

    }

    getAllProcessTypes(): Promise<string[]> {
        return this._processTypesReadService.getTypesList();
    }
}
