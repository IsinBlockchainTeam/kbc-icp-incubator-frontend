import Certificate from "./Certificate";

class Transformation {
    id: number;
    name: string;
    product_category: string;
    input_material_ids: number[];
    output_material_ids: number[];
    executor_company_id: string;
    processesNames: string[];
    input_material_id_percentage_map: Map<number, number>;
    processing_standards: string[];
    certificates: Certificate[];

    constructor(id: number,
                name: string,
                product_category: string,
                output_material_ids: number[],
                input_material_ids: number[],
                executor_company_id: string,
                processesNames: string[],
                input_material_id_percentage_map: Map<number, number>,
                processing_standards: string[],
                certificates: Certificate[]
    ) {
        this.id = id;
        this.name = name;
        this.product_category = product_category;
        this.output_material_ids = output_material_ids;
        this.input_material_ids = input_material_ids;
        this.executor_company_id = executor_company_id;
        this.processesNames = processesNames;
        this.input_material_id_percentage_map = input_material_id_percentage_map;
        this.processing_standards = processing_standards;
        this.certificates = certificates;
    }
}

export default Transformation;
