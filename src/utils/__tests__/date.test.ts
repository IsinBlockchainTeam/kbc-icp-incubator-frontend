import {
    differenceInDaysFromToday,
    fromDateToString,
    fromTimestampToDate,
    validateDates
} from '@/utils/date';
import { FormInstance } from 'antd';

describe('date utility functions', () => {
    it('converts timestamp to date', () => {
        const timestamp = 1633027200;
        const date = fromTimestampToDate(timestamp);
        expect(date.getUTCFullYear()).toEqual(2021);
        expect(date.getUTCMonth()).toEqual(8);
        expect(date.getUTCDate()).toEqual(30);
    });

    it('calculates difference in days from today', () => {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const difference = differenceInDaysFromToday(tomorrow);
        expect(difference).toEqual(1);
    });

    it('validates dates correctly', async () => {
        const form = {
            getFieldValue: (fieldName: string) => {
                return fieldName === 'start' ? '2022-01-01' : '2022-01-02';
            }
        } as FormInstance;
        const validator = validateDates(
            'start',
            'end',
            'less',
            'Start date should be before end date'
        );
        await expect(validator(form)).resolves.toBeUndefined();
    });

    it('throws error when dates are not valid', async () => {
        const form = {
            getFieldValue: (fieldName: string) => {
                return fieldName === 'start' ? '2022-01-02' : '2022-01-01';
            }
        } as FormInstance;
        const validator = validateDates(
            'start',
            'end',
            'less',
            'Start date should be before end date'
        );
        await expect(validator(form)).rejects.toEqual('Start date should be before end date');
    });
});
