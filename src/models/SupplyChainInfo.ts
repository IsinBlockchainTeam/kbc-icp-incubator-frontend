import Transformation from "./Transformation";
import CompanyInfo from "./CompanyInfo";
import Material from "./Material";
import Trade from "./Trade";

class SupplyChainInfo {
    companiesInfo: CompanyInfo[];

    materials: Material[];

    trades: Trade[];

    transformations: Transformation[];

    constructor(companies: CompanyInfo[] = [],
                materials: Material[] = [],
                trades: Trade[] = [],
                transformations: Transformation[] = []) {
        this.companiesInfo = companies;
        this.materials = materials;
        this.trades = trades;
        this.transformations = transformations;
    }

    merge(o: SupplyChainInfo) {
        this.companiesInfo = this.companiesInfo.concat(o.companiesInfo)
        this.materials = this.materials.concat(o.materials)
        this.trades = this.trades.concat(o.trades)
        this.transformations = this.transformations.concat(o.transformations)
    }
}

export default SupplyChainInfo;