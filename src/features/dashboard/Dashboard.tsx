import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Progress, List, Avatar } from 'antd';

const { Title } = Typography;

interface DataPoint {
  month: string;
  value: number;
  category: string;
}

interface UserActivity {
  user: string;
  avatar: string;
  action: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const [revenueData, setRevenueData] = useState<DataPoint[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Giả lập việc lấy dữ liệu từ API
    setTimeout(() => {
      const mockRevenueData: DataPoint[] = [
        { month: 'Tháng 1', value: 3500, category: 'Doanh thu' },
        { month: 'Tháng 2', value: 4200, category: 'Doanh thu' },
        { month: 'Tháng 3', value: 3800, category: 'Doanh thu' },
        { month: 'Tháng 4', value: 5000, category: 'Doanh thu' },
        { month: 'Tháng 5', value: 4800, category: 'Doanh thu' },
        { month: 'Tháng 6', value: 6000, category: 'Doanh thu' },
        { month: 'Tháng 1', value: 2500, category: 'Chi phí' },
        { month: 'Tháng 2', value: 2800, category: 'Chi phí' },
        { month: 'Tháng 3', value: 2600, category: 'Chi phí' },
        { month: 'Tháng 4', value: 3000, category: 'Chi phí' },
        { month: 'Tháng 5', value: 2900, category: 'Chi phí' },
        { month: 'Tháng 6', value: 3200, category: 'Chi phí' },
      ];

      const mockUserActivity = [
        {
          user: 'Nguyễn Văn A',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          action: 'đã đăng ký khóa học "Luyện thi THPT Quốc gia môn Toán"',
          time: '5 phút trước',
        },
        {
          user: 'Trần Thị B',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          action: 'đã hoàn thành bài kiểm tra "Hình học không gian"',
          time: '15 phút trước',
        },
        {
          user: 'Lê Văn C',
          avatar: 'https://randomuser.me/api/portraits/men/46.jpg',
          action: 'đã đánh giá 5 sao cho khóa học "Tiếng Anh giao tiếp"',
          time: '30 phút trước',
        },
        {
          user: 'Phạm Thị D',
          avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
          action: 'đã thanh toán khóa học "Luyện thi IELTS"',
          time: '1 giờ trước',
        },
        {
          user: 'Hoàng Văn E',
          avatar: 'https://randomuser.me/api/portraits/men/81.jpg',
          action: 'đã đăng bình luận trong khóa học "Lập trình Python cơ bản"',
          time: '2 giờ trước',
        },
      ];

      setRevenueData(mockRevenueData);
      setUserActivity(mockUserActivity);
      setLoading(false);
    }, 1000);
  }, []);

  const courseData = [
    {
      key: '1',
      name: 'Luyện thi THPT Quốc gia môn Toán',
      students: 1254,
      rating: 4.8,
      revenue: '125,400,000 đ',
    },
    {
      key: '2',
      name: 'Tiếng Anh giao tiếp cơ bản',
      students: 876,
      rating: 4.5,
      revenue: '87,600,000 đ',
    },
    {
      key: '3',
      name: 'Lập trình web với React',
      students: 732,
      rating: 4.7,
      revenue: '73,200,000 đ',
    },
    {
      key: '4',
      name: 'Luyện thi IELTS 6.5+',
      students: 695,
      rating: 4.9,
      revenue: '104,250,000 đ',
    },
    {
      key: '5',
      name: 'Hóa học lớp 12',
      students: 518,
      rating: 4.6,
      revenue: '51,800,000 đ',
    },
  ];

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
          {rating} <span style={{ color: '#fadb14' }}>★</span>
        </span>
      ),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng học viên"
              value={4075}
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
              value={442.38}
              precision={2}
              suffix="tr đ"
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
              <div>Hiển thị biểu đồ doanh thu (cần cài đặt thư viện biểu đồ)</div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Mục tiêu tháng" style={{ height: '100%' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Học viên mới</span>
                <span>450/500</span>
              </div>
              <Progress percent={90} status="active" />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Doanh thu</span>
                <span>442/500 triệu</span>
              </div>
              <Progress percent={88} status="active" strokeColor="#1890ff" />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Khóa học mới</span>
                <span>6/10</span>
              </div>
              <Progress percent={60} status="active" strokeColor="#13c2c2" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Đánh giá tích cực</span>
                <span>95%</span>
              </div>
              <Progress percent={95} status="active" strokeColor="#52c41a" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Khóa học nổi bật">
            <Table 
              dataSource={courseData} 
              columns={columns} 
              pagination={false} 
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Hoạt động gần đây">
            <List
              itemLayout="horizontal"
              dataSource={userActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={item.user}
                    description={item.action}
                  />
                  <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{item.time}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 