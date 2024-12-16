import React, { type ReactNode } from 'react';
import { SignerProvider } from '@/providers/auth/SignerProvider';
import { SiweIdentityProvider } from '@/providers/auth/SiweIdentityProvider';

const EvmToIcpProviders = ({ children }: { children: ReactNode }) => (
    <SignerProvider>
        <SiweIdentityProvider>{children}</SiweIdentityProvider>
    </SignerProvider>
);

export default EvmToIcpProviders;
