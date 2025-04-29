import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Tag, Input, Select,
  Popconfirm, message, Modal, Form, Row, Col, Progress,
  Tooltip, DatePicker, Divider, Statistic, Alert, Badge, Checkbox
} from 'antd';
import {
  CloudUploadOutlined, CloudDownloadOutlined, DeleteOutlined,
  SyncOutlined, HistoryOutlined, SettingOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  FileExcelOutlined, FileZipOutlined, FilePdfOutlined,
  DatabaseOutlined, LockOutlined, CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface BackupItem {
  id: string;
  name: string;
  date: string;
  size: number;
  type: 'auto' | 'manual';
  status: 'completed' | 'in_progress' | 'error';
  content: ('database' | 'files' | 'configurations')[];
  retention: number;
  expiryDate: string;
}

const BackupPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [backupProgress, setBackupProgress] = useState<number>(0);
  const [isBackupInProgress, setIsBackupInProgress] = useState<boolean>(false);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [backupForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  
  // Giả lập dữ liệu
  const mockBackups: BackupItem[] = [
    {
      id: '1',
      name: 'Auto Backup - 30/10/2023',
      date: '2023-10-30T02:00:00',
      size: 1560342528, // 1.45 GB
      type: 'auto',
      status: 'completed',
      content: ['database', 'files', 'configurations'],
      retention: 30,
      expiryDate: '2023-11-30T02:00:00'
    },
    {
      id: '2',
      name: 'Manual Backup - Database Only',
      date: '2023-10-29T15:45:00',
      size: 536870912, // 512 MB
      type: 'manual',
      status: 'completed',
      content: ['database'],
      retention: 60,
      expiryDate: '2023-12-29T15:45:00'
    },
    {
      id: '3',
      name: 'Pre-Update Backup',
      date: '2023-10-25T10:30:00',
      size: 2147483648, // 2 GB
      type: 'manual',
      status: 'completed',
      content: ['database', 'files', 'configurations'],
      retention: 90,
      expiryDate: '2024-01-25T10:30:00'
    },
    {
      id: '4',
      name: 'Auto Backup - 23/10/2023',
      date: '2023-10-23T02:00:00',
      size: 1342177280, // 1.25 GB
      type: 'auto',
      status: 'completed',
      content: ['database', 'files', 'configurations'],
      retention: 30,
      expiryDate: '2023-11-23T02:00:00'
    },
    {
      id: '5',
      name: 'Auto Backup - 16/10/2023',
      date: '2023-10-16T02:00:00',
      size: 1288490189, // 1.2 GB
      type: 'auto',
      status: 'error',
      content: ['database', 'files', 'configurations'],
      retention: 30,
      expiryDate: '2023-11-16T02:00:00'
    }
  ];

  // Tải dữ liệu
  useEffect(() => {
    setTimeout(() => {
      setBackups(mockBackups);
      setLoading(false);
    }, 1000);
  }, []);

  // Định dạng byte thành đơn vị dễ đọc
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Xử lý tạo bản sao lưu mới
  const handleCreateBackup = () => {
    setIsModalVisible(true);
    backupForm.resetFields();
    backupForm.setFieldsValue({
      name: `Manual Backup - ${new Date().toLocaleDateString('vi-VN')}`,
      content: ['database', 'files', 'configurations'],
      retention: 30
    });
  };

  // Xử lý hiển thị modal cài đặt
  const handleShowSettings = () => {
    setSettingsVisible(true);
    settingsForm.resetFields();
    settingsForm.setFieldsValue({
      autoBackup: true,
      frequency: 'daily',
      time: '02:00',
      retention: 30,
      content: ['database', 'files', 'configurations'],
      compress: true
    });
  };

  // Xử lý bắt đầu sao lưu
  const handleStartBackup = () => {
    backupForm.validateFields().then(values => {
      setIsModalVisible(false);
      setIsBackupInProgress(true);
      setBackupProgress(0);
      
      // Giả lập tiến trình sao lưu
      const interval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsBackupInProgress(false);
            
            // Thêm bản sao lưu mới vào danh sách
            const now = new Date();
            const expiryDate = new Date();
            expiryDate.setDate(now.getDate() + values.retention);
            
            const newBackup: BackupItem = {
              id: `${backups.length + 1}`,
              name: values.name,
              date: now.toISOString(),
              size: Math.random() * 2147483648, // Random size up to 2GB
              type: 'manual',
              status: 'completed',
              content: values.content,
              retention: values.retention,
              expiryDate: expiryDate.toISOString()
            };
            
            setBackups([newBackup, ...backups]);
            message.success('Sao lưu dữ liệu thành công!');
            return 0;
          }
          return prev + 5;
        });
      }, 300);
      
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  // Xử lý xóa bản sao lưu
  const handleDeleteBackup = (id: string) => {
    setBackups(backups.filter(backup => backup.id !== id));
    message.success('Đã xóa bản sao lưu thành công!');
  };

  // Xử lý khôi phục từ bản sao lưu
  const handleRestore = (backup: BackupItem) => {
    Modal.confirm({
      title: 'Xác nhận khôi phục dữ liệu',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc chắn muốn khôi phục dữ liệu từ bản sao lưu này?</p>
          <p><strong>Lưu ý:</strong> Dữ liệu hiện tại sẽ bị ghi đè. Quá trình này không thể hoàn tác.</p>
          <p>Bản sao lưu: <strong>{backup.name}</strong></p>
          <p>Thời gian: {new Date(backup.date).toLocaleString('vi-VN')}</p>
        </div>
      ),
      onOk() {
        message.loading('Đang khôi phục dữ liệu...', 3, () => {
          message.success('Khôi phục dữ liệu thành công!');
        });
      },
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      width: 500
    });
  };

  // Xử lý lưu cài đặt
  const handleSaveSettings = () => {
    settingsForm.validateFields().then(values => {
      console.log('Settings:', values);
      setSettingsVisible(false);
      message.success('Đã lưu cài đặt sao lưu thành công!');
    });
  };

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<BackupItem> = [
    {
      title: 'Tên bản sao lưu',
      key: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.type === 'auto' ? (
              <Tag color="blue" icon={<SyncOutlined />}>Tự động</Tag>
            ) : (
              <Tag color="green" icon={<HistoryOutlined />}>Thủ công</Tag>
            )}
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Thời gian',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleTimeString('vi-VN')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
      render: (size) => formatBytes(size),
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: 'Nội dung',
      key: 'content',
      render: (_, record) => (
        <Space size={0} wrap>
          {record.content.includes('database') && (
            <Tooltip title="Cơ sở dữ liệu">
              <Tag color="blue" icon={<DatabaseOutlined />}>
                DB
              </Tag>
            </Tooltip>
          )}
          {record.content.includes('files') && (
            <Tooltip title="Tệp tin">
              <Tag color="green" icon={<FileZipOutlined />}>
                Files
              </Tag>
            </Tooltip>
          )}
          {record.content.includes('configurations') && (
            <Tooltip title="Cấu hình">
              <Tag color="purple" icon={<SettingOutlined />}>
                Config
              </Tag>
            </Tooltip>
          )}
        </Space>
      ),
      filters: [
        { text: 'Cơ sở dữ liệu', value: 'database' },
        { text: 'Tệp tin', value: 'files' },
        { text: 'Cấu hình', value: 'configurations' },
      ],
      onFilter: (value, record) => record.content.includes(value as 'database' | 'files' | 'configurations'),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        if (record.status === 'completed') {
          return <Badge status="success" text="Hoàn thành" />;
        } else if (record.status === 'in_progress') {
          return <Badge status="processing" text="Đang thực hiện" />;
        } else {
          return <Badge status="error" text="Lỗi" />;
        }
      },
      filters: [
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đang thực hiện', value: 'in_progress' },
        { text: 'Lỗi', value: 'error' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thời hạn lưu trữ',
      key: 'retention',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.retention} ngày</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Hết hạn: {new Date(record.expiryDate).toLocaleDateString('vi-VN')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Tải xuống">
            <Button icon={<CloudDownloadOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Khôi phục">
            <Button 
              icon={<SyncOutlined />} 
              size="small"
              onClick={() => handleRestore(record)}
              disabled={record.status !== 'completed'}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa bản sao lưu này?"
              onConfirm={() => handleDeleteBackup(record.id)}
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

  return (
    <div>
      <Title level={2}>Sao lưu và khôi phục</Title>

      {isBackupInProgress && (
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Đang sao lưu dữ liệu...</Text>
            <Progress percent={backupProgress} status="active" />
          </Space>
        </Card>
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số bản sao lưu"
              value={backups.filter(b => b.status === 'completed').length}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng dung lượng sao lưu"
              value={formatBytes(backups.reduce((total, backup) => total + backup.size, 0))}
              prefix={<FileZipOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Sao lưu tự động tiếp theo"
              value="02:00 - 31/10/2023"
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button 
              type="primary" 
              icon={<CloudUploadOutlined />} 
              onClick={handleCreateBackup}
            >
              Tạo bản sao lưu mới
            </Button>
            <Button 
              icon={<SettingOutlined />} 
              onClick={handleShowSettings}
            >
              Cài đặt sao lưu tự động
            </Button>
          </Space>
          
          <Space>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: 280 }}
            />
            <Select defaultValue="all" style={{ width: 150 }}>
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="completed">Hoàn thành</Select.Option>
              <Select.Option value="in_progress">Đang thực hiện</Select.Option>
              <Select.Option value="error">Lỗi</Select.Option>
            </Select>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={backups}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản sao lưu`
          }}
        />
      </Card>

      {/* Modal tạo bản sao lưu mới */}
      <Modal
        title="Tạo bản sao lưu mới"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleStartBackup}>
            Bắt đầu sao lưu
          </Button>,
        ]}
      >
        <Form
          form={backupForm}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên bản sao lưu"
            rules={[{ required: true, message: 'Vui lòng nhập tên bản sao lưu' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung sao lưu"
            rules={[{ required: true, message: 'Vui lòng chọn nội dung sao lưu' }]}
          >
            <Select mode="multiple" placeholder="Chọn nội dung sao lưu">
              <Select.Option value="database">Cơ sở dữ liệu</Select.Option>
              <Select.Option value="files">Tệp tin</Select.Option>
              <Select.Option value="configurations">Cấu hình hệ thống</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="retention"
            label="Thời gian lưu trữ (ngày)"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian lưu trữ' }]}
          >
            <Select>
              <Select.Option value={7}>7 ngày</Select.Option>
              <Select.Option value={30}>30 ngày</Select.Option>
              <Select.Option value={60}>60 ngày</Select.Option>
              <Select.Option value={90}>90 ngày</Select.Option>
              <Select.Option value={180}>180 ngày</Select.Option>
              <Select.Option value={365}>365 ngày</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cài đặt sao lưu tự động */}
      <Modal
        title="Cài đặt sao lưu tự động"
        visible={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setSettingsVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSaveSettings}>
            Lưu cài đặt
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={settingsForm}
          layout="vertical"
        >
          <Form.Item
            name="autoBackup"
            valuePropName="checked"
          >
            <Checkbox>Bật sao lưu tự động</Checkbox>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="frequency"
                label="Tần suất sao lưu"
              >
                <Select>
                  <Select.Option value="daily">Hàng ngày</Select.Option>
                  <Select.Option value="weekly">Hàng tuần</Select.Option>
                  <Select.Option value="monthly">Hàng tháng</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Thời gian sao lưu"
              >
                <Input placeholder="HH:MM" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="content"
            label="Nội dung sao lưu"
          >
            <Select mode="multiple" placeholder="Chọn nội dung sao lưu">
              <Select.Option value="database">Cơ sở dữ liệu</Select.Option>
              <Select.Option value="files">Tệp tin</Select.Option>
              <Select.Option value="configurations">Cấu hình hệ thống</Select.Option>
            </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="retention"
                label="Thời gian lưu trữ (ngày)"
              >
                <Select>
                  <Select.Option value={7}>7 ngày</Select.Option>
                  <Select.Option value={30}>30 ngày</Select.Option>
                  <Select.Option value={60}>60 ngày</Select.Option>
                  <Select.Option value={90}>90 ngày</Select.Option>
                  <Select.Option value={180}>180 ngày</Select.Option>
                  <Select.Option value={365}>365 ngày</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="compress"
                valuePropName="checked"
              >
                <Checkbox>Nén dữ liệu sao lưu</Checkbox>
              </Form.Item>
            </Col>
          </Row>
          
          <Divider />
          
          <Alert
            message="Lưu ý về sao lưu tự động"
            description="Sao lưu tự động sẽ chạy theo lịch đã cài đặt. Hãy đảm bảo hệ thống vẫn đang hoạt động vào thời điểm này để quá trình sao lưu diễn ra thành công."
            type="info"
            showIcon
          />
        </Form>
      </Modal>
    </div>
  );
};

export default BackupPage; 