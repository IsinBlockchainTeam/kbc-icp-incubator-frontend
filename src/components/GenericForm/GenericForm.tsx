import React, { ReactNode, useEffect } from 'react';
import { Alert, AlertProps, Button, Card, Col, DatePicker, Divider, Form, FormInstance, Input, Popover, Row, Select } from 'antd';
import PDFViewer from '../PDFViewer/PDFViewer';
import { DownloadOutlined, EditOutlined, RollbackOutlined } from '@ant-design/icons';
import { createDownloadWindow } from '@/utils/page';
import { DocumentStatus } from '@kbc-lib/coffee-trading-management-lib';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { CardSize } from 'antd/es/card/Card';

export enum FormElementType {
    TITLE = 'title',
    TIP = 'tip',
    INPUT = 'input',
    SELECT = 'select',
    DATE = 'date',
    SPACE = 'space',
    BUTTON = 'button',
    DOCUMENT = 'document',
    CARD = 'card'
}

export type FormElement = BasicElement | LabeledElement | ClickableElement | SelectableElement | EditableElement | DocumentElement | CardElement;

type BasicElement = {
    type: FormElementType.SPACE;
    span: number;
    hidden?: boolean;
};

type LabeledElement = Omit<BasicElement, 'type'> & {
    type: FormElementType.TITLE | FormElementType.TIP;
    label: ReactNode;
    background?: AlertProps['type'];
    marginVertical?: string;
};

export type DocumentContent = {
    contentType: string;
    content: Blob;
    filename: string;
};

// type DisableableElement = Omit<LabeledElement, 'type'> & {
//     type: FormElementType.GENERIC_DISABLEABLE,
//     name: string,
//     disabled: boolean,
//     block?: boolean,
// }

export type ClickableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.BUTTON;
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    name: string;
    disabled?: boolean;
    block?: boolean;
    buttonType?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
    icon?: React.ReactNode;
    additionalProperties?: AdditionalButtonProperties;
    resetFormValues?: boolean;
};
type AdditionalButtonProperties = 'danger' | 'ghost' | 'loading';
const mapAdditionalPropertiesToButtonProps: Record<AdditionalButtonProperties, Record<string, any>> = {
    danger: { danger: true },
    ghost: { ghost: true },
    loading: { loading: true }
};

type SelectableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.SELECT;
    name: string;
    options: { label: React.ReactNode; value: string | number }[];
    required: boolean;
    onChange?: (value: any) => any;
    search?: {
        showIcon: boolean;
        filterOption: (input: string, option: any) => boolean;
    };
    optionRender?: (option: any) => React.ReactNode;
    onSelect?: (value: string | number) => void;
    // if 'number', it refers to the index of the options array
    defaultValue?: string | number | string[];
    mode?: 'multiple';
    disabled?: boolean;
    block?: boolean;
};

type EditableElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.INPUT | FormElementType.DATE;
    name: string;
    defaultValue: any;
    required: boolean;
    addOnAfter?: string;
    disabled?: boolean;
    disableValues?: (...args: any[]) => boolean;
    block?: boolean;
    regex?: string;
    dependencies?: string[];
    validationCallback?: (form: FormInstance) => Promise<void>;
};

export type DocumentValidationCallback = {
    onApprove: () => Promise<void>;
    onReject: () => Promise<void>;
};
export type DocumentElement = Omit<LabeledElement, 'type'> & {
    type: FormElementType.DOCUMENT;
    name: string;
    uploadable: boolean;
    required: boolean;
    loading: boolean;
    content?: DocumentContent;
    status?: DocumentStatus;
    height?: `${number}px` | `${number}%` | `${number}vh` | 'auto';
    validationCallbacks?: DocumentValidationCallback;
};

type CardElement = Omit<BasicElement, 'type'> & {
    type: FormElementType.CARD;
    name: string;
    title: string;
    content: React.ReactNode | ((values: any) => React.ReactNode);
    actions?: React.ReactNode[];
    bordered?: boolean;
    size?: CardSize;
    extra?: React.ReactNode;
};

type Props = {
    elements: FormElement[];
    formName?: string;
    confirmText?: string;
    toggleEditable?: () => void;
    submittable?: boolean;
    submitText?: string;
    onSubmit?: (values: any) => void;
};

