import { FormElement, FormElementType, GenericForm } from '../GenericForm';
import { fireEvent, render } from '@testing-library/react';
import { PDFViewerProps } from '../../PDFViewer/PDFViewer';

jest.mock('antd', () => {
    const antd = jest.requireActual('antd');

    const MockForm = ({ children, ...props }: any) => (
        <form {...props} data-testid="form" onSubmit={props.onFinish}>
            {children}
        </form>
    );
    MockForm.useWatch = antd.Form.useWatch;
    MockForm.useForm = antd.Form.useForm;
    MockForm.Item = ({ children, ...props }: any) => (
        <div {...props} data-testid="form-item">
            {children}
        </div>
    );
    return {
        ...antd,
        Col: ({ children, ...props }: any) => (
            <div {...props} data-testid="column">
                {children}
            </div>
        ),
        Divider: ({ children, ...props }: any) => (
            <div {...props} data-testid="divider">
                {children}
            </div>
        ),
        Form: MockForm,
        Button: ({ children, ...props }: any) => (
            <div {...props} data-testid="button">
                {children}
            </div>
        ),
        Select: ({ children, ...props }: any) => (
            <div {...props} data-testid="select">
                {children}
            </div>
        ),
        Input: ({ children, ...props }: any) => (
            <div {...props} data-testid="input">
                {children}
            </div>
        ),
        DatePicker: ({ children, ...props }: any) => (
            <div {...props} data-testid="datepicker">
                {children}
            </div>
        ),
        Card: ({ children, ...props }: any) => (
            <div {...props} data-testid="card">
                {children}
            </div>
        ),
        Alert: ({ children, message, ...props }: any) => (
            <div {...props} data-testid="alert">
                {message}
                {children}
            </div>
        )
    };
});

const mockedName: string = 'mockedName';
const mockedFile: Blob = new Blob();
jest.mock('../../PDFViewer/PDFViewer', () => ({ onDocumentChange }: PDFViewerProps) => (
    <div data-testid={'pdfviewer'}>
        <button
            data-testid={'test-onDocumentChange'}
            onClick={(event) => {
                event.preventDefault();
                onDocumentChange(mockedName, mockedFile);
            }}>
            onDocumentChange
        </button>
    </div>
));
jest.mock('@/components/ConfirmButton/ConfirmButton');

