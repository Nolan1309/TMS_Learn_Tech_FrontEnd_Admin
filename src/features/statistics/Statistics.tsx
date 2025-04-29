import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Row, Col, Select, Statistic, Table, Tabs,
  Space, Tag, DatePicker, Button, Progress, Divider
} from 'antd';
import {
  UserOutlined, BookOutlined, DollarOutlined, FileTextOutlined,
  RiseOutlined, FallOutlined, InfoCircleOutlined, BarChartOutlined,
  LineChartOutlined, PieChartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface StatisticsData {
  totalRevenue: number;
  totalStudents: number;
  totalCourses: number;
  totalDocuments: number;
  revenueGrowth: number;
  studentsGrowth: number;
  coursesGrowth: number;
  documentsGrowth: number;
  monthlySales: { month: string; value: number }[];
  topCourses: TopCourse[];
  categorySales: { category: string; value: number }[];
  newStudents: NewStudent[];
}

interface TopCourse {
  id: string;
  name: string;
  students: number;
  revenue: number;
  rating: number;
  status: 'active' | 'inactive';
  trend: 'up' | 'down' | 'stable';
  author: string;
}

interface NewStudent {
  id: string;
  name: string;
  enrollDate: string;
  courseName: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  amount: number;
  source: string;
}

const StatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('week');
  const [period, setPeriod] = useState<[string, string] | null>(null);

  // Dữ liệu mẫu - trong thực tế sẽ được lấy từ API
  const mockData: StatisticsData = {
    totalRevenue: 145800000,
    totalStudents: 842,
    totalCourses: 38,
    totalDocuments: 156,
    revenueGrowth: 12.5,
    studentsGrowth: 8.3,
    coursesGrowth: 5.2,
    documentsGrowth: 15.8,
    monthlySales: [
      { month: 'T1', value: 8500000 },
      { month: 'T2', value: 9200000 },
      { month: 'T3', value: 11500000 },
      { month: 'T4', value: 10800000 },
      { month: 'T5', value: 12300000 },
      { month: 'T6', value: 14000000 },
      { month: 'T7', value: 15200000 },
      { month: 'T8', value: 16800000 },
      { month: 'T9', value: 15500000 },
      { month: 'T10', value: 16700000 },
      { month: 'T11', value: 17800000 },
      { month: 'T12', value: 18500000 },
    ],
    topCourses: [
      {
        id: 'C001',
        name: 'Lập trình Python cơ bản đến nâng cao',
        students: 145,
        revenue: 29000000,
        rating: 4.8,
        status: 'active',
        trend: 'up',
        author: 'Nguyễn Văn A'
      },
      {
        id: 'C002',
        name: 'Toán cao cấp cho kỳ thi THPT Quốc Gia',
        students: 128,
        revenue: 25600000,
        rating: 4.7,
        status: 'active',
        trend: 'up',
        author: 'Trần Thị B'
      },
      {
        id: 'C003',
        name: 'Tiếng Anh giao tiếp nâng cao',
        students: 98,
        revenue: 19600000,
        rating: 4.6,
        status: 'active',
        trend: 'stable',
        author: 'Lê Văn C'
      },
      {
        id: 'C004',
        name: 'Hóa học chuyên đề hữu cơ',
        students: 87,
        revenue: 17400000,
        rating: 4.5,
        status: 'active',
        trend: 'stable',
        author: 'Phạm Thị D'
      },
      {
        id: 'C005',
        name: 'Lập trình Web với ReactJS',
        students: 76,
        revenue: 15200000,
        rating: 4.9,
        status: 'active',
        trend: 'up',
        author: 'Hoàng Văn E'
      }
    ],
    categorySales: [
      { category: 'Lập trình', value: 58000000 },
      { category: 'Ngoại ngữ', value: 32000000 },
      { category: 'Toán học', value: 25600000 },
      { category: 'Vật lý', value: 15200000 },
      { category: 'Hóa học', value: 17400000 },
      { category: 'Sinh học', value: 12600000 },
    ],
    newStudents: [
      {
        id: 'S001',
        name: 'Nguyễn Văn X',
        enrollDate: '2023-10-20',
        courseName: 'Lập trình Python cơ bản đến nâng cao',
        paymentStatus: 'paid',
        amount: 2000000,
        source: 'Facebook'
      },
      {
        id: 'S002',
        name: 'Trần Thị Y',
        enrollDate: '2023-10-19',
        courseName: 'Tiếng Anh giao tiếp nâng cao',
        paymentStatus: 'paid',
        amount: 1800000,
        source: 'Google'
      },
      {
        id: 'S003',
        name: 'Lê Văn Z',
        enrollDate: '2023-10-18',
        courseName: 'Toán cao cấp cho kỳ thi THPT Quốc Gia',
        paymentStatus: 'pending',
        amount: 2200000,
        source: 'Giới thiệu'
      },
      {
        id: 'S004',
        name: 'Phạm Thị W',
        enrollDate: '2023-10-18',
        courseName: 'Hóa học chuyên đề hữu cơ',
        paymentStatus: 'failed',
        amount: 1900000,
        source: 'Website'
      },
      {
        id: 'S005',
        name: 'Hoàng Văn V',
        enrollDate: '2023-10-17',
        courseName: 'Lập trình Web với ReactJS',
        paymentStatus: 'paid',
        amount: 2100000,
        source: 'Instagram'
      }
    ]
  };

  // Giả lập tải dữ liệu
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const handlePeriodChange = (dates: any, dateStrings: [string, string]) => {
    setPeriod(dateStrings);
  };

  // Cột cho bảng khóa học hàng đầu
  const topCoursesColumns: ColumnsType<TopCourse> = [
    {
      title: 'Tên khóa học',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Tác giả: {record.author}
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Học viên',
      dataIndex: 'students',
      key: 'students',
      sorter: (a, b) => a.students - b.students,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value) => `${(value).toLocaleString()}đ`,
      sorter: (a, b) => a.revenue - b.revenue,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => (
        <Space>
          {rating} <span style={{ color: '#faad14' }}>★</span>
        </Space>
      ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: 'Xu hướng',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend) => {
        switch(trend) {
          case 'up':
            return <Tag icon={<RiseOutlined />} color="success">Tăng</Tag>;
          case 'down':
            return <Tag icon={<FallOutlined />} color="error">Giảm</Tag>;
          case 'stable':
            return <Tag color="default">Ổn định</Tag>;
          default:
            return <Tag color="default">{trend}</Tag>;
        }
      },
      filters: [
        { text: 'Tăng', value: 'up' },
        { text: 'Giảm', value: 'down' },
        { text: 'Ổn định', value: 'stable' },
      ],
      onFilter: (value, record) => record.trend === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        return status === 'active' 
          ? <Tag color="success">Đang hoạt động</Tag>
          : <Tag color="error">Ngừng hoạt động</Tag>;
      },
      filters: [
        { text: 'Đang hoạt động', value: 'active' },
        { text: 'Ngừng hoạt động', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  // Cột cho bảng học viên mới
  const newStudentsColumns: ColumnsType<NewStudent> = [
    {
      title: 'Học viên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrollDate',
      key: 'enrollDate',
      sorter: (a, b) => new Date(a.enrollDate).getTime() - new Date(b.enrollDate).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseName',
      key: 'courseName',
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      filters: [
        { text: 'Facebook', value: 'Facebook' },
        { text: 'Google', value: 'Google' },
        { text: 'Website', value: 'Website' },
        { text: 'Giới thiệu', value: 'Giới thiệu' },
        { text: 'Instagram', value: 'Instagram' },
      ],
      onFilter: (value, record) => record.source === value,
    },
    {
      title: 'Thanh toán',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toLocaleString()}đ`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status) => {
        switch(status) {
          case 'paid':
            return <Tag color="success">Đã thanh toán</Tag>;
          case 'pending':
            return <Tag color="warning">Đang xử lý</Tag>;
          case 'failed':
            return <Tag color="error">Thất bại</Tag>;
          default:
            return <Tag color="default">{status}</Tag>;
        }
      },
      filters: [
        { text: 'Đã thanh toán', value: 'paid' },
        { text: 'Đang xử lý', value: 'pending' },
        { text: 'Thất bại', value: 'failed' },
      ],
      onFilter: (value, record) => record.paymentStatus === value,
    },
  ];

  const getTrendIcon = (value: number) => {
    if (value > 0) {
      return <RiseOutlined style={{ color: '#52c41a' }} />;
    } else if (value < 0) {
      return <FallOutlined style={{ color: '#f5222d' }} />;
    }
    return null;
  };

  const renderTrend = (value: number) => {
    const color = value > 0 ? '#52c41a' : value < 0 ? '#f5222d' : 'inherit';
    const sign = value > 0 ? '+' : '';
    return (
      <div style={{ color }}>
        {getTrendIcon(value)} {sign}{value}%
      </div>
    );
  };

  const calculatePercentage = (value: number, total: number): number => {
    return Number(((value / total) * 100).toFixed(1));
  };

  // Mảng màu cho biểu đồ
  const COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#faad14', '#722ed1'];

  return (
    <div style={{ padding: '20px' }}>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={2}>Thống kê</Title>
        
        <Space>
          <Select
            defaultValue="week"
            style={{ width: 120 }}
            onChange={handleTimeRangeChange}
          >
            <Option value="today">Hôm nay</Option>
            <Option value="week">Tuần này</Option>
            <Option value="month">Tháng này</Option>
            <Option value="quarter">Quý này</Option>
            <Option value="year">Năm nay</Option>
          </Select>
          
          <RangePicker
            onChange={handlePeriodChange}
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          
          <Button icon={<InfoCircleOutlined />}>
            Xuất báo cáo
          </Button>
        </Space>
      </Space>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Doanh thu"
              value={mockData.totalRevenue}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="đ"
              formatter={(value) => `${(Number(value)/1000000).toFixed(2)}M`}
            />
            <div style={{ marginTop: 8 }}>
              {renderTrend(mockData.revenueGrowth)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Học viên"
              value={mockData.totalStudents}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              {renderTrend(mockData.studentsGrowth)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Khóa học"
              value={mockData.totalCourses}
              valueStyle={{ color: '#52c41a' }}
              prefix={<BookOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              {renderTrend(mockData.coursesGrowth)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tài liệu"
              value={mockData.totalDocuments}
              valueStyle={{ color: '#722ed1' }}
              prefix={<FileTextOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              {renderTrend(mockData.documentsGrowth)}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Các biểu đồ và bảng thống kê */}
      <Card style={{ marginTop: 16 }} loading={loading}>
        <Tabs defaultActiveKey="revenue">
          <TabPane 
            tab={<span><LineChartOutlined /> Doanh thu theo thời gian</span>} 
            key="revenue"
          >
            <div style={{ height: 400, padding: '20px 0' }}>
              <div style={{ textAlign: 'center', marginTop: 120 }}>
                <LineChartOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                <Title level={4} style={{ marginTop: 16 }}>Biểu đồ doanh thu theo thời gian</Title>
                <Text type="secondary">
                  Cài đặt thư viện recharts để hiển thị biểu đồ này.
                  <br />
                  Dữ liệu: doanh thu theo tháng từ T1 đến T12
                </Text>
              </div>
            </div>
          </TabPane>
          <TabPane 
            tab={<span><BarChartOutlined /> Doanh thu theo danh mục</span>} 
            key="categories"
          >
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ height: 400, padding: '20px 0' }}>
                  <div style={{ textAlign: 'center', marginTop: 120 }}>
                    <BarChartOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                    <Title level={4} style={{ marginTop: 16 }}>Biểu đồ cột theo danh mục</Title>
                    <Text type="secondary">
                      Cài đặt thư viện recharts để hiển thị biểu đồ này.
                      <br />
                      Dữ liệu: doanh thu theo các danh mục khóa học
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ height: 400, padding: '20px 0' }}>
                  <div style={{ textAlign: 'center', marginTop: 120 }}>
                    <PieChartOutlined style={{ fontSize: 48, color: '#722ed1' }} />
                    <Title level={4} style={{ marginTop: 16 }}>Biểu đồ tròn theo danh mục</Title>
                    <Text type="secondary">
                      Cài đặt thư viện recharts để hiển thị biểu đồ này.
                      <br />
                      Dữ liệu: phân bổ doanh thu theo danh mục
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Khóa học hàng đầu" key="courses">
            <Table
              columns={topCoursesColumns}
              dataSource={mockData.topCourses}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Học viên mới" key="students">
            <Table
              columns={newStudentsColumns}
              dataSource={mockData.newStudents}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Phần tỷ lệ hoàn thành khóa học */}
      <Card title="Tỷ lệ hoàn thành khóa học" style={{ marginTop: 16 }} loading={loading}>
        <Row gutter={16}>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Tổng số học viên đã đăng ký"
                value={mockData.totalStudents}
                suffix="học viên"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Đã hoàn thành"
                value={486}
                suffix={`học viên (${calculatePercentage(486, mockData.totalStudents)}%)`}
              />
              <Progress percent={calculatePercentage(486, mockData.totalStudents)} status="active" />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Đang học"
                value={356}
                suffix={`học viên (${calculatePercentage(356, mockData.totalStudents)}%)`}
              />
              <Progress percent={calculatePercentage(356, mockData.totalStudents)} status="active" strokeColor="#1890ff" />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default StatisticsPage; 