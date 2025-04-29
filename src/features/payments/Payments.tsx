import React, { useState, useEffect } from 'react';
import { 
  Typography, Card, Table, Button, Space, Tag, Input, 
  Select, DatePicker, Modal, Form, Tabs, Badge, Tooltip, 
  Statistic, Row, Col, Popconfirm, message, Descriptions, Divider
} from 'antd';
import { 
  SearchOutlined, SyncOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, ExclamationCircleOutlined, 
  DollarOutlined, UserOutlined, FileTextOutlined,
  DownloadOutlined, EyeOutlined, FilterOutlined,
  PrinterOutlined, SendOutlined, ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface Payment {
  id: string;
  code: string;
  amount: number;
  method: 'bank_transfer' | 'credit_card' | 'cash' | 'e_wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  date: string;
  dueDate?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: {
    id: string;
    type: 'course' | 'document' | 'exam';
    name: string;
    price: number;
    quantity: number;
  }[];
  note?: string;
  invoiceGenerated: boolean;
  createdBy: string;
  updatedAt: string;
}

const PaymentsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selectedItems, setSelectedItems] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('all');

  useEffect(() => {
    // Giả lập tải dữ liệu
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Dữ liệu giả
  const payments: Payment[] = [
    {
      id: '1',
      code: 'PAY-2023-10-001',
      amount: 1500000,
      method: 'bank_transfer',
      status: 'completed',
      date: '2023-10-15T08:30:00',
      user: {
        id: 'U001',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@mail.com',
        phone: '0901234567'
      },
      items: [
        {
          id: 'C001',
          type: 'course',
          name: 'Khóa học Toán cao cấp',
          price: 1500000,
          quantity: 1
        }
      ],
      note: 'Đã chuyển khoản qua ngân hàng VCB',
      invoiceGenerated: true,
      createdBy: 'Admin',
      updatedAt: '2023-10-15T09:15:00'
    },
    {
      id: '2',
      code: 'PAY-2023-10-002',
      amount: 750000,
      method: 'credit_card',
      status: 'completed',
      date: '2023-10-16T10:45:00',
      user: {
        id: 'U002',
        name: 'Trần Thị B',
        email: 'tranthib@mail.com',
        phone: '0912345678'
      },
      items: [
        {
          id: 'D001',
          type: 'document',
          name: 'Tài liệu Vật lý nâng cao',
          price: 250000,
          quantity: 1
        },
        {
          id: 'E001',
          type: 'exam',
          name: 'Đề thi thử Hóa học',
          price: 500000,
          quantity: 1
        }
      ],
      invoiceGenerated: true,
      createdBy: 'Admin',
      updatedAt: '2023-10-16T10:50:00'
    },
    {
      id: '3',
      code: 'PAY-2023-10-003',
      amount: 2000000,
      method: 'cash',
      status: 'completed',
      date: '2023-10-17T14:30:00',
      user: {
        id: 'U003',
        name: 'Lê Văn C',
        email: 'levanc@mail.com',
        phone: '0923456789'
      },
      items: [
        {
          id: 'C002',
          type: 'course',
          name: 'Khóa học Anh văn tổng quát',
          price: 2000000,
          quantity: 1
        }
      ],
      note: 'Thanh toán tại văn phòng',
      invoiceGenerated: true,
      createdBy: 'Staff1',
      updatedAt: '2023-10-17T14:35:00'
    },
    {
      id: '4',
      code: 'PAY-2023-10-004',
      amount: 1200000,
      method: 'bank_transfer',
      status: 'pending',
      date: '2023-10-18T09:15:00',
      dueDate: '2023-10-25T23:59:59',
      user: {
        id: 'U004',
        name: 'Phạm Thị D',
        email: 'phamthid@mail.com',
        phone: '0934567890'
      },
      items: [
        {
          id: 'C003',
          type: 'course',
          name: 'Khóa học Lập trình cơ bản',
          price: 1200000,
          quantity: 1
        }
      ],
      note: 'Chờ xác nhận thanh toán',
      invoiceGenerated: false,
      createdBy: 'System',
      updatedAt: '2023-10-18T09:15:00'
    },
    {
      id: '5',
      code: 'PAY-2023-10-005',
      amount: 350000,
      method: 'e_wallet',
      status: 'failed',
      date: '2023-10-19T15:45:00',
      user: {
        id: 'U005',
        name: 'Võ Văn E',
        email: 'vovane@mail.com',
        phone: '0945678901'
      },
      items: [
        {
          id: 'E002',
          type: 'exam',
          name: 'Đề thi thử Toán học',
          price: 350000,
          quantity: 1
        }
      ],
      note: 'Lỗi thanh toán: Số dư không đủ',
      invoiceGenerated: false,
      createdBy: 'System',
      updatedAt: '2023-10-19T15:46:00'
    },
    {
      id: '6',
      code: 'PAY-2023-10-006',
      amount: 1800000,
      method: 'credit_card',
      status: 'refunded',
      date: '2023-10-20T11:30:00',
      user: {
        id: 'U006',
        name: 'Hoàng Văn F',
        email: 'hoangvanf@mail.com',
        phone: '0956789012'
      },
      items: [
        {
          id: 'C004',
          type: 'course',
          name: 'Khóa học Tiếng Nhật cơ bản',
          price: 1800000,
          quantity: 1
        }
      ],
      note: 'Hoàn tiền theo yêu cầu của khách hàng',
      invoiceGenerated: true,
      createdBy: 'Admin',
      updatedAt: '2023-10-21T09:30:00'
    }
  ];

  const getStatusTag = (status: string) => {
    switch(status) {
      case 'completed':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đã thanh toán</Tag>;
      case 'pending':
        return <Tag icon={<SyncOutlined spin />} color="processing">Đang xử lý</Tag>;
      case 'failed':
        return <Tag icon={<CloseCircleOutlined />} color="error">Thất bại</Tag>;
      case 'refunded':
        return <Tag icon={<ExclamationCircleOutlined />} color="warning">Đã hoàn tiền</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getMethodTag = (method: string) => {
    switch(method) {
      case 'bank_transfer':
        return <Tag color="blue">Chuyển khoản</Tag>;
      case 'credit_card':
        return <Tag color="green">Thẻ tín dụng</Tag>;
      case 'cash':
        return <Tag color="gold">Tiền mặt</Tag>;
      case 'e_wallet':
        return <Tag color="purple">Ví điện tử</Tag>;
      default:
        return <Tag color="default">{method}</Tag>;
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings);
  };

  const handleViewPayment = (payment: Payment) => {
    setCurrentPayment(payment);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const confirmPayment = (id: string) => {
    message.success(`Đã xác nhận thanh toán #${id}`);
  };

  const refundPayment = (id: string) => {
    message.success(`Đã hoàn tiền thanh toán #${id}`);
  };

  const generateInvoice = (id: string) => {
    message.success(`Đã tạo hóa đơn cho thanh toán #${id}`);
  };

  const sendReminder = (id: string) => {
    message.success(`Đã gửi nhắc nhở thanh toán #${id}`);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedItems(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys: selectedItems,
    onChange: onSelectChange,
  };

  const columns: ColumnsType<Payment> = [
    {
      title: 'Mã thanh toán',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, record: Payment) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(record.date).toLocaleDateString('vi-VN')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'user',
      key: 'user',
      render: (user) => (
        <Space direction="vertical" size={0}>
          <Text>{user.name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{user.email}</Text>
        </Space>
      ),
      sorter: (a, b) => a.user.name.localeCompare(b.user.name),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items: Payment['items']) => (
        <Space direction="vertical" size={0}>
          {items.map((item, index: number) => (
            <Text key={index}>
              {item.name} ({item.price.toLocaleString()}đ x {item.quantity})
            </Text>
          ))}
        </Space>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>{amount.toLocaleString()}đ</Text>,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Phương thức',
      dataIndex: 'method',
      key: 'method',
      render: (method) => getMethodTag(method),
      filters: [
        { text: 'Chuyển khoản', value: 'bank_transfer' },
        { text: 'Thẻ tín dụng', value: 'credit_card' },
        { text: 'Tiền mặt', value: 'cash' },
        { text: 'Ví điện tử', value: 'e_wallet' },
      ],
      onFilter: (value, record) => record.method === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đã thanh toán', value: 'completed' },
        { text: 'Đang xử lý', value: 'pending' },
        { text: 'Thất bại', value: 'failed' },
        { text: 'Đã hoàn tiền', value: 'refunded' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => handleViewPayment(record)} 
            />
          </Tooltip>
          
          {record.status === 'pending' && (
            <Tooltip title="Xác nhận thanh toán">
              <Button 
                icon={<CheckCircleOutlined />} 
                size="small" 
                type="primary"
                onClick={() => confirmPayment(record.id)}
              />
            </Tooltip>
          )}
          
          {record.status === 'completed' && !record.invoiceGenerated && (
            <Tooltip title="Tạo hóa đơn">
              <Button 
                icon={<FileTextOutlined />} 
                size="small"
                onClick={() => generateInvoice(record.id)}
              />
            </Tooltip>
          )}
          
          {record.status === 'completed' && (
            <Tooltip title="Hoàn tiền">
              <Popconfirm
                title="Bạn có chắc chắn muốn hoàn tiền?"
                onConfirm={() => refundPayment(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button 
                  icon={<CloseCircleOutlined />} 
                  size="small" 
                  danger
                />
              </Popconfirm>
            </Tooltip>
          )}
          
          {record.status === 'pending' && (
            <Tooltip title="Gửi nhắc nhở">
              <Button 
                icon={<SendOutlined />} 
                size="small"
                onClick={() => sendReminder(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const filteredData = payments.filter(payment => {
    if (activeTab === 'all') return true;
    return payment.status === activeTab;
  }).filter(payment => {
    if (paymentMethod === 'all') return true;
    return payment.method === paymentMethod;
  }).filter(payment => {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    return (
      payment.code.toLowerCase().includes(searchLower) ||
      payment.user.name.toLowerCase().includes(searchLower) ||
      payment.user.email.toLowerCase().includes(searchLower) ||
      payment.items.some(item => item.name.toLowerCase().includes(searchLower))
    );
  }).filter(payment => {
    if (!dateRange || dateRange[0] === '' || dateRange[1] === '') return true;
    
    const paymentDate = new Date(payment.date).getTime();
    const startDate = dateRange[0] ? new Date(dateRange[0]).getTime() : 0;
    const endDate = dateRange[1] ? new Date(dateRange[1]).setHours(23, 59, 59, 999) : Infinity;
    
    return paymentDate >= startDate && paymentDate <= endDate;
  });

  // Thống kê
  const totalPayments = payments.length;
  const totalCompleted = payments.filter(p => p.status === 'completed').length;
  const totalPending = payments.filter(p => p.status === 'pending').length;
  const totalAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div>
      <Title level={2}>Quản lý thanh toán</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số thanh toán"
              value={totalPayments}
              valueStyle={{ color: '#1890ff' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={totalCompleted}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix={<small style={{ fontSize: '15px', marginLeft: '8px' }}>({((totalCompleted / totalPayments) * 100).toFixed(0)}%)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang xử lý"
              value={totalPending}
              valueStyle={{ color: '#faad14' }}
              prefix={<SyncOutlined spin />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalAmount}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
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
              <Button 
                icon={<DownloadOutlined />} 
                disabled={selectedItems.length === 0}
              >
                Xuất ({selectedItems.length})
              </Button>
              <Button icon={<ExportOutlined />}>
                Báo cáo
              </Button>
              <Button icon={<PrinterOutlined />}>
                In
              </Button>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm thanh toán..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select 
                defaultValue="all" 
                style={{ width: 150 }} 
                onChange={handleMethodChange}
                placeholder="Phương thức"
              >
                <Option value="all">Tất cả phương thức</Option>
                <Option value="bank_transfer">Chuyển khoản</Option>
                <Option value="credit_card">Thẻ tín dụng</Option>
                <Option value="cash">Tiền mặt</Option>
                <Option value="e_wallet">Ví điện tử</Option>
              </Select>
              <RangePicker 
                onChange={handleDateRangeChange}
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab={<span>Tất cả</span>} key="all" />
            <TabPane 
              tab={
                <Badge count={payments.filter(p => p.status === 'completed').length} showZero>
                  <span>Đã thanh toán</span>
                </Badge>
              } 
              key="completed" 
            />
            <TabPane 
              tab={
                <Badge count={payments.filter(p => p.status === 'pending').length} showZero>
                  <span>Đang xử lý</span>
                </Badge>
              } 
              key="pending" 
            />
            <TabPane 
              tab={
                <Badge count={payments.filter(p => p.status === 'failed').length} showZero>
                  <span>Thất bại</span>
                </Badge>
              } 
              key="failed" 
            />
            <TabPane 
              tab={
                <Badge count={payments.filter(p => p.status === 'refunded').length} showZero>
                  <span>Đã hoàn tiền</span>
                </Badge>
              } 
              key="refunded" 
            />
          </Tabs>

          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thanh toán`
            }}
          />
        </Space>
      </Card>

      <Modal
        title={`Chi tiết thanh toán #${currentPayment?.code}`}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
          currentPayment?.status === 'pending' && (
            <Button 
              key="confirm" 
              type="primary" 
              onClick={() => {
                confirmPayment(currentPayment?.id || '');
                handleModalClose();
              }}
            >
              Xác nhận thanh toán
            </Button>
          ),
          currentPayment?.status === 'completed' && !currentPayment?.invoiceGenerated && (
            <Button 
              key="invoice" 
              type="primary" 
              onClick={() => {
                generateInvoice(currentPayment?.id || '');
                handleModalClose();
              }}
            >
              Tạo hóa đơn
            </Button>
          )
        ].filter(Boolean)}
        width={800}
      >
        {currentPayment && (
          <div>
            <Descriptions 
              title="Thông tin thanh toán" 
              bordered 
              column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
            >
              <Descriptions.Item label="Mã thanh toán">
                {currentPayment.code}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày thanh toán">
                {new Date(currentPayment.date).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(currentPayment.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {getMethodTag(currentPayment.method)}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong>{currentPayment.amount.toLocaleString()}đ</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người tạo">
                {currentPayment.createdBy}
              </Descriptions.Item>
            </Descriptions>

            <Divider/>

            <Descriptions 
              title="Thông tin khách hàng" 
              bordered 
              column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
              style={{ marginBottom: 20 }}
            >
              <Descriptions.Item label="Họ tên">
                {currentPayment.user.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {currentPayment.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {currentPayment.user.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Mã khách hàng">
                {currentPayment.user.id}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Chi tiết đơn hàng</Title>
            <Table
              dataSource={currentPayment.items}
              pagination={false}
              rowKey="id"
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: 'Loại',
                  dataIndex: 'type',
                  key: 'type',
                  render: (type) => {
                    const typeMapping: Record<string, string> = {
                      course: 'Khóa học',
                      document: 'Tài liệu',
                      exam: 'Đề thi'
                    };
                    return typeMapping[type] || type;
                  }
                },
                {
                  title: 'Đơn giá',
                  dataIndex: 'price',
                  key: 'price',
                  render: (price) => `${price.toLocaleString()}đ`
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                },
                {
                  title: 'Thành tiền',
                  key: 'total',
                  render: (_, record) => `${(record.price * record.quantity).toLocaleString()}đ`
                }
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <td colSpan={4} align="right">
                    <Text strong>Tổng tiền:</Text>
                  </td>
                  <td>
                    <Text strong>{currentPayment.amount.toLocaleString()}đ</Text>
                  </td>
                </Table.Summary.Row>
              )}
            />

            {currentPayment.note && (
              <>
                <Title level={5} style={{ marginTop: 20 }}>Ghi chú</Title>
                <Paragraph>{currentPayment.note}</Paragraph>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage; 