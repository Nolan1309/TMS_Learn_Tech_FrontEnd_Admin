import React, { useState, useEffect } from 'react';
import { 
  Typography, Table, Button, Space, Card, Input, Tag, Select, 
  DatePicker, Tabs, Tooltip, Divider, Badge, Popconfirm, 
  Statistic, Row, Col, Progress, Avatar, message, Radio,
  Modal, Descriptions, List, Timeline
} from 'antd';
import { 
  SearchOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, 
  FileExcelOutlined, FilePdfOutlined, UserOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined,
  ExportOutlined, FilterOutlined, SortAscendingOutlined,
  SolutionOutlined, BookOutlined, ShoppingOutlined, BarChartOutlined,
  CalendarOutlined, ReadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

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
  status: 'completed' | 'passed' | 'failed';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  courseId?: string;
  courseTitle?: string;
}

// Interface for CourseStudent data
interface CourseStudent {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatar?: string;
  courseId: string;
  courseTitle: string;
  enrollmentDate: string;
  progress: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  score: number;
}

// Add interface for Course
interface Course {
  id: string;
  title: string;
  subject: string;
  examCount: number;
  soldCount: number;
}

const ResultsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterCourseLearning, setFilterCourseLearning] = useState<string>('all');
  const [activeResultType, setActiveResultType] = useState<'exam' | 'course'>('exam');
  const [examDetailsVisible, setExamDetailsVisible] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<TestResult | null>(null);
  const [courseStatsVisible, setcourseStatsVisible] = useState<boolean>(false);
  const [selectedCourseStats, setSelectedCourseStats] = useState<Course | null>(null);
  const [studentDetailsVisible, setStudentDetailsVisible] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(null);

  useEffect(() => {
    // Giả lập tải dữ liệu
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Sample courses data
  const courses: Course[] = [
    {
      id: 'C001',
      title: 'Lập trình Web nâng cao với React',
      subject: 'Lập trình',
      examCount: 5,
      soldCount: 120
    },
    {
      id: 'C002',
      title: 'Machine Learning từ A-Z',
      subject: 'Khoa học dữ liệu',
      examCount: 8,
      soldCount: 85
    },
    {
      id: 'C003',
      title: 'Thiết kế UI/UX cho người mới bắt đầu',
      subject: 'Thiết kế',
      examCount: 3,
      soldCount: 62
    },
    {
      id: 'C004',
      title: 'Quản trị dự án Agile',
      subject: 'Quản trị',
      examCount: 4,
      soldCount: 45
    }
  ];

  // Update test results data with course info
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
      status: 'passed',
      courseId: 'C001',
      courseTitle: 'Lập trình Web nâng cao với React'
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
      status: 'passed',
      courseId: 'C002',
      courseTitle: 'Machine Learning từ A-Z'
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
      status: 'failed',
      courseId: 'C003',
      courseTitle: 'Thiết kế UI/UX cho người mới bắt đầu'
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
      status: 'passed',
      courseId: 'C001',
      courseTitle: 'Lập trình Web nâng cao với React'
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
      status: 'passed',
      courseId: 'C002',
      courseTitle: 'Machine Learning từ A-Z'
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
      courseId: 'C004',
      courseTitle: 'Quản trị dự án Agile'
    }
  ];

  // Course student data
  const courseStudents: CourseStudent[] = [
    {
      id: 'CS001',
      studentId: 'SV00123',
      studentName: 'Nguyễn Văn A',
      studentEmail: 'nguyenvana@email.com',
      avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
      courseId: 'C001',
      courseTitle: 'Lập trình Web nâng cao với React',
      enrollmentDate: '2023-09-15T08:30:00',
      progress: 85,
      completionStatus: 'in_progress',
      score: 78
    },
    {
      id: 'CS002',
      studentId: 'SV00456',
      studentName: 'Trần Thị B',
      studentEmail: 'tranthib@email.com',
      courseId: 'C002',
      courseTitle: 'Machine Learning từ A-Z',
      enrollmentDate: '2023-08-20T10:15:00',
      progress: 92,
      completionStatus: 'completed',
      score: 92
    },
    {
      id: 'CS003',
      studentId: 'SV00789',
      studentName: 'Lê Văn C',
      studentEmail: 'levanc@email.com',
      avatar: 'https://joeschmoe.io/api/v1/random',
      courseId: 'C003',
      courseTitle: 'Thiết kế UI/UX cho người mới bắt đầu',
      enrollmentDate: '2023-09-05T13:20:00',
      progress: 45,
      completionStatus: 'in_progress',
      score: 65
    },
    {
      id: 'CS004',
      studentId: 'SV01001',
      studentName: 'Phạm Thị D',
      studentEmail: 'phamthid@email.com',
      courseId: 'C004',
      courseTitle: 'Quản trị dự án Agile',
      enrollmentDate: '2023-10-01T09:00:00',
      progress: 15,
      completionStatus: 'in_progress',
      score: 60
    },
    {
      id: 'CS005',
      studentId: 'SV01234',
      studentName: 'Vũ Văn E',
      studentEmail: 'vuvane@email.com',
      courseId: 'C001',
      courseTitle: 'Lập trình Web nâng cao với React',
      enrollmentDate: '2023-09-18T14:30:00',
      progress: 5,
      completionStatus: 'not_started',
      score: 0
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

  const handleCourseChange = (value: string) => {
    setFilterCourse(value);
  };

  const handleCourseLearningChange = (value: string) => {
    setFilterCourseLearning(value);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const downloadResults = () => {
    message.success('Đang tải xuống kết quả...');
  };

  // Get status tag for course completion
  const getCourseStatusTag = (status: string) => {
    switch(status) {
      case 'completed':
        return <Tag icon={<CheckCircleOutlined />} color="success">Hoàn thành</Tag>;
      case 'in_progress':
        return <Tag icon={<ClockCircleOutlined />} color="processing">Đang học</Tag>;
      case 'not_started':
        return <Tag icon={<ClockCircleOutlined />} color="default">Chưa bắt đầu</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // View Student Learning Details
  const viewStudentDetails = (record: CourseStudent) => {
    setSelectedStudent(record);
    setStudentDetailsVisible(true);
  };

  // Mock student activity data for the details popup
  const studentActivities = [
    { id: 1, type: 'lesson', title: 'Bài 1: Giới thiệu khóa học', date: '2023-10-10T15:30:00', status: 'completed', score: 100 },
    { id: 2, type: 'quiz', title: 'Quiz 1: Kiến thức cơ bản', date: '2023-10-12T10:15:00', status: 'completed', score: 85 },
    { id: 3, type: 'lesson', title: 'Bài 2: Kiến thức chuyên sâu', date: '2023-10-15T14:20:00', status: 'completed', score: null },
    { id: 4, type: 'assignment', title: 'Bài tập 1: Thực hành', date: '2023-10-18T16:45:00', status: 'completed', score: 92 },
    { id: 5, type: 'lesson', title: 'Bài 3: Kỹ thuật nâng cao', date: '2023-10-22T09:30:00', status: 'in_progress', score: null },
    { id: 6, type: 'quiz', title: 'Quiz 2: Kiểm tra giữa kỳ', date: '2023-10-25T11:00:00', status: 'not_started', score: null },
  ];

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'lesson':
        return <ReadOutlined />;
      case 'quiz':
        return <SolutionOutlined />;
      case 'assignment':
        return <FileExcelOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };
  
  // Get activity color based on status
  const getActivityColor = (status: string) => {
    switch(status) {
      case 'completed':
        return 'green';
      case 'in_progress':
        return 'blue';
      case 'not_started':
        return 'gray';
      default:
        return 'blue';
    }
  };

  // Columns for course learning results
  const courseColumns: ColumnsType<CourseStudent> = [
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
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.courseTitle}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Ngày đăng ký: {new Date(record.enrollmentDate).toLocaleDateString('vi-VN')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.courseTitle.localeCompare(b.courseTitle),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} shape="circle" onClick={() => viewStudentDetails(record)} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa thông tin này?"
              onConfirm={() => message.success('Đã xóa thông tin!')}
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

  // Get unique courses from courseStudents
  const uniqueCoursesInLearning = Array.from(new Set(courseStudents.map(student => student.courseId)));
  const coursesInLearning = uniqueCoursesInLearning.map(courseId => {
    const student = courseStudents.find(s => s.courseId === courseId);
    return {
      id: courseId,
      title: student ? student.courseTitle : 'Unknown Course'
    };
  });

  const filteredCourseData = courseStudents.filter(student => {
    if (!searchText) return true;
    return (
      student.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
      student.courseTitle.toLowerCase().includes(searchText.toLowerCase())
    );
  }).filter(student => {
    if (filterCourseLearning === 'all') return true;
    return student.courseId === filterCourseLearning;
  });

  // Course data statistics
  const totalCourseStudents = courseStudents.length;

  // Handle changing between exam and course results
  const handleResultTypeChange = (type: 'exam' | 'course') => {
    setActiveResultType(type);
  };

  // View Exam Details
  const viewExamDetails = (record: TestResult) => {
    setSelectedExam(record);
    setExamDetailsVisible(true);
  };

  // View Course Exam Stats
  const viewCourseExamStats = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourseStats(course);
      setcourseStatsVisible(true);
    }
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
          {record.courseTitle && (
            <Text type="secondary" style={{ fontSize: '12px' }}>Khóa học: {record.courseTitle}</Text>
          )}
        </Space>
      ),
      sorter: (a, b) => a.examTitle.localeCompare(b.examTitle),
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
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} shape="circle" onClick={() => viewExamDetails(record)} />
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
    return true;
  }).filter(result => {
    if (!searchText) return true;
    return (
      result.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      result.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
      result.examTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      (result.courseTitle && result.courseTitle.toLowerCase().includes(searchText.toLowerCase()))
    );
  }).filter(result => {
    if (filterCourse === 'all') return true;
    return result.courseId === filterCourse;
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

  // Calculate course exam stats
  const examsByCourseCounts = courses.map(course => {
    const examsForCourse = results.filter(r => r.courseId === course.id).length;
    return {
      course: course.title,
      count: examsForCourse,
      sold: course.soldCount
    };
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>Quản lý Kết quả</Title>
        <Radio.Group 
          value={activeResultType} 
          onChange={e => handleResultTypeChange(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="exam">
            <SolutionOutlined /> Kết quả bài thi
          </Radio.Button>
          <Radio.Button value="course">
            <BookOutlined /> Kết quả khóa học
          </Radio.Button>
        </Radio.Group>
      </div>

      {activeResultType === 'exam' ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={12}>
              <Card>
                <Statistic
                  title="Tổng số bài thi"
                  value={totalResults}
                  prefix={<FileExcelOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Card onClick={() => setcourseStatsVisible(true)} style={{ cursor: 'pointer' }}>
                <Statistic
                  title="Tổng số bài thi đã bán"
                  value={courses.reduce((acc, curr) => acc + curr.soldCount, 0)}
                  prefix={<ShoppingOutlined />}
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
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 250 }}
                  />
                  <Select 
                    defaultValue="all" 
                    style={{ width: 200 }} 
                    onChange={handleCourseChange}
                  >
                    <Option value="all">Tất cả khóa học</Option>
                    {courses.map(course => (
                      <Option key={course.id} value={course.id}>{course.title}</Option>
                    ))}
                  </Select>
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
              </Tabs>
            </Space>
          </Card>
        </>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Card>
                <Statistic
                  title="Tổng số học viên"
                  value={totalCourseStudents}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                <Button icon={<ExportOutlined />}>
                  Xuất dữ liệu
                </Button>
                <Space>
                  <Search
                    placeholder="Tìm kiếm học viên, khóa học..."
                    allowClear
                    onSearch={handleSearch}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 250 }}
                  />
                  <Select 
                    defaultValue="all" 
                    style={{ width: 200 }} 
                    onChange={handleCourseLearningChange}
                  >
                    <Option value="all">Tất cả khóa học</Option>
                    {coursesInLearning.map(course => (
                      <Option key={course.id} value={course.id}>{course.title}</Option>
                    ))}
                  </Select>
                </Space>
              </Space>

              <Table
                columns={courseColumns}
                dataSource={filteredCourseData}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} kết quả`
                }}
              />
            </Space>
          </Card>
        </>
      )}

      {/* Exam Details Modal */}
      <Modal
        title="Chi tiết kết quả bài thi"
        open={examDetailsVisible}
        onCancel={() => setExamDetailsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setExamDetailsVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<FilePdfOutlined />}
            onClick={() => message.success('Đang tải xuống báo cáo...')}
          >
            Tải báo cáo
          </Button>,
        ]}
        width={800}
      >
        {selectedExam && (
          <div>
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <Card title="Thông tin học viên">
                  <Space>
                    <Avatar size={64} src={selectedExam.avatar} icon={!selectedExam.avatar && <UserOutlined />} />
                    <Space direction="vertical">
                      <Title level={4} style={{ margin: 0 }}>{selectedExam.studentName}</Title>
                      <Text>ID: {selectedExam.studentId} | Email: {selectedExam.studentEmail}</Text>
                    </Space>
                  </Space>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Thông tin bài thi">
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Tên bài thi" span={2}>{selectedExam.examTitle}</Descriptions.Item>
                    <Descriptions.Item label="Khóa học">{selectedExam.courseTitle || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian làm bài">
                      {new Date(selectedExam.startTime).toLocaleString('vi-VN')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời lượng">
                      {selectedExam.duration} phút
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Kết quả">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Điểm số"
                        value={selectedExam.score}
                        suffix={`/${selectedExam.maxScore}`}
                        valueStyle={{ color: getScoreColor(selectedExam.percentageScore) }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Tỉ lệ %"
                        value={selectedExam.percentageScore}
                        suffix="%"
                        valueStyle={{ color: getScoreColor(selectedExam.percentageScore) }}
                      />
                      <Progress 
                        percent={selectedExam.percentageScore} 
                        showInfo={false}
                        strokeColor={getScoreColor(selectedExam.percentageScore)}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Câu trả lời đúng"
                        value={selectedExam.correctAnswers}
                        suffix={`/${selectedExam.totalQuestions}`}
                      />
                    </Col>
                  </Row>
                  <Divider />
                  <Space>
                    <Text>Trạng thái: </Text>
                    {getStatusTag(selectedExam.status)}
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Course Exam Stats Modal */}
      <Modal
        title="Thống kê bài thi theo khóa học"
        open={courseStatsVisible}
        onCancel={() => setcourseStatsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setcourseStatsVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="export" 
            type="primary" 
            icon={<ExportOutlined />}
            onClick={() => message.success('Đang xuất báo cáo...')}
          >
            Xuất báo cáo
          </Button>,
        ]}
      >
        <List
          itemLayout="horizontal"
          dataSource={courses}
          renderItem={item => (
            <List.Item
              actions={[
                <Button 
                  key="view" 
                  type="link" 
                  onClick={() => {
                    setFilterCourse(item.id);
                    setcourseStatsVisible(false);
                  }}
                >
                  Xem bài thi
                </Button>
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={`Môn học: ${item.subject}`}
              />
              <div>
                <Statistic 
                  title="Đã bán" 
                  value={item.soldCount} 
                  valueStyle={{ fontSize: '16px' }}
                />
                <Text type="secondary">
                  Tổng số đề thi: {item.examCount}
                </Text>
              </div>
            </List.Item>
          )}
        />
        <Divider />
        <Row gutter={16}>
          <Col span={24}>
            <Card>
              <Statistic
                title="Tổng số bài thi đã bán"
                value={courses.reduce((acc, curr) => acc + curr.soldCount, 0)}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>
      </Modal>

      {/* Student Learning Details Modal */}
      <Modal
        title="Chi tiết kết quả học tập"
        open={studentDetailsVisible}
        onCancel={() => setStudentDetailsVisible(false)}
        footer={[
          <Button key="back" onClick={() => setStudentDetailsVisible(false)}>
            Đóng
          </Button>,
          <Button 
            key="export" 
            type="primary" 
            icon={<ExportOutlined />}
            onClick={() => message.success('Đang xuất báo cáo học tập...')}
          >
            Xuất báo cáo
          </Button>,
        ]}
        width={800}
      >
        {selectedStudent && (
          <div>
            <Row gutter={[16, 24]}>
              <Col span={24}>
                <Card>
                  <Space align="start">
                    <Avatar size={64} src={selectedStudent.avatar} icon={!selectedStudent.avatar && <UserOutlined />} />
                    <Space direction="vertical">
                      <Title level={4} style={{ margin: 0 }}>{selectedStudent.studentName}</Title>
                      <Text>{selectedStudent.studentId} | {selectedStudent.studentEmail}</Text>
                      <Text type="secondary">Ngày đăng ký: {new Date(selectedStudent.enrollmentDate).toLocaleDateString('vi-VN')}</Text>
                    </Space>
                  </Space>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Thông tin khóa học">
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Tên khóa học" span={2}>{selectedStudent.courseTitle}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      {getCourseStatusTag(selectedStudent.completionStatus)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiến độ" span={2}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Text>{selectedStudent.progress}%</Text>
                          <Text type="secondary">hoàn thành</Text>
                        </Space>
                        <Progress 
                          percent={selectedStudent.progress} 
                          status={selectedStudent.completionStatus === 'completed' ? 'success' : 'active'}
                          strokeColor={selectedStudent.progress > 80 ? '#52c41a' : selectedStudent.progress > 50 ? '#1890ff' : '#faad14'}
                        />
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Điểm số" span={2}>
                      <Statistic 
                        value={selectedStudent.score} 
                        suffix="/100"
                        valueStyle={{ color: getScoreColor(selectedStudent.score) }}
                      />
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Lịch sử học tập">
                  <Timeline
                    mode="left"
                    items={studentActivities.map(activity => ({
                      color: getActivityColor(activity.status),
                      label: new Date(activity.date).toLocaleDateString('vi-VN'),
                      children: (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Space>
                            {getActivityIcon(activity.type)}
                            <Text strong>{activity.title}</Text>
                          </Space>
                          <Space>
                            <Text type="secondary">
                              <CalendarOutlined /> {new Date(activity.date).toLocaleTimeString('vi-VN')}
                            </Text>
                            {activity.score !== null && (
                              <Text type="secondary">
                                <TrophyOutlined /> Điểm: {activity.score}/100
                              </Text>
                            )}
                            {getStatusTag(activity.status)}
                          </Space>
                        </Space>
                      ),
                    }))}
                  />
                </Card>
              </Col>
              
              <Col span={24}>
                <Card title="Thống kê tương tác">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Bài học đã hoàn thành"
                        value={studentActivities.filter(a => a.type === 'lesson' && a.status === 'completed').length}
                        suffix={`/${studentActivities.filter(a => a.type === 'lesson').length}`}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Quiz đã làm"
                        value={studentActivities.filter(a => a.type === 'quiz' && a.status === 'completed').length}
                        suffix={`/${studentActivities.filter(a => a.type === 'quiz').length}`}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Điểm trung bình"
                        value={
                          studentActivities
                            .filter(a => a.score !== null)
                            .reduce((acc, curr) => acc + (curr.score || 0), 0) / 
                          studentActivities.filter(a => a.score !== null).length
                        }
                        precision={1}
                        suffix="/100"
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResultsPage; 