import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Line, Column, Pie } from '@ant-design/plots';

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

// -------------------- API & Helper Types --------------------
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T[];
}

interface ApiDataPoint { month: string; value: number; }
interface ApiMonthlyData { month: string; total: number; }
interface ApiExamData { title: string; imageUrl?: string; subject: string; participants: string; }
interface ApiCategoryData { category: string; total: number; }
interface ApiCourseData { key: string; name: string; studentCount: number; rating?: number; revenue: number; }

// Client side data structures
interface DataPoint { month: string; value: number; category: string; formattedValue: string; }
interface MonthlyData { month: string; value: number; }
interface ExamData { title: string; image: string; subject: string; participants: number; }
interface CategoryData { type: string; value: number; }
interface CourseData { key: string; name: string; students: number; rating: number; revenue: string; }

// -------------------- Helper functions --------------------
const formatMonthFromApi = (monthStr: string): string => {
  // Expecting YYYY-MM format
  const parts = monthStr.split('-');
  if (parts.length === 2) {
    return `Tháng ${parseInt(parts[1], 10)}`;
  }
  return monthStr;
};

const formatVND = (value: number): string => {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const StatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('week');
  const [period, setPeriod] = useState<[string, string] | null>(null);

  // ----- States that will be filled by API -----
  const [revenueData, setRevenueData] = useState<DataPoint[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const [newStudentsData, setNewStudentsData] = useState<MonthlyData[]>([]);

  const [examData, setExamData] = useState<ExamData[]>([]);

  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);

  // Growth metrics (placeholder – adjust if API provides these)
  const [revenueGrowth, setRevenueGrowth] = useState<number>(0);
  const [studentsGrowth, setStudentsGrowth] = useState<number>(0);
  const [coursesGrowth, setCoursesGrowth] = useState<number>(0);
  const [documentsGrowth, setDocumentsGrowth] = useState<number>(0);

  // Documents total placeholder
  const [totalDocuments, setTotalDocuments] = useState<number>(0);

  // New student detailed list placeholder
  const [newStudentList, setNewStudentList] = useState<NewStudent[]>([]);

  // Top courses list placeholder
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);

  // -------------------- API FETCHING --------------------
  useEffect(() => {
    // ------------------ DUMMY DATA ------------------
    setLoading(true);

    const dummyRevenue: DataPoint[] = [
      { month: 'Tháng 1', value: 10000000, category: 'Doanh thu', formattedValue: formatVND(10000000) },
      { month: 'Tháng 2', value: 8000000, category: 'Doanh thu', formattedValue: formatVND(8000000) },
      { month: 'Tháng 3', value: 12000000, category: 'Doanh thu', formattedValue: formatVND(12000000) },
    ];
    setRevenueData(dummyRevenue);
    setTotalRevenue(dummyRevenue.reduce((sum, r) => sum + r.value, 0));

    setNewStudentsData([
      { month: 'Tháng 1', value: 120 },
      { month: 'Tháng 2', value: 150 },
      { month: 'Tháng 3', value: 180 },
    ]);

    setExamData([
      { title: 'Đề Python cơ bản', image: 'https://img.icons8.com/color/48/000000/python.png', subject: 'Python', participants: 95 },
      { title: 'Đề Java nâng cao', image: 'https://img.icons8.com/color/48/000000/java-coffee-cup-logo.png', subject: 'Java', participants: 80 },
      { title: 'Đề HTML & CSS', image: 'https://img.icons8.com/color/48/000000/html-5.png', subject: 'Web', participants: 110 },
    ]);

    setCategoryData([
      { type: 'Lập trình', value: 60 },
      { type: 'Thiết kế', value: 25 },
      { type: 'Ngoại ngữ', value: 15 },
    ]);

    const dummyCourses: CourseData[] = [
      { key: 'C1', name: 'Khóa ReactJS', students: 200, rating: 4.7, revenue: formatVND(9000000) },
      { key: 'C2', name: 'Khóa NodeJS', students: 150, rating: 4.5, revenue: formatVND(7500000) },
      { key: 'C3', name: 'Khóa UI/UX Design', students: 180, rating: 4.8, revenue: formatVND(8200000) },
    ];
    setCourseData(dummyCourses);
    setTotalStudents(dummyCourses.reduce((s, c) => s + c.students, 0));

    const dummyTop: TopCourse[] = dummyCourses.map(c => ({
      id: c.key,
      name: c.name,
      students: c.students,
      revenue: parseInt(c.revenue.replace(/\D/g, '')),
      rating: c.rating,
      status: 'active',
      trend: 'stable',
      author: 'Admin',
    }));
    setTopCourses(dummyTop);

    setNewStudentList([
      { id: 'S1', name: 'Nguyễn Văn A', enrollDate: '2025-05-01', courseName: 'Khóa ReactJS', paymentStatus: 'paid', amount: 1200000, source: 'Website' },
      { id: 'S2', name: 'Trần Thị B', enrollDate: '2025-05-03', courseName: 'Khóa NodeJS', paymentStatus: 'pending', amount: 900000, source: 'Facebook' },
    ]);

    setLoading(false);
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
        switch (trend) {
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
        switch (status) {
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
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="đ"
              formatter={(value) => `${(Number(value) / 1000000).toFixed(2)}M`}
            />
            <div style={{ marginTop: 8 }}>
              {renderTrend(revenueGrowth)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Học viên"
              value={totalStudents}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              {renderTrend(studentsGrowth)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Khóa học"
              value={courseData.length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<BookOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              {renderTrend(coursesGrowth)}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tài liệu"
              value={totalDocuments}
              valueStyle={{ color: '#722ed1' }}
              prefix={<FileTextOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              {renderTrend(documentsGrowth)}
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
            {loading ? (
              <div style={{ textAlign: 'center', paddingTop: 120 }}>Đang tải dữ liệu...</div>
            ) : (
              <Line
                data={revenueData}
                xField="month"
                yField="value"
                seriesField="category"
                smooth
                color="#1890ff"
                height={400}
                padding="auto"
                yAxis={{ label: { formatter: (v: string) => `${(parseFloat(v) / 1_000_000).toFixed(1)}M` } }}
                tooltip={{ fields: ['month', 'formattedValue'], formatter: (d: any) => ({ name: 'Doanh thu', value: d.formattedValue }) }}
              />
            )}
          </TabPane>
          <TabPane
            tab={<span><BarChartOutlined /> Doanh thu theo danh mục</span>}
            key="categories"
          >
            <Row gutter={16}>
              <Col span={12}>
                {loading ? (
                  <div style={{ textAlign: 'center', paddingTop: 120 }}>Đang tải dữ liệu...</div>
                ) : (
                  <Column
                    data={categoryData}
                    xField="type"
                    yField="value"
                    color="#52c41a"
                    height={400}
                    label={{ style: { fill: '#fff' } }}
                  />
                )}
              </Col>
              <Col span={12}>
                {loading ? (
                  <div style={{ textAlign: 'center', paddingTop: 120 }}>Đang tải dữ liệu...</div>
                ) : (
                  <Pie
                    data={categoryData}
                    angleField="value"
                    colorField="type"
                    radius={0.8}
                    innerRadius={0.5}
                    height={400}
                    legend={{ position: 'bottom' }}
                    label={false}
                  />
                )}
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Khóa học hàng đầu" key="courses">
            <Table
              columns={topCoursesColumns}
              dataSource={topCourses}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Học viên mới" key="students">
            <Table
              columns={newStudentsColumns}
              dataSource={newStudentList}
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
                value={totalStudents}
                suffix="học viên"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Đã hoàn thành"
                value={486}
                suffix={`học viên (${calculatePercentage(486, totalStudents || 1)}%)`}
              />
              <Progress percent={calculatePercentage(486, totalStudents || 1)} status="active" />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Đang học"
                value={356}
                suffix={`học viên (${calculatePercentage(356, totalStudents || 1)}%)`}
              />
              <Progress percent={calculatePercentage(356, totalStudents || 1)} status="active" strokeColor="#1890ff" />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default StatisticsPage; 