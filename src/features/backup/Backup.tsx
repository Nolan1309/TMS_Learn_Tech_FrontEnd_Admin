import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Input, Select,
  Popconfirm, message, Modal, Form, Progress, Tooltip
} from 'antd';
import {
  CloudUploadOutlined, DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface BackupItem {
  id: string;
  name: string;
  date: string;
  retention: 'local' | 'cloud';
}

const BackupPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [backupProgress, setBackupProgress] = useState<number>(0);
  const [isBackupInProgress, setIsBackupInProgress] = useState<boolean>(false);
  const [backupForm] = Form.useForm();

  // Giả lập dữ liệu
  const mockBackups: BackupItem[] = [
    {
      id: '1',
      name: 'Backup - 30/10/2023',
      date: '2023-10-30T02:00:00',
      retention: 'local'
    },
    {
      id: '2',
      name: 'Backup - 29/10/2023',
      date: '2023-10-29T15:45:00',
      retention: 'cloud'
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
      name: `Backup - ${new Date().toLocaleDateString('vi-VN')}`,
      retention: 'local'
    });
  };

  const handleStartBackup = () => {
    backupForm.validateFields().then((values: { name: string; retention: 'local' | 'cloud' }) => {
      setIsModalVisible(false);
      setIsBackupInProgress(true);
      setBackupProgress(0);

      // Giả lập tiến trình sao lưu
      const interval = setInterval(() => {
        setBackupProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsBackupInProgress(false);

            const newBackup: BackupItem = {
              id: `${backups.length + 1}`,
              name: values.name,
              date: new Date().toISOString(),
              retention: values.retention
            };

            setBackups([newBackup, ...backups]);
            message.success('Sao lưu dữ liệu thành công!');
            return 0;
          }
          return prev + 5;
        });
      }, 300);
    }).catch((info) => {
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

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<BackupItem> = [
    {
      title: 'Tên bản sao lưu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Thời gian',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Vị trí lưu',
      dataIndex: 'retention',
      key: 'retention',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
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

      <Card>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={handleCreateBackup}
          style={{ marginBottom: 16 }}
        >
          Tạo bản sao lưu mới
        </Button>

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
            name="retention"
            label="Vị trí lưu"
            rules={[{ required: true, message: 'Vui lòng chọn vị trí lưu' }]}
          >
            <Select>
              <Select.Option value="local">Máy tính</Select.Option>
              <Select.Option value="cloud">Cloud</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BackupPage;