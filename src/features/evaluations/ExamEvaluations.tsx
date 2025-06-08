import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Rate,
  Select,
  DatePicker,
  Tooltip,
  Typography,
  message,
  Popconfirm,
  Row,
  Col,
  Card
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface Evaluation {
  id: string;
  courseId: string;
  courseName: string;
  testId: string;
  testName: string;
  accountId: string;
  accountName: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
  deletedDate: string;
  isDeleted: boolean;
  reviewType: 'COURSE' | 'TEST';
  status: 'approved' | 'pending' | 'rejected';
}
interface Course {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  courseOutput: string;
  language: string;
  author: string;
  duration: number;
  cost: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  type: string;
  deletedDate: string;
  accountId: number;
  categoryNameLevel3: string;
  categoryIdLevel3: number;
  categoryNameLevel2: string;
  categoryIdLevel2: number;
  categoryNameLevel1: string;
  categoryIdLevel1: number;
  deleted: boolean;
}
interface Exam {
  testId: string;
  title: string;
  type: string[];
  lessonId: number | null;
  chapterId: number;
  courseId: number;
  description: string;
  summary: boolean;
  totalQuestion: number;
  easyQuestion: number;
  mediumQuestion: number;
  hardQuestion: number;
  createdAt: string;
  updatedAt?: string;
  deletedDate?: string;
  deleted: boolean;
  duration: number;
  format: string;
  assigned: boolean;
  point?: number;
}


interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}


const ExamEvaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<Evaluation | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState<boolean>(false);
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [reviewType, setReviewType] = useState<'COURSE' | 'TEST'>('TEST');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchCourseList = async () => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {
      // Update the URL to point to your actual API
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST || 'http://localhost:8080'}/api/courses/get-all-result-list`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch course data");
      }

      const data: Course[] = await response.json();
      setCourses(data);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      message.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };
  const fetchExamList = async (courseId: number) => {
    if (!courseId) return;

    setLoadingExams(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {
      console.log('Fetching exams for course ID:', courseId);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/filter-all-exam-list?courseId=${courseId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam data");
      }

      const rawData = await response.json();
      console.log('Received exam data:', rawData);
      const examData = rawData.data || [];
      setExams(examData);
    } catch (error: any) {
      console.error("Failed to fetch exams:", error);
      message.error("Không thể tải danh sách đề thi");
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };
  const fetchEvaluations = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('reviewType', reviewType);
      params.append('page', page.toString());
      params.append('size', size.toString());

      // Add optional parameters if they exist
      if (searchText) params.append('keyword', searchText);
      if (selectedExamId !== null) {
        params.append('testId', selectedExamId.toString());
        console.log('Filtering by exam ID:', selectedExamId);
      }
      if (selectedCourseId !== null) {
        params.append('courseId', selectedCourseId.toString());
        console.log('Filtering by course ID:', selectedCourseId);
      }
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterRating !== null) params.append('rating', filterRating.toString());

      console.log('Final API params:', params.toString());

      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/reviews/admin?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result: ApiResponse<PageResponse<Evaluation>> = await response.json();

      if (result.data) {
        setEvaluations(result.data.content);
        setPagination({
          current: result.data.number + 1, // API returns 0-based index
          pageSize: result.data.size,
          total: result.data.totalElements
        });
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      message.error("Không thể tải đánh giá. Vui lòng thử lại sau.");
      // Fallback to mock data for demo
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseList();
  }, []); // Only run once on component mount

  useEffect(() => {
    // Fetch evaluations whenever any filter changes
    fetchEvaluations(0, pagination.pageSize);
  }, [reviewType, selectedCourseId, selectedExamId, filterStatus, filterRating, searchText]);

  // Handle pagination changes separately
  useEffect(() => {
    if (pagination.current > 0) { // Skip initial render
      fetchEvaluations(pagination.current - 1, pagination.pageSize);
    }
  }, [pagination.current, pagination.pageSize]);

  // When course is changed, clear the selected exam
  const handleCourseChange = (value: number | null) => {
    console.log('Selected course ID:', value);
    setSelectedCourseId(value);
    setSelectedExamId(null);
    // Will trigger the useEffect that fetches exams if value is not null
    if (value !== null) {
      fetchExamList(value);
    } else {
      // Clear exams list when "All courses" is selected
      setExams([]);
    }
  };

  // Debug exam selection
  const handleExamChange = (value: string | null) => {
    console.log('Selected exam ID:', value);
    setSelectedExamId(value);
    // Will trigger the useEffect that fetches evaluations
  };

  // Reset all filters
  const resetFilters = () => {
    console.log('Resetting all filters');
    setSearchText('');
    setFilterStatus('all');
    setFilterRating(null);
    setSelectedExamId(null);
    setSelectedCourseId(null);
    setExams([]); // Clear exams when resetting
    // Will trigger fetchEvaluations through the useEffect
  };

  // Filter function
  const getFilteredEvaluations = () => {
    return evaluations.filter(evaluation => {
      const matchesSearch =
        evaluation.testName.toLowerCase().includes(searchText.toLowerCase()) ||
        evaluation.accountName.toLowerCase().includes(searchText.toLowerCase()) ||
        evaluation.review.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = filterStatus === 'all' || evaluation.status === filterStatus;
      const matchesRating = filterRating === null || evaluation.rating === filterRating;

      return matchesSearch && matchesStatus && matchesRating;
    });
  };

  // View details
  const showDetailModal = (record: Evaluation) => {
    setCurrentEvaluation(record);
    setIsDetailModalVisible(true);
  };

  // Edit function
  const showEditModal = (record: Evaluation) => {
    setCurrentEvaluation(record);
    form.setFieldsValue({
      testId: record.testId,
      testName: record.testName,
      status: record.status,
      review: record.review,
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      // Call API to delete evaluation
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/reviews/admin/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      message.success('Đã xóa đánh giá thành công');
      fetchEvaluations(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error("Error deleting review:", error);
      message.error("Không thể xóa đánh giá. Vui lòng thử lại sau.");
    }
  };

  // Submit edit
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (currentEvaluation) {
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        // Call API to update evaluation
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/reviews/admin/${currentEvaluation.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: values.status,
            review: values.review,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        setIsEditModalVisible(false);
        message.success('Cập nhật đánh giá thành công');
        fetchEvaluations(pagination.current - 1, pagination.pageSize);
      }
    } catch (error) {
      console.error("Error updating review:", error);
      message.error("Không thể cập nhật đánh giá. Vui lòng thử lại sau.");
    }
  };

  // Table columns
  const columns: ColumnsType<Evaluation> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Tên đề thi',
      dataIndex: 'testName',
      key: 'testName',
      ellipsis: true,
    },
    {
      title: 'Học viên',
      dataIndex: 'accountName',
      key: 'accountName',
      ellipsis: true,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        let color = '';
        let text = '';

        switch (status) {
          case 'approved':
            color = 'green';
            text = 'Đã duyệt';
            break;
          case 'pending':
            color = 'gold';
            text = 'Chờ duyệt';
            break;
          case 'rejected':
            color = 'red';
            text = 'Từ chối';
            break;
        }

        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Ngày đánh giá',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa đánh giá này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];


  return (
    <div>
      <div className="evaluation-filters">
        <Input
          placeholder="Tìm kiếm theo tên đề thi, học viên, nội dung"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          placeholder="Chọn khóa học"
          style={{ width: 220 }}
          value={selectedCourseId}
          onChange={handleCourseChange}
        >
          <Option key="course-all" value={null}>Tất cả</Option>
          {courses.map(course => (
            <Option key={`course-${course.id}`} value={course.id}>{course.title}</Option>
          ))}
        </Select>

        <Select
          placeholder="Chọn đề thi"
          style={{ width: 220 }}
          value={selectedExamId}
          onChange={handleExamChange}
          disabled={!selectedCourseId}
          loading={loadingExams}
        >
          <Option key="exam-all" value={null}>Tất cả</Option>
          {Array.isArray(exams) && exams.length > 0 ? (
            exams.map(exam => (
              <Option key={`exam-${exam.testId}`} value={exam.testId}>{exam.title}</Option>
            ))
          ) : (
            <Option key="no-exam" value="" disabled>{!selectedCourseId ? 'Vui lòng chọn khóa học trước' : 'Không có đề thi'}</Option>
          )}
        </Select>


        <Select
          placeholder="Trạng thái"
          style={{ width: 150 }}
          value={filterStatus}
          onChange={value => setFilterStatus(value)}
        >
          <Option key="status-all" value="all">Tất cả</Option>
          <Option key="status-approved" value="approved">Đã duyệt</Option>
          <Option key="status-pending" value="pending">Chờ duyệt</Option>
          <Option key="status-rejected" value="rejected">Từ chối</Option>
        </Select>

        <Select
          placeholder="Đánh giá"
          style={{ width: 150 }}
          value={filterRating}
          onChange={value => setFilterRating(value)}
        >
          <Option key="rating-all" value={null}>Tất cả</Option>
          <Option key="rating-1" value={1}>1 sao</Option>
          <Option key="rating-2" value={2}>2 sao</Option>
          <Option key="rating-3" value={3}>3 sao</Option>
          <Option key="rating-4" value={4}>4 sao</Option>
          <Option key="rating-5" value={5}>5 sao</Option>
        </Select>

        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={() => fetchEvaluations(0, pagination.pageSize)}
          style={{ marginLeft: 10 }}
        >
          Tìm kiếm
        </Button>

        <Button
          icon={<ReloadOutlined />}
          onClick={resetFilters}
          style={{ marginLeft: 10 }}
        >
          Đặt lại
        </Button>

        <Button
          type="primary"
          icon={<ExportOutlined />}
          style={{ marginLeft: 10 }}
        >
          Xuất báo cáo
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={getFilteredEvaluations()}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng cộng ${total} đánh giá`,
        }}
      />

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đánh giá đề thi"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setIsDetailModalVisible(false);
              if (currentEvaluation) {
                showEditModal(currentEvaluation);
              }
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        className="evaluation-detail-modal"
        width={700}
      >
        {currentEvaluation && (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Thông tin đánh giá" bordered={false}>
                <p><strong>Tên đề thi:</strong> {currentEvaluation.testName}</p>
                <p><strong>Học viên:</strong> {currentEvaluation.accountName}</p>
                <p><strong>Ngày đánh giá:</strong> {new Date(currentEvaluation.createdAt).toLocaleString('vi-VN')}</p>
                <p><strong>Nội dung đánh giá:</strong> {currentEvaluation.review}</p>

                <p><strong>Trạng thái:</strong> {
                  currentEvaluation.status === 'approved' ? 'Đã duyệt' :
                    currentEvaluation.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'
                }</p>
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Nội dung đánh giá" bordered={false}>
                <div className="evaluation-rating">
                  <strong>Đánh giá: </strong>
                  <Rate disabled defaultValue={currentEvaluation.rating} />
                  <p><strong>Nội dung đánh giá:</strong> {currentEvaluation.review}</p>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa đánh giá đề thi"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleEditSubmit}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option key="modal-status-approved" value="approved">Đã duyệt</Option>
              <Option key="modal-status-pending" value="pending">Chờ duyệt</Option>
              <Option key="modal-status-rejected" value="rejected">Từ chối</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="review"
            label="Nhận xét"
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExamEvaluations; 