// @ts-nocheck
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
  DatePicker,
  Tabs
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
  CheckCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { RangePickerProps } from 'antd/es/date-picker';
import moment from 'moment';
import { authTokenLogin } from '../../utils';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface StudentRanking {
  id: string;
  accountId: string;
  accountName: string;
  avatar: string;
  totalPoints: number;
  ranking: number;
  status: boolean; // Đã tính điểm chưa
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  createdAt: string;
  updatedAt: string;
}

interface PaginationParams {
  page: number;
  size: number;
  total: number;
}


// API URL
const API_URL = 'http://localhost:8080/api';

const StudentRankings: React.FC = () => {
  const [currentTimeframe, setCurrentTimeframe] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<StudentRanking | null>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  // Pagination state
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 0,
    size: 10,
    total: 0
  });

  // Filter states
  const [filterPosition, setFilterPosition] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null);

  // Construct the filter parameters for API request
  const getFilterParams = () => {
    const params = new URLSearchParams();

    // Pagination params
    params.append('page', pagination.page.toString());
    params.append('size', pagination.size.toString());

    // Fixed filter by period type
    params.append('periodType', currentTimeframe);

    // Optional filters
    if (filterPosition !== null) {
      params.append('ranking', filterPosition.toString());
    }

    if (filterStatus !== null) {
      params.append('status', filterStatus.toString());
    }

    if (searchText) {
      params.append('accountName', searchText);
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
      params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
    }

    return params;
  };

  // Fetch rankings data
  const fetchRankings = async () => {
    setLoading(true);
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const params = getFilterParams();

      // Add week filter for weekly rankings
      if (currentTimeframe === 'WEEKLY') {
        const now = moment();
        const startOfWeek = now.clone().startOf('week');
        const endOfWeek = now.clone().endOf('week');
        params.append('startDate', startOfWeek.format('YYYY-MM-DD'));
        params.append('endDate', endOfWeek.format('YYYY-MM-DD'));
      }

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/rankings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rankings: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 200 && data.data) {
        // Map response data to StudentRanking interface
        setRankings(data.data.content || []);
        setPagination({
          page: data.data.number || 0,
          size: data.data.size || 10,
          total: data.data.totalElements || 0
        });
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error(`Error fetching rankings:`, error);
      message.error('Không thể tải dữ liệu xếp hạng');
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchRankings();
  }, [
    currentTimeframe,
    pagination.page,
    pagination.size,
    filterPosition,
    filterStatus,
    dateRange
  ]);

  // Handle search with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRankings();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setFilterPosition(null);
    setFilterStatus(null);
    setDateRange(null);

    // Reset pagination to first page
    setPagination({
      ...pagination,
      page: 0
    });

    // Fetch data with cleared filters
    fetchRankings();
  };

  // Handle table pagination changes
  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      page: newPagination.current - 1, // API uses 0-based indexing
      size: newPagination.pageSize,
      total: pagination.total
    });
  };

  // Show student details
  const showStudentDetails = (student: StudentRanking) => {
    setCurrentStudent(student);
    setIsDetailModalVisible(true);
  };

  // Date range change handler
  const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };

  // Get rating badge based on pointRanking
  const getRatingBadge = (points: number) => {
    if (points >= 90) {
      return <Badge count={<TrophyOutlined style={{ color: '#36b3ff' }} />} />;
    } else if (points >= 80) {
      return <Badge count={<TrophyOutlined style={{ color: '#e5e4e2' }} />} />;
    } else if (points >= 70) {
      return <Badge count={<TrophyOutlined style={{ color: '#ffd700' }} />} />;
    } else if (points >= 60) {
      return <Badge count={<TrophyOutlined style={{ color: '#c0c0c0' }} />} />;
    } else {
      return <Badge count={<TrophyOutlined style={{ color: '#cd7f32' }} />} />;
    }
  };

  // Get rating tag based on pointRanking
  const getRatingTag = (points: number) => {
    if (points >= 90) {
      return <Tag color="#36b3ff">Kim cương</Tag>;
    } else if (points >= 80) {
      return <Tag color="#e5e400">Bạch kim</Tag>;
    } else if (points >= 70) {
      return <Tag color="#ffd700">Vàng</Tag>;
    } else if (points >= 60) {
      return <Tag color="#c0c0c0">Bạc</Tag>;
    } else {
      return <Tag color="#cd7f32">Đồng</Tag>;
    }
  };

  // Format period value display
  const formatPeriodValue = (record: StudentRanking) => {
    const date = moment(record.createdAt);

    switch (record.periodType) {
      case 'DAILY':
        return date.format('DD/MM/YYYY');
      case 'WEEKLY':
        const startOfWeek = date.clone().startOf('week');
        const endOfWeek = date.clone().endOf('week');
        return `Tuần ${date.week()} (${startOfWeek.format('DD/MM')} - ${endOfWeek.format('DD/MM/YYYY')})`;
      case 'MONTHLY':
        return date.format('MM/YYYY');
      default:
        return date.format('DD/MM/YYYY');
    }
  };

  // Table columns
  const columns: ColumnsType<StudentRanking> = [
    {
      title: 'Xếp hạng',
      dataIndex: 'ranking',
      key: 'ranking',
      width: 100,
      render: (ranking: number) => (
        <span className="ranking-ranking">{ranking}</span>
      ),
      sorter: (a, b) => a.ranking - b.ranking,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Học viên',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (accountName: string, record: StudentRanking) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <span>{accountName}</span>
          <span className="ranking-badge">{getRatingBadge(record.totalPoints)}</span>
        </Space>
      ),
    },
    {
      title: 'Điểm xếp hạng',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      width: 150,
      render: (score: number) => `${score}`,
      sorter: (a, b) => a.totalPoints - b.totalPoints,
    },
    {
      title: 'Thời gian',
      key: 'createdAt',
      width: 150,
      render: (_, record) => formatPeriodValue(record),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Tag color={record.status ? 'green' : 'orange'}>
          {record.status ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
        </Tag>
      ),
      filters: [
        { text: 'Đã hoàn thành', value: true },
        { text: 'Chưa hoàn thành', value: false },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Cấp độ',
      key: 'level',
      width: 120,
      render: (_, record) => getRatingTag(record.totalPoints),
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

  // Get current timeframe title
  const getTimeframeTitle = () => {
    switch (currentTimeframe) {
      case 'DAILY':
        return 'Bảng xếp hạng ngày';
      case 'WEEKLY':
        return 'Bảng xếp hạng tuần';
      case 'MONTHLY':
        return 'Bảng xếp hạng tháng';
      default:
        return 'Bảng xếp hạng';
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (key: string) => {
    setCurrentTimeframe(key as 'DAILY' | 'WEEKLY' | 'MONTHLY');
    // Reset pagination to first page on timeframe change
    setPagination({
      ...pagination,
      page: 0
    });
  };

  // Get current rankings statistics
  const getRankingsStats = () => {
    // Filter current week rankings if on weekly view
    let filteredRankings = rankings;
    if (currentTimeframe === 'WEEKLY') {
      const now = moment();
      const startOfWeek = now.clone().startOf('week');
      const endOfWeek = now.clone().endOf('week');
      filteredRankings = rankings.filter(r => {
        const recordDate = moment(r.createdAt);
        return recordDate.isBetween(startOfWeek, endOfWeek, 'day', '[]');
      });
    }

    return {
      total: pagination.total,
      diamond: filteredRankings.filter(i => i.totalPoints >= 90).length,
      platinum: filteredRankings.filter(i => i.totalPoints >= 80 && i.totalPoints < 90).length,
      gold: filteredRankings.filter(i => i.totalPoints >= 70 && i.totalPoints < 80).length,
      completed: filteredRankings.filter(i => i.status).length,
      incomplete: filteredRankings.filter(i => !i.status).length
    };
  };

  const stats = getRankingsStats();

  return (
    <div>
      <div className="ranking-description">
        <Paragraph>
          Hệ thống xếp hạng học viên dựa trên điểm xếp hạng của học viên.
        </Paragraph>
        <div className="ranking-criteria">
          Bảng xếp hạng được cập nhật theo ngày, tuần và tháng. Cấp độ xếp hạng: Đồng, Bạc, Vàng, Bạch kim, Kim cương.
        </div>
      </div>

      <Tabs defaultActiveKey="DAILY" onChange={handleTimeframeChange}>
        <TabPane
          tab={<span><CalendarOutlined /> Xếp hạng ngày</span>}
          key="DAILY"
        >
          <Title level={4}>{getTimeframeTitle()}</Title>
        </TabPane>
        <TabPane
          tab={<span><CalendarOutlined /> Xếp hạng tuần</span>}
          key="WEEKLY"
        >
          <Title level={4}>{getTimeframeTitle()}</Title>
        </TabPane>
        <TabPane
          tab={<span><CalendarOutlined /> Xếp hạng tháng</span>}
          key="MONTHLY"
        >
          <Title level={4}>{getTimeframeTitle()}</Title>
        </TabPane>
      </Tabs>

      <div className="ranking-filters">
        <Input
          placeholder="Tìm kiếm theo tên học viên"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          allowClear
        />

        <Select
          placeholder="Xếp hạng"
          style={{ width: 150 }}
          value={filterPosition}
          onChange={value => setFilterPosition(value)}
          allowClear
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(pos => (
            <Option key={pos} value={pos}>Top {pos}</Option>
          ))}
        </Select>

        <Select
          placeholder="Trạng thái"
          style={{ width: 150 }}
          value={filterStatus}
          onChange={value => setFilterStatus(value)}
          allowClear
        >
          <Option value={true}>Đã hoàn thành</Option>
          <Option value={false}>Chưa hoàn thành</Option>
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
          <div className="ranking-stat-value">{stats.total}</div>
        </div>
        <div className="ranking-stat-card">
          <Text>Kim cương</Text>
          <div className="ranking-stat-value">{stats.diamond}</div>
        </div>
        <div className="ranking-stat-card">
          <Text>Bạch kim</Text>
          <div className="ranking-stat-value">{stats.platinum}</div>
        </div>
        <div className="ranking-stat-card">
          <Text>Đã hoàn thành</Text>
          <div className="ranking-stat-value">{stats.completed}</div>
        </div>
      </div>

      <Table
        className="ranking-table"
        columns={columns}
        dataSource={rankings}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page + 1, // Adjust for 0-based indexing
          pageSize: pagination.size,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng cộng ${total} học viên`,
        }}
        onChange={handleTableChange}
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
                    <Title level={4}>{currentStudent.accountName} {getRatingBadge(currentStudent.totalPoints)}</Title>
                    <div style={{ marginTop: 8 }}>
                      {getRatingTag(currentStudent.totalPoints)}
                      <Tag color="blue">Xếp hạng #{currentStudent.ranking}</Tag>
                      <Tag color="purple">{formatPeriodValue(currentStudent)}</Tag>
                      <Tag color={currentStudent.status ? 'green' : 'orange'}>
                        {currentStudent.status ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                      </Tag>
                    </div>
                  </Col>
                  <Col>
                    <Statistic
                      title="Điểm xếp hạng"
                      value={currentStudent.totalPoints}
                      suffix=""
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Số liệu thống kê">
                <p><strong>Cập nhật lần cuối:</strong> {new Date(currentStudent.updatedAt).toLocaleDateString('vi-VN')}</p>
                <p><strong>Kiểu thống kê:</strong> {
                  currentStudent.periodType === 'DAILY' ? 'Hàng ngày' :
                    currentStudent.periodType === 'WEEKLY' ? 'Hàng tuần' : 'Hàng tháng'
                }</p>
                <p><strong>Thời gian áp dụng:</strong> {formatPeriodValue(currentStudent)}</p>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Hiệu suất">
                <div className="ranking-progress">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Điểm xếp hạng</Text>
                    <Text>{currentStudent.totalPoints}</Text>
                  </div>
                  <Progress percent={currentStudent.totalPoints} status="active" />
                </div>

                <div className="ranking-progress">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Trạng thái</Text>
                    <Text>{currentStudent.status ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</Text>
                  </div>
                  <Progress
                    percent={currentStudent.status ? 100 : 0}
                    status={currentStudent.status ? "success" : "exception"}
                  />
                </div>
              </Card>
            </Col>

            <Col span={24}>
              <Card title="Tiêu chí xếp hạng">
                <p>Hệ thống tính điểm dựa trên các tiêu chí sau:</p>
                <ul>
                  <li>Điểm xếp hạng</li>
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