import { checkAndGetEnvironmentVariable } from '@/utils/env';

export const defaultPictureURL: string =
    'https://i.pinimg.com/736x/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg';

export const utils = {
    DATE_FORMAT: 'DD/MM/YYYY'
};

export const ESCROW_FEE: number = Number(
    checkAndGetEnvironmentVariable(
        process.env.REACT_APP_ESCROW_FEE_PERCENT,
        'Escrow fee amount percent must be defined'
    )
);
