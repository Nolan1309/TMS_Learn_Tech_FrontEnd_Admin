import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Form, Input, Button, Row, Col, Tabs, Table, List, Tag, message, Upload, Badge, Space, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, IdcardOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils';
import { jwtDecode } from 'jwt-decode';
import JwtPayload from '../auth/JwtPayload';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UserActivity {
  id: number;
  activityType: string;
  description: string;
  timestamp: string;
  additionalData: string | null;
  additionalDataMap: Record<string, any> | null;
}

type NotificationTopic =
  | 'REGISTER'
  | 'PASSWORD'
  | 'VOUCHER'
  | 'PAYMENT'
  | 'SYSTEM'
  | 'GENERAL'
  | 'ENROLL_COURSE'
  | 'ENROLL_EXAM'
  | 'ENROLL_COMBO'
  | 'LEARNING'
  | 'CHAT';

interface Notification {
  id: number;
  title: string | null;
  message: string | null;
  readStatus: boolean;
  scheduleTime: string | null;
  deliveryStatus: 'PENDING' | 'SENT';
  createdAt: string;
  topic: NotificationTopic;
  notificationId: number | null;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatar: string | null;
  joinDate: string;
  lastLogin: string;
  status: string;
}

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null); const [activities, setActivities] = useState<UserActivity[]>([]);
  const [totalActivities, setTotalActivities] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  
  const authData = localStorage.getItem("authData") ? JSON.parse(localStorage.getItem("authData")!) : null;
  const userId = authData?.id;

  // API endpoint
  const PROFILE_API = `${process.env.REACT_APP_SERVER_HOST}/api/account`;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        const response = await fetch(`${PROFILE_API}/${userId}/admin`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const result = await response.json();

        // Map API response to user object
        const userData = {
          id: result.data.id.toString(),
          name: result.data.fullname,
          email: result.data.email,
          phone: result.data.phone,
          role: result.data.role,
          department: (() => {
            switch (result.data.roleId) {
              case 1: return 'Quản trị hệ thống';
              case 2: return 'Người dùng';
              case 3: return 'Giảng viên';
              case 4: return 'Người dùng VIP';
              case 5: return 'Sinh viên HUIT';
              default: return 'Không xác định';
            }
          })(),
          avatar: result.data.image,
          joinDate: new Date(result.data.createdAt).toLocaleDateString('vi-VN'),
          lastLogin: new Date(result.data.lastLogin).toLocaleString('vi-VN'),
          status: result.data.status
        };          // Notifications are now fetched separately

        setUser(userData);        // Notifications are fetched separately

        form.setFieldsValue({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          department: userData.department,
        });

        setLoading(false);
      } catch (error) {
        message.error('Failed to fetch user data');
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  // Fetch activities
  const fetchActivities = async (page: number) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const decodedToken = jwtDecode(token!) as JwtPayload;
      const userId = decodedToken.AccountId || 1;
      if (!userId) {
        message.error('Không tìm thấy thông tin người dùng');
        return;
      }
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/activity/account/${userId}?page=${page - 1}&size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const result = await response.json();
      setActivities(result.data.content);
      setTotalActivities(result.data.totalElements);
      setCurrentPage(page);
    } catch (error) {
      message.error('Failed to fetch activity history');
      console.error('Error fetching activities:', error);
    }
  };

  // Initial activities fetch
  useEffect(() => {
    fetchActivities(1);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const decodedToken = jwtDecode(token!) as JwtPayload;
      const userId = decodedToken.AccountId || 1;

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/user-notifications/account/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();
      setNotifications(result.data.content);
      setUnreadCount(result.data.content.filter((n: Notification) => !n.readStatus).length);
    } catch (error) {
      message.error('Failed to fetch notifications');
      console.error('Error fetching notifications:', error);
    }
  };

  // Initial notifications fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleUpdateProfile = (values: any) => {
    console.log('Updated profile:', values);
    message.success('Cập nhật thông tin thành công');
  };

  const handleChangePassword = (values: any) => {
    console.log('Change password:', values);
    passwordForm.resetFields();
    message.success('Đổi mật khẩu thành công');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    message.success('Đã đánh dấu tất cả thông báo là đã đọc');
  };
  const getNotificationCategory = (topic: NotificationTopic): string => {
    switch (topic) {
      case 'REGISTER':
        return 'ĐĂNG KÝ TÀI KHOẢN';
      case 'PASSWORD':
        return 'ĐỔI MẬT KHẨU';
      case 'VOUCHER':
        return 'MÃ GIẢM GIÁ';
      case 'PAYMENT':
        return 'THANH TOÁN';
      case 'SYSTEM':
        return 'HỆ THỐNG';
      case 'GENERAL':
        return 'THÔNG BÁO CHUNG';
      case 'ENROLL_COURSE':
        return 'ĐĂNG KÝ KHÓA HỌC';
      case 'ENROLL_EXAM':
        return 'ĐĂNG KÝ BÀI KIỂM TRA';
      case 'ENROLL_COMBO':
        return 'ĐĂNG KÝ COMBO';
      case 'LEARNING':
        return 'HỌC TẬP';
      case 'CHAT':
        return 'TRAO ĐỔI';
      default:
        return 'Không xác định';
    }
  };

  const getNotificationIcon = (topic: NotificationTopic) => {
    switch (topic) {
      case 'REGISTER':
      case 'PASSWORD':
        return <Badge status="processing" />;
      case 'VOUCHER':
      case 'PAYMENT':
        return <Badge status="success" />;
      case 'SYSTEM':
      case 'GENERAL':
        return <Badge status="warning" />;
      case 'ENROLL_COURSE':
      case 'ENROLL_EXAM':
      case 'ENROLL_COMBO':
      case 'LEARNING':
        return <Badge status="error" />;
      case 'CHAT':
        return <Badge status="default" color="#1890ff" />;
      default:
        return <Badge status="default" />;
    }
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: false,
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} tải lên thành công`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} tải lên thất bại.`);
      }
    },
  };
  const activityColumns = [
    {
      title: 'Loại hoạt động',
      dataIndex: 'activityType',
      key: 'activityType',
      render: (text: string) => {
        const activityTypes: Record<string, string> = {
          LOGIN: 'Đăng nhập',
          LOGOUT: 'Đăng xuất',
          UPDATE_PROFILE: 'Cập nhật thông tin',
          CHANGE_PASSWORD: 'Đổi mật khẩu',
          // Add more activity types as needed
        };
        return activityTypes[text] || text;
      }
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => new Date(text).toLocaleString('vi-VN'),
    },
  ];

  if (loading) {
    return <div>Đang tải thông tin...</div>;
  }

  return (
    <div>
      <Title level={2}>Thông tin cá nhân</Title>

      <Tabs defaultActiveKey="info">
        <TabPane tab="Thông tin cá nhân" key="info">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              {user ? (
                <Card style={{ textAlign: 'center' }}>
                  <Avatar
                    size={120}
                    src={user.avatar}
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
                  />
                  <Title level={4}>{user.name}</Title>
                  <Text type="secondary">{user.role}</Text>

                  <div style={{ marginTop: 16 }}>
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>Thay đổi ảnh đại diện</Button>
                    </Upload>
                  </div>

                  <div style={{ marginTop: 24, textAlign: 'left' }}>
                    <p>
                      <MailOutlined style={{ marginRight: 8 }} />
                      {user.email}
                    </p>
                    <p>
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      {user.phone}
                    </p>
                    <p>
                      <IdcardOutlined style={{ marginRight: 8 }} />
                      {user.department}
                    </p>
                    <p>
                      <UserOutlined style={{ marginRight: 8 }} />
                      Tham gia từ: {user.joinDate}
                    </p>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: 16 }}>Đang tải thông tin...</p>
                  </div>
                </Card>
              )}
            </Col>

            <Col xs={24} md={16}>
              <Card title="Chỉnh sửa thông tin">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleUpdateProfile}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          { required: true, message: 'Vui lòng nhập email!' },
                          { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="department"
                        label="Phòng ban"
                        rules={[{ required: true, message: 'Vui lòng nhập phòng ban!' }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Cập nhật thông tin
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <Card title="Đổi mật khẩu" style={{ marginTop: 24 }}>
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handleChangePassword}
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                      >
                        <Input.Password prefix={<LockOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                          { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                          { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['newPassword']}
                        rules={[
                          { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password prefix={<LockOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Đổi mật khẩu
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Nhật ký hoạt động" key="activities">
          <Card>            <Table
            columns={activityColumns}
            dataSource={activities}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalActivities,
              onChange: (page) => fetchActivities(page),
            }}
          />
          </Card>
        </TabPane>

        <TabPane tab={
          <span>
            Thông báo {unreadCount > 0 && <Badge count={unreadCount} style={{ marginLeft: 8 }} />}
          </span>
        } key="notifications">
          <Card
            title="Thông báo của bạn"
            extra={
              unreadCount > 0 && (
                <Button type="link" onClick={markAllAsRead}>
                  Đánh dấu tất cả là đã đọc
                </Button>
              )
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="link" key="list-more">
                      Chi tiết
                    </Button>
                  ]}
                >
                  <List.Item.Meta avatar={getNotificationIcon(item.topic)}
                    title={
                      <Space>                        <span style={{ fontWeight: item.readStatus ? 'normal' : 'bold' }}>
                        {item.title || getNotificationCategory(item.topic)}
                      </span>
                        {!item.readStatus && <Tag color="blue">Mới</Tag>}
                      </Space>
                    }
                    description={
                      <div>
                        <div>{item.message || 'Không có nội dung'}</div>
                        <div style={{ marginTop: 4, color: '#999' }}>
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfilePage;