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

import {
  POST_REWARD,
  PUT_REWARD,
  GET_REWARDS,
  GET_STUDENT_REWARDS,
  GET_INSTRUCTOR_REWARDS
} from '../../api/api';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Reward {
  id: number;
  rewardName: string;
  rewardValue: number;
  rewardType: 'WEEKLY' | 'MONTHLY';
  discountId?: number;
  rankPosition: number;
  createdAt: string;
  updatedAt: string;
}

interface Discount {
  id: string;
  code: string;
  title: string;
  discountType: string;
  description: string;
  value: string;
  status: string;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  maxUsed: number;
  usedCount: number;
}

const RewardManagement: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [form] = Form.useForm();
  const [currentTab, setCurrentTab] = useState<string>('student');
  const [activeTab, setActiveTab] = useState<string>('rewards');
  const [currentTimePeriod, setCurrentTimePeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRewards, setTotalRewards] = useState<number>(0);
  const [filterType, setFilterType] = useState<'WEEKLY' | 'MONTHLY' | 'all' | undefined>(undefined);

  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");



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
    { label: 'Tuần', value: 'WEEKLY' },
    { label: 'Tháng', value: 'MONTHLY' }
  ];

  // Load rewards data
  useEffect(() => {
    fetchRewards();
  }, [currentPage, pageSize, filterType]);

  // Fetch rewards data
  const fetchRewards = async () => {
    try {
      setLoading(true);
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Build query params
      const params = new URLSearchParams();
      params.append('page', String(currentPage - 1)); // Backend uses 0-based page index
      params.append('size', String(pageSize));

      if (filterType && filterType !== 'all') {
        params.append('rewardType', filterType);
      }

      const url = `${process.env.REACT_APP_SERVER_HOST}/api/rewards/type?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseData = await response.json();
      console.log('API Response:', responseData); // Debug log

      if (responseData.status === 200 && responseData.data) {
        setRewards(responseData.data.content || []);
        setTotalRewards(responseData.data.totalElements || 0);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      message.error('Không thể tải dữ liệu phần thưởng. Vui lòng thử lại sau.');
      setRewards([]);
      setTotalRewards(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch discounts data
  const fetchDiscounts = async () => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/discounts/voucher-rewards`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include token in headers
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDiscounts(data.data);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      message.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Get filtered rewards
  const getFilteredRewards = () => {
    if (!Array.isArray(rewards)) return [];

    return rewards.filter(reward =>
      !searchText ||
      (reward?.rewardName?.toLowerCase()?.includes(searchText.toLowerCase()) ?? false)
    );
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
  const handleDelete = async (record: Reward) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/rewards/${record.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      if (responseData.status === 200) {
        message.success('Phần thưởng đã được xóa thành công!');
        fetchRewards(); // Refresh the list after successful deletion
      } else {
        throw new Error(responseData.message || 'Failed to delete reward');
      }
    } catch (error) {
      console.error('Error deleting reward:', error);
      message.error('Có lỗi xảy ra khi xóa phần thưởng. Vui lòng thử lại sau.');
    }
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      if (currentReward) {
        // Edit existing reward
        const formData = {
          id: currentReward.id,
          rewardName: values.rewardName,
          rewardValue: values.rewardValue,
          rewardType: values.rewardType,
          discountId: values.discountId || null,
          rankPosition: values.rankPosition
        };

        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/rewards/${currentReward.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        if (responseData.status === 200) {
          message.success('Phần thưởng đã được cập nhật thành công!');
          fetchRewards(); // Refresh the list
        } else {
          throw new Error(responseData.message || 'Failed to update reward');
        }
      } else {
        // Create new reward
        const formData = {
          rewardName: values.rewardName,
          rewardValue: values.rewardValue,
          rewardType: values.rewardType,
          discountId: values.discountId || null,
          rankPosition: values.rankPosition
        };

        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/rewards`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        if (responseData.status === 200) {
          message.success('Phần thưởng mới đã được tạo thành công!');
          fetchRewards(); // Refresh the list
        } else {
          throw new Error(responseData.message || 'Failed to create reward');
        }
      }

      setIsModalVisible(false);
      form.resetFields();
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

  // Handle page change
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  // Handle filter type change
  const handleFilterTypeChange = (value: 'WEEKLY' | 'MONTHLY' | 'all' | undefined) => {
    setFilterType(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Render reward type tag
  const renderRewardTypeTag = (type: string) => {
    switch (type) {
      case 'WEEKLY':
        return <Tag color="blue">Tuần</Tag>;
      case 'MONTHLY':
        return <Tag color="green">Tháng</Tag>;
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
      title: 'Loại',
      dataIndex: 'rewardType',
      key: 'rewardType',
      width: 120,
      render: type => renderRewardTypeTag(type),
    },
    {
      title: 'Vị trí xếp hạng',
      dataIndex: 'rankPosition',
      key: 'rankPosition',
      width: 150,
      render: position => <Tag color="blue">Top {position}</Tag>,
    },
    {
      title: 'Giá trị (VNĐ)',
      dataIndex: 'rewardValue',
      key: 'rewardValue',
      width: 150,
      render: value => new Intl.NumberFormat('vi-VN').format(value),
    },
    {
      title: 'Mã giảm giá',
      dataIndex: 'discountId',
      key: 'discountId',
      width: 150,
      // render: (discountId) => {
      //   const discount = discounts.find(d => d.id === discountId?.toString());
      //   return discount ? (
      //     <Tooltip title={`${discount.value}% - ${discount.description}`}>
      //       <Tag color="purple">{discount.code} - {discount.title}</Tag>
      //     </Tooltip>
      //   ) : '-';
      // },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: date => moment(date).format('DD/MM/YYYY'),
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
                    value={filterType}
                    style={{ width: 120 }}
                    onChange={setFilterType}
                    allowClear
                    placeholder="Loại thời gian"
                  >
                    <Option value="all">Tất cả</Option>
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
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalRewards,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng cộng ${total} phần thưởng`,
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  }
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
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalRewards,
                  onChange: handlePageChange,
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
            rewardType: 'WEEKLY',
            rankPosition: 1,
            rewardValue: 0
          }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="rewardName"
                label="Tên phần thưởng"
                rules={[{ required: true, message: 'Vui lòng nhập tên phần thưởng' }]}
              >
                <Input placeholder="Ví dụ: Top 1 tuần" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="rewardType"
                label="Loại thời gian xếp hạng"
                rules={[{ required: true, message: 'Vui lòng chọn loại thời gian' }]}
              >
                <Select>
                  <Option value="WEEKLY">Tuần</Option>
                  <Option value="MONTHLY">Tháng</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="discountId"
                label="Mã giảm giá"
              >
                <Select allowClear placeholder="Chọn mã giảm giá (không bắt buộc)">
                  {discounts.map(discount => (
                    <Option key={discount.id} value={discount.id}>
                      {discount.code} - {discount.title} - Giảm {discount.value}%
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="rewardValue"
                label="Giá trị phần thưởng (VNĐ)"
                rules={[{ required: true, message: 'Vui lòng nhập giá trị phần thưởng' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Ví dụ: 500000"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="rankPosition"
                label="Vị trí xếp hạng"
                rules={[{ required: true, message: 'Vui lòng nhập vị trí xếp hạng' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  placeholder="Nhập số thứ tự (vd: 1 cho Top 1)"
                />
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