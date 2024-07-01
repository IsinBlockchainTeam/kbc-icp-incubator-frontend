import { render } from '@testing-library/react';
import TradeDutiesWaiting, { DutiesWaiting } from '@/pages/Trade/TradeDutiesWaiting';
import { Image } from 'antd';

jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Image: jest.fn(() => <div />)
    };
});

describe('TradeDutiesWaiting', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();
    });

    it('should render correctly - EXPORTER_PRODUCTION', () => {
        render(
            <TradeDutiesWaiting waitingType={DutiesWaiting.EXPORTER_PRODUCTION} message="Message" />
        );

        expect(Image).toHaveBeenCalledTimes(1);
        expect(Image).toHaveBeenCalledWith(
            {
                src: './assets/coffee-production.jpg',
                preview: false,
                style: {
                    width: '80%'
                }
            },
            {}
        );
    });
    it('should render correctly - EXPORTER_EXPORT', () => {
        render(
            <TradeDutiesWaiting waitingType={DutiesWaiting.EXPORTER_EXPORT} message="Message" />
        );

        expect(Image).toHaveBeenCalledTimes(1);
        expect(Image).toHaveBeenCalledWith(
            {
                src: './assets/coffee-export.webp',
                preview: false,
                style: {
                    width: '80%'
                }
            },
            {}
        );
    });
    it('should render correctly - EXPORTER_SHIPPING', () => {
        render(
            <TradeDutiesWaiting waitingType={DutiesWaiting.EXPORTER_SHIPPING} message="Message" />
        );

        expect(Image).toHaveBeenCalledTimes(1);
        expect(Image).toHaveBeenCalledWith(
            {
                src: './assets/coffee-shipping.jpg',
                preview: false,
                style: {
                    width: '80%'
                }
            },
            {}
        );
    });
    it('should render correctly - IMPORTER_IMPORT', () => {
        render(
            <TradeDutiesWaiting waitingType={DutiesWaiting.IMPORTER_IMPORT} message="Message" />
        );

        expect(Image).toHaveBeenCalledTimes(1);
        expect(Image).toHaveBeenCalledWith(
            {
                src: './assets/coffee-import.jpeg',
                preview: false,
                style: {
                    width: '80%'
                }
            },
            {}
        );
    });
});
