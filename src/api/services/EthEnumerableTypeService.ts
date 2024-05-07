import {Service} from "./Service";
import {EnumerableTypeService} from "@blockchain-lib/common";
import {BlockchainLibraryUtils} from "../BlockchainLibraryUtils";

export enum EnumerableDefinition {
    PROCESS_TYPE, UNIT, FIAT
}

export class EthEnumerableTypeService extends Service {
    private _enumerableTypeService: EnumerableTypeService;

    constructor(enumDefinition: EnumerableDefinition) {
        super();
        this._enumerableTypeService = BlockchainLibraryUtils.getEnumerableTypeService(enumDefinition);
    }

    async getAll(): Promise<string[]> {
        return this._enumerableTypeService.getTypesList();
    }
}
