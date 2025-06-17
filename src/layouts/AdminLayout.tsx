import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Breadcrumb,
  Typography,
  ConfigProvider,
  theme,
  Switch,
  Tag,
} from 'antd';
import type { MenuProps } from 'antd';
import logoLight from '../assets/logo-light.png';
import logoDark from '../assets/logo-dark.png';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { defaultAlgorithm, darkAlgorithm } = theme;

const MainContent: React.FC<{
  onThemeChange: (checked: boolean) => void;
  isDarkMode: boolean;
}> = ({ onThemeChange, isDarkMode }) => {
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isTeacher, user, isUser, isUserVip, isHuitStudent, logout } = useAuth();

  const pathSnippets = location.pathname.split('/').filter((i) => i);

  const breadcrumbNameMap: Record<string, string> = {
    '/': 'Dashboard',
    '/documents': 'Quản lý tài liệu',
    '/courses': 'Quản lý khóa học',
    '/packages': 'Quản lý gói',
    '/question-bank': 'Ngân hàng câu hỏi',
    '/exams': 'Quản lý bài kiểm tra',
    '/results': 'Quản lý kết quả học tập',
    '/mock-exams': 'Quản lý đề thi thử',
    '/categories': 'Quản lý danh mục',
    '/accounts': 'Quản lý tài khoản',
    '/payments': 'Quản lý thanh toán',
    '/comments': 'Quản lý bình luận',
    '/posts': 'Quản lý bài viết',
    '/discounts': 'Quản lý giảm giá',
    '/marketing': 'Quản lý banner',
    '/notifications': 'Thông báo',
    '/statistics': 'Thống kê',
    '/messages': 'Nhắn tin',
    '/settings': 'Cài đặt hệ thống',
    '/backup': 'Sao lưu phục hồi',
    '/trash': 'Thùng rác',
    '/profile': 'Thông tin cá nhân',
    '/evaluations': 'Quản lý đánh giá',
    '/rankings': 'Quản lý xếp hạng',
  };

  const handleLogout = () => {
    // Call logout from AuthContext
    logout();
    // Remove any additional stored values
    localStorage.removeItem("username");
    localStorage.removeItem("authData");
    localStorage.removeItem("refreshToken");
    // Redirect to login page
    navigate("/login");
  };

  const extraBreadcrumbItems = pathSnippets.map((_, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    return (
      <Breadcrumb.Item key={url}>
        <Link to={url}>{breadcrumbNameMap[url]}</Link>
      </Breadcrumb.Item>
    );
  });

  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <Link to="/">Trang chủ</Link>
    </Breadcrumb.Item>,
  ].concat(extraBreadcrumbItems);

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      label: <Link to="/profile">Thông tin cá nhân</Link>,
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  // Teacher-specific menu items
  const teacherMenuItems = [
    {
      key: 'documents',
      label: <Link to="/documents">Quản lý tài liệu</Link>,
    },
    {
      key: 'courses',
      label: <Link to="/courses">Quản lý khóa học</Link>,
    },
    {
      key: 'question-bank',
      label: <Link to="/question-bank">Ngân hàng câu hỏi</Link>,
    },
    {
      key: 'exams',
      label: <Link to="/exams">Quản lý bài kiểm tra</Link>,
    },
    {
      key: 'results',
      label: <Link to="/results">Quản lý kết quả học tập</Link>,
    },
    {
      key: 'mock-exams',
      label: <Link to="/mock-exams">Quản lý đề thi thử</Link>,
    },
    {
      key: 'evaluations',
      label: <Link to="/evaluations">Quản lý đánh giá</Link>,
    },
    {
      key: 'rankings',
      label: <Link to="/rankings">Quản lý xếp hạng</Link>,
    },
    {
      key: 'comments',
      label: <Link to="/comments">Quản lý bình luận</Link>,
    },
    {
      key: 'posts',
      label: <Link to="/posts">Quản lý bài viết</Link>,
    },
  ];

  // Admin-specific menu items
  const adminOnlyMenuItems = [
    {
      key: 'packages',
      label: <Link to="/packages">Quản lý gói</Link>,
    },
    {
      key: 'categories',
      label: <Link to="/categories">Quản lý danh mục</Link>,
    },
    {
      key: 'accounts',
      label: <Link to="/accounts">Quản lý tài khoản</Link>,
    },
    {
      key: 'payments',
      label: <Link to="/payments">Quản lý thanh toán</Link>,
    },
    {
      key: 'discounts',
      label: <Link to="/discounts">Quản lý giảm giá</Link>,
    },
    {
      key: 'marketing',
      label: <Link to="/marketing">Quản lý banner</Link>,
    },
  ];

  // Helper functions to get menu items based on role
  const getManagementMenuItems = () => {
    if (isAdmin) {
      return [...teacherMenuItems, ...adminOnlyMenuItems]; // Admin can access everything
    } else if (isTeacher) {
      return teacherMenuItems; // Teacher can only access teacher items
    }
    return []; // Default empty array for users without permission
  };

  const getReportMenuItems = () => {
    return [
      ...(isAdmin || isTeacher ? [
        {
          key: 'notifications',
          label: <Link to="/notifications">Thông báo</Link>,
        }
      ] : []),
      ...(isAdmin ? [
        {
          key: 'statistics',
          label: <Link to="/statistics">Thống kê</Link>,
        }
      ] : [])
    ];
  };

  const getSupportMenuItems = () => {
    return [
      ...(isAdmin ? [
        {
          key: 'settings',
          label: <Link to="/settings">Cài đặt hệ thống</Link>,
        },
        {
          key: 'backup',
          label: <Link to="/backup">Sao lưu phục hồi</Link>,
        },
        {
          key: 'trash',
          label: <Link to="/trash">Thùng rác</Link>,
        }
      ] : []),
      ...(isAdmin ? [
        {
          key: 'messages',
          label: <Link to="/messages">Nhắn tin</Link>,
        }
      ] : [])
    ];
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      label: <Link to="/">Dashboard</Link>,
    }
  ];

  // Add management section if user has items
  if (getManagementMenuItems().length > 0) {
    menuItems.push({
      key: 'management',
      label: 'Quản lý',
      children: getManagementMenuItems(),
    });
  }

  // Add report section if user has items
  if (getReportMenuItems().length > 0) {
    menuItems.push({
      key: 'report',
      label: 'Report',
      children: getReportMenuItems(),
    });
  }

  // Add support section if user has items
  if (getSupportMenuItems().length > 0) {
    menuItems.push({
      key: 'support',
      label: 'Support',
      children: getSupportMenuItems(),
    });
  }

  // Helper function to get user role display name
  const getUserRoleDisplay = () => {
    if (isAdmin) return 'Admin';
    if (isTeacher) return 'Giáo viên';
    if (isUser) return 'Người dùng';
    if (isUserVip) return 'VIP';
    if (isHuitStudent) return 'Sinh viên HUIT';
    return 'Khách';
  };

  // Helper function to get the color for the role tag
  const getRoleTagColor = () => {
    if (isAdmin) return 'red';
    if (isTeacher) return 'green';
    if (isUserVip) return 'gold';
    if (isHuitStudent) return 'blue';
    if (isUser) return 'cyan';
    return 'default';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!collapsed ? (
            <img src={isDarkMode ? logoDark : logoLight} alt="Logo" style={{ width: '100%', maxHeight: 64, }} />
          ) : (
            <Title level={4} style={{ margin: 0, color: '#fff' }}>
              TMS
            </Title>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: token.colorBgContainer, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          >
            {collapsed ? '≡' : '≡'}
          </Button>
          <div style={{ paddingRight: 24, display: 'flex', alignItems: 'center' }}>
            <Switch
              checkedChildren="Dark"
              unCheckedChildren="Light"
              onChange={onThemeChange}
              style={{ marginRight: 16 }}
            />
            <Tag color={getRoleTagColor()} style={{ marginRight: 8 }}>
              {getUserRoleDisplay()}
            </Tag>
            <Dropdown menu={{ items }} trigger={['click']}>
              <Space>
                <Avatar>{user ? user.sub.charAt(0).toUpperCase() : 'A'}</Avatar>
                <span>{user?.sub || 'Admin'}</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer,
          }}
        >
          <Breadcrumb style={{ marginBottom: '16px' }}>{breadcrumbItems}</Breadcrumb>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

const AdminLayout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <MainContent onThemeChange={handleThemeChange} isDarkMode={isDarkMode} />
    </ConfigProvider>
  );
};

export default AdminLayout; 