import React from "react";
import {Button, Col, DatePicker, Divider, Form, Input, Row} from "antd";
import { Viewer} from "@react-pdf-viewer/core";

export enum FormElementType {
    TITLE = 'title',
    INPUT = 'input',
    DATE = 'date',
    SPACE = 'space',
    BUTTON = 'button',
    DOCUMENT_PREVIEW = 'document',
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

type ClickableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.BUTTON,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
    name: string,
    disabled: boolean,
    block?: boolean,
    buttonType?: 'primary' | 'default' | 'dashed' | 'text' | 'link',
    icon?: React.ReactNode,
    additionalProperties?: AdditionalButtonProperties,
}
type AdditionalButtonProperties = 'danger' | 'ghost' | 'loading';
const mapAdditionalPropertiesToButtonProps: Record<AdditionalButtonProperties, Record<string, any>> = {
    'danger': { danger: true },
    'ghost': { ghost: true },
    'loading': { loading: true },
};

type EditableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.INPUT | FormElementType.DATE,
    name: string,
    disabled: boolean,
    block?: boolean,
    defaultValue: any,
    required: boolean,
    regex?: string
}

type DocumentElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.DOCUMENT_PREVIEW,
    name: string,
    disabled: boolean,
    content: Blob,
    required: boolean,
}

type Props = {
    elements: FormElement[],
    submittable?: boolean,
    onSubmit?: (values: any) => void
}
export const GenericForm = (props: Props) => {
    const [form] = Form.useForm();
    const dateFormat = 'DD/MM/YYYY';

    const elementComponent = {
        [FormElementType.SPACE]: (element: FormElement, index: number) => {
            element = element as BasicElement;
            const { span} = element;
            return (
                <Col span={span} key={index}>
                </Col>
            )
        },
        [FormElementType.TITLE]: (element: FormElement, index: number) => {
            element = element as LabeledElement;
            const { span, label } = element;
            return (
                <Col span={span} key={index}><Divider>{label}</Divider></Col>
            )
        },
        [FormElementType.BUTTON]: (element: FormElement, index: number) => {
            element = element as ClickableElement;
            const { span, label, name, disabled = false, onClick, buttonType = 'default', icon = undefined, block = true, additionalProperties = undefined } = element;
            const additionalProps = additionalProperties ? mapAdditionalPropertiesToButtonProps[additionalProperties] : {};

            return (
                <Col span={span} key={index}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={' '}
                        name={name}
                    >
                        <Button type={buttonType} block={block} disabled={disabled} onClick={onClick} icon={icon} {...additionalProps}>{label}</Button>
                    </Form.Item>
                </Col>
            );
        },
        [FormElementType.INPUT]: (element: FormElement, index: number) => {
            element = element as EditableElement;
            return (
                <Col span={element.span} key={index}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={element.label}
                        name={element.name}
                        rules={[
                            { required: element.required, message: `Please insert ${element.label}!` },
                            { pattern: new RegExp(element.regex || '.*'), message: `Please enter a valid ${element.label}!` }
                        ]}>
                        <Input
                            type={element.type}
                            disabled={element.disabled}
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
            return (
                <Col span={element.span} key={index}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={element.label}
                        name={element.name}
                        rules={[{ required: element.required, message: `Please insert ${element.label}!` }]}>
                        <DatePicker
                            disabled={element.disabled}
                            placeholder={`Enter ${element.label}`}
                            defaultValue={element.defaultValue}
                            format={dateFormat}
                            className='ant-input'
                        />
                    </Form.Item>
                </Col>
            )
        },
        [FormElementType.DOCUMENT_PREVIEW]: (element: FormElement, index: number) => {
            element = element as DocumentElement;
            return (
                <Col span={element.span} key={index}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={element.label}
                        name={element.name}
                    >
                        <div style={{
                            border: '1px solid #d9d9d9',
                            borderRadius: '6px',
                            height: '200px',
                            width: '100%',
                            overflowY: 'scroll'
                        }}>
                            <Viewer
                                fileUrl='https://pdfobject.com/pdf/sample.pdf'
                                // fileUrl={URL.createObjectURL(element.content!)}
                            />
                        </div>
                    </Form.Item>
                </Col>
            )
        },
    }


    return (
        <Form
            layout='horizontal'
            form={form}
            name='generic-form'
            onFinish={props.onSubmit}
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
