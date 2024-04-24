import {Card, Typography} from "antd";
import styles from "./Profile.module.scss";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/store";
const { Title, Paragraph } = Typography;
export default function Profile() {
    const userInfo = useSelector((state: RootState) => state.userInfo);

    return (
        <div className={styles.ProfileContainer}>
            <Card
                style={{width: '100%'}}
                cover={<img alt="example" src={userInfo.image} />}
            >
                <Title>Welcome {userInfo.legalName}!</Title>
                <Title level={5}>Your information:</Title>
                <Paragraph>Email: {userInfo.email}</Paragraph>
                <Paragraph>Address: {userInfo.address}</Paragraph>
                <Paragraph>Nation: {userInfo.nation}</Paragraph>
                <Paragraph>Telephone: {userInfo.telephone}</Paragraph>
            </Card>
        </div>
    );
}
