
export interface PartnerStrategy<T> {
    getPartners(): Promise<T[]>;
}
