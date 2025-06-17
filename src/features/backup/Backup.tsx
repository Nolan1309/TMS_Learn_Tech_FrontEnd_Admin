import React, { useState, useEffect, JSX } from 'react';
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
  retention: 'local' | 'server';
  url?: string;
}

const BackupPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [backupProgress, setBackupProgress] = useState<number>(0);
  const [isBackupInProgress, setIsBackupInProgress] = useState<boolean>(false);
  const [backupForm] = Form.useForm();

  const fetchBackups = async () => {
    setLoading(true);
    try {

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/backup/list`, {

        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }

      const responseData = await response.json();
      const backupsData: BackupItem[] = responseData.map((item: any) => ({
        id: item.id,
        name: item.name,
        date: item.date,
        retention: item.retention,
        url: item.url || ''
      }));
      setBackups(backupsData);
    } catch (error) {
      console.error('Failed to fetch backups:', error);
      message.error('Không thể tải danh sách bản sao lưu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = () => {
    setIsModalVisible(true);
    backupForm.resetFields();
    backupForm.setFieldsValue({
      name: `Backup - ${new Date().toLocaleDateString('vi-VN')}`
    });
  };
  const handleStartBackup = () => {
    backupForm.validateFields().then(async (values: { name: string; retention: 'local' | 'server' }) => {
      try {
        setIsModalVisible(false);
        setIsBackupInProgress(true);
        setBackupProgress(0);

        const apiUrl = values.retention === 'server'
          ? `${process.env.REACT_APP_SERVER_HOST}/api/backup/api/dump/remote?host=103.166.143.198&port=3306&user=nolan&password=1234&database=hotrohoctap3`
          : `${process.env.REACT_APP_SERVER_HOST}/api/backup/api/dump/remote/local?host=103.166.143.198&port=3306&user=nolan&password=1234&database=hotrohoctap3`;
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: values.retention === 'server'
            ? {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
            }
            : {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
            }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
        }

        if (values.retention === 'server') {
          const url = await response.text();
          const newBackup: BackupItem = {
            id: `${backups.length + 1}`,
            name: values.name,
            date: new Date().toISOString(),
            retention: values.retention,
            url: url
          };
          setBackups([newBackup, ...backups]);
        } else {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = downloadUrl;
          const fileName = `backup_${new Date().toISOString().slice(0, 10)}.sql`;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          const newBackup: BackupItem = {
            id: `${backups.length + 1}`,
            name: values.name,
            date: new Date().toISOString(),
            retention: values.retention,
            url: downloadUrl
          };
          setBackups([newBackup, ...backups]);
        }

        setIsBackupInProgress(false);
        message.success('Sao lưu dữ liệu thành công!');
      } catch (error) {
        console.error('Backup Error:', error);
        message.error('Sao lưu thất bại: ' + (error instanceof Error ? error.message : 'Vui lòng thử lại'));
        setIsBackupInProgress(false);
      }
    }); // <-- Make sure this is closed properly
  };  // <-- Close the handleStartBackup function here

  const handleDeleteBackup = (id: string) => {
    setBackups(backups.filter(backup => backup.id !== id));
    message.success('Đã xóa bản sao lưu thành công!');
  };
  const handleRestore = (backup: BackupItem) => {
    if (!backup.url) {
      message.error('Không tìm thấy file sao lưu!');
      return;
    }

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
      onOk: async () => {
        try {

          const backupUrl = backup.url ? encodeURIComponent(backup.url) : '';
          const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/backup/api/restore/remote?host=103.166.143.198&port=3306&user=nolan&password=1234&database=hotrohoctap3&backupFileUrl=${backupUrl}`;
          const hide = message.loading('Đang khôi phục dữ liệu...', 0);

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
          }

          hide();
          message.success('Khôi phục dữ liệu thành công!');
        } catch (error) {
          message.error('Khôi phục thất bại: ' + (error instanceof Error ? error.message : 'Vui lòng thử lại'));
        }
      },
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      width: 500
    });
  };

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
      render: (retention: string, record: BackupItem) => (
        <Space direction="vertical" size={0}>
          <Text>{retention === 'local' ? 'Máy tính' : 'Server'}</Text>
          {record.url && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <a href={record.url} target="_blank" rel="noopener noreferrer">
                Xem file
              </a>
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'action', render: (_, record) => (
        <Space>
          <Tooltip title="Khôi phục">
            <Button
              icon={<CloudUploadOutlined />}
              size="small"
              onClick={() => handleRestore(record)}
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
      <Title level={2}>Sao lưu và khôi phục dữ liệu</Title>

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
            <Select placeholder="Chọn vị trí lưu">
              <Select.Option value="local">Máy tính</Select.Option>
              <Select.Option value="server">Server</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const Backup = BackupPage;
export default Backup;