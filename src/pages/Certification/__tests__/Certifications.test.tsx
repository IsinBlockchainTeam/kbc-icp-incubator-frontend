import { act, render } from '@testing-library/react';
import React from 'react';
import { Certifications, certificationsType } from '@/pages/Certification/Certifications';
import { useICPOrganization } from '@/providers/entities/ICPOrganizationProvider';
import { CertificateType } from '@kbc-lib/coffee-trading-management-lib';
import { useEthRawCertificate } from '@/providers/entities/EthRawCertificateProvider';
import { Table, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import DropdownButton from 'antd/es/dropdown/dropdown-button';

jest.mock('@/providers/entities/EthRawCertificateProvider');
jest.mock('@/providers/entities/ICPOrganizationProvider');
jest.mock('react-router-dom', () => {
    return {
        ...jest.requireActual('react-router-dom'),
        Link: jest.fn(() => <div />),
        useNavigate: jest.fn()
    };
});
jest.mock('antd', () => {
    return {
        ...jest.requireActual('antd'),
        Table: jest.fn(),
        Tag: jest.fn()
    };
});
jest.mock('antd/es/dropdown/dropdown-button', () => jest.fn());

describe('Certifications', () => {
    const certificates = [
        {
            id: 1,
            assessmentStandard: 'assessmentStandard',
            issuer: 'issuer',
            issueDate: 1,
            certificateType: CertificateType.COMPANY
        }
    ];
    const navigate = jest.fn();
    const getCompany = jest.fn().mockImplementation((name) => ({ legalName: name }));
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useEthRawCertificate as jest.Mock).mockReturnValue({ rawCertificates: certificates });
        (useICPOrganization as jest.Mock).mockReturnValue({ getCompany });
        getCompany.mockReturnValue({ legalName: 'actor' });
        (useNavigate as jest.Mock).mockReturnValue(navigate);
        (Tag as unknown as jest.Mock).mockImplementation(({ children }) => <div>{children}</div>);
    });

    it('should render correctly', async () => {
        render(<Certifications />);
        expect(Table).toHaveBeenCalledTimes(1);

        const tableProps = (Table as unknown as jest.Mock).mock.calls[0][0];
        expect(tableProps.columns).toHaveLength(5);
        expect(tableProps.dataSource).toEqual(certificates);

        expect(DropdownButton).toHaveBeenCalled();
        // TODO: onClick check fails even if I am expecting that is simply a Function..
        // expect(DropdownButton).toHaveBeenCalledWith(
        //     {
        //         trigger: ['hover'],
        //         type: 'primary',
        //         children: 'New Certification',
        //         icon: <PlusOutlined />,
        //         menu: {
        //             items: certificationsType,
        //             onClick: expect.any(Function)
        //         }
        //     },
        //     {}
        // );
        expect((DropdownButton as jest.Mock).mock.calls[0][0].trigger).toEqual(['hover']);
        expect((DropdownButton as jest.Mock).mock.calls[0][0].type).toEqual('primary');
        expect((DropdownButton as jest.Mock).mock.calls[0][0].children).toEqual(
            'New Certification'
        );
        expect((DropdownButton as jest.Mock).mock.calls[0][0].menu.items).toEqual(
            certificationsType
        );
        expect((DropdownButton as jest.Mock).mock.calls[0][0].menu.onClick).toEqual(
            expect.any(Function)
        );
        act(() => {
            (DropdownButton as jest.Mock).mock.calls[0][0].menu.onClick({ key: 'key' });
        });
        expect(navigate).toHaveBeenCalledWith('key');

        const columnsProps = [
            {
                title: 'Id',
                dataIndex: 'id'
            },
            { title: 'Assessment Standard', dataIndex: 'assessmentStandard' },
            { title: 'Certifier', dataIndex: 'issuer' },
            { title: 'Issue date', dataIndex: 'issueDate' },
            { title: 'Type', dataIndex: 'type' }
        ];
        columnsProps.forEach((prop, index) => {
            expect(tableProps.columns[index].title).toBe(prop.title);
            expect(tableProps.columns[index].dataIndex).toBe(prop.dataIndex);
        });
    });

    it('columns sorting', async () => {
        render(<Certifications />);
        expect(Table).toHaveBeenCalledTimes(1);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        expect(columns[0].sorter({ id: 1 }, { id: 2 })).toBeLessThan(0);
        expect(columns[1].sorter({ assessmentStandard: 'c' }, { assessmentStandard: 'a' })).toEqual(
            1
        );
        expect(
            columns[2].sorter(
                { legalName: getCompany('company1') },
                { legalName: getCompany('company2') }
            )
        ).toEqual(0);
        expect(columns[3].sorter({ issueDate: 1 }, { issueDate: 2 })).toBeLessThan(0);
        expect(
            columns[4].sorter(
                { certificateType: CertificateType.SCOPE },
                { certificateType: CertificateType.MATERIAL }
            )
        ).toEqual(1);
    });

    it('columns render', async () => {
        render(<Certifications />);
        expect(Table).toHaveBeenCalledTimes(1);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        render(columns[0].render(1, { certificateType: CertificateType.COMPANY }));
        expect(Link).toHaveBeenCalled();

        render(columns[2].render(0, { issuer: 'issuer' }));
        expect(getCompany).toHaveBeenCalledTimes(1);
        expect(getCompany).toHaveBeenNthCalledWith(1, 'issuer');

        const col3 = render(columns[3].render(1));
        expect(col3.getByText(new Date(1).toLocaleDateString())).toBeInTheDocument();

        render(columns[4].render(0, { certificateType: CertificateType.COMPANY }));
        expect(Tag).toHaveBeenCalled();
        expect(Tag).toHaveBeenNthCalledWith(
            1,
            { color: 'geekblue', children: CertificateType[CertificateType.COMPANY] },
            {}
        );
    });
});
