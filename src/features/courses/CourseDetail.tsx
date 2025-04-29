import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Tabs, Card, Button, Typography, Breadcrumb, Spin, 
  message, Row, Col, Statistic
} from 'antd';
import { 
  BookOutlined, TeamOutlined, FilePdfOutlined, 
  RollbackOutlined, HomeOutlined
} from '@ant-design/icons';
import { Course } from './Courses';
import CourseContent from './CourseContent';
import CourseStudents from './CourseStudents';
import CourseHUITStudents from './CourseHUITStudents';
import CourseMaterials from './CourseMaterials';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils';

const { Title } = Typography;
const { TabPane } = Tabs;

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('content');
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    // Fetch course details from API
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        const url = `${process.env.REACT_APP_SERVER_HOST}/api/courses/${id}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }

        const data = await response.json();

        if (data.status === 200) {
          // Map API response to Course interface
          const courseData = data.data;
          setCourse(courseData);
        } else {
          message.error('Không thể tải thông tin khóa học');
        }
      } catch (err) {
        console.error('Error occurred while fetching the course:', err);
        message.error('Đã xảy ra lỗi khi tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div>
        <Title level={4}>Không tìm thấy khóa học</Title>
        <Button type="primary" onClick={() => navigate('/courses')}>Quay lại danh sách khóa học</Button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/">
          <HomeOutlined />
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/courses">Khóa học</Breadcrumb.Item>
        <Breadcrumb.Item>{course.title}</Breadcrumb.Item>
      </Breadcrumb>

      <Card>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={18}>
            <Title level={2}>{course.title}</Title>
            {/* <p dangerouslySetInnerHTML={{ __html: course.description }}></p> */}
          </Col>
          <Col span={6}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="Giá" 
                  value={course.type === 'FREE' ? 'Miễn phí' : course.price} 
                  formatter={value => typeof value === 'string' ? value : `${value?.toLocaleString()} VNĐ`} 
                />
              </Col>
              <Col span={12}>
                <Button 
                  type="primary" 
                  icon={<RollbackOutlined />}
                  onClick={() => navigate('/courses')}
                >
                  Quay lại
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
        >
          <TabPane 
            tab={<span><BookOutlined />Nội dung khóa học</span>} 
            key="content"
          >
            <CourseContent courseId={course.id} />
          </TabPane>
          <TabPane 
            tab={<span><TeamOutlined />Học viên</span>} 
            key="students"
          >
            <CourseStudents courseId={course.id} />
          </TabPane>
          <TabPane 
            tab={<span><TeamOutlined />Học viên HUIT</span>} 
            key="huit-students"
          >
            <CourseHUITStudents courseId={course.id} />
          </TabPane>
          <TabPane 
            tab={<span><FilePdfOutlined />Tài liệu khóa học</span>} 
            key="materials"
          >
            <CourseMaterials courseId={course.id} />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CourseDetail; 