import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Select,
  Tag,
  Tooltip,
  Typography,
  message,
  Row,
  Col,
  Card,
  Progress,
  Statistic,
  Badge,
  Avatar,
  DatePicker
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  BarChartOutlined,
  ReloadOutlined,
  ExportOutlined,
  TrophyOutlined,
  StarOutlined,
  UserOutlined,
  ReadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { RangePickerProps } from 'antd/es/date-picker';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface StudentRanking {
  id: string;
  name: string;
  avatar: string;
  program: string;
  courseCount: number;
  completedCourseCount: number;
  testScore: number;
  participationRate: number;
  studyTime: number; // in hours
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  position: number;
  lastUpdated: string;
}

// Mock data
const mockStudents: StudentRanking[] = [
  {
    id: '1',
    name: 'Nguyễn Thị Học Giỏi',
    avatar: '',
    program: 'Khóa Fullstack Developer',
    courseCount: 15,
    completedCourseCount: 14,
    testScore: 95,
    participationRate: 98,
    studyTime: 320,
    level: 'diamond',
    position: 1,
    lastUpdated: '2023-08-15T10:30:00',
  },
  {
    id: '2',
    name: 'Trần Văn Chăm Chỉ',
    avatar: '',
    program: 'Khóa Frontend Developer',
    courseCount: 12,
    completedCourseCount: 11,
    testScore: 92,
    participationRate: 95,
    studyTime: 290,
    level: 'diamond',
    position: 2,
    lastUpdated: '2023-08-15T10:30:00',
  },
  {
    id: '3',
    name: 'Lê Thị Tiến Bộ',
    avatar: '',
    program: 'Khóa Backend Developer',
    courseCount: 14,
    completedCourseCount: 12,
    testScore: 90,
    participationRate: 92,
    studyTime: 280,
    level: 'platinum',
    position: 3,
    lastUpdated: '2023-08-15T10:30:00',
  },
  {
    id: '4',
    name: 'Phạm Văn Siêng Năng',
    avatar: '',
    program: 'Khóa UX/UI Designer',
    courseCount: 10,
    completedCourseCount: 9,
    testScore: 88,
    participationRate: 90,
    studyTime: 260,
    level: 'platinum',
    position: 4,
    lastUpdated: '2023-08-15T10:30:00',
  },
  {
    id: '5',
    name: 'Hoàng Thị Nỗ Lực',
    avatar: '',
    program: 'Khóa DevOps',
    courseCount: 9,
    completedCourseCount: 8,
    testScore: 85,
    participationRate: 88,
    studyTime: 240,
    level: 'gold',
    position: 5,
    lastUpdated: '2023-08-15T10:30:00',
  },
  {
    id: '6',
    name: 'Đỗ Văn Cố Gắng',
    avatar: '',
    program: 'Khóa Mobile Developer',
    courseCount: 8,
    completedCourseCount: 7,
    testScore: 82,
    participationRate: 85,
    studyTime: 220,
    level: 'gold',
    position: 6,
    lastUpdated: '2023-08-15T10:30:00',
  },
  {
    id: '7',
    name: 'Vũ Thị Phấn Đấu',
    avatar: '',
    program: 'Khóa Data Science',
    courseCount: 7,
    completedCourseCount: 6,
    testScore: 78,
    participationRate: 80,
    studyTime: 200,
    level: 'silver',
    position: 7,
    lastUpdated: '2023-08-15T10:30:00',
  },
  {
    id: '8',
    name: 'Ngô Văn Rèn Luyện',
    avatar: '',
    program: 'Khóa AI Engineering',
    courseCount: 6,
    completedCourseCount: 5,
    testScore: 75,
    participationRate: 78,
    studyTime: 180,
    level: 'bronze',
    position: 8,
    lastUpdated: '2023-08-15T10:30:00',
  },
];

// API URL
const API_URL = 'http://localhost:8080/api';

