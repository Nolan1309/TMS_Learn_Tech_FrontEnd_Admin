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

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface ExamEvaluation {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  rating: number;
  difficulty: 'easy' | 'medium' | 'hard';
  comment: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'rejected';
}

// Mock data for demonstration
const mockExamEvaluations: ExamEvaluation[] = [
  {
    id: '1',
    examId: 'E001',
    examName: 'Bài kiểm tra JavaScript cơ bản',
    studentId: 'ST001',
    studentName: 'Nguyễn Văn A',
    rating: 5,
    difficulty: 'easy',
    comment: 'Đề thi dễ hiểu, đúng theo nội dung đã học.',
    createdAt: '2023-09-14T09:40:00',
    status: 'approved',
  },
  {
    id: '2',
    examId: 'E002',
    examName: 'Bài thi cuối kỳ React',
    studentId: 'ST002',
    studentName: 'Trần Thị B',
    rating: 3,
    difficulty: 'hard',
    comment: 'Đề thi khá khó, có một số câu hỏi nằm ngoài phạm vi bài giảng.',
    createdAt: '2023-09-15T14:30:00',
    status: 'approved',
  },
  {
    id: '3',
    examId: 'E003',
    examName: 'Đề thi giữa kỳ Node.js',
    studentId: 'ST003',
    studentName: 'Lê Văn C',
    rating: 4,
    difficulty: 'medium',
    comment: 'Đề thi có độ khó vừa phải, phù hợp với trình độ học viên.',
    createdAt: '2023-09-16T11:20:00',
    status: 'pending',
  },
  {
    id: '4',
    examId: 'E004',
    examName: 'Đề thi thử Frontend Developer',
    studentId: 'ST004',
    studentName: 'Phạm Thị D',
    rating: 2,
    difficulty: 'hard',
    comment: 'Đề thi quá khó, thời gian làm bài không đủ.',
    createdAt: '2023-09-17T10:00:00',
    status: 'rejected',
  },
];

// API URL
const API_URL = 'http://localhost:8080/api';

