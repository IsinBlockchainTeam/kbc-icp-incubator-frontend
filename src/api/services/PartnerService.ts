import {PartnerStrategy} from "../strategies/partner/PartnerStrategy";
import {Service} from "./Service";

export class PartnerService<T> extends Service {
    private readonly _strategy: PartnerStrategy<T>;

    constructor(partnerStrategy: PartnerStrategy<T>) {
        super();
        this._strategy = partnerStrategy;
    }

    async getPartners(): Promise<T[]> {
        return this._strategy.getPartners();
    }
}
