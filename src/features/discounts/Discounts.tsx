import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Tag, Input, Select,
  Popconfirm, message, Modal, Form, Row, Col, Tabs, DatePicker,
  InputNumber, Badge, Tooltip, Switch
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined,
  FilterOutlined, PercentageOutlined, DollarOutlined, CopyOutlined,
  GiftOutlined, CheckOutlined, ClockCircleOutlined, StopOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface DiscountItem {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_item';
  value: number;
  description: string;
  startDate: string;
  endDate: string;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  category?: string;
  courseIds?: string[];
  status: 'active' | 'expired' | 'used' | 'disabled';
  createdAt: string;
  createdBy: string;
}

const Discounts: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentDiscount, setCurrentDiscount] = useState<DiscountItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();

  // Giả lập dữ liệu
  const mockDiscounts: DiscountItem[] = [
    {
      id: '1',
      code: 'WELCOME20',
      type: 'percentage',
      value: 20,
      description: 'Giảm 20% cho học viên mới',
      startDate: '2023-10-01T00:00:00',
      endDate: '2023-12-31T23:59:59',
      minOrderValue: 1000000,
      maxUses: 100,
      usedCount: 45,
      status: 'active',
      createdAt: '2023-09-15T10:00:00',
      createdBy: 'Admin'
    },
    {
      id: '2',
      code: 'SUMMER200K',
      type: 'fixed_amount',
      value: 200000,
      description: 'Giảm 200.000đ cho khóa học mùa hè',
      startDate: '2023-06-01T00:00:00',
      endDate: '2023-08-31T23:59:59',
      minOrderValue: 500000,
      usedCount: 120,
      maxUses: 150,
      category: 'Khóa hè',
      status: 'expired',
      createdAt: '2023-05-20T14:30:00',
      createdBy: 'Marketing'
    },
    {
      id: '3',
      code: 'TOTNGHIEP30',
      type: 'percentage',
      value: 30,
      description: 'Giảm 30% cho học sinh tốt nghiệp',
      startDate: '2023-07-01T00:00:00',
      endDate: '2023-12-31T23:59:59',
      minOrderValue: 1500000,
      usedCount: 78,
      maxUses: 200,
      category: 'Luyện thi',
      status: 'active',
      createdAt: '2023-06-15T09:15:00',
      createdBy: 'Admin'
    },
    {
      id: '4',
      code: 'TAICHINH100K',
      type: 'fixed_amount',
      value: 100000,
      description: 'Giảm 100.000đ cho khóa học tài chính',
      startDate: '2023-09-15T00:00:00',
      endDate: '2023-10-15T23:59:59',
      courseIds: ['FINANCE101', 'FINANCE102'],
      usedCount: 25,
      status: 'active',
      createdAt: '2023-09-10T11:20:00',
      createdBy: 'Marketing'
    },
    {
      id: '5',
      code: 'FREE_EBOOK',
      type: 'free_item',
      value: 0,
      description: 'Tặng sách điện tử miễn phí khi đăng ký khóa học',
      startDate: '2023-08-01T00:00:00',
      endDate: '2023-11-30T23:59:59',
      minOrderValue: 800000,
      usedCount: 50,
      maxUses: 100,
      status: 'active',
      createdAt: '2023-07-25T16:45:00',
      createdBy: 'Admin'
    },
    {
      id: '6',
      code: 'INACTIVE_CODE',
      type: 'percentage',
      value: 15,
      description: 'Mã giảm giá tạm khóa',
      startDate: '2023-10-01T00:00:00',
      endDate: '2023-12-31T23:59:59',
      usedCount: 0,
      status: 'disabled',
      createdAt: '2023-09-25T10:30:00',
      createdBy: 'Admin'
    }
  ];

  // Tải dữ liệu
  useEffect(() => {
    setTimeout(() => {
      setDiscounts(mockDiscounts);
      setLoading(false);
    }, 1000);
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Xử lý thay đổi tab
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // Xử lý lọc theo loại giảm giá
  const handleTypeFilter = (value: string) => {
    setFilterType(value);
  };

  // Xử lý hiển thị modal
  const showModal = (discount?: DiscountItem) => {
    if (discount) {
      setCurrentDiscount(discount);
      form.setFieldsValue({
        code: discount.code,
        type: discount.type,
        value: discount.value,
        description: discount.description,
        dateRange: [moment(discount.startDate), moment(discount.endDate)],
        minOrderValue: discount.minOrderValue,
        maxUses: discount.maxUses,
        category: discount.category,
        courseIds: discount.courseIds?.join(', '),
        status: discount.status === 'active'
      });
    } else {
      setCurrentDiscount(null);
      form.resetFields();
      form.setFieldsValue({
        type: 'percentage',
        status: true
      });
    }
    setIsModalVisible(true);
  };

  // Xử lý đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentDiscount(null);
    form.resetFields();
  };

  // Xử lý lưu mã giảm giá
  const handleSave = () => {
    form.validateFields().then(values => {
      const newDiscount: DiscountItem = {
        id: currentDiscount ? currentDiscount.id : `${discounts.length + 1}`,
        code: values.code,
        type: values.type,
        value: values.value,
        description: values.description,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        minOrderValue: values.minOrderValue,
        maxUses: values.maxUses,
        usedCount: currentDiscount?.usedCount || 0,
        category: values.category,
        courseIds: values.courseIds ? values.courseIds.split(',').map((id: string) => id.trim()) : undefined,
        status: values.status ? 'active' : 'disabled',
        createdAt: currentDiscount ? currentDiscount.createdAt : new Date().toISOString(),
        createdBy: 'Admin'
      };

      if (currentDiscount) {
        // Cập nhật mã giảm giá
        setDiscounts(discounts.map(item => 
          item.id === currentDiscount.id ? newDiscount : item
        ));
        message.success('Cập nhật mã giảm giá thành công!');
      } else {
        // Tạo mã giảm giá mới
        setDiscounts([...discounts, newDiscount]);
        message.success('Tạo mã giảm giá mới thành công!');
      }
      
      setIsModalVisible(false);
      setCurrentDiscount(null);
      form.resetFields();
    });
  };

  // Xử lý xóa mã giảm giá
  const handleDelete = (id: string) => {
    setDiscounts(discounts.filter(item => item.id !== id));
    message.success('Đã xóa mã giảm giá thành công!');
  };

  // Xử lý tắt/bật mã giảm giá
  const handleToggleStatus = (id: string, isActive: boolean) => {
    setDiscounts(discounts.map(item => {
      if (item.id === id) {
        return { ...item, status: isActive ? 'active' : 'disabled' };
      }
      return item;
    }));
    
    message.success(`Đã ${isActive ? 'bật' : 'tắt'} mã giảm giá thành công!`);
  };

  // Xử lý copy mã giảm giá
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      message.success(`Đã sao chép mã: ${code}`);
    }, () => {
      message.error('Không thể sao chép mã!');
    });
  };

  // Xử lý chọn nhiều hàng
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Lọc dữ liệu theo các điều kiện
  const filteredDiscounts = discounts.filter(discount => {
    // Lọc theo tab
    if (activeTab === 'active' && discount.status !== 'active') {
      return false;
    } else if (activeTab === 'expired' && discount.status !== 'expired') {
      return false;
    } else if (activeTab === 'disabled' && discount.status !== 'disabled') {
      return false;
    }

    // Lọc theo loại
    if (filterType !== 'all' && discount.type !== filterType) {
      return false;
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      const searchKeyword = searchText.toLowerCase();
      return (
        discount.code.toLowerCase().includes(searchKeyword) ||
        discount.description.toLowerCase().includes(searchKeyword) ||
        (discount.category && discount.category.toLowerCase().includes(searchKeyword))
      );
    }

    return true;
  });

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<DiscountItem> = [
    {
      title: 'Mã giảm giá',
      key: 'code',
      render: (_, record) => (
        <Space>
          <Text strong copyable>{record.code}</Text>
          <Tooltip title="Sao chép">
            <Button 
              type="text" 
              size="small" 
              icon={<CopyOutlined />} 
              onClick={() => handleCopyCode(record.code)}
            />
          </Tooltip>
        </Space>
      ),
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Loại & Giá trị',
      key: 'type',
      render: (_, record) => {
        let icon = <PercentageOutlined />;
        let color = 'green';
        let valueDisplay = `${record.value}%`;
        
        if (record.type === 'fixed_amount') {
          icon = <DollarOutlined />;
          color = 'blue';
          valueDisplay = `${record.value.toLocaleString()}đ`;
        } else if (record.type === 'free_item') {
          icon = <GiftOutlined />;
          color = 'purple';
          valueDisplay = 'Quà tặng';
        }
        
        return (
          <Tag color={color} icon={icon}>
            {valueDisplay}
          </Tag>
        );
      },
      filters: [
        { text: 'Giảm theo %', value: 'percentage' },
        { text: 'Giảm theo số tiền', value: 'fixed_amount' },
        { text: 'Quà tặng', value: 'free_item' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: '25%',
    },
    {
      title: 'Thời gian',
      key: 'date',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary">
            Từ: {new Date(record.startDate).toLocaleDateString('vi-VN')}
          </Text>
          <Text type="secondary">
            Đến: {new Date(record.endDate).toLocaleDateString('vi-VN')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.usedCount} lượt</Text>
          {record.maxUses && (
            <Text type="secondary">
              Giới hạn: {record.maxUses} lượt
            </Text>
          )}
        </Space>
      ),
      sorter: (a, b) => a.usedCount - b.usedCount,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        let color = 'success';
        let text = 'Đang hoạt động';
        let icon = <CheckOutlined />;
        
        if (record.status === 'expired') {
          color = 'default';
          text = 'Hết hạn';
          icon = <ClockCircleOutlined />;
        } else if (record.status === 'used') {
          color = 'warning';
          text = 'Đã dùng hết';
          icon = <StopOutlined />;
        } else if (record.status === 'disabled') {
          color = 'error';
          text = 'Đã tắt';
          icon = <StopOutlined />;
        }
        
        return <Badge status={color as any} text={text} />;
      },
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Hết hạn', value: 'expired' },
        { text: 'Đã dùng hết', value: 'used' },
        { text: 'Đã tắt', value: 'disabled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => showModal(record)} 
            />
          </Tooltip>
          {record.status === 'active' ? (
            <Tooltip title="Tắt">
              <Button
                icon={<StopOutlined />}
                size="small"
                onClick={() => handleToggleStatus(record.id, false)}
              />
            </Tooltip>
          ) : record.status === 'disabled' ? (
            <Tooltip title="Bật">
              <Button
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleToggleStatus(record.id, true)}
                type="primary"
              />
            </Tooltip>
          ) : null}
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa mã giảm giá này?"
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

  // Render giá trị dựa trên loại giảm giá
  const renderValueLabel = () => {
    const type = form.getFieldValue('type');
    if (type === 'percentage') {
      return 'Phần trăm giảm (%)';
    } else if (type === 'fixed_amount') {
      return 'Số tiền giảm (VNĐ)';
    } else {
      return 'Giá trị quà tặng';
    }
  };

  return (
    <div>
      <Title level={2}>Quản lý mã giảm giá</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => showModal()}
              >
                Thêm mã giảm giá
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
                placeholder="Tìm kiếm mã giảm giá..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 200 }}
              />
              <Select
                defaultValue="all"
                style={{ width: 180 }}
                onChange={handleTypeFilter}
              >
                <Option value="all">Tất cả loại</Option>
                <Option value="percentage">Giảm theo %</Option>
                <Option value="fixed_amount">Giảm theo số tiền</Option>
                <Option value="free_item">Quà tặng</Option>
              </Select>
              <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab="Tất cả" key="all" />
            <TabPane tab="Đang hoạt động" key="active" />
            <TabPane tab="Hết hạn" key="expired" />
            <TabPane tab="Đã tắt" key="disabled" />
          </Tabs>

          <Table
            columns={columns}
            dataSource={filteredDiscounts}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mã giảm giá`
            }}
          />
        </Space>
      </Card>
      
      {/* Modal thêm/sửa mã giảm giá */}
      <Modal
        title={currentDiscount ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            {currentDiscount ? "Cập nhật" : "Tạo mới"}
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
                name="code"
                label="Mã giảm giá"
                rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá' }]}
              >
                <Input placeholder="VD: SUMMER2023" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
              >
                <Select onChange={() => form.validateFields(['value'])}>
                  <Option value="percentage">Giảm theo phần trăm (%)</Option>
                  <Option value="fixed_amount">Giảm theo số tiền</Option>
                  <Option value="free_item">Quà tặng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="value"
                label={renderValueLabel()}
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (getFieldValue('type') === 'percentage' && (value <= 0 || value > 100)) {
                        return Promise.reject('Phần trăm giảm phải từ 1% đến 100%');
                      }
                      if (getFieldValue('type') === 'fixed_amount' && value <= 0) {
                        return Promise.reject('Số tiền giảm phải lớn hơn 0');
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Thời gian hiệu lực"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian hiệu lực' }]}
              >
                <RangePicker 
                  style={{ width: '100%' }} 
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="minOrderValue"
                label="Giá trị đơn hàng tối thiểu"
              >
                <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxUses"
                label="Số lần sử dụng tối đa"
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Áp dụng cho danh mục"
              >
                <Select placeholder="Chọn danh mục" allowClear>
                  <Option value="Khóa hè">Khóa hè</Option>
                  <Option value="Luyện thi">Luyện thi</Option>
                  <Option value="Ngoại ngữ">Ngoại ngữ</Option>
                  <Option value="Kỹ năng">Kỹ năng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="courseIds"
                label="Áp dụng cho khóa học (ID, cách nhau bởi dấu phẩy)"
              >
                <Input placeholder="VD: MATH101, ENG202" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Discounts; 