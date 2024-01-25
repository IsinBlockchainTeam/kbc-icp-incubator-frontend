import {PartnerStrategy} from "./PartnerStrategy";
import CompanyControllerApi from "../../controllers/unece/CompanyControllerApi";
import {CompanyPresentable} from "@unece/cotton-fetch";
import {Strategy} from "../Strategy";

export class LegacyPartnerStrategy extends Strategy implements PartnerStrategy<CompanyPresentable> {

    constructor() {
        super(false);
    }
    async getPartners(): Promise<CompanyPresentable[]> {
        return CompanyControllerApi.getCompanyTraders();
    }

}
