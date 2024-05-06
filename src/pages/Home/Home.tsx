import {Navigate} from 'react-router-dom'
import {paths} from "../../constants";
export const Home = () => {

    // const [loadingFirst, setLoadingFirst] = React.useState<boolean>(true);
    // const [loadingSecond, setLoadingSecond] = React.useState<boolean>(true);
    // const [firstDocument, setFirstDocument] = React.useState<Blob | undefined>(undefined);
    // const [secondDocument, setSecondDocument] = React.useState<Blob | undefined>(undefined);
    //
    // useEffect(() => {
    //     (async () => {
    //         setFirstDocument(await fetchPDFAsBlob('https://pdfobject.com/pdf/sample.pdf'));
    //         setLoadingFirst(false);
    //     })();
    //
    //     (async () => {
    //         setSecondDocument(await fetchPDFAsBlob('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'));
    //         setLoadingSecond(false);
    //     })();
    // }, []);
    //
    // async function fetchPDFAsBlob(pdfUrl: string) {
    //     const response = await fetch(pdfUrl);
    //     return response.blob();
    // }
    //
    // const elements: FormElement[] = [
    //     { type: FormElementType.DOCUMENT, span: 12, label: 'Document Preview', name: 'first-document', uploadable: true, loading: loadingFirst, content: undefined, required: false, height: '50vh' },
    //     { type: FormElementType.DOCUMENT, span: 12, label: 'Document Preview2', name: 'second-document', uploadable: true, loading: loadingSecond, content: secondDocument, required: false, height: '50vh' },
    //     { type: FormElementType.INPUT, span: 12, label: 'First Name', name: 'first-name', required: true, disabled: false, defaultValue: '', block: false, regex: '^[a-zA-Z ]+$' },
    // ];
    //
    // const onSubmit = (values: any) => {
    //     console.log(values);
    // }

    return (
        <>
            <Navigate replace to={paths.PROFILE} />
            {/*<GenericForm elements={elements} submittable={true} onSubmit={onSubmit} />*/}
        </>
    )
}

export default Home;
