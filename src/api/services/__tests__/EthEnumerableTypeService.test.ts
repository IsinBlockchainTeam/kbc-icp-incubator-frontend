import { EnumerableTypeReadDriver, EnumerableTypeService } from '@blockchain-lib/common';
import { EthEnumerableTypeService } from 'src/api/services/EthEnumerableTypeService';

jest.mock('@blockchain-lib/common');

describe('EthEnumerableTypeService', () => {
    let ethEnumerableTypeService: EthEnumerableTypeService;
    let enumerableTypeService: EnumerableTypeService;

    beforeEach(() => {
        enumerableTypeService = new EnumerableTypeService({} as EnumerableTypeReadDriver);
        ethEnumerableTypeService = new EthEnumerableTypeService(enumerableTypeService);
    });

    it('should successfully get all enumerable types', async () => {
        const typesList = ['type1', 'type2', 'type3'];
        enumerableTypeService.getTypesList = jest.fn().mockResolvedValue(typesList);

        const result = await ethEnumerableTypeService.getAll();
        expect(result).toEqual(typesList);
        expect(enumerableTypeService.getTypesList).toHaveBeenCalled();
    });
});
