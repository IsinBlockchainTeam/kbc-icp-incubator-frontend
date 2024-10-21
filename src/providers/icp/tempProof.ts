import { Wallet } from 'ethers';
import { computeRoleProof } from '@kbc-lib/coffee-trading-management-lib';

const USER1_PRIVATE_KEY = '0c7e66e74f6666b514cc73ee2b7ffc518951cf1ca5719d6820459c4e134f2264';
const COMPANY1_PRIVATE_KEY = '538d7d8aec31a0a83f12461b1237ce6b00d8efc1d8b1c73566c05f63ed5e6d02';
const userWallet = new Wallet(USER1_PRIVATE_KEY);
const companyPrivateKey = COMPANY1_PRIVATE_KEY;
const DELEGATE_CREDENTIAL_ID_HASH =
    '0x2cc6c15c35500c4341eee2f9f5f8c39873b9c3737edb343ebc3d16424e99a0d4';
const DELEGATOR_CREDENTIAL_ID_HASH =
    '0xf19b6aebcdaba2222d3f2c818ff1ecda71c7ed93c3e0f958241787663b58bc4b';

export const getProof = async () => {
    return await computeRoleProof(
        userWallet.address,
        'Signer',
        DELEGATE_CREDENTIAL_ID_HASH,
        DELEGATOR_CREDENTIAL_ID_HASH,
        companyPrivateKey
    );
};
