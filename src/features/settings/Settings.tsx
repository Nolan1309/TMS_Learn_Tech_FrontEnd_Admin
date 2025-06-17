import React, { useState, useEffect } from 'react';
import { Typography, Card, Form, Input, Button, Select, Upload, message, Row, Col, Divider, Table, Switch } from 'antd';
import { UploadOutlined, SaveOutlined, GlobalOutlined, CheckOutlined, BellOutlined, MailOutlined, MobileOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// Danh sách điểm qua bài mẫu
const passingScoreOptions = [
  { id: 1, name: 'Điểm chuẩn cơ bản', value: 50, description: 'Áp dụng cho các bài tập cơ bản' },
  { id: 2, name: 'Điểm chuẩn trung bình', value: 60, description: 'Áp dụng cho hầu hết các bài tập' },
  { id: 3, name: 'Điểm chuẩn khá', value: 70, description: 'Áp dụng cho các bài tập nâng cao' },
  { id: 4, name: 'Điểm chuẩn giỏi', value: 80, description: 'Áp dụng cho các bài tập khó' },
  { id: 5, name: 'Điểm chuẩn xuất sắc', value: 90, description: 'Áp dụng cho các bài thi đánh giá' },
];

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [generalForm] = Form.useForm();
  const [selectedScoreId, setSelectedScoreId] = useState<number>(3); // Default selection: Điểm chuẩn khá (70)

  useEffect(() => {
    // Giả lập tải dữ liệu
    setTimeout(() => {
      setLoading(false);
      
      // Điền dữ liệu giả lập vào form
      generalForm.setFieldsValue({
        siteName: 'Hệ thống Điểm Quá Bài',
        siteDescription: 'Hệ thống quản lý điểm quá bài cho học viên',
        language: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        emailNotification: true,
        pushNotification: true,
        smsNotification: false,
        completionNotification: true,
        failureNotification: true,
        weeklyReportNotification: true
      });
    }, 1000);
  }, [generalForm]);

  const onGeneralFinish = (values: any) => {
    const selectedScore = passingScoreOptions.find(option => option.id === selectedScoreId);
    console.log('General settings values:', { ...values, selectedPassingScore: selectedScore });
    message.success('Đã lưu thiết lập điểm quá bài thành công!');
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleScoreSelect = (id: number) => {
    setSelectedScoreId(id);
  };

  const columns = [
    {
      title: 'Chọn',
      key: 'action',
      width: 80,
      render: (_: any, record: any) => (
        <Button
          type={record.id === selectedScoreId ? 'primary' : 'default'}
          icon={record.id === selectedScoreId ? <CheckOutlined /> : null}
          onClick={() => handleScoreSelect(record.id)}
        >
          {record.id === selectedScoreId ? 'Đã chọn' : 'Chọn'}
        </Button>
      ),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá trị điểm',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <div>
      <Title level={2}>Cài đặt Điểm Qua Bài</Title>
      <Paragraph>Quản lý các thiết lập điểm quá bài cho học viên</Paragraph>

      <Card loading={loading}>
        <Form
          form={generalForm}
          layout="vertical"
          onFinish={onGeneralFinish}
        >
          

          <Divider orientation="left">Danh sách điểm qua bài</Divider>
          
          <Table 
            dataSource={passingScoreOptions} 
            columns={columns} 
            rowKey="id"
            pagination={false}
            bordered
          />
          
          <Divider orientation="left">
            <BellOutlined /> Thiết lập thông báo
          </Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Thông báo nhắc học"
                name="completionNotification"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            
          </Row>

          <Divider />

          

          

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Lưu thiết lập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;