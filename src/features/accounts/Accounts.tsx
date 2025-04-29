import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Tag, Input, Select,
  Popconfirm, message, Modal, Form, Row, Col, Tabs, Avatar,
  Tooltip, Switch, Divider, Dropdown, Menu, DatePicker
} from 'antd';
import {
  UserOutlined, EditOutlined, DeleteOutlined, LockOutlined,
  UnlockOutlined, PlusOutlined, SearchOutlined, FilterOutlined,
  MoreOutlined, MailOutlined, PhoneOutlined, TeamOutlined,
  UserAddOutlined, ExportOutlined, ImportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils/auth';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface User {
  id: string | number;
  name: string;
  fullname?: string;
  email: string;
  phone: string | null;
  roleId: string | number;
  role: 'ADMIN' | 'TEACHER' | 'USERVIP' | 'USER' | "HUITSTUDENT";
  status: 'ACTIVE' | 'LOCKED';
  image?: string | null;
  lastLogin?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

interface FetchParams {
  page: number;
  pageSize: number;
  fullname?: string;
  status?: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: {
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    pageable: {
      pageNumber: number;
      pageSize: number;
      sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
      };
      offset: number;
      paged: boolean;
      unpaged: boolean;
    };
    size: number;
    content: any[];
    number: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    empty: boolean;
  };
}

// Role mapping
const roleOptions = [
  { id: '1', name: 'ADMIN', label: 'Quản trị viên' },
  { id: '2', name: 'USER', label: 'Học viên' },
  { id: '3', name: 'TEACHER', label: 'Giáo viên' },
  { id: '4', name: 'USERVIP', label: 'Học Viên VIP' },
  { id: '5', name: 'HUITSTUDENT', label: 'Học viên HUIT' }
];


const AccountsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 0,
    pageSize: 10,
    total: 0
  });
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");

  const fetchAccounts = async (params: FetchParams) => {
    setLoading(true);
    try {
      // Get token from localStorage
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      if (!token) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('size', params.pageSize.toString());

      if (params.fullname) {
        queryParams.append('fullname', params.fullname);
      }

      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }

      const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/account?${queryParams.toString()}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Transform the data to match our User interface
      const transformedUsers: User[] = data.data.content.map((user: any) => ({
        id: user.id,
        name: user.fullname || 'N/A',
        fullname: user.fullname || 'N/A',
        email: user.email || 'N/A',
        phone: user.phone || null,
        roleId: user.roleId,
        role: user.role || 'USER',
        status: user.status || 'ACTIVE',
        image: user.image || 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      setUsers(transformedUsers);
      setPagination({
        ...pagination,
        total: data.data.totalElements,
        page: data.data.pageable.pageNumber,
        pageSize: data.data.pageable.pageSize
      });
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      message.error('Không thể tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAccounts({
      page: pagination.page,
      pageSize: pagination.pageSize
    });
  }, []);

  // Handle both pagination and page size changes
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {

    // Ant Design uses 1-based indexing for display, but our API uses 0-based
    const page = pagination.current - 1;
    const { pageSize } = pagination;

    // Update pagination state
    setPagination({
      page,
      pageSize,
      total: pagination.total
    });

    // Fetch data with new pagination
    fetchAccounts({
      page,
      pageSize,
      fullname: searchText,
      status: activeTab
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({
      ...pagination,
      page: 0 // Reset to first page on new search
    });

    fetchAccounts({
      page: 0,
      pageSize: pagination.pageSize,
      fullname: value,
      status: activeTab
    });
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPagination({
      ...pagination,
      page: 0 // Reset to first page on tab change
    });

    fetchAccounts({
      page: 0,
      pageSize: pagination.pageSize,
      fullname: searchText,
      status: key
    });
  };

  const showModal = (user?: User) => {
    if (user) {
      setCurrentUser(user);
      form.setFieldsValue({
        name: user.name || user.fullname,
        email: user.email,
        phone: user.phone,
        roleId: user.roleId.toString(),
        status: user.status
      });
    } else {
      setCurrentUser(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentUser(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      if (!token) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      // Find the role name based on roleId
      const selectedRole = roleOptions.find(role => role.id === values.roleId);
      const roleName = selectedRole ? selectedRole.name : 'USER';

      const userData = {
        ...values,
        fullname: values.name,
        role: roleName
      };

      // Nếu không nhập mật khẩu khi cập nhật, loại bỏ trường password
      if (currentUser && !values.password) {
        delete userData.password;
      }

      let response;
      let data;
      if (currentUser) {
        // Update existing user
        response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/account/${currentUser.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${data.message || 'Unknown error'}`);
        }

        message.success(`Đã cập nhật thông tin tài khoản ${values.name}`);
      } else {
        // Create new user
        response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/account`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        data = await response.json();

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${data.message || 'Unknown error'}`);
        }

        message.success(`Đã tạo tài khoản mới: ${values.name}`);
      }

      // Reset modal and form
      setIsModalVisible(false);
      setCurrentUser(null);
      form.resetFields();

      // Refresh the account list
      fetchAccounts({
        page: pagination.page,
        pageSize: pagination.pageSize,
        fullname: searchText,
        status: activeTab
      });
    } catch (error) {
      console.error('Failed to save account:', error);
      message.error(`Không thể lưu thông tin tài khoản: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  const handleDelete = async (id: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      if (!token) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/account/delete/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      message.success('Đã xóa mềm tài khoản thành công');

      // Refresh the account list
      fetchAccounts({
        page: pagination.page,
        pageSize: pagination.pageSize,
        fullname: searchText,
        status: activeTab
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      message.error('Không thể xóa tài khoản');
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'ACTIVE' | 'LOCKED') => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      if (!token) {
        message.error('Vui lòng đăng nhập để tiếp tục');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/account/${id}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const statusText = newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa';
      message.success(`Đã ${statusText} tài khoản thành công`);

      // Refresh the account list
      fetchAccounts({
        page: pagination.page,
        pageSize: pagination.pageSize,
        fullname: searchText,
        status: activeTab
      });
    } catch (error) {
      console.error('Failed to change account status:', error);
      message.error('Không thể thay đổi trạng thái tài khoản');
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const getRoleTag = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Tag color="red">Quản trị viên</Tag>;
      case 'TEACHER':
        return <Tag color="green">Giáo viên</Tag>;
      case 'USERVIP':
        return <Tag color="blue">Học Viên VIP</Tag>;
      case 'USER':
        return <Tag color="purple">Học viên</Tag>;
      case 'HUITSTUDENT':
        return <Tag color="orange">Học viên HUIT</Tag>;
      default:
        return <Tag color="default">{role}</Tag>;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="success">Đang hoạt động</Tag>;
      case 'LOCKED':
        return <Tag color="error">Đã khóa</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getActionMenu = (record: User) => (
    <Menu>
      <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => showModal(record)}>
        Chỉnh sửa
      </Menu.Item>
      {record.status === 'ACTIVE' ? (
        <Menu.Item
          key="lock"
          icon={<LockOutlined />}
          onClick={() => handleStatusChange(record.id.toString(), 'LOCKED')}
        >
          Khóa tài khoản
        </Menu.Item>
      ) : record.status === 'LOCKED' ? (
        <Menu.Item
          key="unlock"
          icon={<UnlockOutlined />}
          onClick={() => handleStatusChange(record.id.toString(), 'ACTIVE')}
        >
          Mở khóa
        </Menu.Item>
      ) : (
        <Menu.Item
          key="activate"
          icon={<UnlockOutlined />}
          onClick={() => handleStatusChange(record.id.toString(), 'ACTIVE')}
        >
          Kích hoạt
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="delete" danger icon={<DeleteOutlined />}>
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa tài khoản này?"
          onConfirm={() => handleDelete(record.id.toString())}
          okText="Có"
          cancelText="Không"
        >
          Xóa tài khoản
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Tài khoản',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar
            src={record.image}
            icon={!record.image && <UserOutlined />}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{record.name || record.fullname}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined style={{ marginRight: 5 }} />{record.email}
            </Text>
          </Space>
        </Space>
      ),
      sorter: (a, b) => (a.name || a.fullname || '').localeCompare(b.name || b.fullname || ''),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          <span>{phone || 'Chưa cập nhật'}</span>
        </Space>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role),
      filters: [
        { text: 'Quản trị viên', value: 'ADMIN' },
        { text: 'Giáo viên', value: 'TEACHER' },
        { text: 'Học Viên VIP', value: 'USERVIP' },
        { text: 'Học viên', value: 'USER' },
        { text: 'Học viên HUIT', value: 'HUITSTUDENT' },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đang hoạt động', value: 'ACTIVE' },
        { text: 'Ngừng hoạt động', value: 'LOCKED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Đăng nhập gần nhất',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin) => formatDate(lastLogin) || 'Chưa đăng nhập',
      sorter: (a, b) => {
        if (!a.lastLogin) return 1;
        if (!b.lastLogin) return -1;
        return new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => formatDate(createdAt),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Thêm tùy chọn">
            <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
              <Button size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Quản lý tài khoản</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                Thêm tài khoản
              </Button>
              <Button
                icon={<ExportOutlined />}
                disabled={selectedRowKeys.length === 0}
              >
                Xuất ({selectedRowKeys.length})
              </Button>
              <Button icon={<ImportOutlined />}>
                Nhập dữ liệu
              </Button>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm tài khoản..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              {/* <Button icon={<FilterOutlined />}>
                Lọc
              </Button> */}
              {/* <RangePicker placeholder={['Từ ngày', 'Đến ngày']} /> */}
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab="Tất cả tài khoản" key="all" />
            <TabPane tab="Đang hoạt động" key="ACTIVE" />
            <TabPane tab="Đã khóa" key="LOCKED" />
          </Tabs>

          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            onChange={handleTableChange}
            pagination={{
              current: pagination.page + 1, // Convert from 0-based to 1-based for display
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài khoản`
            }}
          />
        </Space>
      </Card>

      {/* Modal thêm/chỉnh sửa tài khoản */}
      <Modal
        title={currentUser ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            {currentUser ? "Cập nhật" : "Tạo mới"}
          </Button>,
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Họ và tên"
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
                <Input disabled={!!currentUser} />
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
                name="roleId"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select>
                  {roleOptions.map(role => (
                    <Option key={role.id} value={role.id}>{role.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="ACTIVE">Đang hoạt động</Option>
                  <Option value="LOCKED">Ngừng hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  {
                    required: !currentUser,
                    message: 'Vui lòng nhập mật khẩu'
                  }
                ]}
                tooltip={currentUser ? "Để trống nếu không muốn thay đổi mật khẩu" : ""}
              >
                <Input.Password placeholder={currentUser ? "Để trống nếu không muốn thay đổi" : ""} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountsPage; 