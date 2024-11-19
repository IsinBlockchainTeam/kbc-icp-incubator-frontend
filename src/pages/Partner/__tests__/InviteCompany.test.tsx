import { render, fireEvent, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { InviteCompany } from '@/pages/Partner/InviteCompany';
import { openNotification } from '@/utils/notification';

jest.mock('react-redux');
jest.mock('@/utils/notification');

describe('InviteCompany', () => {
    const dispatch = jest.fn();
    let fetchBackup: typeof global.fetch;
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.resetAllMocks();
        (useDispatch as jest.Mock).mockReturnValue(dispatch);
        fetchBackup = global.fetch;
    });

    it('should renders form and submit button', () => {
        const { getByText, getByLabelText } = render(
            <InviteCompany open={true} onClose={jest.fn()} />
        );

        expect(getByLabelText('Name')).toBeInTheDocument();
        expect(getByLabelText('E-mail')).toBeInTheDocument();
        expect(getByText('Invite')).toBeInTheDocument();
    });

    it('should submits form and receives success response', async () => {
        const mockedFetch = jest.fn().mockResolvedValueOnce({ ok: true });
        global.fetch = mockedFetch;
        const onClose = jest.fn();

        const { getByText, getByLabelText } = render(
            <InviteCompany open={true} onClose={onClose} />
        );

        fireEvent.change(getByLabelText('Name'), { target: { value: 'Test Company' } });
        fireEvent.change(getByLabelText('E-mail'), { target: { value: 'test@test.com' } });
        fireEvent.click(getByText('Invite'));

        await waitFor(() => expect(mockedFetch).toHaveBeenCalled());
        expect(openNotification).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);

        global.fetch = fetchBackup;
    });

    it('should submits form and receives error response - response not ok', async () => {
        const mockedFetch = jest.fn().mockResolvedValueOnce({ ok: false });
        global.fetch = mockedFetch;
        const onClose = jest.fn();

        const { getByText, getByLabelText } = render(
            <InviteCompany open={true} onClose={onClose} />
        );

        fireEvent.change(getByLabelText('Name'), { target: { value: 'Test Company' } });
        fireEvent.change(getByLabelText('E-mail'), { target: { value: 'test@test.com' } });
        fireEvent.click(getByText('Invite'));

        await waitFor(() => expect(mockedFetch).toHaveBeenCalled());
        expect(openNotification).toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);

        global.fetch = fetchBackup;
    });
    it('should submits form and receives error response - request failure', async () => {
        const mockedFetch = jest.fn().mockRejectedValue(new Error('error'));
        global.fetch = mockedFetch;
        const onClose = jest.fn();

        const { getByText, getByLabelText } = render(
            <InviteCompany open={true} onClose={onClose} />
        );

        fireEvent.change(getByLabelText('Name'), { target: { value: 'Test Company' } });
        fireEvent.change(getByLabelText('E-mail'), { target: { value: 'test@test.com' } });
        fireEvent.click(getByText('Invite'));

        await waitFor(() => expect(mockedFetch).toHaveBeenCalled());
        expect(openNotification).toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledTimes(2);

        global.fetch = fetchBackup;
    });
});
