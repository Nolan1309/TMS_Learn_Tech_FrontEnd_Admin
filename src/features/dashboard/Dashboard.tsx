import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Progress, List, Avatar, Button } from 'antd';
import { Line, Pie, Column } from '@ant-design/plots';
import axios from 'axios';

const { Title } = Typography;

// Add G2 to Window interface
declare global {
  interface Window {
    G2?: any;
  }
}

interface DataPoint {
  month: string;
  value: number;
  category: string;
  formattedValue?: string;
}

interface ApiDataPoint {
  month: string;
  value: number;
}

interface ExamData {
  title: string;
  image: string;
  subject: string;
  participants: number;
}

interface ApiExamData {
  testId: number;
  title: string;
  imageUrl: string | null;
  subject: string;
  subjectId: string;
  participants: string;
}

interface CategoryData {
  type: string;
  value: number;
}

interface ApiCategoryData {
  categoryId: number;
  category: string;
  total: number;
}

interface MonthlyData {
  month: string;
  value: number;
}

interface ApiMonthlyData {
  month: string;
  total: number;
}

interface CourseData {
  key: string;
  name: string;
  students: number;
  rating: number;
  revenue: string;
}

interface ApiCourseData {
  key: string;
  name: string;
  studentCount: number;
  rating: number | null;
  revenue: number;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T[];
}

const Dashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState<DataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [newStudentsData, setNewStudentsData] = useState<MonthlyData[]>([]);
  const [examData, setExamData] = useState<ExamData[]>([]);
  const [courseData, setCourseData] = useState<CourseData[]>([]);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Format currency function
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format currency for display in VNĐ format
  const formatVND = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      maximumFractionDigits: 0
    }).format(value) + ' VNĐ';
  };

  // Format month from API (YYYY-MM) to display format (Tháng MM)
  const formatMonthFromApi = (apiMonth: string): string => {
    const [year, month] = apiMonth.split('-');
    return `Tháng ${parseInt(month)}`;
  };

  // Function to test with sample data
  const testWithSampleData = () => {
    const sampleResponse = {
      status: 200,
      message: "Success",
      data: [
        {
          month: "2025-05",
          value: 7628050.0
        },
        {
          month: "2025-06",
          value: 8429569.0
        }
      ]
    };

    // Process the sample data just like we would with real API data
    const transformedData: DataPoint[] = sampleResponse.data.map(item => ({
      month: formatMonthFromApi(item.month),
      value: item.value,
      category: 'Doanh thu',
      formattedValue: formatVND(item.value)
    }));
    
    // Sort by month
    transformedData.sort((a, b) => {
      const monthA = parseInt(a.month.replace('Tháng ', ''));
      const monthB = parseInt(b.month.replace('Tháng ', ''));
      return monthA - monthB;
    });
    
    setRevenueData(transformedData);
    
    // Calculate total revenue
    const total = sampleResponse.data.reduce((sum, item) => sum + item.value, 0);
    setTotalRevenue(total);

    console.log('Sample data processed:', transformedData);
    console.log('Total revenue:', formatVND(total));
  };

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        // Get token from local storage
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get<ApiResponse<ApiDataPoint>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/data-point`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.status === 200) {
          // Transform data for the revenue chart
          const transformedData: DataPoint[] = response.data.data.map(item => ({
            month: formatMonthFromApi(item.month),
            value: item.value,
            category: 'Doanh thu', // Add default category since it's not in the API response
            formattedValue: formatVND(item.value) // Pre-format the value for tooltip
          }));
          
          // Sort by month
          transformedData.sort((a, b) => {
            const monthA = parseInt(a.month.replace('Tháng ', ''));
            const monthB = parseInt(b.month.replace('Tháng ', ''));
            return monthA - monthB;
          });
          
          setRevenueData(transformedData);
          
          // Calculate total revenue
          const total = response.data.data.reduce((sum, item) => sum + item.value, 0);
          setTotalRevenue(total);
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
      }
    };

    const fetchMonthlyData = async () => {
      try {
        // Get token from local storage
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get<ApiResponse<ApiMonthlyData>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/monthly`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.status === 200) {
          // Transform API data to match our MonthlyData interface
          const transformedData: MonthlyData[] = response.data.data.map(item => ({
            month: formatMonthFromApi(item.month),
            value: item.total
          }));
          setNewStudentsData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching monthly data:', error);
       
      }
    };

    const fetchExamData = async () => {
      try {
        // Get token from local storage
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get<ApiResponse<ApiExamData>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/exam-data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.status === 200) {
          // Transform API data to match our ExamData interface
          const transformedData: ExamData[] = response.data.data
            .map(item => ({
              title: item.title,
              image: item.imageUrl || getDefaultImageForSubject(item.subject),
              subject: item.subject,
              participants: parseInt(item.participants) || 0
            }))
            // Sort by participants in descending order and take top 5
            .sort((a, b) => b.participants - a.participants)
            .slice(0, 5);
          
          setExamData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching exam data:', error);
        
      }
    };

    const fetchCategoryData = async () => {
      try {
        // Get token from local storage
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get<ApiResponse<ApiCategoryData>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.status === 200) {
          // Transform API data to match our CategoryData interface
          const transformedData: CategoryData[] = response.data.data
            .filter(item => item.total > 0) // Filter out categories with 0 total
            .map(item => ({
              type: item.category,
              value: item.total
            }))
            // Sort by value in descending order
            .sort((a, b) => b.value - a.value);
          
          // If we have data, use it; otherwise add a default entry
          if (transformedData.length > 0) {
            setCategoryData(transformedData);
          } else {
            setCategoryData([{ type: 'Không có dữ liệu', value: 1 }]);
          }
        }
      } catch (error) {
        console.error('Error fetching category data:', error);
       
      }
    };

    const fetchCourseData = async () => {
      try {
        // Get token from local storage
        const token = localStorage.getItem('authToken');
        
        const response = await axios.get<ApiResponse<ApiCourseData>>(`${process.env.REACT_APP_SERVER_HOST}/api/dashboard/courses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.status === 200) {
          // Transform API data to match our CourseData interface
          const transformedData: CourseData[] = response.data.data
            .filter(item => item.studentCount > 0 || item.revenue > 0) // Filter out courses with no students and no revenue
            .map(item => ({
              key: item.key,
              name: item.name,
              students: item.studentCount,
              rating: item.rating || 0, // Use 0 if rating is null
              revenue: formatVND(item.revenue)
            }))
            // Sort by revenue in descending order
            .sort((a, b) => parseFloat(b.revenue.replace(/[^\d.-]/g, '')) - parseFloat(a.revenue.replace(/[^\d.-]/g, '')));
          
          setCourseData(transformedData);
          
          // Calculate total students across all courses
          const total = response.data.data.reduce((sum, course) => sum + course.studentCount, 0);
          setTotalStudents(total);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
        
        setTotalStudents(0);
      }
    };

    // Function to get default image URL based on subject
    const getDefaultImageForSubject = (subject: string): string => {
      const subjectLower = subject.toLowerCase();
      if (subjectLower.includes('python')) {
        return 'https://img.icons8.com/color/48/000000/python.png';
      } else if (subjectLower.includes('java')) {
        return 'https://img.icons8.com/color/48/000000/java-coffee-cup-logo.png';
      } else if (subjectLower.includes('javascript') || subjectLower.includes('js')) {
        return 'https://img.icons8.com/color/48/000000/javascript.png';
      } else if (subjectLower.includes('c#') || subjectLower.includes('csharp')) {
        return 'https://img.icons8.com/color/48/000000/c-sharp-logo.png';
      } else if (subjectLower.includes('web') || subjectLower.includes('html') || subjectLower.includes('css')) {
        return 'https://img.icons8.com/color/48/000000/html-5.png';
      } else {
        return 'https://img.icons8.com/color/48/000000/code.png';
      }
    };

    // Giả lập việc lấy dữ liệu từ API
    setTimeout(() => {
      fetchRevenueData(); // Fetch real revenue data
      fetchCategoryData(); // Fetch real category data
      fetchMonthlyData(); // Fetch real monthly data
      fetchExamData(); // Fetch real exam data
      fetchCourseData(); // Fetch real course data
      setLoading(false);
    }, 1000);
  }, []);

  const columns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Học viên',
      dataIndex: 'students',
      key: 'students',
      sorter: (a: any, b: any) => a.students - b.students,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      sorter: (a: any, b: any) => a.rating - b.rating,
      render: (rating: number) => (
        <span>
          {rating > 0 ? rating.toFixed(1) : 'N/A'} {rating > 0 && <span style={{ color: '#fadb14' }}>★</span>}
        </span>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
    },
  ];

  // Cấu hình biểu đồ line
  const lineConfig = {
    data: revenueData,
    padding: 'auto',
    xField: 'month',
    yField: 'value',
    seriesField: 'category',
    color: '#1890FF',
    yAxis: {
      label: {
        formatter: (v: string) => `${(parseFloat(v) / 1000000).toFixed(1)}M`,
      },
    },
    tooltip: {
      fields: ['month', 'category', 'formattedValue'],
      formatter: (datum: any) => {
        return {
          name: datum.category,
          value: datum.formattedValue
        };
      }
    },
    smooth: true,
    point: {
      size: 5,
      shape: 'circle',
    },
  };

  // Cấu hình biểu đồ pie
  const pieChartConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    label: false,
    legend: {
      position: 'bottom',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  // Cấu hình biểu đồ column
  const columnChartConfig = {
    data: newStudentsData,
    xField: 'month',
    yField: 'value',
    color: '#1890FF',
    label: {
      position: 'top',
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
    legend: {
      position: 'top-right',
    },
  };

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      {/* Add a test button in development only */}
      {process.env.NODE_ENV === 'development' && (
        <Button 
          onClick={testWithSampleData} 
          style={{ marginBottom: 16 }}
        >
          Test with Sample Data
        </Button>
      )}
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng học viên"
              value={totalStudents}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khóa học đang hoạt động"
              value={56}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tài liệu"
              value={324}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh thu tháng"
              value={totalRevenue / 1000000}
              precision={2}
              suffix="triệu VNĐ"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Doanh thu 6 tháng gần đây" style={{ height: '100%' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải dữ liệu...</div>
            ) : (
              <Line {...lineConfig} height={300} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố học viên theo danh mục" style={{ height: '100%' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải dữ liệu...</div>
            ) : (
              <Pie {...pieChartConfig} height={300} />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Học viên mới theo tháng" style={{ height: '100%' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>Đang tải dữ liệu...</div>
            ) : (
              <Column {...columnChartConfig} height={300} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Đề thi nổi bật">
            <List
              itemLayout="horizontal"
              dataSource={examData}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.image} />}
                    title={item.title}
                    description={`${item.subject}`}
                  />
                  <div style={{ color: '#8c8c8c' }}>{item.participants} thí sinh</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="Khóa học nổi bật">
            <Table 
              dataSource={courseData} 
              columns={columns} 
              pagination={false} 
              size="middle"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 