import { act, render, screen } from '@testing-library/react';
import Offers, { OfferPresentable } from '../Offers';
import userEvent from '@testing-library/user-event';
import { paths } from '@/constants/paths';
import { Material, Offer, ProductCategory } from '@kbc-lib/coffee-trading-management-lib';
import { useSelector } from 'react-redux';
import { credentials } from '@/constants/ssi';
import { useNavigate } from 'react-router-dom';
import { useOffer } from '@/providers/entities/icp/OfferProvider';
import { useOrganization } from '@/providers/entities/icp/OrganizationProvider';
import { UserInfoState } from '@/redux/reducers/userInfoSlice';
import React from 'react';
import { Table } from 'antd';

jest.mock('react-router-dom');
jest.mock('@/utils/notification');
jest.mock('@/providers/entities/icp/OfferProvider');
jest.mock('@/providers/entities/icp/OrganizationProvider');
jest.mock('react-redux');
jest.mock('@/components/ConfirmButton/ConfirmButton');
jest.mock('@/components/CertificationsInfo/CertificationsInfoGroup');
jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Table: jest.fn()
    };
});

describe('Offers', () => {
    const userInfo = {
        companyClaims: {
            role: credentials.ROLE_EXPORTER
        },
        roleProof: {
            delegator: 'delegator'
        }
    } as UserInfoState;
    const getOrganization = jest.fn();
    const navigate = jest.fn();
    const deleteOffer = jest.fn();
    const material1 = new Material(1, 'name1', 'owner1', new ProductCategory(1, 'Product Category 1'), 'typology', '85', '20%', false);
    const offer1 = new Offer(1, 'Owner 1', material1);
    const material2 = new Material(2, 'name2', 'owner2', new ProductCategory(2, 'Product Category 2'), 'typology2', '90', '15%', false);
    const offer2 = new Offer(2, 'Owner 2', material2);
    const offers = [offer1, offer2];

    let tableDataSource: OfferPresentable[] = [];

    beforeEach(() => {
        // jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        getOrganization.mockReturnValue({ legalName: 'Supplier Name' });
        (useOrganization as jest.Mock).mockReturnValue({
            getOrganization
        });
        (useOffer as jest.Mock).mockReturnValue({
            offers,
            deleteOffer
        });
        (useSelector as jest.Mock).mockReturnValue(userInfo);
        (useNavigate as jest.Mock).mockReturnValue(navigate);

        tableDataSource = offers.map((offer) => ({
            id: offer.id,
            owner: offer.owner,
            supplierName: getOrganization(offer.owner).legalName,
            supplierAddress: offer.owner,
            material: offer.material,
            productCategory: offer.material.productCategory
        }));
    });

    it('should render correctly', async () => {
        render(<Offers />);

        expect(Table).toHaveBeenCalledTimes(1);
        const tableProps = (Table as unknown as jest.Mock).mock.calls[0][0];
        expect(tableProps.columns).toHaveLength(5);
        expect(tableProps.dataSource).toEqual(tableDataSource);

        const columnsProps = [
            {
                title: 'Id',
                dataIndex: 'id'
            },
            { title: 'Company', dataIndex: 'supplierName' },
            { title: 'Product category', dataIndex: ['productCategory', 'name'] },
            { title: 'Certifications', dataIndex: undefined },
            { title: 'Actions', dataIndex: undefined }
        ];
        columnsProps.forEach((prop, index) => {
            expect(tableProps.columns[index].title).toBe(prop.title);
            expect(tableProps.columns[index].dataIndex).toStrictEqual(prop.dataIndex);
        });
    });

    it("should call navigator functions when clicking on 'New' buttons", async () => {
        render(<Offers />);

        act(() => {
            userEvent.click(screen.getByRole('button', { name: 'plus New Offer' }));
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.OFFERS_NEW);
    });

    it("should call navigator functions when clicking on 'Start a negotiation' buttons", async () => {
        (useSelector as jest.Mock).mockReturnValue({
            companyClaims: {
                role: credentials.ROLE_IMPORTER
            },
            roleProof: {
                delegator: 'delegator'
            }
        });

        render(<Offers />);

        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        act(() => {
            const resp = columns[4].render(tableDataSource[0]);
            expect(resp.props.children[0].props.children).toBe('Start a negotiation');
            resp.props.children[0].props.onClick();
        });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(paths.TRADE_NEW, {
            state: { supplierAddress: offer1.owner, material: offer1.material }
        });
    });

    it("should call deleteOffer function when clicking on 'Delete' buttons", async () => {
        (useSelector as jest.Mock).mockReturnValue({
            companyClaims: {
                role: credentials.ROLE_IMPORTER
            },
            roleProof: {
                delegator: tableDataSource[0].owner
            }
        });

        render(<Offers />);

        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        await act(async () => {
            const resp = columns[4].render(tableDataSource[0]);
            expect(resp.props.children[1].props.text).toBe('Delete');
            resp.props.children[1].props.onConfirm();
            // expect(ConfirmButton).toHaveBeenCalledTimes(1);
            // await (ConfirmButton as jest.Mock).mock.calls[0][0].onConfirm();
        });

        expect(deleteOffer).toHaveBeenCalledTimes(1);
        expect(deleteOffer).toHaveBeenCalledWith(tableDataSource[0].id);
    });

    it('should call sorter function correctly when clicking on a table header', async () => {
        render(<Offers />);

        expect(Table).toHaveBeenCalledTimes(1);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        expect(columns[0].sorter({ id: 1 }, { id: 2 })).toBeLessThan(0);
        expect(columns[1].sorter({ supplierName: 'c' }, { supplierName: 'a' })).toEqual(1);
        expect(columns[2].sorter({ productCategory: { name: 'cat1' } }, { productCategory: { name: 'cat2' } })).toEqual(-1);
    });

    it('should filter offers', async () => {
        render(<Offers />);

        let tableDataSource = (Table as unknown as jest.Mock).mock.calls[0][0].dataSource;
        expect(tableDataSource).toHaveLength(2);

        userEvent.type(screen.getByPlaceholderText('Search by product category'), 'Product Category 1');
        act(() => {
            userEvent.click(screen.getByLabelText('search'));
        });

        tableDataSource = (Table as unknown as jest.Mock).mock.calls[1][0].dataSource;
        expect(tableDataSource).toHaveLength(1);
    });
});
