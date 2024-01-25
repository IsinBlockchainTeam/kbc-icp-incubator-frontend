// TODO Check if we do need a blockchain specific class or if it can be merged
class CompanyInfo {
    visibleName: string;
    name: string;
    location: string;
    country: string;
    region: string;
    partnerTyp: string;

    constructor(visibleName: string,
                name: string,
                location: string,
                country: string,
                region: string,
                partnerTyp: string) {
        this.visibleName = visibleName;
        this.name = name;
        this.location = location;
        this.country = country;
        this.region = region;
        this.partnerTyp = partnerTyp;
    }
}

export default CompanyInfo;