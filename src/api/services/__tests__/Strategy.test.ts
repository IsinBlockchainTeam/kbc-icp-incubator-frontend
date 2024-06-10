import { getWalletAddress } from '../../../utils/storage';
import { Strategy } from '../Strategy';
import { ErrorHandler } from '../../../utils/error/ErrorHandler';

jest.mock('../../../utils/storage');
const errorSpy = jest.spyOn(ErrorHandler, 'manageUndefinedOrEmpty');

class TestStrategy extends Strategy {
    constructor(isBlockchain: boolean) {
        super(isBlockchain);
    }

    public checkService(service: any) {
        super.checkService(service);
    }
}
describe('Strategy', () => {
    it('should not check wallet if mode is not blockchain', () => {
        new TestStrategy(false);

        expect(getWalletAddress).toHaveBeenCalledTimes(0);
        expect(errorSpy).toHaveBeenCalledTimes(0);
    });

    it('should manage undefined service', () => {
        const strategy = new TestStrategy(true);
        strategy.checkService(undefined);

        expect(getWalletAddress).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledTimes(2);
    });
});
