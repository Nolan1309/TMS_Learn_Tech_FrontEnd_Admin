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
  Tabs,
  Upload,
  Popconfirm,
  InputNumber
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TrophyOutlined,
  UploadOutlined,
  GiftOutlined,
  CalendarOutlined,
  AuditOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { RangePickerProps } from 'antd/es/date-picker';
import moment from 'moment';
import RewardAssignments from './RewardAssignments';
import axios from 'axios';
import { 
  POST_REWARD, 
  PUT_REWARD, 
  GET_REWARDS, 
  GET_STUDENT_REWARDS, 
  GET_INSTRUCTOR_REWARDS 
} from '../../api/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'COURSE' | 'VOUCHER' | 'EXAM';
  value: number;
  rankingType: 'STUDENT' | 'INSTRUCTOR';
  rankLevel: number;
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'ACTIVE' | 'INACTIVE';
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

// Mock data for rewards
const mockRewards: Reward[] = [
  {
    id: '1',
    name: 'Khóa học Pro miễn phí',
    description: 'Khóa học Pro miễn phí trong 1 tháng dành cho học viên đạt Top 1',
    type: 'COURSE',
    value: 500000,
    rankingType: 'STUDENT',
    rankLevel: 1,
    periodType: 'MONTHLY',
  
    status: 'ACTIVE',
    quantity: 5,
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01'
  },
  {
    id: '2',
    name: 'Chứng chỉ thành tích xuất sắc',
    description: 'Chứng chỉ thành tích xuất sắc dành cho giảng viên đạt Top 1',
    type: 'EXAM',
    value: 0,
    rankingType: 'INSTRUCTOR',
    rankLevel: 1,
    periodType: 'MONTHLY',
    status: 'ACTIVE',
    quantity: 10,
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01'
  },
  {
    id: '3',
    name: 'Mã giảm giá 50%',
    description: 'Mã giảm giá 50% cho khóa học bất kỳ dành cho học viên đạt Top 6-10',
    type: 'VOUCHER',
    value: 200000,
    rankingType: 'STUDENT',
    rankLevel: 6,
    periodType: 'WEEKLY',
    status: 'ACTIVE',
    quantity: 20,
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01'
  },
  {
    id: '4',
    name: 'Cúp danh dự',
    description: 'Cúp danh dự dành cho giảng viên xuất sắc nhất tháng',
    type: 'COURSE',
    value: 1000000,
    rankingType: 'INSTRUCTOR',
    rankLevel: 1,
    periodType: 'MONTHLY',
    status: 'ACTIVE',
    quantity: 1,
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01'
  },
];

