import { Avatar, Layout, Menu, MenuProps, Switch, theme } from "antd";
import React, { useState } from "react";
import {
  ContainerOutlined, ExperimentOutlined, FormOutlined, GoldOutlined, SettingOutlined, SwapOutlined, TeamOutlined, UserAddOutlined, UserOutlined, AuditOutlined
} from "@ant-design/icons";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { defaultPictureURL, paths } from "../../../constants";
import KBCLogo from "../../../assets/logo.png";
import styles from "./MenuLayout.module.scss";
import { useAuth0, User } from "@auth0/auth0-react";
import {
  isBlockchainViewMode,
  toggleBlockchainViewMode,
} from "../../../utils/storage";
import { formatDid } from "../../../utils/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  updateSubjectClaims,
  updateSubjectDid,
} from "../../../redux/reducers/authSlice";
import { OrganizationCredential } from "../../../api/types/OrganizationCredential";
import { RootState } from "../../../redux/types";

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

const legacyItems: MenuItem[] = [
  getItem("Traceability", "t1", <SwapOutlined />, [
    getItem("Contact", paths.CONTRACTS, <FormOutlined />),
    getItem("Order", paths.ORDERS, <FormOutlined />),
    getItem("Shipments", paths.SHIPMENTS, <FormOutlined />),
  ]),
  getItem("Transformations", paths.ASSET_OPERATIONS, <ExperimentOutlined />),
  getItem("Certifications", paths.CERTIFICATIONS, <ContainerOutlined />),
];

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
    getItem("Sign up", paths.SIGNUP, <UserAddOutlined />),
  ]),
];

const userItemLoggedIn: (u: User) => MenuItem[] = (user) => [
  getItem(
    `${user.name}`,
    "profile",
    <Avatar
      size={30}
      style={{ verticalAlign: "middle", margin: "-6px" }}
      src={user.picture}
    />,
    [getItem("Logout", paths.LOGIN, <UserOutlined />)],
  ),
];

export const MenuLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { user, isAuthenticated } = useAuth0();
  const dispatch = useDispatch();

  const subjectDid = useSelector((state: RootState) => state.auth.subjectDid);
  const subjectClaims = useSelector(
    (state: RootState) => state.auth.subjectClaims,
  );

  const handleUpdateSubjectDid = (subjectDid: string) => {
    dispatch(updateSubjectDid(subjectDid));
  };

  const handleUpdateSubjectClaims = (subjectClaims: OrganizationCredential) => {
    dispatch(updateSubjectClaims(subjectClaims));
  };

  const toggleViewMode = () => {
    // window.location.reload();
    navigate("/");
    toggleBlockchainViewMode();
  };

  // @ts-ignore
  const onMenuClick = ({ key }) => navigate(key);

  const didItemLoggedIn: (
    subjectDid: string,
    subjectPictureURL: string,
  ) => MenuItem[] = (subjectDid, subjectPictureURL) => [
    getItem(
      `${formatDid(subjectDid)}`,
      "profile",
      <Avatar
        size={30}
        style={{ verticalAlign: "middle", margin: "-6px" }}
        src={subjectPictureURL}
      />,
      [
        getItem(
          "Logout",
          paths.LOGIN,
          <UserOutlined />,
          undefined,
          undefined,
          useLogoutDid,
        ),
      ],
    ),
  ];

  const useLogoutDid = () => {
    handleUpdateSubjectDid("");
    handleUpdateSubjectClaims({});
  };

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
              items={isBlockchainViewMode() ? blockchainItems : legacyItems}
              defaultOpenKeys={["t1"]}
              onClick={onMenuClick}
            />
            <div className={styles.ViewMode}>
              {" "}
              View mode:
              <Switch
                checkedChildren={collapsed ? "BC ON" : "Blockchain ON"}
                unCheckedChildren={collapsed ? "BC OFF" : "Blockchain OFF"}
                defaultChecked={isBlockchainViewMode()}
                onChange={toggleViewMode}
              />
            </div>
            <Menu
              theme="dark"
              mode="vertical"
              items={
                !isBlockchainViewMode()
                  ? isAuthenticated && user
                    ? userItemLoggedIn(user)
                    : settingItems
                  : subjectDid
                  ? didItemLoggedIn(
                      subjectDid,
                      subjectClaims && subjectClaims.image
                        ? subjectClaims.image
                        : defaultPictureURL,
                    )
                  : settingItems
              }
              onClick={onMenuClick}
            />
          </div>
        </div>
      </Sider>
      <Layout>
        {/*<Header style={{ padding: 0, background: colorBgContainer }} />*/}
        <Content
          className={styles.MainContent}
          style={{ background: colorBgContainer }}
        >
          {/*<Breadcrumb style={{ margin: '16px 0' }}>*/}
          {/*    <Breadcrumb.Item>User</Breadcrumb.Item>*/}
          {/*    <Breadcrumb.Item>Bill</Breadcrumb.Item>*/}
          {/*</Breadcrumb>*/}
          {/*<div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>*/}
          {/*    Bill is a cat.*/}
          {/*</div>*/}

          <Outlet />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Coffe Trading platform ©2024 Created by ISIN
        </Footer>
      </Layout>
    </Layout>
  );
};
