import React, {ReactNode, useEffect, useState} from "react";
import {Alert, Button, Col, DatePicker, Divider, Form, FormInstance, Input, Popover, Row, Select} from "antd";
import PDFViewer from "../PDFViewer/PDFViewer";
import {DownloadOutlined} from "@ant-design/icons";
import {createDownloadWindow, showTextWithHtmlLinebreaks} from "../../utils/utils";
import {DocumentPresentable} from "../../api/types/DocumentPresentable";
import {FormItemInputProps} from "antd/es/form/FormItemInput";

export enum FormElementType {
    TITLE = 'title',
    TIP = 'tip',
    INPUT = 'input',
    SELECT = 'select',
    DATE = 'date',
    SPACE = 'space',
    BUTTON = 'button',
    DOCUMENT = 'document',
}

export type FormElement = BasicElement | LabeledElement | ClickableElement | SelectableElement | EditableElement | DocumentElement;

type BasicElement = {
    type: FormElementType.SPACE,
    span: number,
}

type LabeledElement = Omit<BasicElement, 'type'> & {
    type: FormElementType.TITLE | FormElementType.TIP,
    label: string,
    marginVertical?: string,
}

// type DisableableElement = Omit<LabeledElement, 'type'> & {
//     type: FormElementType.GENERIC_DISABLEABLE,
//     name: string,
//     disabled: boolean,
//     block?: boolean,
// }

export type ClickableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.BUTTON,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
    name: string,
    disabled?: boolean,
    block?: boolean,
    buttonType?: 'primary' | 'default' | 'dashed' | 'text' | 'link',
    icon?: React.ReactNode,
    additionalProperties?: AdditionalButtonProperties,
}
type AdditionalButtonProperties = 'danger' | 'ghost' | 'loading';
const mapAdditionalPropertiesToButtonProps: Record<AdditionalButtonProperties, Record<string, any>> = {
    'danger': {danger: true},
    'ghost': {ghost: true},
    'loading': {loading: true},
};

type SelectableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.SELECT,
    name: string,
    options: {label: string, value: string | number}[],
    required: boolean,
    defaultValue?: string | number,
    mode?: 'multiple',
    disabled?: boolean,
    block?: boolean,
}

type EditableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.INPUT | FormElementType.DATE,
    name: string,
    defaultValue: any,
    required: boolean,
    disabled?: boolean,
    block?: boolean,
    regex?: string,
    dependencies?: string[],
    validationCallback?: (form: FormInstance) => Promise<void>,
}

export type DocumentElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.DOCUMENT,
    name: string,
    uploadable: boolean,
    required: boolean,
    loading: boolean,
    info?: DocumentPresentable,
    height?: `${number}px` | `${number}%` | `${number}vh` | 'auto',
    validationCallback?: {
        approve: (...args: any[]) => Promise<void>,
        reject: (...args: any[]) => Promise<void>,
    }
}

type Props = {
    elements: FormElement[],
    submittable?: boolean,
    onSubmit?: (values: any) => void
}

export type ElementStatus = {type: FormItemInputProps['status'], message: ReactNode};

