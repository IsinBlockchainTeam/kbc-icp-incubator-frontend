import { act, fireEvent, render } from '@testing-library/react';
import { ConfirmButton } from '@/components/ConfirmButton/ConfirmButton';
import { Modal } from 'antd';

describe('ConfirmButton', () => {
    it('should render correctly', () => {
        const text = 'text';
        const confirmText = 'confirmText';
        const onConfirm = jest.fn();
        const spy = jest.spyOn(Modal, 'confirm').mockImplementation(jest.fn());
        const { getByText } = render(
            <ConfirmButton
                text={text}
                confirmText={confirmText}
                disabled={false}
                onConfirm={onConfirm}
            />
        );
        expect(getByText(text)).toBeInTheDocument();

        act(() => {
            fireEvent.click(getByText(text));
        });
        expect(spy).toHaveBeenCalled();
    });
});
