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
  enrollmentStatus: string;
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
interface ApiCategoryCourseData { categoryId: number; category: string; revenue: number; }
interface ApiCategoryExamData { courseId: number; courseName: string; totalPayments: number; revenue: number; }
interface ApiCourseDataDashboard { totalCourses: number; totalStudentsCourses: number; courseData: ApiCourseData[]; }
interface ApiCourseData { key: string; name: string; studentCount: number; rating?: number; revenue: number; }
interface ApiObjectResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Client side data structures
interface DataPoint { month: string; value: number; category: string; formattedValue: string; }
interface CategoryData { type: string; value: number; }
interface CourseData { key: string; name: string; students: number; rating: number; revenue: string; }

interface ApiOverviewStatistic {
  totalAccounts: number;
  totalEnrolledStudents: number;
  totalTests: number;
  totalCourses: number;
  totalDocuments: number;
  totalCompletedStudents: number;
  totalStudyingStudents: number;
  totalStudents: number;
}

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


  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [examCategoryData, setExamCategoryData] = useState<CategoryData[]>([]);

  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalEnrolledStudents, setTotalEnrolledStudents] = useState<number>(0);
  const [totalCompletedStudents, setTotalCompletedStudents] = useState<number>(0);
  const [totalStudyingStudents, setTotalStudyingStudents] = useState<number>(0);
  const [totalCourses, setTotalCourses] = useState<number>(0);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [totalAccounts, setTotalAccounts] = useState<number>(0);

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

    const fetchStatistics = async () => {
      setLoading(true);
      try {
        // 1) Fetch revenue (data-point)
        const revenueRes = await axios.get<ApiResponse<ApiDataPoint>>("http://localhost:8080/api/dashboard/data-point", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const revenueFromApi = revenueRes.data.data || [];

        const toVietnameseMonth = (ym: string) => {
          // Expect format yyyy-mm or yyyy-m
          const parts = ym.split("-");
          const monthNumber = parts.length > 1 ? parseInt(parts[1], 10) : NaN;
          return !isNaN(monthNumber) ? `Tháng ${monthNumber}` : ym;
        };
        const processedRevenue: DataPoint[] = revenueFromApi.map((item) => ({
          month: toVietnameseMonth(item.month),
          value: item.value,
          category: "Doanh thu",
          formattedValue: formatVND(item.value),
        }));

        setRevenueData(processedRevenue);
        setTotalRevenue(processedRevenue.reduce((sum, r) => sum + r.value, 0));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[Statistics] Failed to fetch dashboard statistics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();


    const fetchCategory = async () => {
      const categoryRes = await axios.get<ApiResponse<ApiCategoryCourseData>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/statistics/category-revenue?type=course`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const categoryFromApi = categoryRes.data.data || [];
      setCategoryData(categoryFromApi.map(item => ({
        type: item.category,
        value: item.revenue,
      })));
    }
    fetchCategory();

    // Fetch exam category (aggregate by subject)
    const fetchExamCategory = async () => {
      try {
        const examRes = await axios.get<ApiResponse<ApiCategoryExamData>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/statistics/category-exam-revenue`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const examList = examRes.data.data || [];

        // Aggregate participants (or revenue if provided) by subject
        const aggregationMap = new Map<string, number>();
        examList.forEach((item) => {
          const current = aggregationMap.get(item.courseName) || 0;
          const revenue = item.revenue;
          aggregationMap.set(item.courseName, current + revenue);
        });

        const aggregated: CategoryData[] = Array.from(aggregationMap.entries()).map(([courseName, revenue]) => ({
          type: courseName,
          value: revenue,
        }));
        setExamCategoryData(aggregated);
      } catch (err) {
        console.error("[Statistics] Failed to fetch exam category data", err);
      }
    };
    fetchExamCategory();


    const fetchCourseData = async () => {
      try {
        // Get token from local storage
        const token = localStorage.getItem('authToken');

        const response = await axios.get<ApiObjectResponse<ApiCourseDataDashboard>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.status === 200) {
          // Transform API data to match our CourseData interface
          const transformedData: CourseData[] = response.data.data.courseData
            .filter(item => item.studentCount > 0 || item.revenue > 0) // Filter out courses with no students and no revenue
            // Sort by revenue in descending order first
            .sort((a, b) => b.revenue - a.revenue)
            .map(item => ({
              key: item.key,
              name: item.name,
              students: item.studentCount,
              rating: item.rating || 0, // Use 0 if rating is null
              revenue: formatVND(item.revenue)
            }));

          setCourseData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };
    fetchCourseData();

    const fetchNewStudentList = async () => {
      const newStudentListRes = await axios.get<ApiResponse<NewStudent>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/statistics/new-students`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const newStudentListFromApi = newStudentListRes.data.data || [];
      setNewStudentList(newStudentListFromApi);
    }
    fetchNewStudentList();

    // Tổng quan (students, documents ...)
    const fetchOverviewStatistic = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get<ApiObjectResponse<ApiOverviewStatistic>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/statistics/statistic`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.status === 200) {
          const stats = res.data.data;
          setTotalStudents(stats.totalStudents);
          setTotalEnrolledStudents(stats.totalEnrolledStudents);
          setTotalDocuments(stats.totalDocuments);
          setTotalCompletedStudents(stats.totalCompletedStudents);
          setTotalStudyingStudents(stats.totalStudyingStudents);
          setTotalCourses(stats.totalCourses);
          setTotalTests(stats.totalTests);
          setTotalAccounts(stats.totalAccounts);
        }
      } catch (err) {
        console.error('[Statistics] Fetch overview statistic failed', err);
      }
    };
    fetchOverviewStatistic();

    setLoading(false);
  }, []);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  const handlePeriodChange = (dates: any, dateStrings: [string, string]) => {
    setPeriod(dateStrings);
  };

  // Cột cho bảng khóa học hàng đầu
  const topCoursesColumns: ColumnsType<CourseData> = [
    {
      title: 'Tên khóa học',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Tác giả: {record.name}
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
      sorter: (a, b) => Number(a.revenue.replace(/\D/g, '')) - Number(b.revenue.replace(/\D/g, '')),
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
    }
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
      title: 'Trạng thái',
      dataIndex: 'enrollmentStatus',
      key: 'enrollmentStatus',
      render: (status) => {
        switch (status?.toLowerCase()) {
          case 'actived':
          case 'active':
            return <Tag color="success">Đang học</Tag>;
          case 'pending':
            return <Tag color="warning">Chờ xử lý</Tag>;
          case 'completed':
            return <Tag color="processing">Hoàn thành</Tag>;
          default:
            return <Tag color="default">{status}</Tag>;
        }
      },
      filters: [
        { text: 'Đang học', value: 'actived' },
        { text: 'Chờ xử lý', value: 'pending' },
        { text: 'Hoàn thành', value: 'completed' },
      ],
      onFilter: (value, record) => record.enrollmentStatus?.toLowerCase() === value,
    },
  ];

  // Bảng Doanh thu danh mục (khóa học hoặc đề thi)
  const categoryRevenueColumns: ColumnsType<CategoryData> = [
    {
      title: 'Danh mục',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'value',
      key: 'value',
      render: (v: number) => formatVND(v),
      sorter: (a, b) => a.value - b.value,
      defaultSortOrder: 'descend',
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
              title="Tổng doanh thu"
              value={totalRevenue}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="đ"
              formatter={(value) => `${(Number(value) / 1000000).toFixed(2)}M`}
            />
           
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Học viên"
              value={totalEnrolledStudents}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />
            
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Khóa học"
              value={totalCourses}
              valueStyle={{ color: '#52c41a' }}
              prefix={<BookOutlined />}
            />
            
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
          
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Đề thi"
              value={totalTests}
              valueStyle={{ color: '#1890ff' }}
              prefix={<FileTextOutlined />}
            />
            
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng tài khoản"
              value={totalAccounts}
              valueStyle={{ color: '#1890ff' }}
              prefix={<UserOutlined />}
            />

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
            <Tabs defaultActiveKey="courseCat" style={{ marginTop: 16 }}>
              <TabPane tab="Khóa học" key="courseCat">
                {loading ? (
                  <div style={{ textAlign: 'center', paddingTop: 120 }}>Đang tải dữ liệu...</div>
                ) : (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Table
                        columns={categoryRevenueColumns}
                        dataSource={categoryData}
                        rowKey="type"
                        pagination={{ pageSize: 6 }}
                        scroll={{ y: 320 }}
                      />
                    </Col>
                    <Col span={12}>
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
                    </Col>
                  </Row>
                )}
              </TabPane>
              <TabPane tab="Đề thi" key="examCat">
                {loading ? (
                  <div style={{ textAlign: 'center', paddingTop: 120 }}>Đang tải dữ liệu...</div>
                ) : (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Table
                        columns={categoryRevenueColumns}
                        dataSource={examCategoryData}
                        rowKey="type"
                        pagination={{ pageSize: 6 }}
                        scroll={{ y: 320 }}
                      />
                    </Col>
                    <Col span={12}>
                      <Pie
                        data={examCategoryData}
                        angleField="value"
                        colorField="type"
                        radius={0.8}
                        innerRadius={0.5}
                        height={400}
                        legend={{ position: 'bottom' }}
                        label={false}
                      />
                    </Col>
                  </Row>
                )}
              </TabPane>
            </Tabs>
          </TabPane>
          <TabPane tab="Khóa học hàng đầu" key="courses">
            <Table
              columns={topCoursesColumns}
              dataSource={courseData}
              rowKey="key"
              pagination={{ pageSize: 6 }}
              scroll={{ y: 320 }}
            />
          </TabPane>
          <TabPane tab="Học viên mới" key="students">
            <Table
              columns={newStudentsColumns}
              dataSource={newStudentList}
              rowKey="id"
              pagination={{ pageSize: 6 }}
              scroll={{ y: 320 }}
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
                title="Tổng số học viên"
                value={totalEnrolledStudents}
                suffix="học viên"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Tổng lượt đăng ký"
                value={totalStudents}
                suffix="lượt"
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Đã hoàn thành"
                value={totalCompletedStudents}
                suffix={`học viên (${calculatePercentage(totalCompletedStudents, totalStudents || 1)}%)`}
              />
              <Progress percent={calculatePercentage(totalCompletedStudents, totalStudents || 1)} status="active" />
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false}>
              <Statistic
                title="Đang học"
                value={totalStudyingStudents}
                suffix={`học viên (${calculatePercentage(totalStudyingStudents, totalStudents || 1)}%)`}
              />
              <Progress percent={calculatePercentage(totalStudyingStudents, totalStudents || 1)} status="active" strokeColor="#1890ff" />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default StatisticsPage; 