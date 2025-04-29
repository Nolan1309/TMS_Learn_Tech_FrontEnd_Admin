import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Tag, Input, Select,
  Popconfirm, message, Modal, Form, Row, Col, Tabs, Badge,
  List, Avatar, Tooltip, Radio, Checkbox, Divider, DatePicker
} from 'antd';
import {
  BellOutlined, SendOutlined, DeleteOutlined, EditOutlined,
  EyeOutlined, FilterOutlined, InfoCircleOutlined, UserOutlined,
  TeamOutlined, PlusOutlined, SearchOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import TextArea from 'antd/lib/input/TextArea';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Group: RadioGroup } = Radio;
const { Group: CheckboxGroup } = Checkbox;

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: 'all' | 'individual' | 'group';
  status: 'draft' | 'sent' | 'scheduled';
  recipients?: { id: string; name: string }[];
  recipientType?: 'all' | 'students' | 'teachers' | 'specific';
  recipientCount: number;
  readCount: number;
  sendDate: string;
  createdAt: string;
  createdBy: string;
  priority: 'normal' | 'high' | 'urgent';
}

const Notifications: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentNotification, setCurrentNotification] = useState<NotificationItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  // Giả lập dữ liệu
  const mockNotifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Thông báo bảo trì hệ thống',
      content: 'Hệ thống sẽ bảo trì từ 23:00 ngày 30/10/2023 đến 01:00 ngày 31/10/2023.',
      type: 'all',
      status: 'sent',
      recipientCount: 1200,
      readCount: 850,
      sendDate: '2023-10-29T09:00:00',
      createdAt: '2023-10-28T15:30:00',
      createdBy: 'Admin',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Cập nhật khóa học mới',
      content: 'Chúng tôi vừa cập nhật thêm 5 khóa học mới về lập trình web, mời bạn tham khảo.',
      type: 'individual',
      status: 'sent',
      recipientType: 'students',
      recipientCount: 450,
      readCount: 280,
      sendDate: '2023-10-25T14:30:00',
      createdAt: '2023-10-25T10:15:00',
      createdBy: 'Marketing',
      priority: 'normal'
    },
    {
      id: '3',
      title: 'Nhắc nhở nộp bài tập',
      content: 'Nhắc nhở học viên nộp bài tập trước 23:59 ngày 31/10/2023.',
      type: 'group',
      status: 'scheduled',
      recipientType: 'specific',
      recipients: [
        { id: 'G001', name: 'Lớp Toán cao cấp' },
        { id: 'G002', name: 'Lớp Tiếng Anh IELTS' }
      ],
      recipientCount: 120,
      readCount: 0,
      sendDate: '2023-10-31T08:00:00',
      createdAt: '2023-10-27T16:45:00',
      createdBy: 'Teacher',
      priority: 'urgent'
    },
    {
      id: '4',
      title: 'Thông báo lịch học thay đổi',
      content: 'Lịch học ngày 02/11/2023 được dời sang ngày 03/11/2023.',
      type: 'group',
      status: 'draft',
      recipientType: 'teachers',
      recipientCount: 25,
      readCount: 0,
      sendDate: '',
      createdAt: '2023-10-30T09:20:00',
      createdBy: 'Admin',
      priority: 'high'
    },
    {
      id: '5',
      title: 'Chương trình ưu đãi tháng 11',
      content: 'Giảm 20% tất cả khóa học trong tháng 11/2023. Đăng ký ngay!',
      type: 'all',
      status: 'scheduled',
      recipientCount: 1200,
      readCount: 0,
      sendDate: '2023-11-01T07:00:00',
      createdAt: '2023-10-29T13:10:00',
      createdBy: 'Marketing',
      priority: 'normal'
    }
  ];

  // Tải dữ liệu
  useEffect(() => {
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  // Xử lý hiển thị modal
  const showModal = (notification?: NotificationItem) => {
    if (notification) {
      setCurrentNotification(notification);
      form.setFieldsValue({
        title: notification.title,
        content: notification.content,
        type: notification.type,
        recipientType: notification.recipientType || 'all',
        priority: notification.priority,
        sendNow: notification.status === 'sent'
      });
    } else {
      setCurrentNotification(null);
      form.resetFields();
      form.setFieldsValue({
        type: 'all',
        recipientType: 'all',
        priority: 'normal',
        sendNow: true
      });
    }
    setIsModalVisible(true);
  };

  // Xử lý đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentNotification(null);
    form.resetFields();
  };

  // Xử lý lưu thông báo
  const handleSave = () => {
    form.validateFields().then(values => {
      const sendNow = values.sendNow;
      const status = sendNow ? 'sent' : (values.sendDate ? 'scheduled' : 'draft');
      
      const newNotification: NotificationItem = {
        id: currentNotification ? currentNotification.id : `${notifications.length + 1}`,
        title: values.title,
        content: values.content,
        type: values.type,
        status: status,
        recipientType: values.type !== 'all' ? values.recipientType : undefined,
        recipients: currentNotification?.recipients,
        recipientCount: currentNotification?.recipientCount || (values.type === 'all' ? 1200 : 0),
        readCount: currentNotification?.readCount || 0,
        sendDate: sendNow ? new Date().toISOString() : (values.sendDate?.toISOString() || ''),
        createdAt: currentNotification ? currentNotification.createdAt : new Date().toISOString(),
        createdBy: 'Admin',
        priority: values.priority
      };

      if (currentNotification) {
        // Cập nhật thông báo
        setNotifications(notifications.map(item => 
          item.id === currentNotification.id ? newNotification : item
        ));
        message.success('Cập nhật thông báo thành công!');
      } else {
        // Tạo thông báo mới
        setNotifications([...notifications, newNotification]);
        message.success(sendNow ? 'Đã gửi thông báo thành công!' : 'Đã lưu thông báo thành công!');
      }
      
      setIsModalVisible(false);
      setCurrentNotification(null);
      form.resetFields();
    });
  };

  // Xử lý gửi thông báo nháp
  const handleSendDraft = (id: string) => {
    setNotifications(notifications.map(item => {
      if (item.id === id) {
        return { ...item, status: 'sent', sendDate: new Date().toISOString() };
      }
      return item;
    }));
    
    message.success('Đã gửi thông báo thành công!');
  };

  // Xử lý xóa thông báo
  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(item => item.id !== id));
    message.success('Đã xóa thông báo thành công!');
  };

  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Xử lý chọn nhiều hàng
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Xử lý thay đổi tab
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // Lọc dữ liệu theo các điều kiện
  const filteredNotifications = notifications.filter(notification => {
    // Lọc theo tab
    if (activeTab === 'sent' && notification.status !== 'sent') {
      return false;
    } else if (activeTab === 'scheduled' && notification.status !== 'scheduled') {
      return false;
    } else if (activeTab === 'draft' && notification.status !== 'draft') {
      return false;
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      const searchKeyword = searchText.toLowerCase();
      return (
        notification.title.toLowerCase().includes(searchKeyword) ||
        notification.content.toLowerCase().includes(searchKeyword)
      );
    }

    return true;
  });

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<NotificationItem> = [
    {
      title: 'Tiêu đề',
      key: 'title',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.title}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.content.length > 50 ? `${record.content.substring(0, 50)}...` : record.content}
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
      width: '30%',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        if (type === 'all') {
          return <Tag color="blue">Toàn bộ</Tag>;
        } else if (type === 'individual') {
          return <Tag color="green">Cá nhân</Tag>;
        } else {
          return <Tag color="orange">Nhóm</Tag>;
        }
      },
      filters: [
        { text: 'Toàn bộ', value: 'all' },
        { text: 'Cá nhân', value: 'individual' },
        { text: 'Nhóm', value: 'group' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (record.status === 'sent') {
          return <Badge status="success" text="Đã gửi" />;
        } else if (record.status === 'scheduled') {
          return <Badge status="processing" text="Đã lên lịch" />;
        } else {
          return <Badge status="default" text="Bản nháp" />;
        }
      },
      filters: [
        { text: 'Đã gửi', value: 'sent' },
        { text: 'Đã lên lịch', value: 'scheduled' },
        { text: 'Bản nháp', value: 'draft' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        if (priority === 'normal') {
          return <Tag color="blue">Bình thường</Tag>;
        } else if (priority === 'high') {
          return <Tag color="orange">Cao</Tag>;
        } else {
          return <Tag color="red">Khẩn cấp</Tag>;
        }
      },
      filters: [
        { text: 'Bình thường', value: 'normal' },
        { text: 'Cao', value: 'high' },
        { text: 'Khẩn cấp', value: 'urgent' },
      ],
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: 'Người nhận',
      key: 'recipients',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.type === 'all' ? (
            <Text>Tất cả người dùng</Text>
          ) : record.recipientType === 'students' ? (
            <Text>Tất cả học viên</Text>
          ) : record.recipientType === 'teachers' ? (
            <Text>Tất cả giáo viên</Text>
          ) : record.recipients ? (
            <Text>{record.recipients.map(r => r.name).join(', ')}</Text>
          ) : (
            <Text>-</Text>
          )}
          {record.status === 'sent' && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Đã đọc: {record.readCount}/{record.recipientCount}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.status === 'draft' ? (
            <Text>Chưa gửi</Text>
          ) : record.status === 'scheduled' ? (
            <>
              <Text>Sẽ gửi lúc:</Text>
              <Text>{new Date(record.sendDate).toLocaleString('vi-VN')}</Text>
            </>
          ) : (
            <>
              <Text>Đã gửi lúc:</Text>
              <Text>{new Date(record.sendDate).toLocaleString('vi-VN')}</Text>
            </>
          )}
        </Space>
      ),
      sorter: (a, b) => {
        if (a.status === 'draft') return 1;
        if (b.status === 'draft') return -1;
        return new Date(a.sendDate).getTime() - new Date(b.sendDate).getTime();
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => showModal(record)} />
          </Tooltip>
          {record.status === 'draft' && (
            <Tooltip title="Gửi ngay">
              <Button 
                icon={<SendOutlined />} 
                size="small" 
                type="primary"
                onClick={() => handleSendDraft(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa thông báo này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Cấu hình chọn nhiều hàng
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div>
      <Title level={2}>Quản lý thông báo</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showModal()}
              >
                Tạo thông báo
              </Button>
              <Button 
                icon={<DeleteOutlined />} 
                disabled={selectedRowKeys.length === 0}
                danger
              >
                Xóa ({selectedRowKeys.length})
              </Button>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm thông báo..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select
                defaultValue="all"
                style={{ width: 180 }}
              >
                <Option value="all">Tất cả đối tượng</Option>
                <Option value="students">Học viên</Option>
                <Option value="teachers">Giáo viên</Option>
                <Option value="specific">Nhóm cụ thể</Option>
              </Select>
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab="Tất cả" key="all" />
            <TabPane tab="Đã gửi" key="sent" />
            <TabPane tab="Đã lên lịch" key="scheduled" />
            <TabPane tab="Bản nháp" key="draft" />
          </Tabs>

          <Table
            columns={columns}
            dataSource={filteredNotifications}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thông báo`
            }}
          />
        </Space>
      </Card>

      {/* Modal thêm/sửa thông báo */}
      <Modal
        title={currentNotification ? "Chi tiết thông báo" : "Tạo thông báo mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            {currentNotification 
              ? (currentNotification.status === 'draft' ? "Cập nhật" : "Lưu thay đổi") 
              : "Gửi thông báo"}
          </Button>,
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tiêu đề thông báo"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề thông báo' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="content"
                label="Nội dung"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung thông báo' }]}
              >
                <TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại thông báo"
                rules={[{ required: true, message: 'Vui lòng chọn loại thông báo' }]}
              >
                <RadioGroup>
                  <Radio value="all">Toàn bộ</Radio>
                  <Radio value="individual">Cá nhân</Radio>
                  <Radio value="group">Nhóm</Radio>
                </RadioGroup>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
              >
                <RadioGroup>
                  <Radio value="normal">Bình thường</Radio>
                  <Radio value="high">Cao</Radio>
                  <Radio value="urgent">Khẩn cấp</Radio>
                </RadioGroup>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              return type !== 'all' ? (
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="recipientType"
                      label="Đối tượng nhận"
                      rules={[{ required: true, message: 'Vui lòng chọn đối tượng nhận' }]}
                    >
                      <RadioGroup>
                        <Radio value="all">Tất cả người dùng</Radio>
                        <Radio value="students">Tất cả học viên</Radio>
                        <Radio value="teachers">Tất cả giáo viên</Radio>
                        <Radio value="specific">Chọn nhóm cụ thể</Radio>
                      </RadioGroup>
                    </Form.Item>
                  </Col>
                </Row>
              ) : null;
            }}
          </Form.Item>
          <Divider />
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="sendNow"
                valuePropName="checked"
                initialValue={true}
              >
                <Checkbox>Gửi ngay</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.sendNow !== currentValues.sendNow}
          >
            {({ getFieldValue }) => {
              const sendNow = getFieldValue('sendNow');
              return !sendNow ? (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="sendDate"
                      label="Thời gian gửi"
                      rules={[{ required: true, message: 'Vui lòng chọn thời gian gửi' }]}
                    >
                      <DatePicker 
                        showTime 
                        style={{ width: '100%' }} 
                        placeholder="Chọn thời gian gửi"
                        format="DD/MM/YYYY HH:mm"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Notifications; 