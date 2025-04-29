import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, Button, Space, Card, Input, Tag, Select, 
  DatePicker, Tabs, Tooltip, Divider, Badge, Popconfirm, 
  Statistic, Row, Col, Progress, Avatar, message
} from 'antd';
import { 
  SearchOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, 
  FileExcelOutlined, FilePdfOutlined, UserOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined,
  ExportOutlined, FilterOutlined, SortAscendingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface TestResult {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatar?: string;
  examId: string;
  examTitle: string;
  subject: string;
  score: number;
  maxScore: number;
  percentageScore: number;
  correctAnswers: number;
  totalQuestions: number;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'completed' | 'passed' | 'failed' | 'reviewed';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
}

const ResultsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  useEffect(() => {
    // Giả lập tải dữ liệu
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Dữ liệu giả
  const results: TestResult[] = [
    {
      id: '1',
      studentId: 'SV00123',
      studentName: 'Nguyễn Văn A',
      studentEmail: 'nguyenvana@email.com',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      examId: 'E001',
      examTitle: 'Đề thi học kỳ 1 - Toán 12',
      subject: 'Toán',
      score: 85,
      maxScore: 100,
      percentageScore: 85,
      correctAnswers: 42,
      totalQuestions: 50,
      startTime: '2023-10-15T08:30:00',
      endTime: '2023-10-15T10:00:00',
      duration: 90,
      status: 'passed'
    },
    {
      id: '2',
      studentId: 'SV00456',
      studentName: 'Trần Thị B',
      studentEmail: 'tranthib@email.com',
      examId: 'E002',
      examTitle: 'Đề thi THPT Quốc Gia - Tiếng Anh',
      subject: 'Tiếng Anh',
      score: 65,
      maxScore: 100,
      percentageScore: 65,
      correctAnswers: 32,
      totalQuestions: 50,
      startTime: '2023-10-16T14:00:00',
      endTime: '2023-10-16T15:00:00',
      duration: 60,
      status: 'passed'
    },
    {
      id: '3',
      studentId: 'SV00789',
      studentName: 'Lê Văn C',
      studentEmail: 'levanc@email.com',
      avatar: 'https://joeschmoe.io/api/v1/random',
      examId: 'E003',
      examTitle: 'Đề thi thử đại học - Vật lý',
      subject: 'Vật lý',
      score: 45,
      maxScore: 100,
      percentageScore: 45,
      correctAnswers: 18,
      totalQuestions: 40,
      startTime: '2023-10-17T09:00:00',
      endTime: '2023-10-17T09:50:00',
      duration: 50,
      status: 'failed'
    },
    {
      id: '4',
      studentId: 'SV01001',
      studentName: 'Phạm Thị D',
      studentEmail: 'phamthid@email.com',
      examId: 'E004',
      examTitle: 'Đề luyện tập môn Hóa học - Chương 3',
      subject: 'Hóa học',
      score: 90,
      maxScore: 100,
      percentageScore: 90,
      correctAnswers: 18,
      totalQuestions: 20,
      startTime: '2023-10-18T10:30:00',
      endTime: '2023-10-18T11:15:00',
      duration: 45,
      status: 'passed'
    },
    {
      id: '5',
      studentId: 'SV01234',
      studentName: 'Vũ Văn E',
      studentEmail: 'vuvane@email.com',
      examId: 'E005',
      examTitle: 'Đề thi thử đại học - Sinh học',
      subject: 'Sinh học',
      score: 72,
      maxScore: 100,
      percentageScore: 72,
      correctAnswers: 29,
      totalQuestions: 40,
      startTime: '2023-10-19T13:00:00',
      endTime: '2023-10-19T13:50:00',
      duration: 50,
      status: 'passed'
    },
    {
      id: '6',
      studentId: 'SV00789',
      studentName: 'Lê Văn C',
      studentEmail: 'levanc@email.com',
      avatar: 'https://joeschmoe.io/api/v1/random',
      examId: 'E006',
      examTitle: 'Đề thi giữa kỳ - Hóa học',
      subject: 'Hóa học',
      score: 35,
      maxScore: 100,
      percentageScore: 35,
      correctAnswers: 14,
      totalQuestions: 40,
      startTime: '2023-10-20T10:00:00',
      endTime: '2023-10-20T10:50:00',
      duration: 50,
      status: 'failed',
      reviewedBy: 'Giảng viên Nguyễn X',
      reviewedAt: '2023-10-21T08:30:00',
      reviewComments: 'Cần ôn tập lại lý thuyết chương 4 và 5'
    }
  ];

  const getStatusTag = (status: string) => {
    switch(status) {
      case 'passed':
        return <Tag icon={<CheckCircleOutlined />} color="success">Đạt</Tag>;
      case 'failed':
        return <Tag icon={<CloseCircleOutlined />} color="error">Không đạt</Tag>;
      case 'completed':
        return <Tag icon={<CheckCircleOutlined />} color="processing">Hoàn thành</Tag>;
      case 'reviewed':
        return <Tag icon={<EyeOutlined />} color="warning">Đã xem xét</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#1890ff';
    if (score >= 50) return '#faad14';
    return '#f5222d';
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings);
  };

  const handleSubjectChange = (value: string) => {
    setFilterSubject(value);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const downloadResults = () => {
    message.success('Đang tải xuống kết quả...');
  };

  const columns: ColumnsType<TestResult> = [
    {
      title: 'Học viên',
      dataIndex: 'student',
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={!record.avatar && <UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.studentName}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.studentId} | {record.studentEmail}</Text>
          </Space>
        </Space>
      ),
      sorter: (a, b) => a.studentName.localeCompare(b.studentName),
    },
    {
      title: 'Bài thi',
      dataIndex: 'exam',
      key: 'exam',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.examTitle}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>Môn: {record.subject}</Text>
        </Space>
      ),
      sorter: (a, b) => a.examTitle.localeCompare(b.examTitle),
      filters: [
        { text: 'Toán', value: 'Toán' },
        { text: 'Tiếng Anh', value: 'Tiếng Anh' },
        { text: 'Vật lý', value: 'Vật lý' },
        { text: 'Hóa học', value: 'Hóa học' },
        { text: 'Sinh học', value: 'Sinh học' },
      ],
      onFilter: (value, record) => record.subject === value,
    },
    {
      title: 'Điểm số',
      dataIndex: 'score',
      key: 'score',
      render: (_, record) => (
        <Space direction="vertical" size={0} style={{ width: '100%' }}>
          <Text strong style={{ color: getScoreColor(record.percentageScore) }}>
            {record.score}/{record.maxScore} ({record.percentageScore}%)
          </Text>
          <Progress 
            percent={record.percentageScore} 
            size="small" 
            showInfo={false}
            strokeColor={getScoreColor(record.percentageScore)}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.correctAnswers}/{record.totalQuestions} câu đúng
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.percentageScore - b.percentageScore,
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (_, record) => {
        const startDate = new Date(record.startTime);
        const formattedStart = `${startDate.toLocaleDateString('vi-VN')} ${startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
        
        return (
          <Space direction="vertical" size={0}>
            <Text>{formattedStart}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <ClockCircleOutlined /> {record.duration} phút
            </Text>
          </Space>
        );
      },
      sorter: (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đạt', value: 'passed' },
        { text: 'Không đạt', value: 'failed' },
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đã xem xét', value: 'reviewed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} shape="circle" />
          </Tooltip>
          <Tooltip title="Tải xuống PDF">
            <Button icon={<FilePdfOutlined />} shape="circle" />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa kết quả này?"
              onConfirm={() => message.success('Đã xóa kết quả!')}
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

  const filteredData = results.filter(result => {
    if (activeTab === 'all') return true;
    if (activeTab === 'passed') return result.status === 'passed';
    if (activeTab === 'failed') return result.status === 'failed';
    if (activeTab === 'reviewed') return result.status === 'reviewed';
    return true;
  }).filter(result => {
    if (!searchText) return true;
    return (
      result.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      result.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
      result.examTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      result.subject.toLowerCase().includes(searchText.toLowerCase())
    );
  }).filter(result => {
    if (filterSubject === 'all') return true;
    return result.subject === filterSubject;
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Tính toán thống kê tổng hợp
  const totalResults = results.length;
  const passedResults = results.filter(r => r.status === 'passed').length;
  const failedResults = results.filter(r => r.status === 'failed').length;
  const averageScore = results.reduce((acc, curr) => acc + curr.percentageScore, 0) / totalResults;

  return (
    <div>
      <Title level={2}>Kết quả bài thi</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số bài thi"
              value={totalResults}
              prefix={<FileExcelOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Số bài đạt"
              value={passedResults}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
              suffix={<small style={{ fontSize: '15px', marginLeft: '8px' }}>({((passedResults / totalResults) * 100).toFixed(1)}%)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Số bài không đạt"
              value={failedResults}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
              suffix={<small style={{ fontSize: '15px', marginLeft: '8px' }}>({((failedResults / totalResults) * 100).toFixed(1)}%)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Điểm trung bình"
              value={averageScore.toFixed(1)}
              precision={1}
              valueStyle={{ color: getScoreColor(averageScore) }}
              prefix={<TrophyOutlined />}
              suffix="%"
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
                onClick={downloadResults}
                disabled={selectedRowKeys.length === 0}
              >
                Tải xuống {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}
              </Button>
              <Button icon={<ExportOutlined />}>
                Xuất dữ liệu
              </Button>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm kết quả..."
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
                <Option value="Tiếng Anh">Tiếng Anh</Option>
                <Option value="Vật lý">Vật lý</Option>
                <Option value="Hóa học">Hóa học</Option>
                <Option value="Sinh học">Sinh học</Option>
              </Select>
              <RangePicker onChange={handleDateRangeChange} />
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab={<span>Tất cả kết quả</span>} key="all">
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} kết quả`
                }}
              />
            </TabPane>
            <TabPane
              tab={
                <Badge count={results.filter(r => r.status === 'passed').length} showZero>
                  <span>Đạt</span>
                </Badge>
              }
              key="passed"
            />
            <TabPane
              tab={
                <Badge count={results.filter(r => r.status === 'failed').length} showZero>
                  <span>Không đạt</span>
                </Badge>
              }
              key="failed"
            />
            <TabPane
              tab={
                <Badge count={results.filter(r => r.status === 'reviewed').length} showZero>
                  <span>Đã xem xét</span>
                </Badge>
              }
              key="reviewed"
            />
          </Tabs>
        </Space>
      </Card>
    </div>
  );
};

export default ResultsPage; 