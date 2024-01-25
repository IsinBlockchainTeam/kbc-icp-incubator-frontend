class Certificate {
    id: string;
    certifierCompanyName: string;
    processStandardName: string;
    assessmentLevelName: string
    processingStandardLogoPath: string;
    processingStandardSiteUrl: string;
    processTypes: string[];
    validUntil: string | null;
    validFrom: string | null;
    certificateTypeName: string;
    documentId: number | null;
    documentFileName: string | null;
    subject: string | null;
    status: string | null;
    certificatePageURL: string | null;

    constructor(id: string, certifierCompanyName: string, processStandardName: string, assessmentLevelName: string, processingStandardLogoPath: string, processingStandardSiteUrl: string, processTypes: string[], validUntil: string, validFrom: string, certificateTypeName: string, documentId: number | null, documentFileName: string | null, subject: string | null, status: string | null, certificatePageURL: string | null) {
        this.id = id;
        this.certifierCompanyName = certifierCompanyName;
        this.assessmentLevelName = assessmentLevelName;
        this.processStandardName = processStandardName;
        this.processingStandardLogoPath = processingStandardLogoPath;
        this.processingStandardSiteUrl = processingStandardSiteUrl;
        this.processTypes = processTypes;
        this.validUntil = validUntil;
        this.validFrom = validFrom;
        this.certificateTypeName = certificateTypeName;
        this.documentId = documentId;
        this.documentFileName = documentFileName;
        this.subject = subject;
        this.status = status;
        this.certificatePageURL = certificatePageURL;
    }
}

export default Certificate;