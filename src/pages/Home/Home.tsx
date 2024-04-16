import React, {useEffect} from "react";
import PDFUploader from "../../components/PDFUploader/PDFUploader";
import {Button, Flex, MenuProps, Table, TableColumnsType, UploadFile} from "antd";
import {FileInfo} from "../../../../coffee-trading-management-lib/src/declarations/storage/storage.did";
import {Viewer} from "@react-pdf-viewer/core";
import {DownloadOutlined} from "@ant-design/icons";
import {
    FileHelpers,
    ICPIdentityDriver,
    ICPOrganizationDriver,
    ICPResourceSpec,
    ICPStorageDriver
} from "@blockchain-lib/common";

const ROLES = {
    OWNER: "Owner",
    EDITOR: "Editor",
    VIEWER: "Viewer",
} as const;

// Get the values of the ROLES object
export type Role = (typeof ROLES)[keyof typeof ROLES];

interface FileRole {
    file: FileInfo;
    role: Role
}

export const Home = () => {
    const [uploadFile, setUploadFile] = React.useState<Blob>();
    const [files, setFiles] = React.useState<FileRole[]>();
    const [viewFile, setViewFile] = React.useState<Blob>();
    const [identityDriver, setIdentityDriver] = React.useState<ICPIdentityDriver>();
    const [storageDriver, setStorageDriver] = React.useState<ICPStorageDriver>();

    useEffect(() => {
    }, []);

    const onFileUpload = (file: Blob) => {
        setUploadFile(file);
    }

    const login = async () => {
        // await storageDriver?.login(process.env.REACT_APP_CANISTER_ID_INTERNET_IDENTITY!);
        const identityDriver = new ICPIdentityDriver(`http://${process.env.REACT_APP_CANISTER_ID_INTERNET_IDENTITY!}.localhost:4943`);
        await identityDriver.login();
        // wait 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        setIdentityDriver(identityDriver);

        await ICPStorageDriver.init(identityDriver!, process.env.REACT_APP_CANISTER_ID_STORAGE!);
    }

    const createOrganization = async () => {
        // const orgId = await storageDriver?.createOrganization(process.env.REACT_APP_CANISTER_ID_ORGANIZATION!, "Dunder Mifflin", "The best paper company in the world");
        // console.log("Organization created successfully:", orgId);
        const organizationDriver = new ICPOrganizationDriver();
        await ICPOrganizationDriver.init(identityDriver!, process.env.REACT_APP_CANISTER_ID_ORGANIZATION!);
        const orgId = await organizationDriver.createOrganization("Dunder Mifflin", "The best paper company in the world");
        console.log("Organization created successfully:", orgId);
        console.log("Organization:", await organizationDriver.getUserOrganizations());
    }

    const loadFile = async () => {
        if(!uploadFile) return;

        // Read the file
        const reader = new FileReader();
        reader.readAsArrayBuffer(uploadFile);
        const content = (await new Promise((resolve) => {
            reader.onload = () => {
                resolve(reader.result as ArrayBuffer);
            };
        })) as ArrayBuffer;
        const bytes = new Uint8Array(content);

        await ICPStorageDriver.init(identityDriver!, process.env.REACT_APP_CANISTER_ID_STORAGE!);
        const storageDriver = ICPStorageDriver.getInstance();
            setStorageDriver(storageDriver);
        const file: UploadFile = uploadFile as unknown as UploadFile;
        const resourceSpec: ICPResourceSpec = {
            name: file.name,
            type: file.type!,
            organizationId: 0
        }
        const fileId= await storageDriver.create(bytes, resourceSpec);
        console.log("File uploaded successfully:", fileId)
    }

    const getFiles = async () => {
        const storageDriver = ICPStorageDriver.getInstance();
        const files = await storageDriver.listFiles(0);
        console.log(files);
        if(!files) return;
        setFiles(
            files.map((file: any) => {
                return {
                    file: file.file,
                    role: ROLES.OWNER
                };
            })
        );
    }

    const handleDownload = async (file: FileInfo) => {
        const bytes: Uint8Array | undefined = await storageDriver?.getFile(file);
        if(!bytes) {
            console.error("Failed to download file");
            return;
        }
        console.log("BYTES:", bytes);
        console.log("BLOB:", new Blob([bytes]));
        setViewFile(new Blob([bytes]));
    };

    const columns: TableColumnsType<FileRole> = [
        {
            title: "File Name",
            dataIndex: "name",
            render: (_: string, { file, role }: FileRole) => (
                <>{file + role}</>
            ),
        },
        {
            title: "File Type",
            dataIndex: "mime_type",
            render: (_: string, { file }) => <span>{file.mime_type}</span>,
        },
        {
            title: "Size",
            dataIndex: "total_size",
            render: (_: bigint, { file }) => (
                <span>{FileHelpers.formatBytes(Number(file.total_size))}</span>
            ),
            sorter: (a: FileRole, b: FileRole) =>
                a.file.total_size > b.file.total_size ? 1 : -1,
        },
        {
            title: "Actions",
            render: (text: any, {file, role}: FileRole) => {
                let items: MenuProps["items"] = [];

                return (
                    <Flex gap={10}>
                        <Button
                            icon={<DownloadOutlined/>}
                            onClick={() => handleDownload(file)}
                        />
                    </Flex>
                );
            },
        },
    ];

    return (
        <>
            <PDFUploader onFileUpload={onFileUpload} onRevert={() => {}} />
            <Button onClick={login}>Login</Button>
            <Button onClick={createOrganization}>Create Organization</Button>
            <Button onClick={loadFile}>Upload</Button>
            <Button onClick={getFiles}>Get Files</Button>
            {viewFile && <Viewer
                fileUrl={URL.createObjectURL(viewFile)}
            /> }

            <Table
                scroll={{ y: window.innerHeight - 300 }}
                dataSource={files}
                columns={columns}
                rowSelection={{
                    type: "checkbox",
                }}
                rowKey={(record: FileRole) => record.file.id.toString()}
            />
        </>
    )
}

export default Home;
