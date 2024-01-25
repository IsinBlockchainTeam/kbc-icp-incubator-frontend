import {Service} from "./Service";
import {CertificationStrategy} from "../strategies/certification/CertificationStrategy";

export class CertificationService<T, R> extends Service {
    private readonly _strategy: CertificationStrategy<T, R>;

    constructor(certificationStrategy: CertificationStrategy<T, R>) {
        super();
        this._strategy = certificationStrategy;
    }

    async getCertifications(): Promise<T[]> {
        return this._strategy.getCertifications();
    }

    async getCertificationById(id: number): Promise<T> {
        return this._strategy.getCertificationById(id);
    }

    async getCertificationsByTransactionId(id: number, transactionType: string): Promise<T[]> {
        return this._strategy.getCertificationsByTransactionId(id, transactionType);
    }

    async getSustainabilityCriteria(): Promise<R[]> {
        return this._strategy.getSustainabilityCriteria();
    }
}
