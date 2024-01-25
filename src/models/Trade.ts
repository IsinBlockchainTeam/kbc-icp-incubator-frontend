import Certificate from "./Certificate";

class Trade {
    name: string;

    reference_number: string;
    
    date: Date | null;

    consignee_to_contractor_material_map: Map<number, number>;

    documentType: string;

    processing_standards: string[];

    certificates: Certificate[];

    constructor(name: string,
                reference_number: string,
                date: Date | null,
                consignee_to_contractor_material_map: Map<number, number>,
                documentType: string,
                processing_standards: string[],
                certificates: Certificate[]) {
        this.name = name;
        this.reference_number = reference_number;
        this.date = date;
        this.consignee_to_contractor_material_map = consignee_to_contractor_material_map;
        this.documentType = documentType;
        this.processing_standards = processing_standards;
        this.certificates = certificates;
    }
}

export default Trade;