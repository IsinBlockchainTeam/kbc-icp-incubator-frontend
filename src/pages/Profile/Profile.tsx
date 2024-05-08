import {Card, Typography} from "antd";
import styles from "./Profile.module.scss";
import {useSelector} from "react-redux";
import {RootState} from "../../redux/store";
import {Navigate} from "react-router-dom";
import {paths} from "../../constants";
import SingletonSigner from "../../api/SingletonSigner";
const { Title, Paragraph } = Typography;
export default function Profile() {
    const userInfo = useSelector((state: RootState) => state.userInfo);

    if (!userInfo.isLogged) {
        return <Navigate to={paths.LOGIN} />
    }
    return (
        <div className={styles.ProfileContainer}>
            <Card
                style={{width: '100%'}}
                cover={<img alt="example" src={userInfo.image} style={{marginTop: '10px', height: '200px', width: '100%', objectFit: 'contain'}} />}
            >
                <Title>Welcome {userInfo.legalName}!</Title>
                <Title level={5}>Your information:</Title>
                <Paragraph>Role: {userInfo.role.length !== 0 ? userInfo.role : 'Unknown'}</Paragraph>
                <Paragraph>Email: {userInfo.email}</Paragraph>
                <Paragraph>Address: {userInfo.address}</Paragraph>
                <Paragraph>Nation: {userInfo.nation}</Paragraph>
                <Paragraph>Telephone: {userInfo.telephone}</Paragraph>
                <Paragraph>Ethereum Address: {SingletonSigner.getInstance()?.address || 'undefined'}</Paragraph>
            </Card>
        </div>
    );
}
