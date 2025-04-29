import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Tag, Input, Select,
  Popconfirm, message, Modal, Form, Row, Col, Tabs, Badge,
  Tooltip, Avatar, Divider, DatePicker, Statistic
} from 'antd';
import {
  UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  SearchOutlined, FilterOutlined, ExportOutlined, ImportOutlined,
  MailOutlined, PhoneOutlined, BellOutlined, CheckCircleOutlined,
  CloseCircleOutlined, UserAddOutlined, UsergroupAddOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface Student {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  enrollmentDate: string;
  enrolledCourses: number;
  completedCourses: number;
  totalPayments: number;
  lastActivity: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  address?: string;
  note?: string;
}

const StudentsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();

  // Giả lập tải dữ liệu
  useEffect(() => {
    setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  }, []);

  // Dữ liệu giả
  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      status: 'active',
      enrollmentDate: '2023-01-15',
      enrolledCourses: 3,
      completedCourses: 1,
      totalPayments: 3500000,
      lastActivity: '2023-10-20',
      gender: 'male',
      birthDate: '1995-05-10',
      address: 'Quận 1, TP. Hồ Chí Minh',
      note: 'Sinh viên năm nhất ngành CNTT'
    },
    {
      id: '2',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0912345678',
      status: 'active',
      enrollmentDate: '2023-02-20',
      enrolledCourses: 2,
      completedCourses: 2,
      totalPayments: 2800000,
      lastActivity: '2023-10-18',
      gender: 'female',
      birthDate: '1997-08-15',
      address: 'Quận 7, TP. Hồ Chí Minh'
    },
    {
      id: '3',
      name: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0923456789',
      status: 'inactive',
      enrollmentDate: '2023-03-05',
      enrolledCourses: 1,
      completedCourses: 0,
      totalPayments: 1500000,
      lastActivity: '2023-06-10',
      gender: 'male'
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phone: '0934567890',
      status: 'pending',
      enrollmentDate: '2023-10-10',
      enrolledCourses: 1,
      completedCourses: 0,
      totalPayments: 1200000,
      lastActivity: '2023-10-15',
      gender: 'female'
    },
    {
      id: '5',
      name: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      phone: '0945678901',
      status: 'active',
      enrollmentDate: '2023-04-15',
      enrolledCourses: 4,
      completedCourses: 3,
      totalPayments: 4500000,
      lastActivity: '2023-10-19',
      gender: 'male'
    },
    {
      id: '6',
      name: 'Ngô Thị F',
      email: 'ngothif@example.com',
      phone: '0956789012',
      status: 'active',
      enrollmentDate: '2023-05-22',
      enrolledCourses: 2,
      completedCourses: 1,
      totalPayments: 2200000,
      lastActivity: '2023-10-17',
      gender: 'female'
    }
  ];

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const showEditModal = (student: Student) => {
    setCurrentStudent(student);
    form.setFieldsValue({
      name: student.name,
      email: student.email,
      phone: student.phone,
      status: student.status,
      gender: student.gender,
      birthDate: student.birthDate ? new Date(student.birthDate) : undefined,
      address: student.address || '',
      note: student.note || ''
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentStudent(null);
    form.resetFields();
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      message.success(`Đã cập nhật thông tin học viên ${values.name}`);
      setIsModalVisible(false);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleDelete = (id: string) => {
    setStudents(students.filter(student => student.id !== id));
    message.success('Xóa học viên thành công');
  };

  const getStatusTag = (status: string) => {
    switch(status) {
      case 'active':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đang học</Tag>;
      case 'inactive':
        return <Tag icon={<CloseCircleOutlined />} color="error">Ngừng học</Tag>;
      case 'pending':
        return <Tag icon={<BellOutlined />} color="warning">Chờ xác nhận</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const columns: ColumnsType<Student> = [
    {
      title: 'Học viên',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.avatar}
            icon={!record.avatar && <UserOutlined />}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined style={{ marginRight: 5 }} />{record.email}
            </Text>
          </Space>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          <span>{phone}</span>
        </Space>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
      sorter: (a, b) => new Date(a.enrollmentDate).getTime() - new Date(b.enrollmentDate).getTime(),
    },
    {
      title: 'Khóa học',
      key: 'courses',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.enrolledCourses} khóa học</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Đã hoàn thành: {record.completedCourses}
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.enrolledCourses - b.enrolledCourses,
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'totalPayments',
      key: 'totalPayments',
      render: (amount) => (
        <Text>{amount.toLocaleString()}đ</Text>
      ),
      sorter: (a, b) => a.totalPayments - b.totalPayments,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đang học', value: 'active' },
        { text: 'Ngừng học', value: 'inactive' },
        { text: 'Chờ xác nhận', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hoạt động cuối',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
      sorter: (a, b) => new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa thông tin">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => showEditModal(record)} 
            />
          </Tooltip>
          <Tooltip title="Xóa học viên">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa học viên này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger 
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredStudents = students.filter(student => {
    if (activeTab !== 'all' && student.status !== activeTab) {
      return false;
    }
    
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.phone.includes(searchText)
      );
    }
    
    return true;
  });

  // Thống kê
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const pendingStudents = students.filter(s => s.status === 'pending').length;
  const inactiveStudents = students.filter(s => s.status === 'inactive').length;
  const totalRevenue = students.reduce((sum, student) => sum + student.totalPayments, 0);
  const newStudentsThisMonth = students.filter(s => {
    const enrollmentDate = new Date(s.enrollmentDate);
    const now = new Date();
    return enrollmentDate.getMonth() === now.getMonth() && 
           enrollmentDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div>
      <Title level={2}>Quản lý học viên</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số học viên"
              value={totalStudents}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Học viên mới tháng này"
              value={newStudentsThisMonth}
              valueStyle={{ color: '#52c41a' }}
              prefix={<UserAddOutlined />}
              suffix={`/${totalStudents}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Học viên đang học"
              value={activeStudents}
              valueStyle={{ color: '#722ed1' }}
              prefix={<CheckCircleOutlined />}
              suffix={<small style={{ fontSize: '15px', marginLeft: '8px' }}>({((activeStudents / totalStudents) * 100).toFixed(0)}%)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              valueStyle={{ color: '#cf1322' }}
              suffix="đ"
              formatter={(value) => `${value.toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button type="primary" icon={<PlusOutlined />}>
                Thêm học viên
              </Button>
              <Button icon={<ExportOutlined />} disabled={selectedRowKeys.length === 0}>
                Xuất ({selectedRowKeys.length})
              </Button>
              <Button icon={<ImportOutlined />}>
                Nhập dữ liệu
              </Button>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm học viên..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Button icon={<FilterOutlined />}>
                Lọc
              </Button>
              <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab={<span>Tất cả</span>} key="all" />
            <TabPane 
              tab={
                <Badge count={activeStudents} showZero>
                  <span>Đang học</span>
                </Badge>
              } 
              key="active"
            />
            <TabPane 
              tab={
                <Badge count={pendingStudents} showZero>
                  <span>Chờ xác nhận</span>
                </Badge>
              } 
              key="pending"
            />
            <TabPane 
              tab={
                <Badge count={inactiveStudents} showZero>
                  <span>Ngừng học</span>
                </Badge>
              } 
              key="inactive"
            />
          </Tabs>

          <Table
            columns={columns}
            dataSource={filteredStudents}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} học viên`
            }}
          />
        </Space>
      </Card>

      <Modal
        title="Thông tin học viên"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy bỏ
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            Lưu thay đổi
          </Button>,
        ]}
        width={700}
      >
        {currentStudent && (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              name: currentStudent.name,
              email: currentStudent.email,
              phone: currentStudent.phone,
              status: currentStudent.status,
              gender: currentStudent.gender,
              birthDate: currentStudent.birthDate,
              address: currentStudent.address || '',
              note: currentStudent.note || ''
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Họ tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không hợp lệ' }
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
                  rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                >
                  <Select>
                    <Option value="active">Đang học</Option>
                    <Option value="inactive">Ngừng học</Option>
                    <Option value="pending">Chờ xác nhận</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                >
                  <Select>
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                    <Option value="other">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="birthDate"
                  label="Ngày sinh"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="address"
              label="Địa chỉ"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="note"
              label="Ghi chú"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default StudentsPage; 