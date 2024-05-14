export {};
it('should always pass', () => {
    expect(true).toBe(true);
});
// import {combineReducers, configureStore, Store} from "@reduxjs/toolkit";
// import {useNavigate} from "react-router-dom";
//
// jest.mock('react-router-dom', () => ({
//     ...jest.requireActual('react-router-dom'),
//     useNavigate: jest.fn(),
// }));
// jest.mock('../../../../api/services/EthTradeService');
// jest.mock('../../../../api/strategies/trade/BlockchainTradeStrategy');
// jest.mock('../../../../utils/utils', () => ({
//     checkAndGetEnvironmentVariable: jest.fn(),
//     getEnumKeyByValue: jest.fn(),
// }));
// jest.mock('../../../../api/services/SolidServerService', () => ({}));
//
// describe('Trade View', () => {
//     const navigate = jest.fn();
//
//     let store: Store;
//
//     function createTestStore() {
//         return configureStore({
//             preloadedState: {
//                 auth: {
//                     subjectDid: 'did:test:123',
//                 }
//             },
//         });
//     }
//
//     beforeEach(() => {
//         store = createTestStore();
//         (useNavigate as jest.Mock).mockReturnValue(navigate);
//         jest.spyOn(console, 'log').mockImplementation(jest.fn());
//         jest.spyOn(console, 'error').mockImplementation(jest.fn());
//         jest.clearAllMocks();
//     });
//
//     describe('Basic Trade', () => {
//         it('should render correctly', () => {
//
//         });
//     });
// });