export const GenericForm = (props: Props) => {
    const [form] = Form.useForm();
    const [areFieldsValid, setAreFieldsValid] = React.useState<boolean>(false);
    const [documents, setDocuments] = React.useState<Map<string, Blob | undefined>>(new Map<string, Blob>());
    const [isEditing, setIsEditing] = React.useState(false);

    const dateFormat = 'DD/MM/YYYY';
    const values = Form.useWatch([], form);

    const checkFormValue = (form: FormInstance, fieldName: string, value: any) =>
        form.getFieldValue(fieldName) !== undefined ? form.getFieldValue(fieldName) : value;

    useEffect(() => {
        props.elements.forEach((element) => {
            if (element.type === FormElementType.DOCUMENT) {
                const doc = element as DocumentElement;
                if (doc?.content?.content) {
                    setDocuments(documents.set(doc.name, doc.content.content));
                }
            }
        });
        form.resetFields();
    }, [props.elements]);

    useEffect(() => {
        form.validateFields({ validateOnly: true })
            .then(() => setAreFieldsValid(true))
            .catch(() => setAreFieldsValid(false));
    }, [form, values]);

    const addDocument = (name: string, file?: Blob) => {
        // this will update the state without re-rendering the component (the reference is the same)
        setDocuments(documents.set(name, file));
    };

    const elementsComponent = {
        [FormElementType.SPACE]: (element: FormElement, index: number) => {
            element = element as BasicElement;
            const { span } = element;
            return <Col span={span} key={`space_${index}`}></Col>;
        },
        [FormElementType.TITLE]: (element: FormElement, index: number) => {
            element = element as LabeledElement;
            const { span, label } = element;
            return (
                <Col span={span} key={`title_${index}`} style={{ display: `${element.hidden ? 'none' : 'block'}` }}>
                    <Divider>{label}</Divider>
                </Col>
            );
        },
        [FormElementType.TIP]: (element: FormElement, index: number) => {
            element = element as LabeledElement;
            const { span, label, background = 'info' } = element;
            return (
                <Col
                    span={span}
                    key={`tip_${label}`}
                    style={{
                        margin: `${element.marginVertical} 0`,
                        display: `${element.hidden ? 'none' : 'block'}`
                    }}>
                    <Alert style={{ textAlign: 'center' }} message={element.label} type={background} />
                </Col>
            );
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
                additionalProperties = undefined,
                resetFormValues
            } = element;
            const additionalProps = additionalProperties ? mapAdditionalPropertiesToButtonProps[additionalProperties] : {};

            return (
                <Col span={span} key={`button_${element.name}`} style={{ display: `${element.hidden ? 'none' : 'block'}` }}>
                    <Form.Item labelCol={{ span: 24 }} label={' '} name={name}>
                        <Button
                            type={buttonType}
                            block={block}
                            disabled={disabled}
                            onClick={(e) => {
                                onClick(e);
                                if (resetFormValues) form.resetFields();
                            }}
                            icon={icon}
                            {...additionalProps}>
                            {label}
                        </Button>
                    </Form.Item>
                </Col>
            );
        },
        [FormElementType.SELECT]: (element: FormElement, index: number) => {
            element = element as SelectableElement;
            const { disabled = false } = element;
            return (
                <Col span={element.span} key={`select_${element.name}`} style={{ display: `${element.hidden ? 'none' : 'block'}` }}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={element.label}
                        name={element.name}
                        initialValue={checkFormValue(form, element.name, element.defaultValue)}
                        rules={[
                            {
                                required: element.required,
                                message: `Please select ${element.label}!`
                            }
                        ]}>
                        <Select
                            mode={element.mode}
                            disabled={disabled}
                            placeholder={`Select ${element.label}`}
                            // defaultValue={element.defaultValue}
                            options={element.options}
                            onChange={element.onChange}
                            optionRender={element.optionRender}
                            onSelect={element.onSelect}
                            showSearch={element.search?.showIcon}
                            filterOption={element.search?.filterOption}
                        />
                    </Form.Item>
                </Col>
            );
        },
        [FormElementType.INPUT]: (element: FormElement, index: number) => {
            element = element as EditableElement;
            const { disabled = false, validationCallback } = element;
            return (
                <Col span={element.span} key={`input_${element.name}`} style={{ display: `${element.hidden ? 'none' : 'block'}` }}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={element.label}
                        name={element.name}
                        initialValue={checkFormValue(form, element.name, element.defaultValue)}
                        dependencies={element.dependencies}
                        rules={[
                            {
                                required: element.required,
                                message: `Please insert ${element.label}!`
                            },
                            {
                                pattern: new RegExp(element.regex || '.*'),
                                message: `Please enter a valid ${element.label}!`
                            },
                            ...(validationCallback
                                ? [
                                    {
                                        validator: () => validationCallback(form)
                                    }
                                ]
                                : [])
                        ]}
                        validateTrigger="onBlur">
                        <Input
                            type={element.type}
                            disabled={disabled}
                            placeholder={`Enter ${element.label}`}
                            addonAfter={element.addOnAfter}
                            // defaultValue={element.defaultValue}
                            // value={element.defaultValue}
                            className="ant-input"
                            style={{ padding: element.addOnAfter ? 0 : undefined }}
                        />
                    </Form.Item>
                </Col>
            );
        },
        [FormElementType.DATE]: (element: FormElement, index: number) => {
            element = element as EditableElement;
            const { disabled = false, validationCallback, disableValues } = element;
            return (
                <Col span={element.span} key={`date_${element.name}`} style={{ display: `${element.hidden ? 'none' : 'block'}` }}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={element.label}
                        name={element.name}
                        initialValue={element.defaultValue}
                        dependencies={element.dependencies}
                        rules={[
                            {
                                required: element.required,
                                message: `Please insert ${element.label}!`
                            },
                            ...(validationCallback
                                ? [
                                    {
                                        validator: () => validationCallback(form)
                                    }
                                ]
                                : [])
                        ]}>
                        <DatePicker
                            disabled={disabled}
                            placeholder={`Enter ${element.label}`}
                            format={dateFormat}
                            className="ant-input"
                            disabledDate={disableValues}
                        />
                    </Form.Item>
                </Col>
            );
        },
        [FormElementType.DOCUMENT]: (element: FormElement, index: number) => {
            element = element as DocumentElement;
            const docInfo = element.content!;
            const status = element.status!;

            return (
                <Col span={element.span} key={`document_${element.name}`} style={{ display: `${element.hidden ? 'none' : 'block'}` }}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={element.label}
                        name={element.name}
                    // TODO: if document is required, it shows error message also if the document is uploaded, to fix when document uploading will be re-introduced
                    // rules={[{required: element.required, message: `Please insert ${element.label}!`}]}
                    >
                        <PDFViewer element={element} onDocumentChange={addDocument} validationStatus={status} />
                        {element.validationCallbacks && (
                            <Popover
                                title="Validate the document"
                                trigger="click"
                                placement="bottom"
                                content={
                                    <Row gutter={[16, 10]}>
                                        <Col span={24}>
                                            Download the document
                                            <Button
                                                style={{ marginLeft: '1rem' }}
                                                type="default"
                                                onClick={() => {
                                                    const filenameSlices = docInfo.filename.split('/');
                                                    createDownloadWindow(docInfo.content, filenameSlices[filenameSlices.length - 1]);
                                                }}
                                                icon={<DownloadOutlined />}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Button type="primary" style={{ width: '100%' }} onClick={element.validationCallbacks.onApprove}>
                                                Approve
                                            </Button>
                                        </Col>
                                        <Col span={12}>
                                            <Button danger type="primary" style={{ width: '100%' }} onClick={element.validationCallbacks.onReject}>
                                                Reject
                                            </Button>
                                        </Col>
                                    </Row>
                                }>
                                <Button
                                    type="default"
                                    shape="round"
                                    style={{
                                        width: '100%',
                                        borderColor: 'darkorange',
                                        color: 'darkorange'
                                    }}>
                                    Check content and validate
                                </Button>
                            </Popover>
                        )}
                    </Form.Item>
                </Col>
            );
        },
        [FormElementType.CARD]: (element: FormElement, index: number) => {
            element = element as CardElement;
            const { title, content, actions, bordered = true, size = 'default', extra } = element;

            const actualContent = typeof content === 'function' ? content(values) : content;

            return (
                <Col span={element.span} key={`date_${element.name}`} style={{ display: `${element.hidden ? 'none' : 'block'}` }}>
                    <Form.Item labelCol={{ span: 24 }} name={element.name}>
                        <Card title={title} bordered={bordered} size={size} extra={extra} actions={actions}>
                            {actualContent}
                        </Card>
                    </Form.Item>
                </Col>
            );
        }
    };

    const toggleEditing = () => {
        setIsEditing(!isEditing);
        props.toggleEditable!();
    };

    const editElements: FormElement[] = [
        {
            type: FormElementType.BUTTON,
            span: 24,
            name: 'back',
            label: (
                <div>
                    Back <RollbackOutlined />
                </div>
            ),
            buttonType: 'primary',
            hidden: !isEditing,
            onClick: toggleEditing,
            resetFormValues: true
        },
        {
            type: FormElementType.BUTTON,
            span: 24,
            name: 'edit',
            label: (
                <div>
                    {isEditing ? 'Editing... ' : 'Edit '}
                    <EditOutlined style={{ fontSize: 'large' }} />
                </div>
            ),
            buttonType: 'primary',
            hidden: isEditing,
            onClick: toggleEditing
        }
    ];

    return (
        <Form
            layout="horizontal"
            form={form}
            name={props.formName || 'generic-form'}
            onFinish={(values) => {
                if (props.onSubmit) {
                    documents.forEach((value, key) => {
                        values[key] = value;
                    });
                    props.onSubmit(values);
                }
            }}>
            <Row gutter={10}>
                {[...props.elements, ...(props.toggleEditable ? editElements : [])].map((element, index) => {
                    return elementsComponent[element.type](element, index);
                })}
                {props.submittable && (
                    <Col span={24}>
                        <Form.Item>
                            <ConfirmButton
                                text={props.submitText || 'Submit'}
                                disabled={!areFieldsValid}
                                confirmText={props.confirmText || 'Are you sure you want to submit?'}
                                onConfirm={form.submit}
                                type="primary"
                                block
                            />
                        </Form.Item>
                    </Col>
                )}
            </Row>
        </Form>
    );
};
