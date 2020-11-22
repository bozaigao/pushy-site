/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import { Link } from 'gatsby';

import {
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RightOutlined,
} from '@ant-design/icons';

import { Badge, Row, Col, Menu } from 'antd';
import MobileMenu from 'rc-drawer-menu';
import moment from 'moment';
import Article from './Article';
import { getMenuItems, MenuDataItem, IMenuData } from '../utils';
import { IFrontmatterData } from '../../templates/docs';

const { SubMenu } = Menu;

export interface MainContentProps {
  isMobile: boolean;
  location: {
    pathname: string;
  };
  menuList: MenuDataItem[];
  localizedPageData: {
    meta: IFrontmatterData;
    toc: string | false;
    content: string;
  };
}

interface MainContentState {
  openKeys: string[];
}

function getActiveMenuItem(props: MainContentProps) {
  const { pathname } = props.location;
  if (pathname.endsWith('/')) {
    return pathname.substring(0, pathname.length - 1);
  }
  return pathname;
}

function getModuleDataWithProps(props: MainContentProps) {
  const moduleData = props.menuList;
  return moduleData.filter(({ filename }) => {
    if (!filename) {
      return false;
    }
    return true;
  });
}

function isNotTopLevel(level: string) {
  return level !== 'topLevel';
}

export default class MainContent extends React.PureComponent<MainContentProps, MainContentState> {
  timer: number;

  currentModule: string;

  constructor(props: MainContentProps) {
    super(props);
    this.state = {
      openKeys: this.getSideBarOpenKeys(props) || [],
    };
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentWillReceiveProps(nextProps: MainContentProps) {
    const openKeys = this.getSideBarOpenKeys(nextProps);
    if (openKeys) {
      this.setState({
        openKeys,
      });
    }
  }

  componentDidUpdate() {
    if (!window.location.hash) {
      return;
    }
    const element = document.getElementById(
      decodeURIComponent(window.location.hash.replace('#', '')),
    );
    setTimeout(() => {
      if (element) {
        element.scrollIntoView(true);
      }
    }, 100);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  getSideBarOpenKeys = (nextProps: MainContentProps) => {
    const { pathname } = nextProps.location;
    const moduleData = getModuleDataWithProps(nextProps);
    const item = moduleData.find(({ slug }) => pathname.includes(slug));
    if (item) {
      return [item.type];
    }
    return [];
  };

  handleMenuOpenChange = (openKeys: string[]) => {
    this.setState({
      openKeys,
    });
  };

  generateMenuItem = ({ before = null, after = null }, item: MenuDataItem) => {
    if (!item.title) {
      return null;
    }

    const { disabled } = item;

    const child = !item.link ? (
      <Link to={item.filename}>
        {before}
        {item.title}
        {after}
      </Link>
    ) : (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="menu-item-link-outside"
      >
        {before}
        {item.title}
        {after}
      </a>
    );

    return (
      <Menu.Item key={item.filename} disabled={disabled}>
        {item.important ? <Badge dot={item.important}>{child}</Badge> : child}
      </Menu.Item>
    );
  };

  generateSubMenuItems = (obj?: IMenuData, footerNavIcons = {}) => {
    if (!obj) return [];
    const topLevel = ((obj.topLevel as MenuDataItem[]) || []).map(
      this.generateMenuItem.bind(this, footerNavIcons),
    );
    const itemGroups = Object.keys(obj)
      .filter(isNotTopLevel)
      .map((type) => {
        const groupItems = (obj[type] as MenuDataItem[])
          .sort((a, b) => {
            if ('time' in a && 'time' in b) {
              return moment(b.time).valueOf() - moment(a.time).valueOf();
            }
            if ('order' in a && 'order' in b) {
              return a.order - b.order;
            }
            return a.title.charCodeAt(0) - b.title.charCodeAt(0);
          })
          .map(this.generateMenuItem.bind(this, footerNavIcons));
        return (
          <SubMenu title={type} key={type}>
            {groupItems}
          </SubMenu>
        );
      });
    return [...topLevel, ...itemGroups];
  };

  getMenuItems = (footerNavIcons = {}) => {
    const moduleData = getModuleDataWithProps(this.props);
    const menuItems: IMenuData = getMenuItems(moduleData) || {};
    const topLevel =
      this.generateSubMenuItems(menuItems.topLevel as IMenuData, footerNavIcons) || [];

    const result = [...topLevel].filter(({ key }) => key);
    return result;
  };

  getPreAndNext = (menuItems: any) => {
    const {
      localizedPageData: {
        meta: { filename },
      },
    } = this.props;

    const list =
      menuItems.length && !menuItems[0].props.children.length
        ? menuItems
        : Object.keys(menuItems).reduce(
            (pre, key) => pre.concat(menuItems[key].props.children),
            [],
          );
    const index = list.findIndex((item: { key: string }) => item.key === filename);

    if (index === -1) {
      return {};
    }
    return {
      previous: list[index - 1],
      next: list[index + 1],
    };
  };

  render() {
    const { localizedPageData, isMobile } = this.props;

    const activeMenuItem = getActiveMenuItem(this.props);
    const menuItems = this.getMenuItems();
    const currentItem = this.getPreAndNext(menuItems);
    const { next, previous } = currentItem;
    const { openKeys } = this.state;
    const menuChild = (
      <Menu
        inlineIndent={16}
        className="aside-container"
        mode="inline"
        openKeys={openKeys}
        selectedKeys={[activeMenuItem]}
        onOpenChange={this.handleMenuOpenChange}
      >
        {menuItems}
      </Menu>
    );
    return (
      <div className="main-wrapper">
        <Row>
          {isMobile ? (
            <MobileMenu
              iconChild={[<MenuUnfoldOutlined />, <MenuFoldOutlined />]}
              key="mobile-menu"
              wrapperClassName="drawer-wrapper"
            >
              {menuChild}
            </MobileMenu>
          ) : (
            <Col xxl={4} xl={5} lg={6} md={24} sm={24} xs={24} className="main-menu">
              {menuChild}
            </Col>
          )}
          <Col xxl={20} xl={19} lg={18} md={24} sm={24} xs={24}>
            <div className="main-container">
              <Article {...this.props} content={localizedPageData} />
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={{ span: 20, offset: 4 }} md={24} sm={24} xs={24}>
            <section className="prev-next-nav">
              {previous ? (
                <div className="prev-page">
                  <LeftOutlined className="footer-nav-icon-before" />
                  {previous.props.children}
                </div>
              ) : null}
              {next ? (
                <div className="next-page">
                  {next.props.children}
                  <RightOutlined className="footer-nav-icon-after" />
                </div>
              ) : null}
            </section>
          </Col>
        </Row>
      </div>
    );
  }
}
