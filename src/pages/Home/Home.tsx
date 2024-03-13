import React, {useEffect} from "react";
import {FormElement, FormElementType, GenericForm} from "../../components/GenericForm/GenericForm";

export const Home = () => {
    const [firstDocument, setFirstDocument] = React.useState<Blob | undefined>(undefined);
    const [secondDocument, setSecondDocument] = React.useState<Blob | undefined>(undefined);

    useEffect(() => {
        (async () => {
            setFirstDocument(await fetchPDFAsBlob('https://pdfobject.com/pdf/sample.pdf'));
            setSecondDocument(await fetchPDFAsBlob('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'));
        })();
    }, []);

    async function fetchPDFAsBlob(pdfUrl: string) {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        return blob;
    }

    const elements: FormElement[] = [
        { type: FormElementType.DOCUMENT, span: 12, label: 'Document Preview', name: 'test-document', uploadable: false, content: firstDocument, required: false, height: '50vh' },
        { type: FormElementType.DOCUMENT, span: 12, label: 'Document Preview', name: 'test-document', uploadable: true, content: secondDocument, required: false, height: '50vh' },
    ];

    return (
        <>
            <GenericForm elements={elements} />
        </>
    )
}

export default Home;
