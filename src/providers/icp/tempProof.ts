import { Wallet } from 'ethers';
import { computeRoleProof } from '@kbc-lib/coffee-trading-management-lib';

const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';

export const getProof = async (userAddress: string) => {
    return await computeRoleProof(
        userAddress,
        'Signer',
        DELEGATE_CREDENTIAL_ID_HASH,
        DELEGATOR_CREDENTIAL_ID_HASH,
        new Wallet(COMPANY1_PRIVATE_KEY)
    );
};
