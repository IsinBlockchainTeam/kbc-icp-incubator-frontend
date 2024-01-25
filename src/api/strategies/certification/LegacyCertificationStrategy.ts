import {Strategy} from "../Strategy";
import {CertificationStrategy} from "./CertificationStrategy";
import {
    ConfirmationCertificationPresentable,
    SustainabilityCriterionPresentable,
    TableCertificationPresentable
} from "@unece/cotton-fetch";
import CertificationControllerApi from "../../controllers/unece/CertificationControllerApi";
import SustainabilityCriteriaControllerApi from "../../controllers/unece/SustainabilityCriteriaControllerApi";

export class LegacyCertificationStrategy extends Strategy implements CertificationStrategy<TableCertificationPresentable | ConfirmationCertificationPresentable, SustainabilityCriterionPresentable> {

    constructor() {
        super(false);
    }

    async getCertifications(): Promise<(ConfirmationCertificationPresentable | TableCertificationPresentable)[]> {
        return CertificationControllerApi.getMyCertifications();
    }

    async getCertificationById(id: number): Promise<ConfirmationCertificationPresentable> {
        return CertificationControllerApi.getCertification({id});
    }
    async getCertificationsByTransactionId(id: number, transactionType: string): Promise<(ConfirmationCertificationPresentable | TableCertificationPresentable)[]> {
        return CertificationControllerApi.getCertificationsByTransactionId({id, transactionType});
    }

    async getSustainabilityCriteria(): Promise<SustainabilityCriterionPresentable[]> {
        return SustainabilityCriteriaControllerApi.getSustainabilityCriteria();
    }

}