const StudentRankings: React.FC = () => {
  const [rankings, setRankings] = useState<StudentRanking[]>(mockStudents);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<StudentRanking | null>(null);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  
  // Filter states
  const [filterProgram, setFilterProgram] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  
  // Fetch rankings data
  const fetchRankings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/student/rankings`);
      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }
      const data = await response.json();
      setRankings(data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      // Using mock data for demonstration
      setRankings(mockStudents);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRankings();
  }, []);
  
  // Filter function
  const getFilteredRankings = () => {
    return rankings.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchText.toLowerCase()) ||
        student.program.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesProgram = !filterProgram || student.program === filterProgram;
      const matchesLevel = !filterLevel || student.level === filterLevel;
      
      return matchesSearch && matchesProgram && matchesLevel;
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setFilterProgram(null);
    setFilterLevel(null);
    setDateRange(null);
  };
  
  // Show student details
  const showStudentDetails = (student: StudentRanking) => {
    setCurrentStudent(student);
    setIsDetailModalVisible(true);
  };
  
  // Date range change handler
  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates) {
      setDateRange([dates[0]?.toDate() as Date, dates[1]?.toDate() as Date]);
    } else {
      setDateRange(null);
    }
  };
  
  // Get level badge
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'diamond':
        return <Badge count={<TrophyOutlined style={{ color: '#36b3ff' }} />} />;
      case 'platinum':
        return <Badge count={<TrophyOutlined style={{ color: '#e5e4e2' }} />} />;
      case 'gold':
        return <Badge count={<TrophyOutlined style={{ color: '#ffd700' }} />} />;
      case 'silver':
        return <Badge count={<TrophyOutlined style={{ color: '#c0c0c0' }} />} />;
      case 'bronze':
        return <Badge count={<TrophyOutlined style={{ color: '#cd7f32' }} />} />;
      default:
        return null;
    }
  };
  
  // Get level tag
  const getLevelTag = (level: string) => {
    switch (level) {
      case 'diamond':
        return <Tag color="#36b3ff">Kim cương</Tag>;
      case 'platinum':
        return <Tag color="#e5e4e2">Bạch kim</Tag>;
      case 'gold':
        return <Tag color="#ffd700">Vàng</Tag>;
      case 'silver':
        return <Tag color="#c0c0c0">Bạc</Tag>;
      case 'bronze':
        return <Tag color="#cd7f32">Đồng</Tag>;
      default:
        return <Tag>Chưa xác định</Tag>;
    }
  };
  
  // Table columns
  const columns: ColumnsType<StudentRanking> = [
    {
      title: 'Xếp hạng',
      dataIndex: 'position',
      key: 'position',
      width: 100,
      render: (position: number) => (
        <span className="ranking-position">{position}</span>
      ),
      sorter: (a, b) => a.position - b.position,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Học viên',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: StudentRanking) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <span>{name}</span>
          <span className="ranking-badge">{getLevelBadge(record.level)}</span>
        </Space>
      ),
    },
    {
      title: 'Chương trình học',
      dataIndex: 'program',
      key: 'program',
      width: 220,
    },
    {
      title: 'Khóa học đã hoàn thành',
      key: 'completedCourses',
      width: 200,
      render: (_, record) => (
        <span>{record.completedCourseCount}/{record.courseCount}</span>
      ),
      sorter: (a, b) => (a.completedCourseCount / a.courseCount) - (b.completedCourseCount / b.courseCount),
    },
    {
      title: 'Điểm kiểm tra',
      dataIndex: 'testScore',
      key: 'testScore',
      width: 150,
      render: (score: number) => `${score}/100`,
      sorter: (a, b) => a.testScore - b.testScore,
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level: string) => getLevelTag(level),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => showStudentDetails(record)} 
            />
          </Tooltip>
          <Tooltip title="Biểu đồ thống kê">
            <Button 
              icon={<BarChartOutlined />} 
              size="small" 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // Get unique programs for filter
  const programs = Array.from(new Set(rankings.map(item => item.program)));
  
  // Level options for filter
  const levelOptions = [
    { value: 'diamond', label: 'Kim cương' },
    { value: 'platinum', label: 'Bạch kim' },
    { value: 'gold', label: 'Vàng' },
    { value: 'silver', label: 'Bạc' },
    { value: 'bronze', label: 'Đồng' },
  ];

  return (
    <div>
      <div className="ranking-description">
        <Paragraph>
          Hệ thống xếp hạng học viên dựa trên nhiều tiêu chí: số lượng khóa học đã hoàn thành, 
          điểm kiểm tra trung bình, tỷ lệ tham gia và thời gian học tập.
        </Paragraph>
        <div className="ranking-criteria">
          Bảng xếp hạng được cập nhật hàng tuần. Cấp độ xếp hạng: Đồng, Bạc, Vàng, Bạch kim, Kim cương.
        </div>
      </div>
      
      <div className="ranking-filters">
        <Input
          placeholder="Tìm kiếm theo tên học viên, chương trình"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          allowClear
        />
        
        <Select
          placeholder="Chọn chương trình"
          style={{ width: 200 }}
          value={filterProgram}
          onChange={value => setFilterProgram(value)}
          allowClear
        >
          {programs.map(program => (
            <Option key={program} value={program}>{program}</Option>
          ))}
        </Select>
        
        <Select
          placeholder="Cấp độ"
          style={{ width: 150 }}
          value={filterLevel}
          onChange={value => setFilterLevel(value)}
          allowClear
        >
          {levelOptions.map(option => (
            <Option key={option.value} value={option.value}>{option.label}</Option>
          ))}
        </Select>
        
        <RangePicker onChange={handleDateRangeChange} />
        
        <Button 
          icon={<ReloadOutlined />} 
          onClick={resetFilters}
        >
          Đặt lại
        </Button>
        
        <Button 
          type="primary" 
          icon={<ExportOutlined />}
        >
          Xuất báo cáo
        </Button>
      </div>
      
      <div className="ranking-stats">
        <div className="ranking-stat-card">
          <Text>Tổng số học viên</Text>
          <div className="ranking-stat-value">{rankings.length}</div>
        </div>
        <div className="ranking-stat-card">
          <Text>Kim cương</Text>
          <div className="ranking-stat-value">{rankings.filter(i => i.level === 'diamond').length}</div>
        </div>
        <div className="ranking-stat-card">
          <Text>Bạch kim</Text>
          <div className="ranking-stat-value">{rankings.filter(i => i.level === 'platinum').length}</div>
        </div>
        <div className="ranking-stat-card">
          <Text>Vàng</Text>
          <div className="ranking-stat-value">{rankings.filter(i => i.level === 'gold').length}</div>
        </div>
      </div>
      
      <Table
        className="ranking-table"
        columns={columns}
        dataSource={getFilteredRankings()}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng cộng ${total} học viên`,
        }}
      />
      
      {/* Detail Modal */}
      <Modal
        title="Chi tiết học viên"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        className="ranking-detail-modal"
        width={800}
      >
        {currentStudent && (
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card>
                <Row gutter={16} align="middle">
                  <Col>
                    <Avatar size={64} icon={<UserOutlined />} src={currentStudent.avatar} />
                  </Col>
                  <Col flex="auto">
                    <Title level={4}>{currentStudent.name} {getLevelBadge(currentStudent.level)}</Title>
                    <Text>{currentStudent.program}</Text>
                    <div style={{ marginTop: 8 }}>
                      {getLevelTag(currentStudent.level)}
                      <Tag color="blue">Xếp hạng #{currentStudent.position}</Tag>
                    </div>
                  </Col>
                  <Col>
                    <Statistic 
                      title="Điểm kiểm tra" 
                      value={currentStudent.testScore} 
                      suffix="/100" 
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="Số liệu thống kê">
                <p><ReadOutlined /> <strong>Số khóa học:</strong> {currentStudent.courseCount}</p>
                <p><CheckCircleOutlined /> <strong>Khóa học đã hoàn thành:</strong> {currentStudent.completedCourseCount}</p>
                <p><ClockCircleOutlined /> <strong>Thời gian học tập:</strong> {currentStudent.studyTime} giờ</p>
                <p><strong>Cập nhật lần cuối:</strong> {new Date(currentStudent.lastUpdated).toLocaleDateString('vi-VN')}</p>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="Hiệu suất">
                <div className="ranking-progress">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Hoàn thành khóa học</Text>
                    <Text>{Math.round((currentStudent.completedCourseCount / currentStudent.courseCount) * 100)}%</Text>
                  </div>
                  <Progress percent={Math.round((currentStudent.completedCourseCount / currentStudent.courseCount) * 100)} status="active" />
                </div>
                
                <div className="ranking-progress">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Điểm kiểm tra</Text>
                    <Text>{currentStudent.testScore}/100</Text>
                  </div>
                  <Progress percent={currentStudent.testScore} status="active" />
                </div>
                
                <div className="ranking-progress">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Tỷ lệ tham gia</Text>
                    <Text>{currentStudent.participationRate}%</Text>
                  </div>
                  <Progress percent={currentStudent.participationRate} status="active" />
                </div>
              </Card>
            </Col>
            
            <Col span={24}>
              <Card title="Tiêu chí xếp hạng">
                <p>Hệ thống tính điểm dựa trên các tiêu chí sau:</p>
                <ul>
                  <li>Số lượng khóa học đã hoàn thành</li>
                  <li>Điểm kiểm tra trung bình</li>
                  <li>Tỷ lệ tham gia</li>
                  <li>Thời gian học tập</li>
                </ul>
                <p>Các cấp độ xếp hạng:</p>
                <ul>
                  <li><strong>Kim cương:</strong> &gt;= 90 điểm</li>
                  <li><strong>Bạch kim:</strong> 80-89 điểm</li>
                  <li><strong>Vàng:</strong> 70-79 điểm</li>
                  <li><strong>Bạc:</strong> 60-69 điểm</li>
                  <li><strong>Đồng:</strong> &lt; 60 điểm</li>
                </ul>
              </Card>
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default StudentRankings; 