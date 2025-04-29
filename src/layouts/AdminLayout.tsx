import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Menu, 
  Button, 
  Avatar, 
  Dropdown, 
  Space, 
  Breadcrumb,
  Typography
} from 'antd';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const pathSnippets = location.pathname.split('/').filter(i => i);
  const breadcrumbNameMap: Record<string, string> = {
    '/': 'Dashboard',
    '/documents': 'Quản lý tài liệu',
    '/courses': 'Quản lý khóa học',
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
      onClick: () => {
        // Xử lý đăng xuất
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
        <div style={{ height: 64, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            {!collapsed ? 'CRM Khóa Học' : 'CRM'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={[
            {
              key: 'dashboard',
              label: <Link to="/">Dashboard</Link>,
            },
            {
              key: 'management',
              label: 'Quản lý',
              children: [
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
                  key: 'comments',
                  label: <Link to="/comments">Quản lý bình luận</Link>,
                },
                {
                  key: 'posts',
                  label: <Link to="/posts">Quản lý bài viết</Link>,
                },
                {
                  key: 'discounts',
                  label: <Link to="/discounts">Quản lý giảm giá</Link>,
                },
                {
                  key: 'marketing',
                  label: <Link to="/marketing">Quản lý banner</Link>,
                },
              ],
            },
            {
              key: 'report',
              label: 'Report',
              children: [
                {
                  key: 'notifications',
                  label: <Link to="/notifications">Thông báo</Link>,
                },
                {
                  key: 'statistics',
                  label: <Link to="/statistics">Thống kê</Link>,
                },
              ],
            },
            {
              key: 'support',
              label: 'Support',
              children: [
                {
                  key: 'messages',
                  label: <Link to="/messages">Nhắn tin</Link>,
                },
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
                },
              ],
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff', display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="text"
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          >
            {collapsed ? '≡' : '≡'}
          </Button>
          <div style={{ paddingRight: 24 }}>
            <Dropdown menu={{ items }} trigger={['click']}>
              <Space>
                <Avatar>A</Avatar>
                <span>Admin</span>
              </Space>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 4,
            overflow: 'auto'
          }}
        >
          <Breadcrumb style={{ marginBottom: 16 }}>{breadcrumbItems}</Breadcrumb>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 