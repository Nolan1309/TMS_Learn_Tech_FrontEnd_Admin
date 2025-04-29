import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, Button, Space, Card, Input, Tag, Select, 
  DatePicker, Modal, Form, Upload, Tabs, Tooltip, Divider, 
  Badge, Popconfirm, Row, Col, Statistic, Progress, message 
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, 
  DownloadOutlined, UploadOutlined, FileOutlined, TeamOutlined,
  FilePdfOutlined, TrophyOutlined, ClockCircleOutlined, 
  CheckCircleOutlined, FormOutlined, LockOutlined, UnlockOutlined,
  DollarOutlined, ImportOutlined, ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface MockExam {
  id: string;
  title: string;
  category: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  duration: number;
  attemptCount: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
  price: number;
  author: string;
  status: 'active' | 'inactive' | 'draft';
  isPaid: boolean;
  passingScore: number;
  tags: string[];
}

const MockExamsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [form] = Form.useForm();

  useEffect(() => {
    // Giả lập tải dữ liệu
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Dữ liệu giả
  const mockExams: MockExam[] = [
    {
      id: '1',
      title: 'Đề thi thử THPT Quốc Gia 2024 - Toán học (Lần 1)',
      category: 'THPT Quốc Gia',
      subject: 'Toán',
      difficulty: 'medium',
      questionCount: 50,
      duration: 90,
      attemptCount: 1245,
      averageScore: 7.2,
      createdAt: '2023-09-10',
      updatedAt: '2023-09-15',
      price: 0,
      author: 'Nguyễn Văn A',
      status: 'active',
      isPaid: false,
      passingScore: 5.0,
      tags: ['đề mới', 'có đáp án']
    },
    {
      id: '2',
      title: 'Đề luyện thi đại học - Vật lý (Chuyên đề Điện)',
      category: 'Luyện thi đại học',
      subject: 'Vật lý',
      difficulty: 'hard',
      questionCount: 40,
      duration: 60,
      attemptCount: 789,
      averageScore: 6.5,
      createdAt: '2023-08-20',
      updatedAt: '2023-08-25',
      price: 45000,
      author: 'Trần Thị B',
      status: 'active',
      isPaid: true,
      passingScore: 6.0,
      tags: ['chuyên đề', 'đề khó']
    },
    {
      id: '3',
      title: 'Đề thi thử THPT Quốc Gia 2024 - Hóa học (Cơ bản)',
      category: 'THPT Quốc Gia',
      subject: 'Hóa học',
      difficulty: 'easy',
      questionCount: 40,
      duration: 50,
      attemptCount: 968,
      averageScore: 8.1,
      createdAt: '2023-09-05',
      updatedAt: '2023-09-05',
      price: 0,
      author: 'Lê Văn C',
      status: 'active',
      isPaid: false,
      passingScore: 5.0,
      tags: ['cơ bản', 'dễ']
    },
    {
      id: '4',
      title: 'Đề thi thử THPT Quốc Gia 2024 - Tiếng Anh (Nâng cao)',
      category: 'THPT Quốc Gia',
      subject: 'Tiếng Anh',
      difficulty: 'hard',
      questionCount: 50,
      duration: 60,
      attemptCount: 1035,
      averageScore: 6.9,
      createdAt: '2023-09-01',
      updatedAt: '2023-09-10',
      price: 50000,
      author: 'Phạm Thị D',
      status: 'active',
      isPaid: true,
      passingScore: 6.5,
      tags: ['nâng cao', 'đề hay', 'có giải thích']
    },
    {
      id: '5',
      title: 'Đề luyện thi đại học - Sinh học (Chuyên đề Di truyền)',
      category: 'Luyện thi đại học',
      subject: 'Sinh học',
      difficulty: 'medium',
      questionCount: 35,
      duration: 50,
      attemptCount: 0,
      averageScore: 0,
      createdAt: '2023-10-01',
      updatedAt: '2023-10-01',
      price: 35000,
      author: 'Vũ Văn E',
      status: 'draft',
      isPaid: true,
      passingScore: 5.5,
      tags: ['chuyên đề', 'di truyền']
    },
    {
      id: '6',
      title: 'Đề thi thử học kỳ 1 - Lớp 12 - Ngữ văn',
      category: 'Học kỳ',
      subject: 'Ngữ văn',
      difficulty: 'medium',
      questionCount: 6,
      duration: 120,
      attemptCount: 12,
      averageScore: 7.8,
      createdAt: '2023-08-15',
      updatedAt: '2023-08-15',
      price: 0,
      author: 'Hoàng Thị F',
      status: 'inactive',
      isPaid: false,
      passingScore: 5.0,
      tags: ['tự luận', 'văn học']
    }
  ];

  const getDifficultyTag = (difficulty: string) => {
    switch(difficulty) {
      case 'easy':
        return <Tag color="success">Dễ</Tag>;
      case 'medium':
        return <Tag color="warning">Trung bình</Tag>;
      case 'hard':
        return <Tag color="error">Khó</Tag>;
      default:
        return <Tag color="default">{difficulty}</Tag>;
    }
  };

  const getStatusTag = (status: string, isPaid: boolean) => {
    let statusTag;
    switch(status) {
      case 'active':
        statusTag = <Tag color="green">Đang hoạt động</Tag>;
        break;
      case 'inactive':
        statusTag = <Tag color="gray">Không hoạt động</Tag>;
        break;
      case 'draft':
        statusTag = <Tag color="gold">Bản nháp</Tag>;
        break;
      default:
        statusTag = <Tag color="default">{status}</Tag>;
    }
    
    return (
      <Space direction="vertical" size={4}>
        {statusTag}
        {isPaid ? <Tag color="red">Trả phí</Tag> : <Tag color="blue">Miễn phí</Tag>}
      </Space>
    );
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleSubjectChange = (value: string) => {
    setFilterSubject(value);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCreateMockExam = () => {
    form.validateFields()
      .then(values => {
        console.log('Form values:', values);
        message.success('Đã tạo đề thi thử mới!');
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(error => {
        console.log('Validate failed:', error);
      });
  };

  const columns: ColumnsType<MockExam> = [
    {
      title: 'Tên đề thi',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: MockExam) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Space size={4}>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.subject} | {record.category}</Text>
            {record.tags.map((tag, index) => (
              <Tag key={index} color="blue" style={{ fontSize: '10px', padding: '0 4px' }}>{tag}</Tag>
            ))}
          </Space>
        </Space>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Thông tin',
      dataIndex: 'info',
      key: 'info',
      render: (_, record: MockExam) => (
        <Space direction="vertical" size={0}>
          <Text>
            <ClockCircleOutlined style={{ marginRight: 4 }} /> {record.duration} phút | {record.questionCount} câu
          </Text>
          <Space size={4}>
            {getDifficultyTag(record.difficulty)}
            <Text>Điểm đạt: ≥ {record.passingScore}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Thống kê',
      dataIndex: 'stats',
      key: 'stats',
      render: (_, record: MockExam) => (
        record.attemptCount > 0 ? (
          <Space direction="vertical" size={0}>
            <Text><TeamOutlined style={{ marginRight: 4 }} /> {record.attemptCount} lượt thi</Text>
            <Space>
              <Text><TrophyOutlined style={{ marginRight: 4 }} /> ĐTB: {record.averageScore.toFixed(1)}/10</Text>
              <Progress 
                percent={record.averageScore * 10} 
                size="small" 
                style={{ width: 60 }} 
                showInfo={false}
                strokeColor={record.averageScore >= 8 ? '#52c41a' : record.averageScore >= 6.5 ? '#1890ff' : record.averageScore >= 5 ? '#faad14' : '#f5222d'}
              />
            </Space>
          </Space>
        ) : (
          <Text type="secondary">Chưa có dữ liệu</Text>
        )
      ),
      sorter: (a, b) => a.attemptCount - b.attemptCount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => getStatusTag(status, record.isPaid),
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Không hoạt động', value: 'inactive' },
        { text: 'Bản nháp', value: 'draft' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        price > 0 ? (
          <Text type="danger">{price.toLocaleString()}đ</Text>
        ) : (
          <Text type="success">Miễn phí</Text>
        )
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date, record) => (
        <Space direction="vertical" size={0}>
          <Text>{date}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>Tác giả: {record.author}</Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} shape="circle" />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} shape="circle" />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button 
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />} 
              shape="circle"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa đề thi này?"
              onConfirm={() => message.success('Đã xóa đề thi!')}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = mockExams.filter(exam => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return exam.status === 'active';
    if (activeTab === 'inactive') return exam.status === 'inactive';
    if (activeTab === 'draft') return exam.status === 'draft';
    if (activeTab === 'free') return !exam.isPaid;
    if (activeTab === 'paid') return exam.isPaid;
    return true;
  }).filter(exam => {
    if (!searchText) return true;
    return (
      exam.title.toLowerCase().includes(searchText.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchText.toLowerCase()) ||
      exam.category.toLowerCase().includes(searchText.toLowerCase()) ||
      exam.author.toLowerCase().includes(searchText.toLowerCase()) ||
      exam.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
    );
  }).filter(exam => {
    if (filterSubject === 'all') return true;
    return exam.subject === filterSubject;
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Thống kê
  const totalExams = mockExams.length;
  const activeExams = mockExams.filter(e => e.status === 'active').length;
  const freeExams = mockExams.filter(e => !e.isPaid).length;
  const totalAttempts = mockExams.reduce((acc, curr) => acc + curr.attemptCount, 0);
  const totalRevenue = mockExams.reduce((acc, curr) => acc + (curr.price * curr.attemptCount), 0);

  return (
    <div>
      <Title level={2}>Đề thi thử</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng số đề thi"
              value={totalExams}
              prefix={<FormOutlined />}
              suffix={<small style={{ fontSize: '15px', marginLeft: '8px' }}>({activeExams} hoạt động)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng lượt thi"
              value={totalAttempts}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Đề thi miễn phí"
              value={freeExams}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix={<small style={{ fontSize: '15px', marginLeft: '8px' }}>({((freeExams / totalExams) * 100).toFixed(0)}%)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
              >
                Tạo đề thi thử mới
              </Button>
              <Button icon={<ImportOutlined />}>
                Nhập danh sách
              </Button>
              <Button icon={<ExportOutlined />}>
                Xuất Excel
              </Button>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm đề thi..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select
                defaultValue="all"
                style={{ width: 140 }}
                onChange={handleSubjectChange}
              >
                <Option value="all">Tất cả môn học</Option>
                <Option value="Toán">Toán học</Option>
                <Option value="Vật lý">Vật lý</Option>
                <Option value="Hóa học">Hóa học</Option>
                <Option value="Sinh học">Sinh học</Option>
                <Option value="Tiếng Anh">Tiếng Anh</Option>
                <Option value="Ngữ văn">Ngữ văn</Option>
              </Select>
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab={<span>Tất cả đề thi</span>} key="all">
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đề thi`
                }}
              />
            </TabPane>
            <TabPane
              tab={
                <Badge count={mockExams.filter(e => e.status === 'active').length} showZero>
                  <span>Đang hoạt động</span>
                </Badge>
              }
              key="active"
            />
            <TabPane
              tab={
                <Badge count={mockExams.filter(e => e.status === 'inactive').length} showZero>
                  <span>Không hoạt động</span>
                </Badge>
              }
              key="inactive"
            />
            <TabPane
              tab={
                <Badge count={mockExams.filter(e => e.status === 'draft').length} showZero>
                  <span>Bản nháp</span>
                </Badge>
              }
              key="draft"
            />
            <TabPane
              tab={
                <Badge count={mockExams.filter(e => !e.isPaid).length} showZero>
                  <span>Miễn phí</span>
                </Badge>
              }
              key="free"
            />
            <TabPane
              tab={
                <Badge count={mockExams.filter(e => e.isPaid).length} showZero>
                  <span>Trả phí</span>
                </Badge>
              }
              key="paid"
            />
          </Tabs>
        </Space>
      </Card>

      <Modal
        title="Tạo đề thi thử mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleCreateMockExam}>
            Tạo
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="create_mock_exam_form"
        >
          <Form.Item
            name="title"
            label="Tên đề thi thử"
            rules={[{ required: true, message: 'Vui lòng nhập tên đề thi thử!' }]}
          >
            <Input placeholder="Nhập tên đề thi thử" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="subject"
                label="Môn học"
                rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
              >
                <Select placeholder="Chọn môn học">
                  <Option value="Toán">Toán học</Option>
                  <Option value="Vật lý">Vật lý</Option>
                  <Option value="Hóa học">Hóa học</Option>
                  <Option value="Sinh học">Sinh học</Option>
                  <Option value="Tiếng Anh">Tiếng Anh</Option>
                  <Option value="Ngữ văn">Ngữ văn</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
              >
                <Select placeholder="Chọn danh mục">
                  <Option value="THPT Quốc Gia">THPT Quốc Gia</Option>
                  <Option value="Luyện thi đại học">Luyện thi đại học</Option>
                  <Option value="Học kỳ">Học kỳ</Option>
                  <Option value="Chuyên đề">Chuyên đề</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="difficulty"
                label="Độ khó"
                rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
              >
                <Select placeholder="Chọn độ khó">
                  <Option value="easy">Dễ</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="hard">Khó</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="questionCount"
                label="Số câu hỏi"
                rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi!' }]}
              >
                <Input type="number" placeholder="Nhập số câu hỏi" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="duration"
                label="Thời gian làm bài (phút)"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}
              >
                <Input type="number" placeholder="Nhập thời gian" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="passingScore"
                label="Điểm đạt"
                rules={[{ required: true, message: 'Vui lòng nhập điểm đạt!' }]}
              >
                <Input type="number" placeholder="Nhập điểm đạt" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isPaid"
                label="Loại đề thi"
                rules={[{ required: true, message: 'Vui lòng chọn loại đề thi!' }]}
              >
                <Select placeholder="Chọn loại đề thi">
                  <Option value={false}>Miễn phí</Option>
                  <Option value={true}>Trả phí</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Giá (đ)"
                help="Để 0 nếu miễn phí"
              >
                <Input type="number" placeholder="Nhập giá" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select mode="tags" placeholder="Nhập tags cho đề thi" style={{ width: '100%' }}>
              <Option value="đề mới">đề mới</Option>
              <Option value="có đáp án">có đáp án</Option>
              <Option value="có giải thích">có giải thích</Option>
              <Option value="chuyên đề">chuyên đề</Option>
              <Option value="đề khó">đề khó</Option>
              <Option value="cơ bản">cơ bản</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả về đề thi" />
          </Form.Item>

          <Form.Item
            name="examFile"
            label="Tập tin đề thi"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload name="examFile" action="/upload.do" listType="text" maxCount={1}>
              <Button icon={<UploadOutlined />}>Tải lên tập tin</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Đang hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
              <Option value="draft">Bản nháp</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MockExamsPage; 