import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Form, Input, Button, Row, Col, Tabs, Table, List, Tag, message, Upload, Badge, Space } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, IdcardOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UserActivity {
  id: string;
  action: string;
  ip: string;
  device: string;
  time: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'system' | 'course' | 'exam' | 'payment';
}

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Giả lập lấy dữ liệu người dùng
  useEffect(() => {
    setTimeout(() => {
      const mockUser = {
        id: '1',
        name: 'Nguyễn Văn Admin',
        email: 'admin@example.com',
        phone: '0912345678',
        role: 'Administrator',
        department: 'Quản trị hệ thống',
        avatar: null,
        joinDate: '2022-05-15',
        lastLogin: '2023-06-20 08:45:22',
      };

      const mockActivities: UserActivity[] = [
        {
          id: '1',
          action: 'Đăng nhập vào hệ thống',
          ip: '192.168.1.1',
          device: 'Chrome trên Windows',
          time: '2023-06-20 08:45:22',
        },
        {
          id: '2',
          action: 'Thêm tài liệu mới',
          ip: '192.168.1.1',
          device: 'Chrome trên Windows',
          time: '2023-06-19 15:32:18',
        },
        {
          id: '3',
          action: 'Cập nhật khóa học',
          ip: '192.168.1.1',
          device: 'Chrome trên Windows',
          time: '2023-06-18 11:20:05',
        },
        {
          id: '4',
          action: 'Xóa câu hỏi',
          ip: '192.168.1.1',
          device: 'Chrome trên Windows',
          time: '2023-06-17 09:15:40',
        },
        {
          id: '5',
          action: 'Đăng nhập vào hệ thống',
          ip: '42.113.45.78',
          device: 'Safari trên Mac',
          time: '2023-06-15 14:05:12',
        },
      ];

      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Bạn có 3 đề xuất cần duyệt',
          description: 'Hệ thống đang có 3 đề xuất cần bạn xử lý',
          time: '2 giờ trước',
          read: false,
          type: 'system',
        },
        {
          id: '2',
          title: 'Có 5 học viên mới đăng ký',
          description: 'Có 5 học viên mới đăng ký khóa học IELTS',
          time: '1 ngày trước',
          read: false,
          type: 'course',
        },
        {
          id: '3',
          title: 'Báo cáo doanh thu tháng đã được cập nhật',
          description: 'Báo cáo doanh thu tháng 6/2023 đã được cập nhật',
          time: '2 ngày trước',
          read: true,
          type: 'payment',
        },
        {
          id: '4',
          title: 'Bài kiểm tra mới được tạo',
          description: 'Giáo viên Nguyễn Văn A đã tạo bài kiểm tra mới cho khóa học Toán lớp 12',
          time: '3 ngày trước',
          read: true,
          type: 'exam',
        },
      ];

      setUser(mockUser);
      setActivities(mockActivities);
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);

      form.setFieldsValue({
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        department: mockUser.department,
      });

      setLoading(false);
    }, 1000);
  }, [form]);

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <Badge status="processing" />;
      case 'course':
        return <Badge status="success" />;
      case 'exam':
        return <Badge status="warning" />;
      case 'payment':
        return <Badge status="error" />;
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
      title: 'Hoạt động',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Thiết bị',
      dataIndex: 'device',
      key: 'device',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
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
              <Card style={{ textAlign: 'center' }}>
                <Avatar 
                  size={120} 
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
          <Card>
            <Table 
              columns={activityColumns} 
              dataSource={activities} 
              rowKey="id"
              pagination={{ pageSize: 10 }}
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
                  <List.Item.Meta
                    avatar={getNotificationIcon(item.type)}
                    title={
                      <Space>
                        <span style={{ fontWeight: item.read ? 'normal' : 'bold' }}>
                          {item.title}
                        </span>
                        {!item.read && <Tag color="blue">Mới</Tag>}
                      </Space>
                    }
                    description={
                      <div>
                        <div>{item.description}</div>
                        <div style={{ marginTop: 4, color: '#999' }}>{item.time}</div>
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