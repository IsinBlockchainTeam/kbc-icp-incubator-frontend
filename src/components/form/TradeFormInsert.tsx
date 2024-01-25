import React, {useEffect, useState} from "react";
import {Button, Col, Divider, Form, Input, Row, Select, Upload} from "antd";
import {GenericCard} from "../GenericCard/GenericCard";
import {PlusOutlined} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import DatePicker from "../DatePicker/DatePicker";
import CompanyControllerApi from "../../api/controllers/unece/CompanyControllerApi";
import {CompanyPresentable, DocumentTypePresentable} from "@unece/cotton-fetch";
import UnitControllerApi from "../../api/controllers/unece/UnitControllerApi";
import CertificationControllerApi from "../../api/controllers/unece/CertificationControllerApi";
import DocumentControllerApi from "../../api/controllers/unece/DocumentControllerApi";
import {Company, Material, ProcessingStandard, Unit, User} from "@unece/cotton-fetch";
import UserControllerApi from "../../api/controllers/unece/UserControllerApi";
import MaterialControllerApi from "../../api/controllers/unece/MaterialControllerApi";

type FormValues = {
    name: string,
    did: string,
    dateRange: any[]
}

type Props = {
    transactionType: string,
    documentTypeTitle: string,
    validFromTitle: string,
    validUntilTitle?: string,
    referenceIdTitle: string,
    parentReferenceIdTitle: string,
}

type OptionValue = {
    label: string,
    value: number | string,
    data: Company
}

export const TradeFormInsert = (props: Props) => {
    const [form] = Form.useForm();

    const [companies, setCompanies] = useState<CompanyPresentable[]>();
    const [companySelectedRef, setCompanySelectedRef] = useState<number | undefined>(undefined);
    const [companyEmails, setCompanyEmails] = useState<string[]>([]);
    const [userSelected, setUserSelected] = useState<User>();

    const [materials, setMaterials] = useState<Material[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [referenceStandards, setReferenceStandards] = useState<ProcessingStandard[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentTypePresentable[]>([]);


    const getCompanyTraders = async () => {
        const resp = await CompanyControllerApi.getCompanyTraders();
        resp && setCompanies(resp);
    }

    const getUnits = async () => {
        const resp = await UnitControllerApi.getAllUnits();
        resp && setUnits(resp);
    }

    const getTradeProcessingStandards = async () => {
        const resp = await CertificationControllerApi.getCertificationProcessingStandards({type: "trade"});
        resp && setReferenceStandards(resp);
    }

    const getDocumentTypes = async () => {
        const resp = await DocumentControllerApi.getDocumentTypes({type: props.transactionType});
        resp && setDocumentTypes(resp);
    }

    useEffect(() => {
        (async function loadDropdownInfo() {
            await getCompanyTraders();
            await getDocumentTypes();
            await getUnits();
            await getTradeProcessingStandards();
        })();
    }, []);

    const submit = async (values: FormValues) => {
        console.log("values: ", values)
    }

    const getUserFromEmailAddress = async (email: string | undefined) => {
        if (email) {
            setUserSelected(await UserControllerApi.getUserFromEmailAddress({email}))
        }
    }

    const companySelected = async (companyRef: number, option: OptionValue | OptionValue[]) => {
        let companyEmails = await CompanyControllerApi.getCompanyEmails({companyName: (option as OptionValue).data.companyName!});
        companyEmails.sort();

        setCompanySelectedRef(companyRef);
        setCompanyEmails(companyEmails);
        form.setFieldValue("userEmail", companyEmails[0]);
        await getUserFromEmailAddress(companyEmails[0]);
        setMaterials(await MaterialControllerApi.getMaterialsByCompany({company: "", isInput: false, isForTransformation: false}));
    }

    return (
        <Form layout="vertical" onFinish={submit} form={form}>
            <Row gutter={[8, 8]}>
                <Col span={12}>
                    <Form.Item label="Buyer" name="buyer" required>
                        <Select
                            showSearch
                            allowClear
                            onClear={() => setCompanySelectedRef(undefined)}
                            placeholder="Select a company"
                            optionFilterProp="children"
                            onChange={companySelected}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={companies ? companies.map((c, index) => ({value: index, label: c.companyName, data: c})) as OptionValue[] : []}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <GenericCard
                        title={'Company Information:'}
                        elements={[
                            {name: 'Name', value: companySelectedRef != null ? companies?.[companySelectedRef]?.companyName : undefined},
                            {name: 'Address', value: companySelectedRef != null ? companies?.[companySelectedRef]?.address : undefined}
                        ]}
                    />
                </Col>
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={12}>
                    <Form.Item label="User email" name="userEmail" required>
                        <Select
                            showSearch
                            placeholder="No email addresses"
                            optionFilterProp="children"
                            onChange={getUserFromEmailAddress}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={companyEmails ? companyEmails.map((e, index) => ({value: e, label: e})) as OptionValue[] : []}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <GenericCard
                        title={'User Information:'}
                        elements={[
                            {name: 'Name and Surname', value: userSelected && `${userSelected.firstname} ${userSelected.lastname}`},
                            {name: 'City', value: userSelected && userSelected.city}
                        ]}
                    />
                </Col>
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={12}>
                    <Form.Item label={props.documentTypeTitle} name="documentType" required>
                        <Select
                            showSearch
                            placeholder="Select.."
                            optionFilterProp="children"
                            onChange={getUserFromEmailAddress}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={companyEmails ? companyEmails.map((e, index) => ({value: e, label: e})) as OptionValue[] : []}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Upload" valuePropName="fileList">
                        <Upload action="/upload.do" listType="picture-card">
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={12}>
                    <Form.Item label={props.validFromTitle} name="validFrom" required>
                        <DatePicker />
                    </Form.Item>
                </Col>
                { props.validUntilTitle &&
                    <Col span={12}>
                        <Form.Item label={props.validUntilTitle} name="validUntil">
                            <DatePicker />
                        </Form.Item>
                    </Col>
                }
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={24}>
                    <Form.Item label="Assessment Reference Standard" name="assessmentStandard">
                    <Select
                            showSearch
                            placeholder="Select.."
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={referenceStandards ? referenceStandards.map((s, index) => ({value: s.name, label: s.name})) as OptionValue[] : []}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={12}>
                    <Form.Item label={props.referenceIdTitle} name="referenceID" required>
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={props.parentReferenceIdTitle} name="parentReferenceID">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[8, 8]}>
                <Col span={24}>
                    <Form.Item label="Notes" name="notes" >
                        <TextArea rows={4} />
                    </Form.Item>
                </Col>
            </Row>

            <Divider />

            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <h1>Line Items</h1>
                <Button type="primary" shape="circle" icon={<PlusOutlined />}/>
            </div>
            <div>
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">Confirm</Button>
                        </Form.Item>
                    </Col>
                </Row>
            </div>

            <Row gutter={[8, 8]}>
                <Col span={24}>
                    <Form.Item label="Material" name="material">
                        <Select
                            showSearch
                            placeholder="Select material.."
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={materials ? materials.map((m, index) => ({value: m.id, label: m.name})) as OptionValue[] : []}
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
}

export default TradeFormInsert;
