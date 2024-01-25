import {useEffect, useState} from "react";
import {ConfirmationCertificationPresentable} from "@unece/cotton-fetch";
import {CertificationService} from "../../../../api/services/CertificationService";
import {LegacyCertificationStrategy} from "../../../../api/strategies/certification/LegacyCertificationStrategy";
import {useParams} from "react-router-dom";
import LegacyScopeCertificationView from "./LegacyScopeCertificationView";
import LegacySelfCertificationView from "./LegacySelfCertificationView";
import LegacyTransactionCertificationView from "./LegacyTransactionCertificationView";
import LegacyMaterialCertificationView from "./LegacyMaterialCertificationView";


export type CertificationViewerChildProps = {
    certification: ConfirmationCertificationPresentable;
}

export const LegacyCertificationView = () => {
    const { id, type } = useParams();
    const [certification, setCertification] = useState<ConfirmationCertificationPresentable>();

    const getCertificationInfo = async (id: number) => {
        const certificationService = new CertificationService(new LegacyCertificationStrategy());
        const resp = await certificationService.getCertificationById(id) as ConfirmationCertificationPresentable;
        resp && setCertification(resp);
    }

    useEffect(() => {
        (async () => {
            await getCertificationInfo(parseInt(id!));
        })();
    }, []);

    if (certification) {
        switch (type) {
            case "scope":
                return <LegacyScopeCertificationView certification={certification}/>
            case "material":
                return <LegacyMaterialCertificationView certification={certification}/>
            case "self":
                return <LegacySelfCertificationView certification={certification}/>
            case "transaction":
                return <LegacyTransactionCertificationView certification={certification}/>
        }
    }
    return (
        <div>Loading...</div>
    )
}

export default LegacyCertificationView;
