import React from 'react';
import { render } from '@testing-library/react';
import { useSelector } from 'react-redux';
import PrivateRoutes from './PrivateRoutes';
import { paths } from '@/constants/paths';
import { SignerProvider } from '@/providers/SignerProvider';
import { SiweIdentityProvider } from '@/providers/SiweIdentityProvider';
import { ICPProvider } from '@/providers/ICPProvider';
import { EthMaterialProvider } from '@/providers/entities/EthMaterialProvider';
import { EthEnumerableProvider } from '@/providers/entities/EthEnumerableProvider';
import { EthOfferProvider } from '@/providers/entities/EthOfferProvider';
import { ICPNameProvider } from '@/providers/entities/ICPNameProvider';
import { EthRawTradeProvider } from '@/providers/entities/EthRawTradeProvider';
import { EthDocumentProvider } from '@/providers/entities/EthDocumentProvider';
import { EthBasicTradeProvider } from '@/providers/entities/EthBasicTradeProvider';
import { EthOrderTradeProvider } from '@/providers/entities/EthOrderTradeProvider';
import { EthAssetOperationProvider } from '@/providers/entities/EthAssetOperationProvider';
import { EthRelationshipProvider } from '@/providers/entities/EthRelationshipProvider';
import { EthGraphProvider } from '@/providers/entities/EthGraphProvider';
import { Navigate, Outlet } from 'react-router-dom';
import { EthEscrowProvider } from '@/providers/entities/EthEscrowProvider';

jest.mock('react-router-dom');
jest.mock('react-redux');
jest.mock('@/providers/SignerProvider');
jest.mock('@/providers/SiweIdentityProvider');
jest.mock('@/providers/ICPProvider');
jest.mock('@/providers/entities/EthMaterialProvider');
jest.mock('@/providers/entities/EthEnumerableProvider');
jest.mock('@/providers/entities/EthOfferProvider');
jest.mock('@/providers/entities/ICPNameProvider');
jest.mock('@/providers/entities/EthRawTradeProvider');
jest.mock('@/providers/entities/EthDocumentProvider');
jest.mock('@/providers/entities/EthBasicTradeProvider');
jest.mock('@/providers/entities/EthOrderTradeProvider');
jest.mock('@/providers/entities/EthAssetOperationProvider');
jest.mock('@/providers/entities/EthRelationshipProvider');
jest.mock('@/providers/entities/EthGraphProvider');
jest.mock('@/providers/entities/EthEscrowProvider');

describe('PrivateRoutes', () => {
    it('renders when user is logged in', () => {
        const renderChildren = ({ children }: any) => <div>{children}</div>;
        (useSelector as jest.Mock).mockReturnValue({ isLogged: true });
        (SignerProvider as jest.Mock).mockImplementation(renderChildren);
        (SiweIdentityProvider as jest.Mock).mockImplementation(renderChildren);
        (ICPProvider as jest.Mock).mockImplementation(renderChildren);
        (EthMaterialProvider as jest.Mock).mockImplementation(renderChildren);
        (EthEnumerableProvider as jest.Mock).mockImplementation(renderChildren);
        (EthOfferProvider as jest.Mock).mockImplementation(renderChildren);
        (ICPNameProvider as jest.Mock).mockImplementation(renderChildren);
        (EthRawTradeProvider as jest.Mock).mockImplementation(renderChildren);
        (EthDocumentProvider as jest.Mock).mockImplementation(renderChildren);
        (EthBasicTradeProvider as jest.Mock).mockImplementation(renderChildren);
        (EthOrderTradeProvider as jest.Mock).mockImplementation(renderChildren);
        (EthAssetOperationProvider as jest.Mock).mockImplementation(renderChildren);
        (EthRelationshipProvider as jest.Mock).mockImplementation(renderChildren);
        (EthGraphProvider as jest.Mock).mockImplementation(renderChildren);
        (EthEscrowProvider as jest.Mock).mockImplementation(renderChildren);

        render(<PrivateRoutes />);

        expect(SignerProvider).toHaveBeenCalled();
        expect(SiweIdentityProvider).toHaveBeenCalled();
        expect(ICPProvider).toHaveBeenCalled();
        expect(EthMaterialProvider).toHaveBeenCalled();
        expect(EthEnumerableProvider).toHaveBeenCalled();
        expect(EthOfferProvider).toHaveBeenCalled();
        expect(ICPNameProvider).toHaveBeenCalled();
        expect(EthRawTradeProvider).toHaveBeenCalled();
        expect(EthDocumentProvider).toHaveBeenCalled();
        expect(EthBasicTradeProvider).toHaveBeenCalled();
        expect(EthOrderTradeProvider).toHaveBeenCalled();
        expect(EthAssetOperationProvider).toHaveBeenCalled();
        expect(EthRelationshipProvider).toHaveBeenCalled();
        expect(EthGraphProvider).toHaveBeenCalled();
        expect(EthEscrowProvider).toHaveBeenCalled();
        expect(Outlet).toHaveBeenCalled();
    });

    it('renders Navigate to LOGIN when user is not logged in', () => {
        (useSelector as jest.Mock).mockReturnValue({ isLogged: false });

        render(<PrivateRoutes />);

        expect(Navigate).toHaveBeenCalled();
        expect(Navigate).toHaveBeenCalledWith({ to: paths.LOGIN }, {});
    });
});
