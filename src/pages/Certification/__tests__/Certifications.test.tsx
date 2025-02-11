import { act, render } from '@testing-library/react';
import React from 'react';
import { Certifications, certificationsType } from '@/pages/Certification/Certifications';
import { ICPAssessmentReferenceStandard, ICPCertificateType } from '@kbc-lib/coffee-trading-management-lib';
import { Table, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import DropdownButton from 'antd/es/dropdown/dropdown-button';
import { useRawCertification } from '@/providers/entities/icp/RawCertificationProvider';

jest.mock('@/providers/entities/icp/RawCertificationProvider');
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
            assessmentReferenceStandard: { id: 2 } as ICPAssessmentReferenceStandard,
            issuer: 'issuer',
            issueDate: new Date(),
            certificateType: ICPCertificateType.COMPANY
        }
    ];
    const navigate = jest.fn();
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        jest.spyOn(console, 'error').mockImplementation(jest.fn());
        jest.clearAllMocks();

        (useRawCertification as jest.Mock).mockReturnValue({ rawCertificates: certificates });
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
        expect((DropdownButton as jest.Mock).mock.calls[0][0].children).toEqual('New Certification');
        expect((DropdownButton as jest.Mock).mock.calls[0][0].menu.items).toEqual(certificationsType);
        expect((DropdownButton as jest.Mock).mock.calls[0][0].menu.onClick).toEqual(expect.any(Function));
        act(() => {
            (DropdownButton as jest.Mock).mock.calls[0][0].menu.onClick({ key: 'key' });
        });
        expect(navigate).toHaveBeenCalledWith('key');

        const columnsProps = [
            {
                title: 'Id',
                dataIndex: 'id'
            },
            { title: 'Assessment Reference Standard', dataIndex: 'assessmentReferenceStandard' },
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
        expect(columns[1].sorter({ assessmentReferenceStandard: { name: 'c' } }, { assessmentReferenceStandard: { name: 'a' } })).toEqual(1);
        expect(columns[2].sorter({ issuer: 'company1' }, { issuer: 'company2' })).toEqual(-1);
        expect(columns[3].sorter({ issueDate: new Date() }, { issueDate: new Date(new Date().setDate(new Date().getDate() + 1)) })).toBeLessThan(0);
        expect(columns[4].sorter({ certificateType: ICPCertificateType.SCOPE }, { certificateType: ICPCertificateType.MATERIAL })).toEqual(1);
    });

    it('columns render', async () => {
        render(<Certifications />);
        expect(Table).toHaveBeenCalledTimes(1);
        const columns = (Table as unknown as jest.Mock).mock.calls[0][0].columns;
        render(columns[0].render(1, { certificateType: ICPCertificateType.COMPANY }));
        expect(Link).toHaveBeenCalled();

        render(columns[2].render(0, { issuer: 'issuer' }));

        const col3 = render(columns[3].render(new Date(1)));
        expect(col3.getByText(new Date(1).toLocaleDateString())).toBeInTheDocument();

        render(columns[4].render(0, { certificateType: ICPCertificateType.COMPANY }));
        expect(Tag).toHaveBeenCalled();
        expect(Tag).toHaveBeenNthCalledWith(1, { color: 'geekblue', children: ICPCertificateType[ICPCertificateType.COMPANY] }, {});
    });
});
