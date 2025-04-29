import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Tag, Input,
  Popconfirm, message, Modal, Alert, Tabs, Empty,
  Tooltip, Select, Statistic, Row, Col, Badge
} from 'antd';
import {
  DeleteOutlined, UndoOutlined, ExclamationCircleOutlined,
  SearchOutlined, FilterOutlined, ClearOutlined,
  FileTextOutlined, UserOutlined, BookOutlined,
  FolderOutlined, SettingOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;
const { confirm } = Modal;

interface TrashItem {
  id: string;
  name: string;
  type: 'student' | 'course' | 'document' | 'payment' | 'other';
  deletedAt: string;
  deletedBy: string;
  expireAt: string;
  size?: number;
  description?: string;
}

const TrashPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>('all');
  
  // Giả lập dữ liệu
  const mockTrashItems: TrashItem[] = [
    {
      id: '1',
      name: 'Nguyễn Văn A',
      type: 'student',
      deletedAt: '2023-10-25T09:15:00',
      deletedBy: 'Admin',
      expireAt: '2023-11-25T09:15:00',
      description: 'Học viên đăng ký khóa học Toán'
    },
    {
      id: '2',
      name: 'Khóa học Tiếng Anh cơ bản',
      type: 'course',
      deletedAt: '2023-10-27T14:30:00',
      deletedBy: 'Marketing',
      expireAt: '2023-11-27T14:30:00',
      size: 250000000, // 250MB
      description: 'Khóa học dành cho người mới bắt đầu'
    },
    {
      id: '3',
      name: 'Hóa đơn thanh toán #INV-2023-089',
      type: 'payment',
      deletedAt: '2023-10-28T10:45:00',
      deletedBy: 'Finance',
      expireAt: '2023-11-28T10:45:00',
      description: 'Hóa đơn thanh toán khóa học của Trần Thị B'
    },
    {
      id: '4',
      name: 'Tài liệu Vật lý đại cương.pdf',
      type: 'document',
      deletedAt: '2023-10-20T16:20:00',
      deletedBy: 'Teacher',
      expireAt: '2023-11-20T16:20:00',
      size: 15000000, // 15MB
      description: 'Tài liệu tham khảo môn Vật lý đại cương'
    },
    {
      id: '5',
      name: 'Cấu hình hệ thống thông báo',
      type: 'other',
      deletedAt: '2023-10-15T11:10:00',
      deletedBy: 'System',
      expireAt: '2023-11-15T11:10:00',
      description: 'Cấu hình cũ của hệ thống thông báo tự động'
    }
  ];

  // Tải dữ liệu
  useEffect(() => {
    setTimeout(() => {
      setTrashItems(mockTrashItems);
      setLoading(false);
    }, 1000);
  }, []);

  // Định dạng byte thành đơn vị dễ đọc
  const formatBytes = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Xử lý chọn nhiều hàng
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Xử lý khôi phục mục
  const handleRestore = (id: string) => {
    const itemToRestore = trashItems.find(item => item.id === id);
    if (itemToRestore) {
      setTrashItems(trashItems.filter(item => item.id !== id));
      message.success(`Đã khôi phục "${itemToRestore.name}"`);
    }
  };

  // Xử lý xóa vĩnh viễn
  const handlePermanentDelete = (id: string) => {
    const itemToDelete = trashItems.find(item => item.id === id);
    if (itemToDelete) {
      confirm({
        title: 'Xác nhận xóa vĩnh viễn',
        icon: <ExclamationCircleOutlined />,
        content: (
          <div>
            <p>Bạn có chắc chắn muốn xóa vĩnh viễn mục này?</p>
            <p><strong>Lưu ý:</strong> Hành động này không thể hoàn tác.</p>
            <p>Mục: <strong>{itemToDelete.name}</strong></p>
          </div>
        ),
        onOk() {
          setTrashItems(trashItems.filter(item => item.id !== id));
          message.success(`Đã xóa vĩnh viễn "${itemToDelete.name}"`);
        },
        okText: 'Xóa vĩnh viễn',
        cancelText: 'Hủy',
        okButtonProps: { danger: true }
      });
    }
  };

  // Xử lý khôi phục nhiều mục
  const handleBatchRestore = () => {
    if (selectedRowKeys.length === 0) return;
    
    const newTrashItems = trashItems.filter(item => !selectedRowKeys.includes(item.id));
    setTrashItems(newTrashItems);
    message.success(`Đã khôi phục ${selectedRowKeys.length} mục`);
    setSelectedRowKeys([]);
  };

  // Xử lý xóa vĩnh viễn nhiều mục
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) return;
    
    confirm({
      title: 'Xác nhận xóa vĩnh viễn',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa vĩnh viễn {selectedRowKeys.length} mục?</p>
          <p><strong>Lưu ý:</strong> Hành động này không thể hoàn tác.</p>
        </div>
      ),
      onOk() {
        const newTrashItems = trashItems.filter(item => !selectedRowKeys.includes(item.id));
        setTrashItems(newTrashItems);
        message.success(`Đã xóa vĩnh viễn ${selectedRowKeys.length} mục`);
        setSelectedRowKeys([]);
      },
      okText: 'Xóa vĩnh viễn',
      cancelText: 'Hủy',
      okButtonProps: { danger: true }
    });
  };

  // Xử lý dọn sạch thùng rác
  const handleEmptyTrash = () => {
    if (trashItems.length === 0) return;
    
    confirm({
      title: 'Xác nhận dọn sạch thùng rác',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa vĩnh viễn tất cả các mục trong thùng rác?</p>
          <p><strong>Cảnh báo:</strong> Hành động này sẽ xóa vĩnh viễn {trashItems.length} mục và không thể hoàn tác.</p>
        </div>
      ),
      onOk() {
        setTrashItems([]);
        message.success('Đã dọn sạch thùng rác');
      },
      okText: 'Dọn sạch',
      cancelText: 'Hủy',
      okButtonProps: { danger: true }
    });
  };

  // Lọc dữ liệu theo tab và từ khóa tìm kiếm
  const filteredTrashItems = trashItems.filter(item => {
    // Lọc theo tab
    if (activeTabKey !== 'all' && item.type !== activeTabKey) {
      return false;
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.deletedBy.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Cấu hình chọn nhiều hàng
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<TrashItem> = [
    {
      title: 'Tên',
      key: 'name',
      render: (_, record) => {
        let icon = <FileTextOutlined />;
        let color = '';
        
        switch (record.type) {
          case 'student':
            icon = <UserOutlined />;
            color = 'blue';
            break;
          case 'course':
            icon = <BookOutlined />;
            color = 'green';
            break;
          case 'document':
            icon = <FileTextOutlined />;
            color = 'purple';
            break;
          case 'payment':
            icon = <FolderOutlined />;
            color = 'orange';
            break;
          default:
            icon = <FileTextOutlined />;
            color = 'default';
        }
        
        return (
          <Space direction="vertical" size={0}>
            <Space>
              <Tag color={color} icon={icon}>{record.type.toUpperCase()}</Tag>
              <Text strong>{record.name}</Text>
            </Space>
            {record.description && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.description}
              </Text>
            )}
          </Space>
        );
      },
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Kích thước',
      key: 'size',
      render: (_, record) => record.size ? formatBytes(record.size) : 'N/A',
      sorter: (a, b) => (a.size || 0) - (b.size || 0),
    },
    {
      title: 'Đã xóa',
      key: 'deletedAt',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{new Date(record.deletedAt).toLocaleDateString('vi-VN')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Bởi: {record.deletedBy}
          </Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.deletedAt).getTime() - new Date(b.deletedAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thời gian còn lại',
      key: 'expireAt',
      render: (_, record) => {
        const now = new Date();
        const expireDate = new Date(record.expireAt);
        const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        let color = 'default';
        if (daysLeft <= 5) color = 'error';
        else if (daysLeft <= 15) color = 'warning';
        
        return (
          <Tag color={color}>
            {daysLeft <= 0 ? 'Hết hạn' : `${daysLeft} ngày`}
          </Tag>
        );
      },
      sorter: (a, b) => new Date(a.expireAt).getTime() - new Date(b.expireAt).getTime(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Khôi phục">
            <Button 
              icon={<UndoOutlined />} 
              size="small" 
              onClick={() => handleRestore(record.id)}
            />
          </Tooltip>
          <Tooltip title="Xóa vĩnh viễn">
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handlePermanentDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Thùng rác</Title>

      <Alert
        message="Lưu ý về thùng rác"
        description="Các mục trong thùng rác sẽ bị xóa vĩnh viễn sau 30 ngày kể từ ngày đưa vào thùng rác. Bạn có thể khôi phục các mục này bất cứ lúc nào trước khi chúng bị xóa vĩnh viễn."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số mục trong thùng rác"
              value={trashItems.length}
              prefix={<DeleteOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Dung lượng chiếm dụng"
              value={formatBytes(trashItems.reduce((total, item) => total + (item.size || 0), 0))}
              prefix={<FolderOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Số mục gần hết hạn (<5 ngày)"
              value={trashItems.filter(item => {
                const now = new Date();
                const expireDate = new Date(item.expireAt);
                const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return daysLeft <= 5;
              }).length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTabKey} onChange={setActiveTabKey}>
          <TabPane tab="Tất cả" key="all" />
          <TabPane tab="Học viên" key="student" />
          <TabPane tab="Khóa học" key="course" />
          <TabPane tab="Tài liệu" key="document" />
          <TabPane tab="Thanh toán" key="payment" />
          <TabPane tab="Khác" key="other" />
        </Tabs>
        
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button 
              type="primary" 
              icon={<UndoOutlined />} 
              onClick={handleBatchRestore}
              disabled={selectedRowKeys.length === 0}
            >
              Khôi phục ({selectedRowKeys.length})
            </Button>
            <Button 
              danger
              icon={<DeleteOutlined />} 
              onClick={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              Xóa vĩnh viễn ({selectedRowKeys.length})
            </Button>
            <Button 
              icon={<ClearOutlined />} 
              onClick={handleEmptyTrash}
              disabled={trashItems.length === 0}
            >
              Dọn sạch thùng rác
            </Button>
          </Space>
          
          <Space>
            <Search
              placeholder="Tìm kiếm..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 250 }}
            />
            <Select defaultValue="date" style={{ width: 150 }}>
              <Select.Option value="date">Sắp xếp theo ngày</Select.Option>
              <Select.Option value="name">Sắp xếp theo tên</Select.Option>
              <Select.Option value="type">Sắp xếp theo loại</Select.Option>
              <Select.Option value="size">Sắp xếp theo kích thước</Select.Option>
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredTrashItems}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
          }}
          locale={{
            emptyText: <Empty description="Thùng rác trống" />
          }}
        />
      </Card>
    </div>
  );
};

export default TrashPage; 