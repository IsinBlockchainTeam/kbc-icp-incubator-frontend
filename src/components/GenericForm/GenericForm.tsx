import React from "react";
import {Button, Col, DatePicker, Divider, Form, Input, Row} from "antd";
import { Viewer} from "@react-pdf-viewer/core";
import {Dayjs} from "dayjs";

export enum FormElementType {
    TITLE = 'title',
    INPUT = 'input',
    DATE = 'date',
    SPACE = 'space',
    BUTTON = 'button',
    DOCUMENT_PREVIEW = 'document',
}
export type FormElement = BasicElement | LabeledElement | DisableableElement | EditableElement | DocumentElement;

type BasicElement = {
    type: FormElementType.SPACE,
    span: number,
}

type LabeledElement = Omit<BasicElement, 'type'> & {
    type: FormElementType.TITLE,
    label: string,
}

type DisableableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.BUTTON,
    label: string,
    name: string,
    disabled: boolean,
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

type EditableElement = Omit<DisableableElement, 'type'> & {
    type: FormElementType.INPUT | FormElementType.DATE,
    defaultValue: any,
    required: boolean,
    regex?: string
}

type DocumentElement = Omit<DisableableElement, 'type'> & {
    type: FormElementType.DOCUMENT_PREVIEW,
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
            return (
                <Col span={element.span} key={index}>
                </Col>
            )
        },
        [FormElementType.TITLE]: (element: FormElement, index: number) => {
            element = element as LabeledElement;
            return (
                <Col span={element.span} key={index}><Divider>{element.label}</Divider></Col>
            )
        },
        [FormElementType.BUTTON]: (element: FormElement, index: number) => {
            element = element as DisableableElement;
            return (
                <Col span={element.span} key={index}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={' '}
                        name={element.name}
                    >
                        <Button type="primary" block disabled={element.disabled} onClick={element.onClick}>{element.label}</Button>
                    </Form.Item>
                </Col>
            )
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
