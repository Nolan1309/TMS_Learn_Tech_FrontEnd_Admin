import React, { useState, useEffect } from 'react';
import { Typography, Card, Tabs, Form, Input, Switch, Button, Select, Upload, message, Space, Radio, Divider, Collapse, Row, Col } from 'antd';
import { UploadOutlined, SaveOutlined, GlobalOutlined, NotificationOutlined, UserOutlined, LockOutlined, MailOutlined, BellOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [generalForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [emailForm] = Form.useForm();

  useEffect(() => {
    // Giả lập tải dữ liệu
    setTimeout(() => {
      setLoading(false);
      
      // Điền dữ liệu giả lập vào các form
      generalForm.setFieldsValue({
        siteName: 'CRM Hỗ Trợ Học Tập',
        siteDescription: 'Hệ thống quản lý khóa học và học viên',
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        enableRegistration: true,
        maintenanceMode: false,
        pageSize: 10,
        maxUploadSize: 20,
      });

      notificationForm.setFieldsValue({
        emailNotification: true,
        pushNotification: true,
        smsNotification: false,
        weeklyReport: true,
        newUserAlert: true,
        paymentAlert: true,
        courseCompletionAlert: true,
      });

      securityForm.setFieldsValue({
        requireStrongPassword: true,
        passwordExpiration: 90,
        maxLoginAttempts: 5,
        twoFactorAuth: false,
        sessionTimeout: 30,
      });

      emailForm.setFieldsValue({
        smtpServer: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: 'system@hotro.edu.vn',
        smtpPassword: '******',
        senderName: 'Hệ thống Hỗ trợ học tập',
        senderEmail: 'system@hotro.edu.vn',
        emailFooter: 'Đây là email tự động, vui lòng không trả lời email này.',
      });
    }, 1000);
  }, [generalForm, notificationForm, securityForm, emailForm]);

  const onGeneralFinish = (values: any) => {
    console.log('General settings values:', values);
    message.success('Đã lưu thiết lập chung thành công!');
  };

  const onNotificationFinish = (values: any) => {
    console.log('Notification settings values:', values);
    message.success('Đã lưu thiết lập thông báo thành công!');
  };

  const onSecurityFinish = (values: any) => {
    console.log('Security settings values:', values);
    message.success('Đã lưu thiết lập bảo mật thành công!');
  };

  const onEmailFinish = (values: any) => {
    console.log('Email settings values:', values);
    message.success('Đã lưu thiết lập email thành công!');
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div>
      <Title level={2}>Cài đặt hệ thống</Title>
      <Paragraph>Quản lý các thiết lập cho hệ thống CRM Hỗ Trợ Học Tập</Paragraph>

      <Tabs defaultActiveKey="general">
        <TabPane 
          tab={
            <span>
              <GlobalOutlined />
              Thiết lập chung
            </span>
          } 
          key="general"
        >
          <Card loading={loading}>
            <Form
              form={generalForm}
              layout="vertical"
              onFinish={onGeneralFinish}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tên hệ thống"
                    name="siteName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên hệ thống!' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Mô tả hệ thống"
                    name="siteDescription"
                  >
                    <Input.TextArea rows={1} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Ngôn ngữ mặc định"
                    name="language"
                    rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ!' }]}
                  >
                    <Select>
                      <Option value="vi">Tiếng Việt</Option>
                      <Option value="en">Tiếng Anh</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Múi giờ"
                    name="timezone"
                    rules={[{ required: true, message: 'Vui lòng chọn múi giờ!' }]}
                  >
                    <Select>
                      <Option value="Asia/Ho_Chi_Minh">Hồ Chí Minh (GMT+7)</Option>
                      <Option value="Asia/Bangkok">Bangkok (GMT+7)</Option>
                      <Option value="UTC">UTC</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Logo hệ thống"
                    name="logo"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload name="logo" listType="picture" maxCount={1} action="/api/upload">
                      <Button icon={<UploadOutlined />}>Tải lên logo</Button>
                    </Upload>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Favicon"
                    name="favicon"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload name="favicon" listType="picture" maxCount={1} action="/api/upload">
                      <Button icon={<UploadOutlined />}>Tải lên favicon</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Tùy chọn hệ thống</Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Cho phép đăng ký"
                    name="enableRegistration"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label="Chế độ bảo trì"
                    name="maintenanceMode"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Số mục mỗi trang"
                    name="pageSize"
                    rules={[{ required: true, message: 'Vui lòng nhập số mục mỗi trang!' }]}
                  >
                    <Select>
                      <Option value={10}>10</Option>
                      <Option value={20}>20</Option>
                      <Option value={50}>50</Option>
                      <Option value={100}>100</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Kích thước tải lên tối đa (MB)"
                    name="maxUploadSize"
                    rules={[{ required: true, message: 'Vui lòng nhập kích thước tối đa!' }]}
                  >
                    <Select>
                      <Option value={5}>5 MB</Option>
                      <Option value={10}>10 MB</Option>
                      <Option value={20}>20 MB</Option>
                      <Option value={50}>50 MB</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Lưu thiết lập
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <NotificationOutlined />
              Thông báo
            </span>
          } 
          key="notifications"
        >
          <Card loading={loading}>
            <Form
              form={notificationForm}
              layout="vertical"
              onFinish={onNotificationFinish}
            >
              <Collapse defaultActiveKey={['1']}>
                <Panel header="Kênh thông báo" key="1">
                  <Form.Item
                    label="Thông báo qua email"
                    name="emailNotification"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Thông báo đẩy trên trình duyệt"
                    name="pushNotification"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Thông báo qua SMS"
                    name="smsNotification"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Panel>

                <Panel header="Loại thông báo" key="2">
                  <Form.Item
                    label="Báo cáo hàng tuần"
                    name="weeklyReport"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Thông báo người dùng mới"
                    name="newUserAlert"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Thông báo khi có thanh toán"
                    name="paymentAlert"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Thông báo khi hoàn thành khóa học"
                    name="courseCompletionAlert"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Panel>
              </Collapse>

              <Form.Item style={{ marginTop: 16 }}>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Lưu thiết lập
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <LockOutlined />
              Bảo mật
            </span>
          } 
          key="security"
        >
          <Card loading={loading}>
            <Form
              form={securityForm}
              layout="vertical"
              onFinish={onSecurityFinish}
            >
              <Form.Item
                label="Yêu cầu mật khẩu mạnh"
                name="requireStrongPassword"
                valuePropName="checked"
                tooltip="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Thời gian hết hạn mật khẩu (ngày)"
                name="passwordExpiration"
              >
                <Select>
                  <Option value={30}>30 ngày</Option>
                  <Option value={60}>60 ngày</Option>
                  <Option value={90}>90 ngày</Option>
                  <Option value={180}>180 ngày</Option>
                  <Option value={0}>Không bao giờ</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Số lần đăng nhập tối đa trước khi khóa"
                name="maxLoginAttempts"
              >
                <Select>
                  <Option value={3}>3 lần</Option>
                  <Option value={5}>5 lần</Option>
                  <Option value={10}>10 lần</Option>
                  <Option value={0}>Không giới hạn</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Xác thực hai yếu tố"
                name="twoFactorAuth"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label="Thời gian hết hạn phiên làm việc (phút)"
                name="sessionTimeout"
              >
                <Select>
                  <Option value={15}>15 phút</Option>
                  <Option value={30}>30 phút</Option>
                  <Option value={60}>60 phút</Option>
                  <Option value={120}>120 phút</Option>
                  <Option value={0}>Không bao giờ</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Lưu thiết lập
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <MailOutlined />
              Cấu hình Email
            </span>
          } 
          key="email"
        >
          <Card loading={loading}>
            <Form
              form={emailForm}
              layout="vertical"
              onFinish={onEmailFinish}
            >
              <Divider orientation="left">Cài đặt SMTP</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Máy chủ SMTP"
                    name="smtpServer"
                    rules={[{ required: true, message: 'Vui lòng nhập máy chủ SMTP!' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Cổng SMTP"
                    name="smtpPort"
                    rules={[{ required: true, message: 'Vui lòng nhập cổng SMTP!' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tên đăng nhập SMTP"
                    name="smtpUser"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập SMTP!' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Mật khẩu SMTP"
                    name="smtpPassword"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu SMTP!' }]}
                  >
                    <Input.Password />
                  </Form.Item>
                </Col>
              </Row>

              <Divider orientation="left">Cài đặt email</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tên người gửi"
                    name="senderName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên người gửi!' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Email người gửi"
                    name="senderEmail"
                    rules={[
                      { required: true, message: 'Vui lòng nhập email người gửi!' },
                      { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Chân trang email"
                name="emailFooter"
              >
                <Input.TextArea rows={2} />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  Lưu thiết lập
                </Button>
                <Button>
                  Gửi email kiểm tra
                </Button>
              </Space>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 