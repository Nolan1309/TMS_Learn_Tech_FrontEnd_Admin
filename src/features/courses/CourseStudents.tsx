import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Space, Tag, Input, Typography, Popconfirm, 
  message, Modal, Form, Select, DatePicker, Tabs, Pagination
} from 'antd';
import { 
  PlusOutlined, DeleteOutlined, SearchOutlined, 
  MailOutlined, UserAddOutlined, EyeOutlined, MessageOutlined
} from '@ant-design/icons';
import moment from 'moment';
import useRefreshToken from '../../utils/useRefreshToken';
import { useNavigate } from 'react-router-dom';
import { authTokenLogin } from '../../utils/auth';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

interface Account {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  birthday: string;
  gender: number;
  image: string;
  lastLogin: string;
  deletedDate: number;
  deleted: boolean;
  status : string;
  roleId : number;
}

interface EnrollCourse {
  id: string;
  course_id: string;
  account_id: string;
  enrollment_date: string;
  status: string;
}

// Combine Account and EnrollCourse with additional UI fields
type Student = {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  progress: number;
  status: string;
  type: string;
};

interface CourseStudentsProps {
  courseId: string;
}

interface ApiResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

const CourseStudents: React.FC<CourseStudentsProps> = ({ courseId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isResultModalVisible, setIsResultModalVisible] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  
  const fetchStudents = async (courseId: string, searchTerm: string = "", roles: string[] = ['USER', 'USERVIP'], page: number = 0, size: number = 10) => {
    try {
      // Lấy token từ auth
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      
      // Tạo URL với các tham số phân trang, tìm kiếm và vai trò
      const rolesParam = roles.join(",");  // chuyển array thành chuỗi roles (ví dụ: 'USER,USERVIP')
      const url = `${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/courses/${courseId}/students?searchTerm=${searchTerm}&roles=${rolesParam}&page=${page}&size=${size}`;
  
      // Gửi yêu cầu GET với các tham số trong headers
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      // Kiểm tra nếu response không thành công
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
  
      // Parse dữ liệu trả về từ API
      const result = await response.json();
      return result as ApiResponse<Student>;  // Return the full response with pagination info
  
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;  // Rethrow to handle in the caller
    }
  };
  
  const loadStudents = async () => {
    setLoading(true);
    try {
      // Determine roles based on active tab
      let roles: string[] = ['USER', 'USERVIP'];
      if (activeTab === 'vip') {
        roles = ['USERVIP'];
      } else if (activeTab === 'regular') {
        roles = ['USER'];
      }
      
      // Convert to zero-based page index for API
      const pageIndex = pagination.current - 1;
      
      const response = await fetchStudents(
        courseId, 
        searchText, 
        roles, 
        pageIndex, 
        pagination.pageSize
      );
      
      setStudents(response.data);
      setPagination({
        ...pagination,
        total: response.totalElements
      });
    } catch (error) {
      console.error('Error loading students:', error);
      message.error('Không thể tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [courseId, activeTab, pagination.current, pagination.pageSize]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({
      ...pagination,
      current: 1 // Reset to first page on new search
    });
    loadStudents();
  };

  const handleDelete = async (id: string) => {
    try {
      // Lấy token từ auth
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      
      // Call API to delete student
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
      
      // After successful deletion, reload the students
      message.success('Xóa học viên thành công');
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      message.error('Không thể xóa học viên');
    }
  };

  const showModal = (student?: Student) => {
    if (student) {
      setSelectedStudent(student);
      form.setFieldsValue({
        fullname: student.fullname,
        email: student.email,
        phone: student.phone,
        status: student.status,
        type: student.type
      });
    } else {
      setSelectedStudent(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const showResultModal = (student: Student) => {
    setSelectedStudent(student);
    setIsResultModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleResultCancel = () => {
    setIsResultModalVisible(false);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      
      if (selectedStudent) {
        // Update student
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/${selectedStudent.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(values),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update student');
        }
        
        message.success('Cập nhật học viên thành công');
      } else {
        // Add new student
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/enrolled-course/courses/${courseId}/students`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...values,
            enrollmentDate: new Date().toISOString().split('T')[0],
            progress: 0,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to add student');
        }
        
        message.success('Thêm học viên mới thành công');
      }
      
      setIsModalVisible(false);
      loadStudents(); // Reload the student list after update
    } catch (error) {
      console.error('Error saving student:', error);
      message.error('Không thể lưu thông tin học viên');
    }
  };

  const handleChat = async (student: Student) => {
    try {
      // Implementation of chat functionality
      message.success(`Đã mở cửa sổ chat với ${student.fullname}`);
    } catch (error) {
      console.error('Error opening chat:', error);
      message.error('Không thể mở cửa sổ chat');
    }
  };

  const handleTableChange = (pagination: any) => {
    setPagination({
      ...pagination,
      current: pagination.current
    });
  };

  // Format progress to 2 decimal places
  const formatProgress = (progress: number) => {
    return progress.toFixed(2);
  };

  const columns = [
    {
      title: 'Học viên',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (text: string, record: Student) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '0.85em', color: '#888' }}>{record.email}</div>
          <div style={{ fontSize: '0.85em', color: '#888' }}>{record.phone}</div>
        </div>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => {
        let color = 'blue';
        if (progress >= 80) color = 'green';
        else if (progress >= 50) color = 'cyan';
        else if (progress >= 30) color = 'orange';
        else if (progress >= 0) color = 'red';
        
        return (
          <Tag color={color}>
            {formatProgress(progress)}%
          </Tag>
        );
      },
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'USERVIP' ? 'gold' : 'blue'}>
          {type === 'USERVIP' ? 'VIP' : 'Thường'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string, text: string }> = {
          active: { color: 'green', text: 'Đang học' },
          inactive: { color: 'red', text: 'Nghỉ học' },
          completed: { color: 'blue', text: 'Hoàn thành' },
        };
        
        return (
          <Tag color={statusMap[status]?.color || 'default'}>
            {statusMap[status]?.text || status}
          </Tag>
        );
      },
    },
    // {
    //   title: 'Ghi chú',
    //   dataIndex: 'note',
    //   key: 'note',
    // },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Student) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<MessageOutlined />}
            onClick={() => handleChat(record)}
          />
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showResultModal(record)}
          />
          {/* <Button
            type="primary"
            size="small"
            icon={<MailOutlined />}
            onClick={() => message.success(`Đã gửi mã khóa học đến ${record.email}`)}
          /> */}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa học viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          {/* <Title level={4}>Quản lý học viên</Title> */}
          <Space>
            {/* <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={sendCourseCode}
            >
              Gửi mã khóa học
            </Button> */}
            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm học viên
            </Button> */}
          </Space>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm học viên..."
            allowClear
            enterButton="Tìm kiếm"
            onSearch={handleSearch}
            style={{ width: 300, marginBottom: 16 }}
          />
        </div>

        <Tabs activeKey={activeTab} onChange={(key) => {
          setActiveTab(key);
          setPagination({...pagination, current: 1}); // Reset to page 1 when changing tabs
        }}>
          <TabPane tab="Tất cả" key="all" />
          <TabPane tab="VIP" key="vip" />
          <TabPane tab="Thường" key="regular" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} học viên`,
            pageSizeOptions: ['10', '20', '50']
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={selectedStudent ? "Chỉnh sửa học viên" : "Thêm học viên mới"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={selectedStudent ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="fullname"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên học viên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại học viên"
            rules={[{ required: true, message: 'Vui lòng chọn loại học viên!' }]}
          >
            <Select>
              <Option value="USER">Học viên thường</Option>
              <Option value="USERVIP">Học viên VIP</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value="active">Đang học</Option>
              <Option value="inactive">Nghỉ học</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
          </Form.Item>
          {/* <Form.Item
            name="note"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} />
          </Form.Item> */}
        </Form>
      </Modal>

      <Modal
        title="Xem nhanh kết quả học tập"
        visible={isResultModalVisible}
        onCancel={handleResultCancel}
        footer={[
          <Button key="close" onClick={handleResultCancel}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedStudent && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <Title level={5}>{selectedStudent.fullname}</Title>
              <div>Email: {selectedStudent.email}</div>
              <div>SĐT: {selectedStudent.phone}</div>
              <div>Loại học viên: {selectedStudent.type === 'USERVIP' ? 'VIP' : 'Thường'}</div>
              <div>Tiến độ hoàn thành: {formatProgress(selectedStudent.progress)}%</div>
            </div>
            
            <Table 
              dataSource={[
                { id: 1, module: 'Module 1: Giới thiệu', score: 9.5, status: 'Hoàn thành' },
                { id: 2, module: 'Module 2: Cơ bản', score: 8.0, status: 'Hoàn thành' },
                { id: 3, module: 'Module 3: Nâng cao', score: 7.5, status: 'Đang học' },
                { id: 4, module: 'Module 4: Chuyên sâu', score: null, status: 'Chưa bắt đầu' },
              ]} 
              columns={[
                { title: 'Module', dataIndex: 'module', key: 'module' },
                { 
                  title: 'Điểm', 
                  dataIndex: 'score', 
                  key: 'score',
                  render: (score) => score ? score.toFixed(2) : '-' 
                },
                { 
                  title: 'Trạng thái', 
                  dataIndex: 'status', 
                  key: 'status',
                  render: (status) => {
                    let color = 'blue';
                    if (status === 'Hoàn thành') color = 'green';
                    else if (status === 'Đang học') color = 'orange';
                    else if (status === 'Chưa bắt đầu') color = 'red';
                    
                    return <Tag color={color}>{status}</Tag>;
                  }
                },
              ]}
              pagination={false}
              rowKey="id"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseStudents; 