import { FormInstance } from 'antd';
import dayjs from 'dayjs';

export const fromTimestampToDate = (timestamp: number): Date => {
    return new Date(timestamp * 1000);
};

export const differenceInDaysFromToday = (date: number | Date): number => {
    const today = new Date();
    const date1 = typeof date === 'number' ? fromTimestampToDate(date) : date;
    return Math.ceil((date1.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
export const validateDates = (
    dataFieldName: string,
    dateFieldNameToCompare: string,
    comparison: 'greater' | 'less',
    errorMessage: string
) => {
    return (form: FormInstance): Promise<void> => {
        const date = dayjs(form.getFieldValue(dataFieldName));
        const dateToCompare = dayjs(form.getFieldValue(dateFieldNameToCompare));
        if (date && dateToCompare)
            if (
                (comparison === 'greater' && date.isBefore(dateToCompare)) ||
                (comparison === 'less' && date.isAfter(dateToCompare))
            )
                return Promise.reject(errorMessage);

        return Promise.resolve();
    };
};
