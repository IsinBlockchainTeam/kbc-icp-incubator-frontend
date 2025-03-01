import { checkAndGetEnvironmentVariable } from '@/utils/env';

export const defaultPictureURL: string = 'https://i.pinimg.com/736x/ec/d9/c2/ecd9c2e8ed0dbbc96ac472a965e4afda.jpg';

export const utils = {
    DATE_FORMAT: 'DD/MM/YYYY'
};

export const DOWN_PAYMENT_FEE: number = Number(
    checkAndGetEnvironmentVariable(process.env.REACT_APP_DOWN_PAYMENT_FEE_PERCENT, 'Down payment fee amount percent must be defined')
);
