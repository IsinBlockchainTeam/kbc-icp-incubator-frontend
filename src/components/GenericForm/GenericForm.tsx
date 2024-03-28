import React, {useEffect} from "react";
import {Blob} from "buffer";
import {Button, Col, DatePicker, Divider, Form, Input, Row} from "antd";
import PDFViewer from "../PDFViewer/PDFViewer";

export enum FormElementType {
    TITLE = 'title',
    INPUT = 'input',
    DATE = 'date',
    SPACE = 'space',
    BUTTON = 'button',
    DOCUMENT = 'document',
}

export type FormElement = BasicElement | LabeledElement | ClickableElement | EditableElement | DocumentElement;

type BasicElement = {
    type: FormElementType.SPACE,
    span: number,
}

type LabeledElement = Omit<BasicElement, 'type'> & {
    type: FormElementType.TITLE,
    label: string,
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

type EditableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.INPUT | FormElementType.DATE,
    name: string,
    defaultValue: any,
    required: boolean,
    disabled?: boolean,
    block?: boolean,
    regex?: string
}

export type DocumentElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.DOCUMENT,
    name: string,
    uploadable: boolean,
    required: boolean,
    loading: boolean,
    content?: Blob,
    height?: `${number}px` | `${number}%` | `${number}vh` | 'auto',
}

type Props = {
    elements: FormElement[],
    submittable?: boolean,
    onSubmit?: (values: any) => void
}
export const GenericForm = (props: Props) => {
    const [form] = Form.useForm();
    const documents: Map<string, Blob | undefined> = new Map<string, Blob>();
    const dateFormat = 'DD/MM/YYYY';

    useEffect(() => {
        props.elements.forEach((element) => {
            if (element.type === FormElementType.DOCUMENT) {
                const doc = element as DocumentElement;
                if (doc.content) {
                    documents.set(doc.name, doc.content);
                }
            }
        });
    }, [props.elements]);

    const addDocument = (name: string, file?: Blob) => {
        documents.set(name, file);
    }

    const elementComponent = {
        [FormElementType.SPACE]: (element: FormElement, index: number) => {
            element = element as BasicElement;
            const {span} = element;
            return (
                <Col span={span} key={index}>
                </Col>
            )
        },
        [FormElementType.TITLE]: (element: FormElement, index: number) => {
            element = element as LabeledElement;
            const {span, label} = element;
            return (
                <Col span={span} key={index}><Divider>{label}</Divider></Col>
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
                <Col span={span} key={index}>
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
        [FormElementType.INPUT]: (element: FormElement, index: number) => {
            element = element as EditableElement;
            const { disabled = false } = element;
            return (
                <Col span={element.span} key={index}>
                    <Form.Item
                        labelCol={{span: 24}}
                        label={element.label}
                        name={element.name}
                        rules={[
                            {required: element.required, message: `Please insert ${element.label}!`},
                            {
                                pattern: new RegExp(element.regex || '.*'),
                                message: `Please enter a valid ${element.label}!`
                            }
                        ]}>
                        <Input
                            type={element.type}
                            disabled={disabled}
                            placeholder={`Enter ${element.label}`}
                            defaultValue={element.defaultValue}
                            className='ant-input'
                        />
                    </Form.Item>
                </Col>
            )
        },
        [FormElementType.DATE]: (element: FormElement, index: number) => {
            element = element as EditableElement;
            const { disabled = false } = element;
            return (
                <Col span={element.span} key={index}>
                    <Form.Item
                        labelCol={{span: 24}}
                        label={element.label}
                        name={element.name}
                        rules={[{required: element.required, message: `Please insert ${element.label}!`}]}>
                        <DatePicker
                            disabled={disabled}
                            placeholder={`Enter ${element.label}`}
                            defaultValue={element.defaultValue}
                            format={dateFormat}
                            className='ant-input'
                        />
                    </Form.Item>
                </Col>
            )
        },
        [FormElementType.DOCUMENT]: (element: FormElement, index: number) => {
            element = element as DocumentElement;

            return (
                <>
                    <Col span={element.span} key={index}>
                        <Form.Item
                            labelCol={{span: 24}}
                            label={element.label}
                            name={element.name}
                            rules={[{required: element.required, message: `Please insert ${element.label}!`}]}
                        >
                            <PDFViewer element={element} onDocumentChange={addDocument}/>
                        </Form.Item>
                    </Col>
                </>

            )
        },
    }


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
                        return elementComponent[element.type](element, index);
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