describe('GenericForm', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });
    it('should render correctly BasicElements', () => {
        const elements: FormElement[] = [
            { type: FormElementType.SPACE, span: 24 },
            { type: FormElementType.SPACE, span: 12 }
        ];
        const tree = render(<GenericForm elements={elements} />);

        const columns = tree.getAllByTestId('column');
        expect(columns.length).toBe(2);
        expect(columns[0]).toHaveAttribute('span', '24');
        expect(columns[1]).toHaveAttribute('span', '12');
    });
    it('should render correctly LabeledElements', () => {
        const elements: FormElement[] = [
            { type: FormElementType.TITLE, span: 24, label: 'Text 1' },
            { type: FormElementType.TITLE, span: 12, label: 'Text 2' },
            { type: FormElementType.TIP, span: 12, label: 'Tip 1' }
        ];
        const tree = render(<GenericForm elements={elements} />);

        const dividers = tree.getAllByTestId('divider');
        expect(dividers.length).toBe(2);
        expect(dividers[0].innerHTML).toContain('Text 1');
        expect(dividers[1].innerHTML).toContain('Text 2');
        const alerts = tree.getAllByTestId('alert');
        expect(alerts.length).toBe(1);
        expect(alerts[0].innerHTML).toContain('Tip 1');
    });
    it('should render correctly ClickableElements', () => {
        const mockedOnClick = jest.fn();
        const elements: FormElement[] = [
            {
                type: FormElementType.BUTTON,
                span: 4,
                name: 'button',
                label: 'Button 1',
                disabled: false,
                onClick: mockedOnClick
            },
            {
                type: FormElementType.BUTTON,
                span: 12,
                name: 'button',
                label: 'Button 2',
                disabled: true,
                onClick: mockedOnClick
            }
        ];
        const tree = render(<GenericForm elements={elements} />);

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
    });
    it('should render correctly SelectableElement', () => {
        const elements: FormElement[] = [
            {
                type: FormElementType.SELECT,
                name: 'select',
                options: [{ label: 'option 1', value: 'option1' }],
                required: true,
                span: 4,
                label: 'Option 1',
                disabled: false
            }
        ];
        const tree = render(<GenericForm elements={elements} />);

        const formitems = tree.getAllByTestId('form-item');
        expect(formitems[0]).toHaveAttribute('label', 'Option 1');
        expect(formitems[0]).toHaveAttribute('name', 'select');

        const selects = tree.getAllByTestId('select');
        expect(selects[0]).not.toHaveAttribute('disabled');
    });
    it('should render correctly EditableElements', () => {
        const elements: FormElement[] = [
            {
                type: FormElementType.INPUT,
                span: 12,
                name: 'input',
                label: 'Input 1',
                required: true,
                defaultValue: '',
                regex: '0x[a-fA-F0-9]{40}'
            },
            {
                type: FormElementType.INPUT,
                span: 8,
                name: 'input',
                label: 'Input 2',
                required: true,
                defaultValue: 'Default value',
                disabled: true
            },
            {
                type: FormElementType.DATE,
                span: 8,
                name: 'date',
                label: 'Date 1',
                required: true,
                defaultValue: '',
                disabled: true
            },
            {
                type: FormElementType.DATE,
                span: 8,
                name: 'date',
                label: 'Date 2',
                required: true,
                defaultValue: ''
            }
        ];
        const tree = render(<GenericForm elements={elements} />);

        const formitems = tree.getAllByTestId('form-item');
        expect(formitems[0]).toHaveAttribute('label', 'Input 1');
        expect(formitems[0]).toHaveAttribute('name', 'input');
        expect(formitems[1]).toHaveAttribute('label', 'Input 2');
        expect(formitems[1]).toHaveAttribute('name', 'input');
        expect(formitems[2]).toHaveAttribute('label', 'Date 1');
        expect(formitems[2]).toHaveAttribute('name', 'date');
        expect(formitems[3]).toHaveAttribute('label', 'Date 2');
        expect(formitems[3]).toHaveAttribute('name', 'date');

        const inputs = tree.getAllByTestId('input');
        expect(inputs[0]).not.toHaveAttribute('disabled');
        expect(inputs[0]).toHaveAttribute('placeholder', 'Enter Input 1');
        expect(inputs[0]).not.toHaveAttribute('defaultValue');
        expect(inputs[1]).toHaveAttribute('disabled');
        expect(inputs[1]).toHaveAttribute('placeholder', 'Enter Input 2');

        const datepicker = tree.getAllByTestId('datepicker');
        expect(datepicker[0]).toHaveAttribute('disabled');
        expect(datepicker[0]).toHaveAttribute('placeholder', 'Enter Date 1');
        expect(datepicker[0]).not.toHaveAttribute('defaultValue');
        expect(datepicker[1]).not.toHaveAttribute('disabled');
        expect(datepicker[1]).toHaveAttribute('placeholder', 'Enter Date 2');
        expect(datepicker[1]).not.toHaveAttribute('defaultValue');
    });
    it('should render correctly EditableElements', () => {
        const elements: FormElement[] = [
            {
                type: FormElementType.INPUT,
                span: 24,
                name: 'input-element',
                label: 'Input 1',
                required: true,
                disabled: false,
                defaultValue: 'test'
            }
        ];
        const tree = render(<GenericForm elements={elements} />);

        const formitem = tree.getByTestId('form-item');
        expect(formitem).toHaveAttribute('label', 'Input 1');
        expect(formitem).toHaveAttribute('name', 'input-element');
    });
    it('should render correctly DocumentElements', () => {
        const elements: FormElement[] = [
            {
                type: FormElementType.DOCUMENT,
                span: 24,
                name: 'document',
                label: 'Document 1',
                required: true,
                uploadable: true,
                loading: false
            }
        ];
        const tree = render(<GenericForm elements={elements} />);

        const formitem = tree.getByTestId('form-item');
        expect(formitem).toHaveAttribute('label', 'Document 1');
        expect(formitem).toHaveAttribute('name', 'document');

        const pdfViewer = tree.getByTestId('pdfviewer');
        expect(pdfViewer).toBeDefined();
    });
    it('should render correctly CardElements', () => {
        const elements: FormElement[] = [
            {
                type: FormElementType.CARD,
                span: 24,
                name: 'card',
                title: 'Card 1',
                content: "This is the card's content"
            }
        ];
        const tree = render(<GenericForm elements={elements} />);

        const formitem = tree.getByTestId('form-item');
        expect(formitem).toHaveAttribute('name', 'card');

        const card = tree.getByTestId('card');
        expect(card).toHaveAttribute('title', 'Card 1');
        expect(card).not.toHaveAttribute('size');
        expect(card).not.toHaveAttribute('extra');
        expect(card).not.toHaveAttribute('actions');
    });
    it('should call onSubmit', () => {
        const elements: FormElement[] = [
            {
                type: FormElementType.DOCUMENT,
                span: 24,
                name: 'document',
                label: 'Document 1',
                required: true,
                uploadable: true,
                loading: false
            },
            {
                type: FormElementType.DOCUMENT,
                span: 24,
                name: 'empty-document',
                label: 'Document 2',
                required: false,
                uploadable: true,
                loading: false
            }
        ];
        const onSubmit = jest.fn();
        const tree = render(
            <GenericForm elements={elements} submittable={true} onSubmit={onSubmit} />
        );

        const form = tree.getByTestId('form');
        expect(form).toBeDefined();
        fireEvent.click(tree.getAllByTestId('test-onDocumentChange')[0]);
        fireEvent.submit(form);
        expect(onSubmit).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ mockedName: mockedFile }));
        expect(onSubmit).toHaveBeenCalledWith(
            expect.not.objectContaining({ 'empty-document': expect.anything() })
        );
    });
    it('should not call onSubmit if the function is not specified', () => {
        const elements: FormElement[] = [
            {
                type: FormElementType.INPUT,
                span: 24,
                name: 'input',
                label: 'Input 1',
                required: true,
                defaultValue: 'test',
                disabled: false
            }
        ];
        const onSubmit = jest.fn();
        const tree = render(<GenericForm elements={elements} submittable={true} />);

        fireEvent.submit(tree.getByTestId('form'));
        expect(onSubmit).toHaveBeenCalledTimes(0);
    });
});
