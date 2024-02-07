import React from "react";
import {Button, Col, DatePicker, Divider, Form, Input, Row} from "antd";
import dayjs from "dayjs";
import { Viewer} from "@react-pdf-viewer/core";
enum FormElementType {
    TITLE = 'title',
    INPUT = 'input',
    DATE = 'date',
    SPACE = 'space',
    BUTTON = 'button',
    DOCUMENT_PREVIEW = 'document',
}
type FormElement = {
    type: FormElementType,
    span: number,
    label?: string,
    name?: string,
    defaultValue?: any,
    required?: boolean,
    content?: Blob,
};



const elements: FormElement[] = [
    { type: FormElementType.TITLE, span: 24, label: 'Actors' },
    { type: FormElementType.INPUT, span: 12, name: 'supplier', label: 'Supplier', required: true, defaultValue: ''},
    { type: FormElementType.INPUT, span: 12, name: 'customer', label: 'Customer', required: true, defaultValue: ''},
    { type: FormElementType.TITLE, span: 24, label: 'Constraints' },
    { type: FormElementType.INPUT, span: 12, name: 'icoterms', label: 'Icoterms', required: true, defaultValue: 'FOB'},
    { type: FormElementType.SPACE, span: 12 },
    { type: FormElementType.DATE, span: 12, name: 'payment-deadline', label: 'Payment Deadline', required: true, defaultValue: ''},
    { type: FormElementType.DATE, span: 12, name: 'document-delivery-deadline', label: 'Document Delivery Deadline', required: true, defaultValue: ''},
    { type: FormElementType.INPUT, span: 12, name: 'shipper', label: 'Shipper', required: true, defaultValue: ''},
    { type: FormElementType.INPUT, span: 12, name: 'arbiter', label: 'Arbiter', required: true, defaultValue: ''},
    { type: FormElementType.INPUT, span: 12, name: 'shipping-port', label: 'Shipping Port', required: true, defaultValue: ''},
    { type: FormElementType.DATE, span: 12, name: 'shipping-deadline', label: 'Shipping Deadline', required: true, defaultValue: dayjs()},
    { type: FormElementType.INPUT, span: 12, name: 'delivery-port', label: 'Delivery Port', required: true, defaultValue: ''},
    { type: FormElementType.DATE, span: 12, name: 'delivery-deadline', label: 'Delivery Deadline', required: true, defaultValue: ''},
    { type: FormElementType.INPUT, span: 12, name: 'escrow', label: 'Escrow', required: true, defaultValue: ''},
    { type: FormElementType.TITLE, span: 24, label: 'Line Items' },
    { type: FormElementType.INPUT, span: 8, name: 'material-name', label: 'Material Name', required: true, defaultValue: ''},
    { type: FormElementType.BUTTON, span: 4, name: 'button', label: 'Show Supply Chain', required: true, defaultValue: ''},
    { type: FormElementType.INPUT, span: 6, name: 'quantity', label: 'Quantity', required: true, defaultValue: ''},
    { type: FormElementType.INPUT, span: 6, name: 'price', label: 'Price', required: true, defaultValue: ''},
    { type: FormElementType.DOCUMENT_PREVIEW, span: 12, name: 'shipping-document', label: 'Shipping Document', required: true, defaultValue: '', content: new Blob()},
    { type: FormElementType.DOCUMENT_PREVIEW, span: 12, name: 'delivery-document', label: 'Delivery Document', required: true, defaultValue: '', content: new Blob()},

];

type Props = {
    // elements: FormElement[]
}
export const GenericForm = (props: Props) => {
    const [form] = Form.useForm();
    const dateFormat = 'DD/MM/YYYY';

    const elementComponent = {
        [FormElementType.TITLE]: (element: FormElement, index: number) => {
            return (
                <Col span={element.span} key={index}><Divider>{element.label}</Divider></Col>
            )
        },
        [FormElementType.INPUT]: (element: FormElement, index: number) => {
            return (
                <Col span={element.span} key={index}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={element.label}
                        name={element.name}
                        rules={[{ required: element.required, message: `Please insert ${element.name}!` }]}>
                        <Input
                            type={element.type}
                            placeholder={`Enter ${element.label}`}
                            defaultValue={element.defaultValue}
                            className='ant-input'
                        />
                    </Form.Item>
                </Col>
            )
        },
        [FormElementType.DATE]: (element: FormElement, index: number) => {
            return (
                <Col span={element.span} key={index}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={element.label}
                        name={element.name}
                        rules={[{ required: element.required, message: `Please insert ${element.name}!` }]}>
                        <DatePicker
                            className='ant-input'
                            placeholder={`Enter ${element.label}`}
                            defaultValue={element.defaultValue}
                            format={dateFormat}
                        />
                    </Form.Item>
                </Col>
            )
        },
        [FormElementType.SPACE]: (element: FormElement, index: number) => {
            return (
                <Col span={element.span} key={index}>
                </Col>
            )
        },
        [FormElementType.BUTTON]: (element: FormElement, index: number) => {
            return (
                <Col span={element.span} key={index}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={' '}
                        name={element.name}
                    >
                        <Button type="primary" block>{element.label}</Button>
                    </Form.Item>
                </Col>
            )
        },
        [FormElementType.DOCUMENT_PREVIEW]: (element: FormElement, index: number) => {
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

    const onFinish = (values: any) => {
        console.log(values);
    };


    return (
        <Form
            layout='horizontal'
            form={form}
            name='generic-form'
            onFinish={onFinish}>
            <Row gutter={10}>
                {
                    elements.map((element, index) => {
                        return elementComponent[element.type](element, index);
                    })
                }
            </Row>
        </Form>
    )
}
