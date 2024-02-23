import {FormElement, FormElementType, GenericForm} from "../GenericForm";
import {fireEvent, render} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock('antd', () => {
    const antd = jest.requireActual('antd');

    const MockForm = ({ children, ...props }: any) => <form {...props} data-testid="form" onSubmit={props.onFinish}>{children}</form>;
    MockForm.useForm = antd.Form.useForm;
    MockForm.Item = ({ children, ...props }: any) => <div {...props} data-testid="form-item">{children}</div>;
    return {
        ...antd,
        Col: ({children, ...props}: any) => <div {...props} data-testid="column">{children}</div>,
        Divider: ({children, ...props}: any) => <div {...props} data-testid="divider">{children}</div>,
        Form: MockForm,
        Button: ({children, ...props}: any) => <div {...props} data-testid="button">{children}</div>,
        Input: ({children, ...props}: any) => <div {...props} data-testid="input">{children}</div>,
        DatePicker: ({children, ...props}: any) => <div {...props} data-testid="datepicker">{children}</div>,
    };
});

jest.mock('@react-pdf-viewer/core', () => {
    return {
        Viewer: ({children, ...props}: any) => <div {...props} data-testid="viewer">{children}</div>,
    };
});

describe('GenericForm', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
    it('should render correctly BasicElements', () => {
        const elements: FormElement[] = [
            { type: FormElementType.SPACE, span: 24 },
            { type: FormElementType.SPACE, span: 12 },
        ];
        const tree = render(<GenericForm elements={elements}/>);

        const columns = tree.getAllByTestId('column');
        expect(columns.length).toBe(2);
        expect(columns[0]).toHaveAttribute('span', '24');
        expect(columns[1]).toHaveAttribute('span', '12');
    });
    it('should render correctly LabeledElements', () => {
        const elements: FormElement[] = [
            {type: FormElementType.TITLE, span: 24, label: 'Text 1'},
            {type: FormElementType.TITLE, span: 12, label: 'Text 2'},
        ];
        const tree = render(<GenericForm elements={elements}/>);

        const dividers = tree.getAllByTestId('divider');
        expect(dividers.length).toBe(2);
        expect(dividers[0].innerHTML).toContain('Text 1');
        expect(dividers[1].innerHTML).toContain('Text 2');
    });
    it('should render correctly ClickableElement', () => {
        const mockedOnClick = jest.fn();
        const elements: FormElement[] = [
            { type: FormElementType.BUTTON, span: 4, name: 'button', label: 'Button 1', disabled: false, onClick: mockedOnClick},
            { type: FormElementType.BUTTON, span: 12, name: 'button', label: 'Button 2', disabled: true, onClick: mockedOnClick},
        ];
        const tree = render(<GenericForm elements={elements}/>);

        const formitems = tree.getAllByTestId('form-item');
        expect(formitems[0]).toHaveAttribute('label', ' ');
        expect(formitems[0]).toHaveAttribute('name', 'button');
        expect(formitems[1]).toHaveAttribute('label', ' ');
        expect(formitems[1]).toHaveAttribute('name', 'button');

        const buttons = tree.getAllByTestId('button');
        expect(buttons[0]).not.toHaveAttribute('disabled');
        expect(buttons[0].innerHTML).toContain('Button 1');
        expect(buttons[1]).toHaveAttribute('disabled');
        expect(buttons[1].innerHTML).toContain('Button 2');

        userEvent.click(buttons[0]);
        expect(mockedOnClick).toHaveBeenCalledTimes(1);
        userEvent.click(buttons[1]);
        expect(mockedOnClick).toHaveBeenCalledTimes(2);
    });
    it('should render correctly EditableElements', () => {
        const elements: FormElement[] = [
            { type: FormElementType.INPUT, span: 12, name: 'input', label: 'Input 1', required: true, defaultValue: '', disabled: false, regex: '0x[a-fA-F0-9]{40}'},
            { type: FormElementType.INPUT, span: 8, name: 'input', label: 'Input 2', required: true, defaultValue: 'Default value', disabled: true},
            { type: FormElementType.DATE, span: 8, name: 'date', label: 'Date', required: true, defaultValue: '', disabled: true},
        ];
        const tree = render(<GenericForm elements={elements}/>);

        const formitems = tree.getAllByTestId('form-item');
        expect(formitems[0]).toHaveAttribute('label', 'Input 1');
        expect(formitems[0]).toHaveAttribute('name', 'input');
        expect(formitems[1]).toHaveAttribute('label', 'Input 2');
        expect(formitems[1]).toHaveAttribute('name', 'input');
        expect(formitems[2]).toHaveAttribute('label', 'Date');
        expect(formitems[2]).toHaveAttribute('name', 'date');

        const inputs = tree.getAllByTestId('input');
        expect(inputs[0]).not.toHaveAttribute('disabled');
        expect(inputs[0]).toHaveAttribute('placeholder', 'Enter Input 1');
        expect(inputs[0]).not.toHaveAttribute('defaultValue');
        expect(inputs[1]).toHaveAttribute('disabled');
        expect(inputs[1]).toHaveAttribute('placeholder', 'Enter Input 2');

        const datepicker = tree.getByTestId('datepicker');
        expect(datepicker).toHaveAttribute('disabled');
        expect(datepicker).toHaveAttribute('placeholder', 'Enter Date');
        expect(datepicker).not.toHaveAttribute('defaultValue');
    });
    it('should render correctly EditableElements', () => {
        const elements: FormElement[] = [
            { type: FormElementType.DOCUMENT_PREVIEW, span: 24, name: 'document', label: 'Document 1', required: true, content: new Blob(), disabled: false},
        ];
        const tree = render(<GenericForm elements={elements}/>);

        const formitem = tree.getByTestId('form-item');
        expect(formitem).toHaveAttribute('label', 'Document 1');
        expect(formitem).toHaveAttribute('name', 'document');

        const viewer = tree.getByTestId('viewer');
        expect(viewer).toBeDefined();
    });
    it('should call onSubmit', () => {
        const elements: FormElement[] = [
            { type: FormElementType.INPUT, span: 12, name: 'input', label: 'Input 1', required: false, defaultValue: '', disabled: false, regex: '0x[a-fA-F0-9]{40}'},
        ];
        const onSubmit = jest.fn();
        const tree = render(<GenericForm elements={elements} submittable={true} onSubmit={onSubmit}/>);

        const form = tree.getByTestId('form');
        expect(form).toBeDefined();
        fireEvent.submit(form);
        expect(onSubmit).toHaveBeenCalled();
    });

});
