export interface ProcessTypeStrategy {
    getAllProcessTypes(): Promise<string[]>;
}
