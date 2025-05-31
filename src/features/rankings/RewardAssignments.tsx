// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Tag,
  Tooltip,
  Typography,
  message,
  Row,
  Col,
  Card,
  DatePicker,
  Avatar,
  Tabs
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  UserOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import axios from 'axios';
import { 
  GET_REWARD_ASSIGNMENTS, 
  PUT_REWARD_ASSIGNMENT_STATUS
} from '../../api/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface RewardAssignment {
  id: string;
  rewardId: string;
  rewardName: string;
  accountId: string;
  accountName: string;
  accountAvatar: string;
  rankingId: string;
  rankingType: 'STUDENT' | 'INSTRUCTOR';
  rankingPeriodType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  rankingPosition?: number;
  assignedAt: string;
  status: 'ASSIGNED' | 'CLAIMED' | 'DELIVERED';
  claimedAt?: string;
  deliveredAt?: string;
  deliveryAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// Mock data for reward assignments
const mockAssignments: RewardAssignment[] = [
  {
    id: '1',
    rewardId: '1',
    rewardName: 'Khóa học Pro miễn phí',
    accountId: '1001',
    accountName: 'Nguyễn Văn A',
    accountAvatar: 'https://example.com/avatar1.jpg',
    rankingId: 'r1',
    rankingType: 'STUDENT',
    rankingPeriodType: 'MONTHLY',
    rankingPosition: 1,
    assignedAt: '2023-06-05',
    status: 'CLAIMED',
    claimedAt: '2023-06-06',
    contactEmail: 'nguyenvana@example.com'
  },
  {
    id: '2',
    rewardId: '2',
    rewardName: 'Chứng chỉ thành tích xuất sắc',
    accountId: '2001',
    accountName: 'Trần Thị B',
    accountAvatar: 'https://example.com/avatar2.jpg',
    rankingId: 'r2',
    rankingType: 'INSTRUCTOR',
    rankingPeriodType: 'MONTHLY',
    rankingPosition: 1,
    assignedAt: '2023-06-05',
    status: 'DELIVERED',
    claimedAt: '2023-06-06',
    deliveredAt: '2023-06-10',
    contactEmail: 'tranthib@example.com'
  },
  {
    id: '3',
    rewardId: '3',
    rewardName: 'Mã giảm giá 50%',
    accountId: '1002',
    accountName: 'Lê Văn C',
    accountAvatar: 'https://example.com/avatar3.jpg',
    rankingId: 'r3',
    rankingType: 'STUDENT',
    rankingPeriodType: 'WEEKLY',
    rankingPosition: 7,
    assignedAt: '2023-06-12',
    status: 'ASSIGNED',
    contactEmail: 'levanc@example.com'
  },
  {
    id: '4',
    rewardId: '4',
    rewardName: 'Cúp danh dự',
    accountId: '2002',
    accountName: 'Phạm Thị D',
    accountAvatar: 'https://example.com/avatar4.jpg',
    rankingId: 'r4',
    rankingType: 'INSTRUCTOR',
    rankingPeriodType: 'MONTHLY',
    rankingPosition: 1,
    assignedAt: '2023-06-05',
    status: 'CLAIMED',
    claimedAt: '2023-06-07',
    deliveryAddress: '123 Đường ABC, Quận 1, TP.HCM',
    contactPhone: '0123456789',
    contactEmail: 'phamthid@example.com'
  },
];

const RewardAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<RewardAssignment[]>(mockAssignments);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedAssignment, setSelectedAssignment] = useState<RewardAssignment | null>(null);
  const [form] = Form.useForm();
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [currentTimePeriod, setCurrentTimePeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');

  // Load assignments data
  useEffect(() => {
    fetchAssignments();
  }, [currentTab, currentTimePeriod]);

  // Fetch assignments data
  // const fetchAssignments = async () => {
  //   try {
  //     setLoading(true);
  //     let url = GET_REWARD_ASSIGNMENTS;
      
  //     // Add date filter for daily period
  //     if (currentTimePeriod === 'DAILY') {
  //       const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  //       url += `${url.includes('?') ? '&' : '?'}date=${today}`;
  //     }
      
  //     const response = await axios.get(url);
  //     let assignmentsData = response.data;
      
  //     // Filter data based on tab
  //     if (currentTab === 'student') {
  //       assignmentsData = assignmentsData.filter(
  //         (assignment: RewardAssignment) => assignment.rankingType === 'STUDENT'
  //       );
  //     } else if (currentTab === 'instructor') {
  //       assignmentsData = assignmentsData.filter(
  //         (assignment: RewardAssignment) => assignment.rankingType === 'INSTRUCTOR'
  //       );
  //     }
      
  //     setAssignments(assignmentsData);
  //   } catch (error) {
  //     console.error('Error fetching reward assignments:', error);
  //     message.error('Không thể tải dữ liệu phần thưởng đã gán. Vui lòng thử lại sau.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Get filtered assignments
  const getFilteredAssignments = () => {
    let filtered = assignments.filter(assignment => 
      (searchText === '' || 
        assignment.accountName.toLowerCase().includes(searchText.toLowerCase()) ||
        assignment.rewardName.toLowerCase().includes(searchText.toLowerCase()))
    );
    
    if (currentTab === 'student') {
      filtered = filtered.filter(assignment => assignment.rankingType === 'STUDENT');
    } else if (currentTab === 'instructor') {
      filtered = filtered.filter(assignment => assignment.rankingType === 'INSTRUCTOR');
    }
    
    return filtered;
  };

  // Handle view assignment details
  const handleViewDetails = (record: RewardAssignment) => {
    setSelectedAssignment(record);
    setIsModalVisible(true);
  };

  // Handle status update
  const handleStatusUpdate = async (record: RewardAssignment, newStatus: 'ASSIGNED' | 'CLAIMED' | 'DELIVERED') => {
    try {
      await axios.put(PUT_REWARD_ASSIGNMENT_STATUS(record.id, newStatus));
      
      const updatedAssignments = assignments.map(item => {
        if (item.id === record.id) {
          const updated = { ...item, status: newStatus };
          
          if (newStatus === 'CLAIMED') {
            updated.claimedAt = new Date().toISOString().split('T')[0];
          } else if (newStatus === 'DELIVERED') {
            updated.deliveredAt = new Date().toISOString().split('T')[0];
          }
          
          return updated;
        }
        return item;
      });
      
      setAssignments(updatedAssignments);
      message.success('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating assignment status:', error);
      message.error('Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại sau.');
    }
  };

  // Handle tab change
  const handleTabChange = (key: string) => {
    setCurrentTab(key);
  };

  // Handle time period change
  const handleTimePeriodChange = (period: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
    setCurrentTimePeriod(period);
    fetchAssignments();
  };

  // Render status tag
  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return <Tag color="blue">Đã gán</Tag>;
      case 'CLAIMED':
        return <Tag color="green">Đã nhận</Tag>;
      case 'DELIVERED':
        return <Tag color="purple">Đã giao</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  // Render ranking type tag
  const renderRankingTypeTag = (type: string) => {
    switch (type) {
      case 'STUDENT':
        return <Tag color="blue">Học viên</Tag>;
      case 'INSTRUCTOR':
        return <Tag color="orange">Giảng viên</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  // Render period type
  const renderPeriodType = (type: string) => {
    switch (type) {
      case 'DAILY':
        return <Tag color="blue">Ngày</Tag>;
      case 'WEEKLY':
        return <Tag color="green">Tuần</Tag>;
      case 'MONTHLY':
        return <Tag color="purple">Tháng</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  // Assignment columns
  const columns: ColumnsType<RewardAssignment> = [
    {
      title: 'Người nhận',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (text, record) => (
        <div className="reward-recipient">
          <Avatar 
            className="reward-recipient-avatar" 
            icon={<UserOutlined />} 
            src={record.accountAvatar} 
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Phần thưởng',
      dataIndex: 'rewardName',
      key: 'rewardName',
      render: (text) => (
        <Space>
          <GiftOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Xếp hạng',
      dataIndex: 'rankingPosition',
      key: 'rankingPosition',
      width: 100,
      render: position => position ? `Top ${position}` : 'N/A',
      sorter: (a, b) => (a.rankingPosition || 999) - (b.rankingPosition || 999),
    },
    {
      title: 'Loại',
      dataIndex: 'rankingType',
      key: 'rankingType',
      width: 120,
      render: type => renderRankingTypeTag(type),
    },
    {
      title: 'Thời gian',
      dataIndex: 'rankingPeriodType',
      key: 'rankingPeriodType',
      width: 120,
      render: period => renderPeriodType(period),
    },
    {
      title: 'Ngày gán',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      width: 120,
      render: date => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: status => renderStatusTag(status),
      filters: [
        { text: 'Đã gán', value: 'ASSIGNED' },
        { text: 'Đã nhận', value: 'CLAIMED' },
        { text: 'Đã giao', value: 'DELIVERED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
          
          {record.status === 'ASSIGNED' && (
            <Button 
              size="small"
              type="primary"
              onClick={() => handleStatusUpdate(record, 'CLAIMED')}
            >
              Đánh dấu đã nhận
            </Button>
          )}
          
          {record.status === 'CLAIMED' && (
            <Button 
              size="small"
              type="primary"
              onClick={() => handleStatusUpdate(record, 'DELIVERED')}
            >
              Đánh dấu đã giao
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="reward-assignments">
      <div className="reward-description">
        <Paragraph>
          Quản lý việc gán và theo dõi phần thưởng cho học viên và giảng viên theo thứ hạng.
        </Paragraph>
      </div>
      
      <Tabs defaultActiveKey="all" onChange={handleTabChange}>
        <Tabs.TabPane 
          tab={<span>Tất cả phần thưởng</span>} 
          key="all"
        />
        <Tabs.TabPane 
          tab={<span>Phần thưởng học viên</span>} 
          key="student"
        />
        <Tabs.TabPane 
          tab={<span>Phần thưởng giảng viên</span>} 
          key="instructor"
        />
      </Tabs>
      
      <div className="reward-header">
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm kiếm theo tên người nhận hoặc phần thưởng"
            onSearch={handleSearch}
            style={{ width: 400 }}
            allowClear
          />
          <Select 
            defaultValue="WEEKLY" 
            style={{ width: 120 }} 
            onChange={(value) => handleTimePeriodChange(value as 'DAILY' | 'WEEKLY' | 'MONTHLY')}
          >
            <Option value="DAILY">Ngày</Option>
            <Option value="WEEKLY">Tuần</Option>
            <Option value="MONTHLY">Tháng</Option>
          </Select>
          <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
          <Button icon={<SearchOutlined />}>Tìm kiếm</Button>
        </Space>
      </div>
      
      <Table
        className="reward-assignment-table"
        columns={columns}
        dataSource={getFilteredAssignments()}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng cộng ${total} phần thưởng đã gán`,
        }}
      />
      
      {/* Assignment Details Modal */}
      <Modal
        title="Chi tiết phần thưởng đã gán"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedAssignment && (
          <Card>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <Avatar 
                    size={64} 
                    icon={<UserOutlined />} 
                    src={selectedAssignment.accountAvatar} 
                  />
                  <div style={{ marginLeft: 16 }}>
                    <Title level={4}>{selectedAssignment.accountName}</Title>
                    <div>
                      {renderRankingTypeTag(selectedAssignment.rankingType)}
                      {renderPeriodType(selectedAssignment.rankingPeriodType)}
                      {renderStatusTag(selectedAssignment.status)}
                      {selectedAssignment.rankingPosition && (
                        <Tag color="#ff4d4f">Top {selectedAssignment.rankingPosition}</Tag>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col span={24}>
                <Title level={5}>Thông tin phần thưởng</Title>
                <Card size="small">
                  <p><strong>Tên phần thưởng:</strong> {selectedAssignment.rewardName}</p>
                  <p><strong>Xếp hạng:</strong> {selectedAssignment.rankingPosition ? `Top ${selectedAssignment.rankingPosition}` : 'N/A'}</p>
                  <p><strong>Ngày gán:</strong> {moment(selectedAssignment.assignedAt).format('DD/MM/YYYY')}</p>
                  {selectedAssignment.claimedAt && (
                    <p><strong>Ngày nhận:</strong> {moment(selectedAssignment.claimedAt).format('DD/MM/YYYY')}</p>
                  )}
                  {selectedAssignment.deliveredAt && (
                    <p><strong>Ngày giao:</strong> {moment(selectedAssignment.deliveredAt).format('DD/MM/YYYY')}</p>
                  )}
                </Card>
              </Col>
              
              <Col span={24}>
                <Title level={5}>Thông tin liên hệ</Title>
                <Card size="small">
                  {selectedAssignment.contactEmail && (
                    <p>
                      <MailOutlined style={{ marginRight: 8 }} />
                      <strong>Email:</strong> {selectedAssignment.contactEmail}
                    </p>
                  )}
                  {selectedAssignment.contactPhone && (
                    <p>
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      <strong>Số điện thoại:</strong> {selectedAssignment.contactPhone}
                    </p>
                  )}
                  {selectedAssignment.deliveryAddress && (
                    <p>
                      <HomeOutlined style={{ marginRight: 8 }} />
                      <strong>Địa chỉ giao hàng:</strong> {selectedAssignment.deliveryAddress}
                    </p>
                  )}
                </Card>
              </Col>
              
              <Col span={24}>
                <Space style={{ marginTop: 16 }}>
                  {selectedAssignment.status === 'ASSIGNED' && (
                    <Button 
                      type="primary"
                      onClick={() => {
                        handleStatusUpdate(selectedAssignment, 'CLAIMED');
                        setIsModalVisible(false);
                      }}
                    >
                      Đánh dấu đã nhận
                    </Button>
                  )}
                  
                  {selectedAssignment.status === 'CLAIMED' && (
                    <Button 
                      type="primary"
                      onClick={() => {
                        handleStatusUpdate(selectedAssignment, 'DELIVERED');
                        setIsModalVisible(false);
                      }}
                    >
                      Đánh dấu đã giao
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default RewardAssignments; 