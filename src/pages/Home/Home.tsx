import React, {useEffect} from "react";
import {ICPStorageDriver} from "@kbc-lib/coffee-trading-management-lib";
import PDFUploader from "../../components/PDFUploader/PDFUploader";
import {Button} from "antd";

export const Home = () => {
    const [file, setFile] = React.useState<Blob>();
    const [storageDriver, setStorageDriver] = React.useState<ICPStorageDriver>();

    useEffect(() => {
        setStorageDriver(new ICPStorageDriver());
    }, []);

    const onFileUpload = (file: Blob) => {
        setFile(file);
    }

    const login = async () => {
        console.log(process.env.DFX_NETWORK)
        console.log(process.env.REACT_APP_CANISTER_ID_INTERNET_IDENTITY!)
        storageDriver?.login(process.env.REACT_APP_CANISTER_ID_INTERNET_IDENTITY!);
    }

    const loadFile = async () => {
        if(!file) return;

        // Read the file
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        const content = (await new Promise((resolve) => {
            reader.onload = () => {
                resolve(reader.result as ArrayBuffer);
            };
        })) as ArrayBuffer;
        const bytes = new Uint8Array(content);
        await storageDriver?.create(bytes);
        console.log("File uploaded successfully")
    }

    return (
        <>
            <PDFUploader onFileUpload={onFileUpload} onRevert={() => {}} />
            <Button onClick={login}>Login</Button>
            <Button onClick={loadFile}>Upload</Button>
        </>
    )
}

export default Home;