export const GenericForm = (props: Props) => {
    const [form] = Form.useForm();
    const documents: Map<string, Blob | undefined> = new Map<string, Blob>();
    const dateFormat = 'DD/MM/YYYY';

    useEffect(() => {
        props.elements.forEach((element) => {
            if (element.type === FormElementType.DOCUMENT) {
                const doc = element as DocumentElement;
                if (doc?.info?.content) {
                    documents.set(doc.name, doc.info.content);
                }
            }
        });
    }, [props.elements]);

    const addDocument = (name: string, file?: Blob) => {
        documents.set(name, file);
    }

    const elementsComponent = {
        [FormElementType.SPACE]: (element: FormElement, index: number) => {
            element = element as BasicElement;
            const {span} = element;
            return (
                <Col span={span} key={`space_${index}`}>
                </Col>
            )
        },
        [FormElementType.TITLE]: (element: FormElement, index: number) => {
            element = element as LabeledElement;
            const {span, label} = element;
            return (
                <Col span={span} key={`title_${index}`}><Divider>{label}</Divider></Col>
            )
        },
        [FormElementType.TIP]: (element: FormElement, index: number) => {
            element = element as LabeledElement;
            const {span, label} = element;
            return (
                <Col span={span} key={`tip_${label}`} style={{margin: `${element.marginVertical} 0`}}>
                    <Alert style={{textAlign: 'center'}} message={showTextWithHtmlLinebreaks(label)} />
                </Col>
            )
        },
        [FormElementType.BUTTON]: (element: FormElement, index: number) => {
            element = element as ClickableElement;
            const {
                span,
                label,
                name,
                disabled = false,
                onClick,
                buttonType = 'default',
                icon = undefined,
                block = true,
                additionalProperties = undefined
            } = element;
            const additionalProps = additionalProperties ? mapAdditionalPropertiesToButtonProps[additionalProperties] : {};

            return (
                <Col span={span} key={`button_${element.name}`}>
                    <Form.Item
                        labelCol={{span: 24}}
                        label={' '}
                        name={name}
                    >
                        <Button type={buttonType} block={block} disabled={disabled} onClick={onClick}
                                icon={icon} {...additionalProps}>{label}</Button>
                    </Form.Item>
                </Col>
            );
        },
        [FormElementType.SELECT]: (element: FormElement, index: number) => {
            element = element as SelectableElement;
            const { disabled = false } = element;
            return (
                <Col span={element.span} key={`select_${element.name}`}>
                    <Form.Item
                        labelCol={{span: 24}}
                        label={element.label}
                        name={element.name}
                        initialValue={element.defaultValue ? element.defaultValue : undefined}
                        rules={[{required: element.required, message: `Please select ${element.label}!`}]}>
                        <Select
                            mode={element.mode}
                            disabled={disabled}
                            placeholder={`Select ${element.label}`}
                            // defaultValue={element.defaultValue}
                            options={element.options}
                        />
                    </Form.Item>
                </Col>
            )
        },
        [FormElementType.INPUT]: (element: FormElement, index: number) => {
            element = element as EditableElement;
            const { disabled = false, validationCallback } = element;
            return (
                <Col span={element.span} key={`input_${element.name}`}>
                    <Form.Item
                        labelCol={{span: 24}}
                        label={element.label}
                        name={element.name}
                        initialValue={element.defaultValue}
                        dependencies={element.dependencies}
                        rules={[
                            {required: element.required, message: `Please insert ${element.label}!`},
                            {
                                pattern: new RegExp(element.regex || '.*'),
                                message: `Please enter a valid ${element.label}!`
                            },
                            ...(validationCallback ? [{
                                validator: () => validationCallback(form)
                            }] : []),
                        ]}
                        validateTrigger="onBlur"
                    >
                        <Input
                            type={element.type}
                            disabled={disabled}
                            placeholder={`Enter ${element.label}`}
                            // defaultValue={element.defaultValue}
                            // value={element.defaultValue}
                            className='ant-input'
                        />
                    </Form.Item>
                </Col>
            )
        },
        [FormElementType.DATE]: (element: FormElement, index: number) => {
            element = element as EditableElement;
            const { disabled = false, validationCallback } = element;
            return (
                <Col span={element.span} key={`date_${element.name}`}>
                    <Form.Item
                        labelCol={{span: 24}}
                        label={element.label}
                        name={element.name}
                        initialValue={element.defaultValue}
                        dependencies={element.dependencies}
                        rules={[
                            {required: element.required, message: `Please insert ${element.label}!`},
                            ...(validationCallback ? [{
                                validator: () => validationCallback(form)
                            }] : []),
                        ]}
                    >
                        <DatePicker
                            disabled={disabled}
                            placeholder={`Enter ${element.label}`}
                            format={dateFormat}
                            className='ant-input'
                        />
                    </Form.Item>
                </Col>
            )
        },
        [FormElementType.DOCUMENT]: (element: FormElement, index: number) => {
            element = element as DocumentElement;
            const docInfo = element.info!;

            return (
                <Col span={element.span} key={`document_${element.name}`}>
                    <Form.Item
                        labelCol={{span: 24}}
                        label={element.label}
                        name={element.name}
                        // TODO: if document is required, it shows error message also if the document is uploaded, to fix when document uploading will be re-introduced
                        // rules={[{required: element.required, message: `Please insert ${element.label}!`}]}
                    >
                        <PDFViewer element={element} onDocumentChange={addDocument} validationStatus={docInfo?.status} />
                        { element.validationCallback &&
                            <Popover
                                title="Validate the document"
                                trigger="click"
                                placement="bottom"
                                content={
                                    <Row gutter={[16, 10]}>
                                        <Col span={24}>
                                            Download the document
                                            <Button style={{marginLeft: '1rem'}} type="default" onClick={() => {
                                                const filenameSlices = docInfo.filename.split("/");
                                                createDownloadWindow(docInfo.content, filenameSlices[filenameSlices.length - 1])
                                            }} icon={<DownloadOutlined />} />
                                        </Col>
                                        <Col span={12}><Button type="primary" style={{width: '100%'}} onClick={element.validationCallback.approve}>Approve</Button></Col>
                                        <Col span={12}><Button danger type="primary" style={{width: '100%'}} onClick={element.validationCallback.reject}>Reject</Button></Col>
                                    </Row>
                                }
                            >
                                <Button type="default" shape="round" style={{width: '100%', borderColor: 'darkorange', color: 'darkorange'}}>Check content and validate</Button>
                            </Popover>
                        }
                    </Form.Item>
                </Col>
            )
        },
    };

    return (
        <Form
            layout='horizontal'
            form={form}
            name='generic-form'
            onFinish={
                (values) => {
                    if (props.onSubmit) {
                        documents.forEach((value, key) => {
                            values[key] = value;
                        });
                        props.onSubmit(values);
                    }
                }
            }
        >
            <Row gutter={10}>
                {
                    props.elements.map((element, index) => {
                        return elementsComponent[element.type](element, index);
                    })
                }
                {
                    props.submittable && (
                        <Col span={24}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" block>Submit</Button>
                            </Form.Item>
                        </Col>
                    )
                }
            </Row>
        </Form>
    )
}
