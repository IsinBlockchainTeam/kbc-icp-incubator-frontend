export const fromTimestampToDate = (timestamp: number): Date => {
    return new Date(timestamp * 1000);
};

export const differenceInDaysFromToday = (date: number | Date): number => {
    const today = new Date();
    const date1 = typeof date === 'number' ? fromTimestampToDate(date) : date;
    return Math.ceil((date1.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};
