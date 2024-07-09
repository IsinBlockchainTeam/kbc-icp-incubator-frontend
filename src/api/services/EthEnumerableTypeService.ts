import { EnumerableTypeService } from '@blockchain-lib/common';

export class EthEnumerableTypeService {
    private _enumerableTypeService: EnumerableTypeService;

    constructor(enumerableTypeService: EnumerableTypeService) {
        this._enumerableTypeService = enumerableTypeService;
    }

    async getAll(): Promise<string[]> {
        return this._enumerableTypeService.getTypesList();
    }
}
