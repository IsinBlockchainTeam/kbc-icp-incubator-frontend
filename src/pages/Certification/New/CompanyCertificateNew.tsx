import { CardPage } from '@/components/structure/CardPage/CardPage';
import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { paths } from '@/constants/paths';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GenericForm } from '@/components/GenericForm/GenericForm';

export const CompanyCertificateNew = () => {
    const navigate = useNavigate();

    return (
        <CardPage
            title={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                    New Company Certificate
                    <Button
                        type="primary"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => navigate(paths.TRADES)}>
                        Delete Trade
                    </Button>
                </div>
            }>
            {/*<GenericForm elements={elements} onSubmit={onSubmit} submittable={true} />*/}
        </CardPage>
    );
};
