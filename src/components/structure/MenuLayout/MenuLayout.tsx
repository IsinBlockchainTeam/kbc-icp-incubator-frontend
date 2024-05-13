import {Avatar, Layout, Menu, MenuProps, Spin, theme} from "antd";
import React, { useState } from "react";
import {
  ExperimentOutlined, GoldOutlined, SettingOutlined, SwapOutlined, TeamOutlined, LogoutOutlined, UserOutlined, AuditOutlined
} from "@ant-design/icons";
import {Link, Outlet, useLocation, useNavigate} from "react-router-dom";
import { defaultPictureURL, paths } from "../../../constants";
import KBCLogo from "../../../assets/logo.png";
import styles from "./MenuLayout.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {updateUserInfo} from "../../../redux/reducers/userInfoSlice";
import SingletonSigner from "../../../api/SingletonSigner";
import {clearSiweIdentity} from "../../../redux/reducers/siweIdentitySlice";

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const getItem = (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: "group",
    onClick?: () => void,
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type,
    onClick,
  } as MenuItem;
};

const blockchainItems: MenuItem[] = [
  getItem("Trades", paths.TRADES, <SwapOutlined />),
  getItem("Materials", paths.MATERIALS, <GoldOutlined />),
  getItem("Transformations", paths.ASSET_OPERATIONS, <ExperimentOutlined />),
  getItem("Partners", paths.PARTNERS, <TeamOutlined />),
  getItem("Offers", paths.OFFERS, <AuditOutlined />)
];

const settingItems: MenuItem[] = [
  getItem("Settings", "settings", <SettingOutlined />, [
    getItem("Login", paths.LOGIN, <UserOutlined />),
  ]),
];

const getUserItemLoggedIn = (name: string, picture: string, dispatch: any) => [
  getItem(
      `${name}`,
      "profile",
      <Avatar
          size={30}
          style={{ verticalAlign: "middle", margin: "-6px" }}
          src={picture}
      />,
      [
        getItem("Profile", paths.PROFILE, <UserOutlined />),
        getItem("Logout", paths.LOGIN, <LogoutOutlined />,
            undefined,
            undefined,
            () => {
              const reset = {
                isLogged: false,
                id: "",
                legalName: "",
                email: "",
                address: "",
                nation: "",
                telephone: "",
                image: "",
                role: "",
                privateKey: "",
              };
              dispatch(updateUserInfo(reset));
              dispatch(clearSiweIdentity());
              SingletonSigner.resetInstance();
            }
        ),
      ],
  ),
];



export const MenuLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const dispatch = useDispatch();

  const userInfo = useSelector((state: RootState) => state.userInfo);
  const loading = useSelector((state: RootState) => state.loading);

  // @ts-ignore
  const onMenuClick = ({ key }) => {
    navigate(key);
  }

  return (
      <Layout className={styles.AppContainer}>
        <Sider
            width="max(250px, 12vw)"
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
        >
          {/*<div className="demo-logo-vertical" />*/}
          <div className={styles.Sidebar}>
            <Link to={paths.HOME} className={styles.LogoContainer}>
              <img
                  alt="KBC-Logo"
                  src={KBCLogo}
                  className={`${collapsed ? styles.LogoCollapsed : styles.Logo}`}
              />
            </Link>
            <div className={styles.MenuContainer}>
              <Menu
                  theme="dark"
                  mode="inline"
                  items={blockchainItems}
                  selectedKeys={[location.pathname]}
                  onClick={onMenuClick}
              />
              <Menu
                  theme="dark"
                  mode="vertical"
                  items={
                    userInfo.isLogged
                        ? getUserItemLoggedIn(userInfo.legalName, userInfo.image || defaultPictureURL, dispatch)
                        : settingItems
                  }
                  onClick={onMenuClick}
              />
            </div>
          </div>
        </Sider>
        <Layout>
          <Content
              className={styles.MainContent}
              style={{ background: colorBgContainer }}
          >
            <Spin spinning={loading.isLoading} size="large" tip={loading.loadingMessage}>
              <Outlet />
            </Spin>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            Coffe Trading platform ©2024 Created by ISIN
          </Footer>
        </Layout>
      </Layout>
  );
};
