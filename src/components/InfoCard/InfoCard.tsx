import { Card, Collapse, ConfigProvider, Typography, Image } from "antd";
import { InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Panel } = Collapse;

type InfoCardProps = {
    title: string;
    items: React.ReactNode[];
    collapsed?: boolean;
    marginTop?: string;
    marginBottom?: string;
    image?: string;
    imageWidth?: number;
}

export const InfoCard = ({
    title,
    items,
    collapsed = false,
    marginTop = '24px',
    marginBottom = '24px',
    image,
    imageWidth = 250
}: InfoCardProps) => {
    const expandIcon = ({ isActive }: { isActive?: boolean }) => {
        if (isActive) {
            return <InfoCircleOutlined style={{ color: '#1677FF', fontSize: '20px', }} />
        } else {
            return <PlusOutlined style={{ color: '#1677FF', fontSize: '20px', }} />
        }
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    Card: {
                        bodyPadding: 8,
                    },
                },
            }}
        >
            <Card
                style={{
                    background: '#E6F4FF',
                    borderColor: '#91CAFF',
                    width: '100%',
                    marginTop: marginTop,
                    marginBottom: marginBottom
                }}
            >
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                    <Collapse
                        ghost
                        style={{ width: '100%' }}
                        defaultActiveKey={!collapsed ? ['1'] : []}
                        expandIcon={expandIcon}
                    >
                        <Panel
                            header={
                                <Text strong style={{ fontSize: '16px' }}>
                                    {title}
                                </Text>
                            }
                            key="1"
                        >
                            <div style={{
                                display: 'flex',
                                gap: '24px',
                                alignItems: 'flex-start'
                            }}>
                                <ul style={{
                                    margin: '8px 0 0 0',
                                    padding: 0,
                                    flex: 1
                                }}>
                                    {items.map((item, index) => (
                                        <li key={index} style={{
                                            marginBottom: index !== items.length - 1 ? '8px' : 0,
                                            display: 'flex',
                                            gap: '8px',
                                        }}>
                                            <Text>•</Text>
                                            <div style={{ textAlign: 'left' }}>{item}</div>
                                        </li>
                                    ))}
                                </ul>
                                {image && (
                                    <Image
                                        src={image}
                                        width={imageWidth}
                                        style={{ objectFit: 'contain' }}
                                        preview={false}
                                    />
                                )}
                            </div>
                        </Panel>
                    </Collapse>
                </div>
            </Card>
        </ConfigProvider>
    );
};