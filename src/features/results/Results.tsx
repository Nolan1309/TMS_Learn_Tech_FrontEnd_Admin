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
import axios from 'axios';
import { authTokenLogin, refreshToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface TestResult {
  testId?: number;
  id?: string;
  studentId?: string;
  studentName?: string;
  studentEmail?: string;
  avatar?: string;
  examId?: string;
  title?: string;
  examTitle?: string;
  description?: string;
  subject?: string;
  score?: number;
  maxScore?: number;
  percentageScore?: number;
  correctAnswers?: number;
  totalQuestion?: number;
  totalQuestions?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status?: 'completed' | 'passed' | 'failed';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  courseId?: string | number;
  courseTitle?: string;
  level?: string;
  type?: string;
  point?: number;
  easyQuestion?: number;
  mediumQuestion?: number;
  hardQuestion?: number;
  author?: string;
  imageUrl?: string;
  examType?: string;
  cost?: number;
  price?: number;
  rating?: number;
  totalAttempts?: number;
  uniqueParticipants?: number;
  avgScore?: number;
  minScore?: number;
}

// Interface for the new paginated API response
interface PaginatedResponse<T> {
  status: number;
  message: string;
  data: {
    content: T[];
    totalElements: number;
    totalPages: number;
    pageable: {
      pageNumber: number;
      pageSize: number;
      offset: number;
    };
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  };
}

// Updated CourseStudent interface to match the new API response
interface CourseStudent {
  id?: string;
  accountId: number;
  fullname: string;
  email: string;
  image?: string;
  avatar?: string;
  gender?: string;
  phone?: string;
  courseId: number;
  coursesTitle?: string;
  enrollmentDate: string;
  enrollmentStatus: string;
  completionStatus?: string;
  certificateCode?: string;
  certificateUrl?: string;
  certificateVerified?: boolean;
  issuedAt?: string;
  testCount: number;
  totalTestScore: number;
  avgTestScore: number;
  lastTestCompletedAt?: string;
  lessonCompleted: number;
  chapterCompleted: number;
  totalLessons: number;
  totalChapters: number;
  progressPercent: number;
  progress?: number;
  lastProgressCompletedAt?: string;
  totalScore?: number;
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
  const [searchTextCourse, setSearchTextCourse] = useState<string>(''); // search keyword for course tab
  const [searchTextExam, setSearchTextExam] = useState<string>('');   // search keyword for exam tab

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterCourseLearning, setFilterCourseLearning] = useState<string>('all');
  const [activeResultType, setActiveResultType] = useState<'exam' | 'course'>('course');
  const [examDetailsVisible, setExamDetailsVisible] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<TestResult | null>(null);
  const [courseStatsVisible, setcourseStatsVisible] = useState<boolean>(false);

  const [studentDetailsVisible, setStudentDetailsVisible] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<CourseStudent | null>(null);
  const [courseStudents, setCourseStudents] = useState<CourseStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageSizeExam, setPageSizeExam] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [examCurrentPage, setExamCurrentPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [examTotalElements, setExamTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [examTotalPages, setExamTotalPages] = useState<number>(0);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const [totalCourseStudents, setTotalCourseStudents] = useState<number>(0);

  // Refs for form controls to reset their values
  const examSearchRef = React.useRef<any>(null);
  const courseSearchRef = React.useRef<any>(null);
  const examFilterRef = React.useRef<any>(null);
  const courseFilterRef = React.useRef<any>(null);


  useEffect(() => {
    fetchCourseList();

    if (activeResultType === 'exam') {
      fetchExamResults(0, pageSizeExam);
    } else {
      fetchStudents(0, pageSize);
    }
  }, []);

  const fetchCourseList = async () => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/get-all-result-list`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch course data");
      }
      const data: Course[] = await response.json();
      setCourses(data);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      message.error("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };



  // -------- Fetch course students from API --------
  const mapApiStudent = (api: any): CourseStudent => ({
    id: api.id,
    accountId: api.accountId,
    fullname: api.fullname,
    email: api.email,
    image: api.image,
    avatar: api.image,
    gender: api.gender,
    phone: api.phone,
    courseId: api.courseId,
    coursesTitle: api.coursesTitle,
    enrollmentDate: api.enrollmentDate,
    enrollmentStatus: api.enrollmentStatus,
    completionStatus: (api.enrollmentStatus || '').toLowerCase().includes('complete') ? 'completed' : (api.enrollmentStatus || '').toLowerCase().includes('study') ? 'in_progress' : 'not_started',
    certificateCode: api.certificateCode,
    certificateUrl: api.certificateUrl,
    certificateVerified: api.certificateVerified,
    issuedAt: api.issuedAt,
    testCount: api.testCount,
    totalTestScore: api.totalTestScore,
    avgTestScore: api.avgTestScore,
    lastTestCompletedAt: api.lastTestCompletedAt,
    lessonCompleted: api.lessonCompleted,
    chapterCompleted: api.chapterCompleted,
    totalLessons: api.totalLessons,
    totalChapters: api.totalChapters,
    progressPercent: api.progressPercent,
    progress: api.progressPercent,
    lastProgressCompletedAt: api.lastProgressCompletedAt,
    totalScore: api.totalTestScore
  });

  const fetchStudents = async (page: number, size: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      // Construct the URL based on whether a specific course is selected
      let url = `${process.env.REACT_APP_SERVER_HOST}/api/courses/result/students?page=${page}&size=${size}`;

      // Only add courseId parameter if a specific course is selected
      if (filterCourseLearning !== 'all') {
        url += `&courseId=${filterCourseLearning}`;
      }

      // Add search parameter if there is search text
      if (searchTextCourse) {
        url += `&search=${encodeURIComponent(searchTextCourse)}`;
      }

      const res = await axios.get<PaginatedResponse<any>>(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === 200) {
        // Always update the data when this function is called
        const transformed = res.data.data.content.map((s: any) => mapApiStudent(s));
        setTotalCourseStudents(res.data.data.totalElements);
        setCourseStudents(transformed);
        setTotalElements(res.data.data.totalElements);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      message.error('Không thể tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(currentPage, pageSize);
  }, [filterCourseLearning, pageSize, currentPage, searchTextCourse]);

  useEffect(() => {
    fetchExamResults(examCurrentPage, pageSizeExam);
  }, [filterCourse, pageSizeExam, examCurrentPage, searchTextExam]);

  const getStatusTag = (status: string) => {
    switch (status) {
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

  // Search handlers
  const handleCourseSearch = (value: string) => {
    setSearchTextCourse(value);
  };

  const handleExamSearch = (value: string) => {
    setSearchTextExam(value);
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

  // Export selected exam results to Excel
  const downloadResults = async () => {
    if (activeResultType !== 'exam') return;

    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một bài thi để xuất');
      return;
    }

    try {
      setLoading(true);
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      if (!token) {
        message.error('Không xác thực được người dùng');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/tests/result/export-excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedRowKeys)
      });

      if (!response.ok) {
        throw new Error('Xuất tệp Excel thất bại');
      }

      const blob = await response.blob();
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Use timestamp for file name
      link.download = `ExamResults_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('Đã xuất file Excel thành công');
    } catch (err: any) {
      console.error(err);
      message.error(err.message || 'Không thể xuất tệp Excel');
    } finally {
      setLoading(false);
    }
  };

  // Get status tag for course completion
  const getCourseStatusTag = (status: string) => {
    switch (status) {
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




  // Columns for course learning results
  const courseColumns: ColumnsType<CourseStudent> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50
    },
    {
      title: 'Học viên',
      dataIndex: 'student',
      key: 'student',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar} icon={!record.avatar && <UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.fullname}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.accountId} | {record.email}</Text>
          </Space>
        </Space>
      ),
      sorter: (a, b) => {
        const nameA = a.fullname || '';
        const nameB = b.fullname || '';
        return nameA.localeCompare(nameB);
      },
    },
    {
      title: 'Điểm trung bình',
      dataIndex: 'avgTestScore',
      key: 'avgTestScore',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.avgTestScore.toFixed(2) || 0}/10</Text>
        </Space>
      ),
      sorter: (a, b) => {
        const scoreA = a.avgTestScore || 0;
        const scoreB = b.avgTestScore || 0;
        return scoreA - scoreB;
      },
    },
    {
      title: 'Khóa học',
      dataIndex: 'course',
      key: 'course',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.coursesTitle}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Ngày đăng ký: {new Date(record.enrollmentDate).toLocaleDateString('vi-VN')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => {
        const titleA = a.coursesTitle || '';
        const titleB = b.coursesTitle || '';
        return titleA.localeCompare(titleB);
      },
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progressPercent',
      key: 'progressPercent',
      render: (_, record) => {
        const progressValue = record.progressPercent || 0;
        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Progress
              percent={progressValue}
              size="small"
              format={(percent) => `${percent}%`}
              status={progressValue >= 100 ? "success" : "active"}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.lessonCompleted}/{record.totalLessons} bài học
            </Text>
          </Space>
        );
      },
      sorter: (a, b) => {
        const progressA = a.progressPercent || 0;
        const progressB = b.progressPercent || 0;
        return progressA - progressB;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => {
        const status = record.completionStatus ||
          ((record.progressPercent || 0) >= 100 ? 'completed' :
            (record.progressPercent || 0) > 0 ? 'in_progress' : 'not_started');
        return getCourseStatusTag(status);
      },
      filters: [
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đang học', value: 'in_progress' },
        { text: 'Chưa bắt đầu', value: 'not_started' },
      ],
      onFilter: (value, record) => {
        const status = record.completionStatus ||
          ((record.progressPercent || 0) >= 100 ? 'completed' :
            (record.progressPercent || 0) > 0 ? 'in_progress' : 'not_started');
        return status === value;
      },
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

  // const filteredExamData = activeResultType === 'exam' ? results.filter(result => {
  //   if (!searchText) return true;

  //   const title = result.examTitle || result.title || '';
  //   const course = result.title || '';
  //   const author = result.author || '';

  //   return (
  //     title.toLowerCase().includes(searchText.toLowerCase()) ||
  //     course.toLowerCase().includes(searchText.toLowerCase()) ||
  //     author.toLowerCase().includes(searchText.toLowerCase())
  //   );
  // }) : [];

  // const filteredCourseData = activeResultType === 'course' ? courseStudents.filter(student => {
  //   if (!searchTextCourse) return true;

  //   const fullname = student.fullname || '';

  //   const coursesTitle = student.coursesTitle || '';

  //   return (
  //     fullname.toLowerCase().includes(searchText.toLowerCase()) ||

  //     coursesTitle.toLowerCase().includes(searchText.toLowerCase())
  //   );
  // }) : [];



  const handleResultTypeChange = (type: 'exam' | 'course') => {
    setSearchTextCourse('');
    setSearchTextExam('');
    setSelectedRowKeys([]);

    if (type === 'exam') {
      setCourseStudents([]);
      setTotalElements(0);
      setTotalPages(0);
      setCurrentPage(0);
      setExamCurrentPage(0);
      setActiveResultType(type);
      fetchCourseList();
      handleCourseChange('all')
      setTimeout(() => {
        fetchExamResults(0, pageSizeExam);
      }, 0);
    } else {
      setResults([]);
      setExamTotalElements(0);
      setExamTotalPages(0);
      setExamCurrentPage(0);
      setCurrentPage(0);
      handleCourseLearningChange('all')
      setActiveResultType(type);
      fetchCourseList();
      setTimeout(() => {
        fetchStudents(0, pageSize);
      }, 0);
    }
  };

  const viewExamDetails = (record: TestResult) => {
    setSelectedExam(record);
    setExamDetailsVisible(true);
  };


  const examColumns: ColumnsType<TestResult> = [
    {
      title: 'Bài thi',
      dataIndex: 'exam',
      key: 'exam',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            {record.imageUrl && (
              <Avatar shape="square" size="large" src={record.imageUrl} />
            )}
            <div>
              <Text strong>{record.examTitle || record.title}</Text>
              {record.author && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                  Tác giả: {record.author}
                </Text>
              )}
            </div>
          </Space>
          {record.courseTitle && (
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 5 }}>Khóa học: {record.courseTitle}</Text>
          )}
        </Space>
      ),
      sorter: (a, b) => {
        const titleA = a.examTitle || a.title || '';
        const titleB = b.examTitle || b.title || '';
        return titleA.localeCompare(titleB);
      },
    },
    {
      title: 'Thông tin',
      dataIndex: 'info',
      key: 'info',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.type && <Tag color="blue">{record.type}</Tag>}
          {record.level && <Tag color={record.level === 'HARD' ? 'red' : record.level === 'MEDIUM' ? 'orange' : 'green'}>{record.level}</Tag>}
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Câu hỏi: {record.totalQuestions || record.totalQuestion || 0}
          </Text>
          {record.easyQuestion !== undefined && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Dễ: {record.easyQuestion}, Vừa: {record.mediumQuestion}, Khó: {record.hardQuestion}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Thống kê',
      dataIndex: 'stats',
      key: 'stats',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>Lượt thi: {record.totalAttempts || 0}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Người tham gia: {record.uniqueParticipants || 0}
          </Text>
          {record.rating !== undefined && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Đánh giá:  {record.rating != null ? record.rating.toFixed(1) : 0}/5
            </Text>
          )}
        </Space>
      ),
      sorter: (a, b) => {
        const attemptsA = a.totalAttempts || 0;
        const attemptsB = b.totalAttempts || 0;
        return attemptsA - attemptsB;
      },
    },
    {
      title: 'Điểm số',
      dataIndex: 'score',
      key: 'score',
      render: (_, record) => {
        const scoreValue = record.avgScore || 0;
        const maxScoreValue = record.maxScore || 10;
        const percentageScore = scoreValue ? (scoreValue / maxScoreValue * 100) : 0;

        return (
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <Text strong style={{ color: getScoreColor(percentageScore) }}>
              {scoreValue.toFixed(2)}/{maxScoreValue} ({percentageScore.toFixed(0)}%)
            </Text>
            <Progress
              percent={percentageScore}
              size="small"
              showInfo={false}
              strokeColor={getScoreColor(percentageScore)}
            />
            {record.minScore !== undefined && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Min: {record.minScore.toFixed(1)}, Max: {record.maxScore?.toFixed(1) || 10}
              </Text>
            )}
          </Space>
        )
      },
      sorter: (a, b) => {
        const scoreA = a.avgScore || 0;
        const scoreB = b.avgScore || 0;
        return scoreA - scoreB;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (_, record) => {
        return (
          <Space direction="vertical" size={0}>
            <Text>
              <ClockCircleOutlined /> {record.duration ? `${record.duration / 60} phút` : 'N/A'}
            </Text>
          </Space>
        );
      },
      sorter: (a, b) => {
        const durationA = a.duration || 0;
        const durationB = b.duration || 0;
        return durationA - durationB;
      },
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

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const fetchExamResults = async (page: number, size: number) => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      let url = `${process.env.REACT_APP_SERVER_HOST}/api/tests/result/students?page=${page}&size=${size}`;

      if (filterCourse !== 'all') {
        url += `&categoryLevel4Id=${filterCourse}`;
      }

      if (searchTextExam) {
        url += `&search=${encodeURIComponent(searchTextExam)}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch exam results");
      }

      const responseData = await response.json();

      if (responseData.status === 200 && responseData.data) {
        const mappedResults = responseData.data.content.map((result: any) => ({
          testId: result.testId,
          id: result.testId?.toString(),
          examId: result.testId?.toString(),
          title: result.title,
          examTitle: result.title,
          description: result.description,
          courseTitle: result.courseTitle,
          courseId: result.categoryLevel1Id,
          subject: result.courseTitle,
          score: result.avgScore || 0,
          maxScore: result.maxScore || 10,
          percentageScore: result.avgScore ? (result.avgScore * 10) : 0,
          totalQuestions: result.totalQuestion,
          duration: result.duration,
          status: result.avgScore >= 5 ? 'passed' : 'failed',
          level: result.level,
          type: result.type,
          point: result.point,
          easyQuestion: result.easyQuestion,
          mediumQuestion: result.mediumQuestion,
          hardQuestion: result.hardQuestion,
          author: result.author,
          imageUrl: result.imageUrl,
          examType: result.examType,
          cost: result.cost,
          price: result.price,
          rating: result.rating,
          totalAttempts: result.totalAttempts,
          uniqueParticipants: result.uniqueParticipants,
          avgScore: result.avgScore,
          minScore: result.minScore
        }));

        setResults(mappedResults);
        setExamTotalElements(responseData.data.totalElements || 0);
        setExamTotalPages(responseData.data.totalPages || 0);
      }
    } catch (error: any) {
      console.error("Failed to fetch exam results:", error);
      message.error("Không thể tải kết quả bài thi");
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setCurrentPage(page - 1);
    if (pageSize) setPageSize(pageSize);
  };

  const handleExamPaginationChange = (page: number, pageSize?: number) => {
    setExamCurrentPage(page - 1);
    if (pageSize) setPageSizeExam(pageSize);
  };

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

      {activeResultType === 'course' ? (
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
                    ref={courseSearchRef}
                    onSearch={handleCourseSearch}
                    onChange={e => setSearchTextCourse(e.target.value)}
                    style={{ width: 250 }}
                  />
                  <Select
                    defaultValue="all"
                    style={{ width: 200 }}
                    ref={courseFilterRef}
                    onChange={handleCourseLearningChange}
                  >
                    <Option value="all">Tất cả khóa học</Option>
                    {courses.map(course => (
                      <Option key={course.id} value={course.id}>{course.title}</Option>
                    ))}
                  </Select>
                </Space>
              </Space>

              <Table
                columns={courseColumns}
                dataSource={courseStudents}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: currentPage + 1,
                  pageSize: pageSize,
                  total: totalElements,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100', '200'],
                  onChange: handlePaginationChange,
                  onShowSizeChange: (current, size) => {
                    setPageSize(size);
                    setCurrentPage(0);
                  },
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} kết quả`
                }}
                scroll={{ x: 'max-content', y: 450 }}
              />
            </Space>
          </Card>
        </>
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={24}>
              <Card>
                <Statistic
                  title="Tổng số bài thi"
                  value={examTotalElements}
                  prefix={<FileExcelOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Button disabled={selectedRowKeys.length === 0} onClick={downloadResults} icon={<ExportOutlined />}>
                    Xuất dữ liệu {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}
                  </Button>
                </Space>
                <Space>
                  <Search
                    placeholder="Tìm kiếm kết quả..."
                    allowClear
                    ref={examSearchRef}
                    onSearch={handleExamSearch}
                    onChange={e => setSearchTextExam(e.target.value)}
                    style={{ width: 250 }}
                  />
                  <Select
                    defaultValue="all"
                    style={{ width: 200 }}
                    ref={examFilterRef}
                    onChange={handleCourseChange}
                  >
                    <Option value="all">Tất cả khóa học</Option>
                    {courses.map(course => (
                      <Option key={course.id} value={course.id}>{course.title}</Option>
                    ))}
                  </Select>
                </Space>
              </Space>

              <Table
                columns={examColumns}
                dataSource={results}
                rowKey="testId"
                loading={loading}
                rowSelection={rowSelection}
                pagination={{
                  current: examCurrentPage + 1,
                  pageSize: pageSizeExam,
                  total: examTotalElements,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100', '200'],
                  onChange: handleExamPaginationChange,
                  onShowSizeChange: (current, size) => {
                    setPageSizeExam(size);
                    setExamCurrentPage(0);
                  },
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} kết quả`
                }}
                scroll={{ x: 'max-content', y: 450 }}
              />
            </Space>
          </Card>
        </>
      )}

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
                <Card>
                  <Space align="start">
                    {selectedExam.imageUrl && (
                      <Avatar shape="square" size={64} src={selectedExam.imageUrl} />
                    )}
                    <Space direction="vertical">
                      <Title level={4} style={{ margin: 0 }}>{selectedExam.examTitle || selectedExam.title}</Title>
                      {selectedExam.author && <Text>Tác giả: {selectedExam.author}</Text>}
                      {selectedExam.courseTitle && <Text>Khóa học: {selectedExam.courseTitle}</Text>}
                    </Space>
                  </Space>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Thông tin chi tiết">
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Loại bài thi" span={2}>
                      {selectedExam.type || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Độ khó">
                      {selectedExam.level || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian làm bài">
                      {selectedExam.duration ? `${selectedExam.duration / 60} phút` : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng số câu hỏi">
                      {selectedExam.totalQuestions || selectedExam.totalQuestion || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phân bố câu hỏi">
                      Dễ: {selectedExam.easyQuestion || 0}, Vừa: {selectedExam.mediumQuestion || 0}, Khó: {selectedExam.hardQuestion || 0}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Kết quả">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Điểm trung bình"
                        value={selectedExam.avgScore || 0}
                        precision={2}
                        // suffix={`/${selectedExam.maxScore || 10}`}
                        valueStyle={{ color: getScoreColor((selectedExam.avgScore || 0) * 10) }}
                      />
                    </Col>

                    <Col span={8}>
                      <Statistic
                        title="Số lượt thi"
                        value={selectedExam.totalAttempts || 0}
                      />
                    </Col>
                  </Row>
                  <Divider />

                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

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
                    <Avatar
                      size={64}
                      src={selectedStudent.avatar || selectedStudent.image}
                      icon={!selectedStudent.avatar && !selectedStudent.image && <UserOutlined />}
                    />
                    <Space direction="vertical">
                      <Title level={4} style={{ margin: 0 }}>
                        {selectedStudent.fullname || ''}
                      </Title>
                      <Text>
                        ID: {selectedStudent.accountId} |
                        Email: {selectedStudent.email || ''}
                      </Text>
                      <Text type="secondary">
                        Ngày đăng ký: {new Date(selectedStudent.enrollmentDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </Space>
                  </Space>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Thông tin khóa học">
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Tên khóa học" span={2}>
                      {selectedStudent.coursesTitle || ''}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      {getCourseStatusTag(
                        selectedStudent.completionStatus ||
                        ((selectedStudent.progressPercent || 0) >= 100 ? 'completed' :
                          (selectedStudent.progressPercent || 0) > 0 ? 'in_progress' : 'not_started')
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiến độ" span={2}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space>
                          <Text>{selectedStudent.progressPercent || selectedStudent.progress || 0}%</Text>
                          <Text type="secondary">hoàn thành</Text>
                        </Space>
                        <Progress
                          percent={selectedStudent.progressPercent || selectedStudent.progress || 0}
                          status={
                            (selectedStudent.completionStatus === 'completed' ||
                              (selectedStudent.progressPercent || selectedStudent.progress || 0) >= 100)
                              ? 'success' : 'active'
                          }
                          strokeColor={
                            (selectedStudent.progressPercent || selectedStudent.progress || 0) > 80
                              ? '#52c41a'
                              : (selectedStudent.progressPercent || selectedStudent.progress || 0) > 50
                                ? '#1890ff'
                                : '#faad14'
                          }
                        />
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Bài học hoàn thành" span={2}>
                      <Text>{selectedStudent.lessonCompleted || 0}/{selectedStudent.totalLessons || 0} bài học</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Chương hoàn thành" span={2}>
                      <Text>{selectedStudent.chapterCompleted || 0}/{selectedStudent.totalChapters || 0} chương</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Điểm trung bình" span={2}>
                      <Statistic
                        value={Number(selectedStudent.avgTestScore.toFixed(2)) || 0}
                        suffix="/10"
                        valueStyle={{
                          color: getScoreColor((Number(selectedStudent.avgTestScore.toFixed(2)) || 0) * 10)
                        }}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Số bài kiểm tra đã làm" span={2}>
                      <Text>{selectedStudent.testCount || 0}</Text>
                    </Descriptions.Item>
                    {selectedStudent.certificateCode && (
                      <Descriptions.Item label="Chứng chỉ" span={2}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Space>
                            <Text>Mã: {selectedStudent.certificateCode}</Text>
                            {selectedStudent.certificateVerified && (
                              <Tag color="green">Đã xác thực</Tag>
                            )}
                          </Space>
                          {selectedStudent.certificateUrl && (
                            <>
                              <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                                <img
                                  src={selectedStudent.certificateUrl}
                                  alt="Certificate Preview"
                                  style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #f0f0f0' }}
                                />
                              </div>
                              <Space>
                                <Button
                                  type="primary"
                                  icon={<EyeOutlined />}
                                  onClick={() => window.open(selectedStudent.certificateUrl, '_blank')}
                                >
                                  Xem chứng chỉ
                                </Button>
                                <Button
                                  icon={<DownloadOutlined />}
                                  onClick={() => {
                                    const urlParts = selectedStudent.certificateUrl?.split('.') || [];
                                    const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].toLowerCase() : 'jpg';

                                    fetch(selectedStudent.certificateUrl || '')
                                      .then(response => response.blob())
                                      .then(blob => {
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = `Certificate-${selectedStudent.certificateCode}.${extension}`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(url);
                                        message.success('Đang tải chứng chỉ...');
                                      })
                                      .catch(error => {
                                        console.error('Error downloading image:', error);
                                        message.error('Không thể tải chứng chỉ.');
                                      });
                                  }}
                                >
                                  Tải về
                                </Button>
                              </Space>
                            </>
                          )}
                          {!selectedStudent.certificateUrl && (
                            <Text type="secondary">Chưa có file chứng chỉ</Text>
                          )}
                        </Space>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
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