const ExamEvaluations: React.FC = () => {
  const [evaluations, setEvaluations] = useState<ExamEvaluation[]>(mockExamEvaluations);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<ExamEvaluation | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  
  // Fetch reviews by exam ID from API
  const fetchReviewsByExamId = async (examId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/exam/${examId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      // Transform API data to match our ExamEvaluation interface if needed
      const apiEvaluations = data.map((review: any) => ({
        id: review.id.toString(),
        examId: review.examId.toString(),
        examName: review.examName || 'Unknown Exam', // Add default if not available in API
        studentId: review.studentId.toString(),
        studentName: review.studentName || 'Unknown Student', // Add default if not available in API
        rating: review.rating,
        difficulty: review.difficulty || 'medium',
        comment: review.comment,
        createdAt: review.createdAt,
        status: review.status || 'pending', // Add default if not available in API
      }));
      setEvaluations(apiEvaluations);
    } catch (error) {
      console.error("Error fetching exam reviews:", error);
      message.error("Không thể tải đánh giá đề thi. Vui lòng thử lại sau.");
      // Fallback to mock data for demo
      setEvaluations(mockExamEvaluations);
    } finally {
      setLoading(false);
    }
  };
  
  // Load data function
  const fetchEvaluations = () => {
    setLoading(true);
    // If no exam selected, load all evaluations or mock data
    if (!selectedExamId) {
      // Here you would typically call an API to get all evaluations
      // For demo, we'll use mock data
      setTimeout(() => {
        setEvaluations(mockExamEvaluations);
        setLoading(false);
      }, 500);
    } else {
      // Fetch evaluations for the selected exam
      fetchReviewsByExamId(selectedExamId);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [selectedExamId]);

  // Filter function
  const getFilteredEvaluations = () => {
    return evaluations.filter(evaluation => {
      const matchesSearch = 
        evaluation.examName.toLowerCase().includes(searchText.toLowerCase()) ||
        evaluation.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
        evaluation.comment.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || evaluation.status === filterStatus;
      const matchesRating = filterRating === null || evaluation.rating === filterRating;
      const matchesDifficulty = filterDifficulty === null || evaluation.difficulty === filterDifficulty;
      
      return matchesSearch && matchesStatus && matchesRating && matchesDifficulty;
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setFilterStatus('all');
    setFilterRating(null);
    setFilterDifficulty(null);
    setSelectedExamId(null);
  };

  // View details
  const showDetailModal = (record: ExamEvaluation) => {
    setCurrentEvaluation(record);
    setIsDetailModalVisible(true);
  };

  // Edit function
  const showEditModal = (record: ExamEvaluation) => {
    setCurrentEvaluation(record);
    form.setFieldsValue({
      status: record.status,
      difficulty: record.difficulty,
      comment: record.comment,
    });
    setIsEditModalVisible(true);
  };

  // Delete function
  const handleDelete = (id: string) => {
    setEvaluations(prev => prev.filter(item => item.id !== id));
    message.success('Đã xóa đánh giá thành công');
  };

  // Submit edit
  const handleEditSubmit = () => {
    form.validateFields().then(values => {
      if (currentEvaluation) {
        const updatedEvaluations = evaluations.map(evaluation => 
          evaluation.id === currentEvaluation.id 
            ? { ...evaluation, status: values.status, difficulty: values.difficulty, comment: values.comment }
            : evaluation
        );
        setEvaluations(updatedEvaluations);
        setIsEditModalVisible(false);
        message.success('Cập nhật đánh giá thành công');
      }
    });
  };

  // Table columns
  const columns: ColumnsType<ExamEvaluation> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Tên đề thi',
      dataIndex: 'examName',
      key: 'examName',
      ellipsis: true,
    },
    {
      title: 'Học viên',
      dataIndex: 'studentName',
      key: 'studentName',
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
      title: 'Độ khó',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (difficulty: string) => {
        let color = '';
        let text = '';
        
        switch (difficulty) {
          case 'easy':
            color = 'green';
            text = 'Dễ';
            break;
          case 'medium':
            color = 'blue';
            text = 'Trung bình';
            break;
          case 'hard':
            color = 'red';
            text = 'Khó';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
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

  // Mock exams for the exam selector
  const exams = [
    { id: 'E001', name: 'Bài kiểm tra JavaScript cơ bản' },
    { id: 'E002', name: 'Bài thi cuối kỳ React' },
    { id: 'E003', name: 'Đề thi giữa kỳ Node.js' },
    { id: 'E004', name: 'Đề thi thử Frontend Developer' },
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
          placeholder="Chọn đề thi"
          style={{ width: 220 }}
          value={selectedExamId}
          onChange={value => setSelectedExamId(value)}
          allowClear
        >
          {exams.map(exam => (
            <Option key={exam.id} value={exam.id}>{exam.name}</Option>
          ))}
        </Select>
        
        <Select
          placeholder="Trạng thái"
          style={{ width: 150 }}
          value={filterStatus}
          onChange={value => setFilterStatus(value)}
        >
          <Option value="all">Tất cả</Option>
          <Option value="approved">Đã duyệt</Option>
          <Option value="pending">Chờ duyệt</Option>
          <Option value="rejected">Từ chối</Option>
        </Select>
        
        <Select
          placeholder="Đánh giá"
          style={{ width: 150 }}
          value={filterRating}
          onChange={value => setFilterRating(value)}
          allowClear
        >
          <Option value={1}>1 sao</Option>
          <Option value={2}>2 sao</Option>
          <Option value={3}>3 sao</Option>
          <Option value={4}>4 sao</Option>
          <Option value={5}>5 sao</Option>
        </Select>
        
        <Select
          placeholder="Độ khó"
          style={{ width: 150 }}
          value={filterDifficulty}
          onChange={value => setFilterDifficulty(value)}
          allowClear
        >
          <Option value="easy">Dễ</Option>
          <Option value="medium">Trung bình</Option>
          <Option value="hard">Khó</Option>
        </Select>
        
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
                <p><strong>Tên đề thi:</strong> {currentEvaluation.examName}</p>
                <p><strong>Học viên:</strong> {currentEvaluation.studentName}</p>
                <p><strong>Ngày đánh giá:</strong> {new Date(currentEvaluation.createdAt).toLocaleString('vi-VN')}</p>
                <p>
                  <strong>Độ khó:</strong>{' '}
                  {currentEvaluation.difficulty === 'easy' ? 'Dễ' : 
                   currentEvaluation.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                </p>
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
                </div>
                <div className="evaluation-comment">
                  <strong>Nhận xét:</strong>
                  <Paragraph>{currentEvaluation.comment}</Paragraph>
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
              <Option value="approved">Đã duyệt</Option>
              <Option value="pending">Chờ duyệt</Option>
              <Option value="rejected">Từ chối</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="difficulty"
            label="Độ khó"
            rules={[{ required: true, message: 'Vui lòng chọn độ khó' }]}
          >
            <Select>
              <Option value="easy">Dễ</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="hard">Khó</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="comment"
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