const RewardManagement: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [form] = Form.useForm();
  const [currentTab, setCurrentTab] = useState<string>('student');
  const [activeTab, setActiveTab] = useState<string>('rewards');
  const [currentTimePeriod, setCurrentTimePeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');

  // Filter options
  const rankLevelOptions = [
    { label: 'Top 1', value: 1 },
    { label: 'Top 2-5', value: 2 },
    { label: 'Top 6-10', value: 6 },
    { label: 'Top 11-20', value: 11 },
    { label: 'Top 21-30', value: 21 }
  ];

  const periodTypeOptions = [
    { label: 'Ngày', value: 'DAILY' },
    { label: 'Tuần', value: 'WEEKLY' },
    { label: 'Tháng', value: 'MONTHLY' }
  ];

  const rewardTypeOptions = [
    { label: 'Khóa học', value: 'COURSE' },
    { label: 'Voucher', value: 'VOUCHER' },
    { label: 'Đề thi', value: 'EXAM' }
  ];

  // Load rewards data
  useEffect(() => {
    fetchRewards();
  }, [currentTab, currentTimePeriod]);

  // Fetch rewards data
  const fetchRewards = async () => {
    try {
      setLoading(true);
      let response;
      let url = '';
      
      // Base URL based on student/instructor tab
      if (currentTab === 'student') {
        url = GET_STUDENT_REWARDS;
      } else if (currentTab === 'instructor') {
        url = GET_INSTRUCTOR_REWARDS;
      } else {
        url = GET_REWARDS;
      }
      
      // Add date filter for daily tab if using period type filter
      if (currentTimePeriod === 'DAILY') {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        url += `${url.includes('?') ? '&' : '?'}date=${today}`;
      }
      
      response = await axios.get(url);
      setRewards(response.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      message.error('Không thể tải dữ liệu phần thưởng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Get filtered rewards
  const getFilteredRewards = () => {
    const filtered = rewards.filter(reward => 
      (searchText === '' || 
        reward.name.toLowerCase().includes(searchText.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchText.toLowerCase())) &&
      reward.rankingType === (currentTab === 'student' ? 'STUDENT' : 'INSTRUCTOR')
    );
    
    return filtered;
  };

  // Handle reward creation/edit
  const handleAddOrEdit = () => {
    setCurrentReward(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle reward edit
  const handleEdit = (record: Reward) => {
    setCurrentReward(record);
    form.setFieldsValue({
      ...record,
      createdAt: moment(record.createdAt)
    });
    setIsModalVisible(true);
  };

  // Handle reward deletion
  const handleDelete = (record: Reward) => {
    setRewards(rewards.filter(item => item.id !== record.id));
    message.success('Phần thưởng đã được xóa thành công!');
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      if (currentReward) {
        // Edit existing reward
        await axios.put(`${PUT_REWARD(currentReward.id)}`, {
          ...values,
          rankingType: currentTab === 'student' ? 'STUDENT' : 'INSTRUCTOR',
          updatedAt: new Date().toISOString().split('T')[0]
        });
        
        // Update local state
        const updatedRewards = rewards.map(item => 
          item.id === currentReward.id ? { 
            ...item, 
            ...values,
            rankingType: currentTab === 'student' ? 'STUDENT' : 'INSTRUCTOR',
            updatedAt: new Date().toISOString().split('T')[0]
          } : item
        );
        setRewards(updatedRewards);
        message.success('Phần thưởng đã được cập nhật thành công!');
      } else {
        // Create new reward
        const newRewardData = {
          ...values,
          rankingType: currentTab === 'student' ? 'STUDENT' : 'INSTRUCTOR',
          status: 'ACTIVE',
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        
        const response = await axios.post(POST_REWARD, newRewardData);
        
        // Add new reward to local state
        const newReward = response.data;
        setRewards([...rewards, newReward]);
        message.success('Phần thưởng mới đã được tạo thành công!');
      }
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving reward:', error);
      message.error('Có lỗi xảy ra khi lưu phần thưởng. Vui lòng thử lại sau.');
    }
  };

  // Handle tab change
  const handleTabChange = (key: string) => {
    setCurrentTab(key);
  };

  // Handle time period change
  const handleTimePeriodChange = (period: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
    setCurrentTimePeriod(period);
    fetchRewards();
  };

  // Render reward type tag
  const renderRewardTypeTag = (type: string) => {
    switch (type) {
      case 'COURSE':
        return <Tag color="blue">Khóa học</Tag>;
      case 'VOUCHER':
        return <Tag color="green">Voucher</Tag>;
      case 'EXAM':
        return <Tag color="purple">Đề thi</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  // Render rank level tag
  const renderRankLevelTag = (level: string) => {
    switch (level) {
      case 1:
        return <Tag color="#ff4d4f">Top 1</Tag>;
      case 2:
        return <Tag color="#faad14">Top 2-5</Tag>;
      case 6:
        return <Tag color="#52c41a">Top 6-10</Tag>;
      case 11:
        return <Tag color="#1890ff">Top 11-20</Tag>;
      case 21:
        return <Tag color="#722ed1">Top 21-30</Tag>;
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

  // Student rewards columns
  const studentColumns: ColumnsType<Reward> = [
    {
      title: 'Tên phần thưởng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <GiftOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: type => renderRewardTypeTag(type),
    },
    {
      title: 'Cấp độ xếp hạng',
      dataIndex: 'rankLevel',
      key: 'rankLevel',
      width: 150,
      render: level => renderRankLevelTag(level),
    },
    {
      title: 'Thời gian',
      dataIndex: 'periodType',
      key: 'periodType',
      width: 120,
      render: period => renderPeriodType(period),
    },
    {
      title: 'Giá trị (VNĐ)',
      dataIndex: 'value',
      key: 'value',
      width: 150,
      render: value => new Intl.NumberFormat('vi-VN').format(value),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngưng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => handleEdit(record)} 
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa phần thưởng này?"
            onConfirm={() => handleDelete(record)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Instructor rewards columns (same as student columns)
  const instructorColumns = studentColumns;

  return (
    <div className="reward-management">
      <div className="reward-description">
        <Paragraph>
          Quản lý phần thưởng cho các học viên và giảng viên dựa trên xếp hạng của họ.
        </Paragraph>
        <div className="reward-criteria">
          Phần thưởng được phân loại theo cấp độ xếp hạng và thời gian xếp hạng (ngày, tuần, tháng).
        </div>
      </div>
      
      <Tabs defaultActiveKey="rewards" onChange={setActiveTab}>
        <TabPane 
          tab={<span><GiftOutlined /> Danh sách phần thưởng</span>} 
          key="rewards"
        >
          <Tabs defaultActiveKey="student" onChange={handleTabChange}>
            <TabPane 
              tab={<span><TrophyOutlined /> Phần thưởng cho học viên</span>} 
              key="student"
            >
              <div className="reward-header">
                <Space style={{ marginBottom: 16 }}>
                  <Input.Search
                    placeholder="Tìm kiếm phần thưởng"
                    onSearch={handleSearch}
                    style={{ width: 300 }}
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
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddOrEdit}
                  >
                    Thêm phần thưởng mới
                  </Button>
                </Space>
              </div>
              
              <Table
                columns={studentColumns}
                dataSource={getFilteredRewards()}
                loading={loading}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng cộng ${total} phần thưởng`,
                }}
              />
            </TabPane>
            
            <TabPane 
              tab={<span><TrophyOutlined /> Phần thưởng cho giảng viên</span>} 
              key="instructor"
            >
              <div className="reward-header">
                <Space style={{ marginBottom: 16 }}>
                  <Input.Search
                    placeholder="Tìm kiếm phần thưởng"
                    onSearch={handleSearch}
                    style={{ width: 300 }}
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
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddOrEdit}
                  >
                    Thêm phần thưởng mới
                  </Button>
                </Space>
              </div>
              
              <Table
                columns={instructorColumns}
                dataSource={getFilteredRewards()}
                loading={loading}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng cộng ${total} phần thưởng`,
                }}
              />
            </TabPane>
          </Tabs>
        </TabPane>
        
        <TabPane 
          tab={<span><AuditOutlined /> Phần thưởng đã gán</span>} 
          key="assignments"
        >
          <RewardAssignments />
        </TabPane>
      </Tabs>
      
      {/* Add/Edit Form Modal */}
      <Modal
        title={currentReward ? "Chỉnh sửa phần thưởng" : "Thêm phần thưởng mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'COURSE',
            rankLevel: 1,
            periodType: 'MONTHLY',
            status: 'ACTIVE',
            quantity: 1,
            value: 0
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Tên phần thưởng"
                rules={[{ required: true, message: 'Vui lòng nhập tên phần thưởng' }]}
              >
                <Input placeholder="Nhập tên phần thưởng" />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả phần thưởng' }]}
              >
                <TextArea rows={4} placeholder="Nhập mô tả phần thưởng" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại phần thưởng"
                rules={[{ required: true, message: 'Vui lòng chọn loại phần thưởng' }]}
              >
                <Select>
                  {rewardTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="value"
                label="Giá trị (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị phần thưởng' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Nhập giá trị phần thưởng"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="rankLevel"
                label="Cấp độ xếp hạng"
                rules={[{ required: true, message: 'Vui lòng chọn cấp độ xếp hạng' }]}
              >
                <Select>
                  {rankLevelOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="periodType"
                label="Thời gian xếp hạng"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian xếp hạng' }]}
              >
                <Select>
                  {periodTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: 'Vui lòng nhập số lượng phần thưởng' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="ACTIVE">Hoạt động</Option>
                  <Option value="INACTIVE">Tạm ngưng</Option>
                </Select>
              </Form.Item>
            </Col>
           
          </Row>
          
          <Form.Item style={{ marginTop: 16, textAlign: 'right' }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {currentReward ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RewardManagement; 