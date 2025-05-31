import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Space, Tag, Input, Typography, Popconfirm,
  message, Modal, Form, Select, DatePicker, Tabs, Row, Col, Upload,
  Divider, Statistic, Tooltip, InputNumber
} from 'antd';
import { Pie } from '@ant-design/plots';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  MailOutlined, UserAddOutlined, ExportOutlined, ImportOutlined,
  InboxOutlined, UploadOutlined, LineChartOutlined, PieChartOutlined,
  KeyOutlined, SyncOutlined
} from '@ant-design/icons';
import { StudentDataHUIT } from './Courses';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { authTokenLogin } from '../../utils/auth';
import useRefreshToken from '../../utils/useRefreshToken';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;
const { Dragger } = Upload;


interface StudentCourseDataDTO {
  id: number;
  studentId: string;
  email: string;
  fullname: string;
  classRoom: string;
  accountId: number;
  courseId: number;
  age: number;
  studyHoursPerWeek: number;
  onlineCoursesCompleted: number;
  assignmentCompletionRate: number;
  examScore: number;
  attendanceRate: number;
  timeSpentOnSocialMedia: number;
  sleepHoursPerNight: number;
  gender: number;  // 0: Female, 1: Male
  preferredLearningStyle: number;
  participationInDiscussions: number;
  useOfEducationalTech: number;
  selfReportedStressLevel: number;
  courseProgress: string;
}

interface StudentStatisticsDTO {
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  predictedStudents: number;
  predictedPass: number;
  predictedFail: number;
}

interface ClassRoomStudent {
  studentId: string;
  accountId: string;
  fullname: string;
  classRoom: string;
  age: number;
  gender: string;
  assignmentCompletionRate: number;
  examScore: number;
  probability: number;
  prediction: string;
}

interface CourseHUITStudentsProps {
  courseId: string;
}

const CourseHUITStudents: React.FC<CourseHUITStudentsProps> = ({ courseId }) => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentCourseDataDTO[]>([]);
  const [studentsTotal, setStudentsTotal] = useState<number>(0);
  const [selectedStudents, setSelectedStudents] = useState<StudentCourseDataDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isPredictionModalVisible, setIsPredictionModalVisible] = useState<boolean>(false);
  const [isSendPredictionModalVisible, setIsSendPredictionModalVisible] = useState<boolean>(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState<boolean>(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState<boolean>(false);
  const [isGenerateCodeModalVisible, setIsGenerateCodeModalVisible] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [statistics, setStatistics] = useState<StudentStatisticsDTO>({
    totalStudents: 0,
    passedStudents: 0,
    failedStudents: 0,
    predictedStudents: 0,
    predictedPass: 0,
    predictedFail: 0
  });
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('');
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const [editingStudent, setEditingStudent] = useState<StudentCourseDataDTO | null>(null);
  const [form] = Form.useForm();
  const [predictionForm] = Form.useForm();
  const [sendPredictionForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const [classRoomList, setClassRoomList] = useState<ClassRoomStudent[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [activationCodes, setActivationCodes] = useState<any[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [totalCodes, setTotalCodes] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);

  // Mock data for predictions - this will need to be calculated from real data
  const passRate = 65; // percentage
  const passCount = Math.round(students.length * (passRate / 100));
  const failCount = students.length - passCount;

  useEffect(() => {
    fetchClassroomList();
    fetchStudents();
    fetchStatisticsPredicted();
  }, [courseId, page, size, selectedClassFilter]);

  const fetchStatisticsPredicted = async () => {
    setStatsLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/student-course-data/dashboard/student-huit/by-course/${courseId}?classRoom=${selectedClassFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: StudentStatisticsDTO = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Lỗi khi tải thống kê sinh viên');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    // Retrieve the token
    const token = await authTokenLogin(refreshToken, refresh, navigate);

    try {
      const baseUrl = `${process.env.REACT_APP_SERVER_HOST}/api/student-course-data/list-student-huit/${courseId}?page=${page}&size=${size}`;
      const urlWithFilter = selectedClassFilter ? `${baseUrl}&classRoom=${selectedClassFilter}` : baseUrl;
      const response = await fetch(urlWithFilter, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Authorization header
        },
      });

      // Handle response
      const data = await response.json();

      if (response.ok) {
        // Update the students list and total pages
        setStudents(data.content);  // Data is in 'content' field
        setTotalPages(data.totalPages);  // Total pages
        setStudentsTotal(data.totalElements);
      } else {
        // Show error message if the response is not okay
        toast.error("Lỗi khi tải danh sách sinh viên.");
      }
    } catch (error) {
      // Handle network or other errors
      toast.error("Có lỗi xảy ra khi tải danh sách sinh viên.");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassroomList = async () => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/student-course-data/students-list?courseId=${courseId}&classRoom=${selectedClassFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setClassRoomList(data);
    } catch (error) {
      console.error('Error fetching students list:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredStudents = students.filter(student =>
    student.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
    student.email.toLowerCase().includes(searchText.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/student-course-data/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh the student list after successful deletion
        fetchStudents();
        message.success('Xóa học viên thành công');
      } else {
        message.error('Không thể xóa học viên');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa học viên');
    }
  };

  const showModal = (student?: StudentCourseDataDTO) => {
    if (student) {
      setEditingStudent(student);
      form.setFieldsValue({
        fullname: student.fullname,
        email: student.email,
        studentId: student.studentId,
        classRoom: student.classRoom,
      });
    } else {
      setEditingStudent(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      if (editingStudent) {
        // Update student
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/student-course-data/${editingStudent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...editingStudent,
            ...values,
          }),
        });

        if (response.ok) {
          message.success('Cập nhật học viên thành công');
          fetchStudents();
        } else {
          message.error('Không thể cập nhật học viên');
        }
      } else {
        // Add new student
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/student-course-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...values,
            courseId: parseInt(courseId),
          }),
        });

        if (response.ok) {
          message.success('Thêm học viên mới thành công');
          fetchStudents();
        } else {
          message.error('Không thể thêm học viên mới');
        }
      }
      setIsModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu thông tin học viên');
    }
  };

  const showPredictionModal = (student?: StudentCourseDataDTO) => {
    if (student) {
      setEditingStudent(student);
      predictionForm.setFieldsValue({
        prediction: student.examScore,
      });
    } else {
      setEditingStudent(null);
      predictionForm.resetFields();
    }
    setIsPredictionModalVisible(true);
  };

  const handlePredictionCancel = () => {
    setIsPredictionModalVisible(false);
  };

  const handlePredictionOk = async () => {
    try {
      const values = await predictionForm.validateFields();
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      if (editingStudent) {
        // Update student prediction (exam score)
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/student-course-data/${editingStudent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...editingStudent,
            examScore: values.prediction,
          }),
        });

        if (response.ok) {
          message.success('Cập nhật dự đoán điểm thành công');
          fetchStudents();
        } else {
          message.error('Không thể cập nhật dự đoán điểm');
        }
      }
      setIsPredictionModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra khi cập nhật dự đoán điểm');
    }
  };

  const showSendPredictionModal = () => {
    setIsSendPredictionModalVisible(true);
  };

  const handleSendPredictionCancel = () => {
    setIsSendPredictionModalVisible(false);
  };

  const handleSendPredictionOk = async () => {
    try {
      const values = await sendPredictionForm.validateFields();
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Call API to send predictions to selected students
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/student-course-data/send-predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentIds: values.students,
          message: values.message,
          courseId: parseInt(courseId),
        }),
      });

      if (response.ok) {
        message.success(`Đã gửi kết quả dự đoán cho ${values.students.length} học viên`);
      } else {
        message.error('Không thể gửi kết quả dự đoán');
      }
      setIsSendPredictionModalVisible(false);
    } catch (error) {
      message.error('Có lỗi xảy ra khi gửi kết quả dự đoán');
    }
  };

  const sendCourseCode = () => {
    message.success('Đã gửi mã khóa học đến tất cả học viên');
  };

  const fetchData = async (page = 0) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      setCurrentPage(page);

      // Using a smaller page size for better performance
      const pageSize = 10;
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-codes/list/${courseId}?page=${page}&size=${pageSize}&codeSearch=${search}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu mã khóa học');
      }

      const data = await response.json();
      setActivationCodes(data.content); // content là danh sách mã khóa học
      setPageCount(data.totalPages); // totalPages là tổng số trang
      setTotalCodes(data.totalElements); // totalElements là tổng số mã khóa học

    } catch (error) {
      console.error('Có lỗi khi tải dữ liệu:', error);
      message.error('Không thể tải danh sách mã khóa học');
    }
  };

  const generateCourseCode = () => {
    fetchData(0); // Load the course codes when opening the modal
    setIsGenerateCodeModalVisible(true);
  };

  const handleGenerateCodeCancel = () => {
    setIsGenerateCodeModalVisible(false);
  };

  const handleGenerateCodeOk = async () => {
    try {
      const bodyValues = await exportForm.validateFields();
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-codes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity: bodyValues.quantity,
          courseId: parseInt(courseId),
          accountId: bodyValues.accountId || 2,
          expiryDays: bodyValues.expiryDays || 5
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể tạo mã khóa học');
      }

      message.success('Đã tạo mã khóa học mới thành công');
      fetchData(0); // Refresh the list
    } catch (error) {
      console.error('Error generating course code:', error);
      message.error('Có lỗi xảy ra khi tạo mã khóa học');
    }
  };

  const setCodeStatus = async (id: string, active: boolean) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-codes/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) {
        throw new Error(`Không thể ${active ? 'kích hoạt' : 'vô hiệu hóa'} mã khóa học`);
      }

      message.success(`Đã ${active ? 'kích hoạt' : 'vô hiệu hóa'} mã khóa học`);
      fetchData(0); // Refresh the list
    } catch (error) {
      console.error('Error updating code status:', error);
      message.error(`Có lỗi xảy ra khi ${active ? 'kích hoạt' : 'vô hiệu hóa'} mã khóa học`);
    }
  };

  const deleteCode = async (id: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-codes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa mã khóa học');
      }

      message.success('Đã xóa mã khóa học');
      fetchData(0); // Refresh the list
    } catch (error) {
      console.error('Error deleting code:', error);
      message.error('Có lỗi xảy ra khi xóa mã khóa học');
    }
  };

  const showImportModal = () => {
    setIsImportModalVisible(true);
  };

  const handleImportCancel = () => {
    setIsImportModalVisible(false);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId.toString());

    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/student-course-data/file-upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.text();
      if (response.ok) {
        toast.success("Thêm danh sách thành công!");
        fetchStudents(); // Refresh the student list
        fetchStatisticsPredicted(); // Update statistics
        setIsImportModalVisible(false);
      } else {
        toast.error("Lỗi: " + result);
      }
    } catch (error) {
      toast.error("Lỗi: " + error);
    }
  };

  const handleImportOk = () => {
    message.success('Đã nhập danh sách học viên thành công');
    setIsImportModalVisible(false);
  };

  const showExportModal = () => {
    setIsExportModalVisible(true);
  };

  const handleExportCancel = () => {
    setIsExportModalVisible(false);
  };

  const exportToExcel = async () => {
    if (!courseId) {
      alert('Vui lòng chọn khóa học trước khi xuất Excel.');
      return;
    }

    if (selectedClasses.length === 0) {
      alert('Vui lòng chọn ít nhất một lớp để xuất Excel.');
      return;
    }
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const requestData = {
        courseId: courseId,
        classRooms: selectedClasses
      };

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/student-course-data/student-huit/excel/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const { data } = await response.json();  // Dữ liệu trả về là Base64 encoded string

      // Giải mã dữ liệu Base64
      const binaryString = atob(data);
      const binaryLen = binaryString.length;
      const bytes = new Uint8Array(binaryLen);

      for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Tạo Blob từ dữ liệu đã giải mã
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Tạo link tải về
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();

      setIsExportModalVisible(false);
      message.success('Đã xuất danh sách học viên thành công');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      message.error('Có lỗi xảy ra khi xuất Excel');
    }
  };

  const handleExportOk = () => {
    exportForm.validateFields().then(values => {
      setSelectedClasses(values.classes);
      exportToExcel();
    });
  };

  // Get unique classrooms from students data to populate the dropdown
  const uniqueClassrooms = Array.from(new Set(classRoomList.map(student => student.classRoom)))
    .filter(Boolean) // Remove empty values
    .sort(); // Sort alphabetically

  const columns = [
    {
      title: 'Học viên',
      dataIndex: 'fullname',
      key: 'fullname',
      render: (text: string, record: StudentCourseDataDTO) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '0.85em', color: '#888' }}>{record.email}</div>
          <div style={{ fontSize: '0.85em', color: '#888' }}>MSSV: {record.studentId}</div>
          <div style={{ fontSize: '0.85em', color: '#888' }}>Lớp: {record.classRoom}</div>
        </div>
      ),
    },
    {
      title: 'Tiến độ',
      dataIndex: 'assignmentCompletionRate',
      key: 'progress',
      render: (progress: number) => {
        const progressPercentage = progress;
        const progressInt = Math.floor(progressPercentage);
        let color = 'blue';
        if (progressInt >= 80) color = 'green';
        else if (progressInt >= 50) color = 'cyan';
        else if (progressInt >= 30) color = 'orange';
        else if (progressInt >= 0) color = 'red';

        return (
          <Tag color={color}>
            {progressInt}%
          </Tag>
        );
      },
      sorter: (a: StudentCourseDataDTO, b: StudentCourseDataDTO) =>
        a.assignmentCompletionRate - b.assignmentCompletionRate,
    },
    {
      title: 'Điểm kiểm tra',
      dataIndex: 'examScore',
      key: 'examScore',
      render: (score: number) => {
        let color = 'red';
        if (score >= 8.0) color = 'green';
        else if (score >= 6.5) color = 'cyan';
        else if (score >= 5.0) color = 'orange';
        const scoreFormatted = (score / 10).toFixed(1);
        return (
          <Tag color={color}>
            {scoreFormatted}
          </Tag>
        );
      },
      sorter: (a: StudentCourseDataDTO, b: StudentCourseDataDTO) => a.examScore - b.examScore,
    },
    {
      title: 'Trạng thái',
      key: 'predictionStatus',
      render: (_: any, record: StudentCourseDataDTO) => {
        const isPredicted = record.accountId && record.examScore > 0;
        return (
          <Tag color={isPredicted ? 'green' : 'orange'}>
            {isPredicted ? 'Đã dự đoán' : 'Chưa dự đoán'}
          </Tag>
        );
      },
      sorter: (a: StudentCourseDataDTO, b: StudentCourseDataDTO) => {
        const aStatus = a.accountId && a.examScore > 0 ? 1 : 0;
        const bStatus = b.accountId && b.examScore > 0 ? 1 : 0;
        return aStatus - bStatus;
      },
    },
    {
      title: 'Tỷ lệ tham gia bài tập',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      render: (rate: number) => {
        const attendancePercentage = rate;
        let color = 'red';
        if (attendancePercentage >= 80) color = 'green';
        else if (attendancePercentage >= 60) color = 'cyan';
        else if (attendancePercentage >= 40) color = 'orange';

        return (
          <Tag color={color}>
            {attendancePercentage}%
          </Tag>
        );
      },
      sorter: (a: StudentCourseDataDTO, b: StudentCourseDataDTO) => a.attendanceRate - b.attendanceRate,
    },
    // {
    //   title: 'Tiến độ khóa học',
    //   dataIndex: 'courseProgress',
    //   key: 'courseProgress',
    //   render: (progress: string) => {
    //     return <span>{progress}</span>;
    //   }
    // },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: StudentCourseDataDTO) => (
        <Space size="small">
          <Tooltip title="Cập nhật thông tin">
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => showModal(record)}
            />
          </Tooltip>
          {/* <Tooltip title="Cập nhật dự đoán điểm">
            <Button
              type="primary"
              size="small"
              icon={<LineChartOutlined />}
              onClick={() => showPredictionModal(record)}
            />
          </Tooltip>
          <Tooltip title="Gửi mã khóa học">
            <Button
              type="primary"
              size="small"
              icon={<MailOutlined />}
              onClick={() => message.success(`Đã gửi mã khóa học đến ${record.email}`)}
            />
          </Tooltip>  */}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa học viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa học viên">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>Quản lý học viên HUIT</Title>

          <div className="row">
            <div style={{ marginBottom: '10px' }}>
              <Space>
                {/* <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => showModal()}
                >
                  Thêm học viên
                </Button> */}
                <Button
                  type="primary"
                  icon={<KeyOutlined />}
                  onClick={generateCourseCode}
                >
                  Mã khóa học
                </Button>
                <Button
                  type="primary"
                  icon={<MailOutlined />}
                  onClick={sendCourseCode}
                >
                  Gửi mã khóa học
                </Button>
                <Button
                  type="primary"
                  icon={<LineChartOutlined />}
                  onClick={showSendPredictionModal}
                >
                  Gửi kết quả dự đoán
                </Button>
              </Space>
            </div>
            <div style={{ float: 'right' }}>
              <Space>
                <Button
                  icon={<SyncOutlined />}
                  onClick={() => {
                    fetchStatisticsPredicted();
                    fetchStudents();
                  }}
                  loading={statsLoading || loading}
                >
                  Làm mới
                </Button>


                <Button
                  icon={<ImportOutlined />}
                  onClick={showImportModal}
                >
                  Nhập Excel
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={showExportModal}
                >
                  Xuất Excel
                </Button>
              </Space>

            </div>

          </div>


        </div>

        <Row gutter={24} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng số học viên"
                value={studentsTotal}
                prefix={<UserAddOutlined />}
                loading={statsLoading}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Row>

                <Col span={12}>
                  <Statistic
                    title="Đã dự đoán"
                    value={statistics.predictedStudents}
                    valueStyle={{ color: '#722ed1' }}
                    loading={statsLoading}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Row>
                <Col span={12}>
                  <Statistic
                    title="Dự đoán qua môn"
                    value={statistics.passedStudents}
                    valueStyle={{ color: '#3f8600' }}
                    loading={statsLoading}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Dự đoán rớt môn"
                    value={statistics.failedStudents}
                    valueStyle={{ color: '#cf1322' }}
                    loading={statsLoading}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {!statsLoading && statistics.predictedStudents > 0 && (
          <Row gutter={24} style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Card title="Kết quả dự đoán">
                <Row>
                  <Col span={12}>
                    <div style={{ height: 250 }}>
                      <Pie
                        data={[
                          { type: 'Đậu', value: statistics.passedStudents },
                          { type: 'Trượt', value: statistics.failedStudents },
                        ]}
                        angleField="value"
                        colorField="type"
                        radius={0.8}
                        innerRadius={0.5}
                        legend={{
                          position: 'bottom',
                        }}
                        label={{
                          offset: '-30%',
                          content: ({ percent }: { percent: number }) => `${(percent * 100).toFixed(0)}%`,
                          style: {
                            fontSize: 14,
                            textAlign: 'center',
                          },
                        }}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="Dự đoán qua môn"
                          value={statistics.passedStudents}
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Dự đoán rớt môn"
                          value={statistics.failedStudents}
                          valueStyle={{ color: '#cf1322' }}
                        />
                      </Col>
                      {/* <Col span={24}>
                        <Statistic
                          title="Tỷ lệ đậu dự đoán"
                          value={statistics.predictedPass > 0 ?
                            Math.round((statistics.predictedPass / statistics.predictedStudents) * 100) : 0}
                          suffix="%"
                          valueStyle={{ color: '#3f8600' }}
                        />
                      </Col> */}
                    </Row>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}

        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
          <Search
            placeholder="Tìm kiếm học viên..."
            allowClear
            enterButton="Tìm kiếm"
            onSearch={handleSearch}
            style={{ width: 300, marginRight: 16 }}
          />

          <Select
            placeholder="Lọc theo lớp"
            style={{ width: 200, marginRight: 16 }}
            allowClear
            onChange={(value) => setSelectedClassFilter(value || '')}
            value={selectedClassFilter || undefined}
          >
            <Option value="">Tất cả các lớp</Option>
            {uniqueClassrooms.map(classroom => (
              <Option key={classroom} value={classroom}>{classroom}</Option>
            ))}
          </Select>

          {selectedStudents.length > 0 && (
            <Button
              type="primary"
              onClick={showSendPredictionModal}
            >
              Gửi dự đoán cho {selectedStudents.length} học viên đã chọn
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page + 1, // API uses 0-based indexing but UI uses 1-based
            pageSize: size,
            total: totalPages * size, // Approximate total count
            onChange: (newPage, newPageSize) => {
              setPage(newPage - 1); // Convert back to 0-based indexing for API
              if (newPageSize !== size) {
                setSize(newPageSize || 10);
                setPage(0); // Reset to first page when changing page size
              }
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          rowSelection={{
            type: 'checkbox',
            onChange: (_, selectedRows) => {
              setSelectedStudents(selectedRows);
            }
          }}
        />
      </Card>

      {/* Student Modal */}
      <Modal
        title={editingStudent ? "Chỉnh sửa học viên" : "Thêm học viên mới"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingStudent ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
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
            name="studentId"
            label="Mã số sinh viên"
            rules={[{ required: true, message: 'Vui lòng nhập mã số sinh viên!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="classRoom"
            label="Lớp"
            rules={[{ required: true, message: 'Vui lòng nhập lớp!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Prediction Modal */}
      <Modal
        title="Cập nhật dự đoán điểm"
        visible={isPredictionModalVisible}
        onOk={handlePredictionOk}
        onCancel={handlePredictionCancel}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form
          form={predictionForm}
          layout="vertical"
        >
          {editingStudent && (
            <div style={{ marginBottom: 16 }}>
              <Text strong>Học viên: {editingStudent.fullname}</Text>
            </div>
          )}
          <Form.Item
            name="prediction"
            label="Điểm dự đoán"
            rules={[
              { required: true, message: 'Vui lòng nhập điểm dự đoán!' },
              { type: 'number', min: 0, max: 10, message: 'Điểm từ 0-10!' }
            ]}
          >
            <Input type="number" step="0.1" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Send Prediction Modal */}
      <Modal
        title="Gửi kết quả dự đoán"
        visible={isSendPredictionModalVisible}
        onOk={handleSendPredictionOk}
        onCancel={handleSendPredictionCancel}
        okText="Gửi"
        cancelText="Hủy"
      >
        <Form
          form={sendPredictionForm}
          layout="vertical"
        >
          <Form.Item
            name="students"
            label="Chọn học viên"
            rules={[{ required: true, message: 'Vui lòng chọn học viên!' }]}
            initialValue={students.map(s => s.id)}
          >
            <Select mode="multiple">
              {students.map(student => (
                <Option key={student.id} value={student.id}>
                  {student.fullname}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="message"
            label="Tin nhắn"
            initialValue="Kính gửi học viên, Dưới đây là kết quả dự đoán điểm của bạn dựa trên quá trình học tập."
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Nhập danh sách học viên từ Excel"
        visible={isImportModalVisible}
        onCancel={handleImportCancel}
        footer={null}
      >
        <Dragger
          name="file"
          multiple={false}
          showUploadList={{ showRemoveIcon: true }}
          beforeUpload={(file) => {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
              file.type === 'application/vnd.ms-excel';
            if (!isExcel) {
              message.error('Chỉ hỗ trợ tải lên file Excel!');
              return Upload.LIST_IGNORE;
            }
            setSelectedFile(file);
            return false;
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Kéo thả file Excel hoặc nhấp để chọn file</p>
          <p className="ant-upload-hint">
            Hỗ trợ định dạng .xls, .xlsx
          </p>
        </Dragger>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="link"
            icon={<InboxOutlined />}
          >
            Tải về mẫu nhập liệu
          </Button>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            disabled={!selectedFile}
            onClick={() => {
              if (selectedFile) {
                handleFileUpload(selectedFile);
              } else {
                message.warning('Vui lòng chọn file trước khi tải lên');
              }
            }}
          >
            Tải lên
          </Button>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        title="Xuất danh sách học viên ra Excel"
        visible={isExportModalVisible}
        onOk={handleExportOk}
        onCancel={handleExportCancel}
        okText="Xuất"
        cancelText="Hủy"
      >
        <Form
          form={exportForm}
          layout="vertical"
        >
          <Form.Item
            name="classes"
            label="Chọn lớp"
            rules={[{ required: true, message: 'Vui lòng chọn lớp!' }]}
          >
            <Select mode="multiple">
              {uniqueClassrooms.map(classroom => (
                <Option key={classroom} value={classroom}>{classroom}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Generate Course Code Modal */}
      <Modal
        title="Quản lý mã khóa học"
        visible={isGenerateCodeModalVisible}
        onCancel={handleGenerateCodeCancel}
        footer={[
          <Button key="cancel" onClick={handleGenerateCodeCancel}>
            Đóng
          </Button>,
          <Button key="generate" type="primary" onClick={handleGenerateCodeOk}>
            Tạo mã mới
          </Button>,
        ]}
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Mã khóa học dùng để học viên đăng ký tham gia khóa học. Chỉ có một mã khóa học được kích hoạt tại một thời điểm.</Text>
        </div>

        <Form form={exportForm} layout="vertical" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Số lượng mã cần tạo"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng mã cần tạo' },
                  { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={1} placeholder="Nhập số lượng mã" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDays"
                label="Số ngày hiệu lực"
                rules={[
                  { required: true, message: 'Vui lòng nhập số ngày hiệu lực' },
                  { type: 'number', min: 1, message: 'Số ngày phải lớn hơn 0' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={1} placeholder="Nhập số ngày hiệu lực" />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm mã khóa học"
            onSearch={(value) => {
              setSearch(value);
              setCurrentPage(0);
              fetchData(0);
            }}
            style={{ width: 300 }}
          />
        </div>

        <Table
          dataSource={activationCodes}
          rowKey="id"
          pagination={{
            total: totalCodes,
            pageSize: 10,
            onChange: (page) => fetchData(page - 1),
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) => `Tổng cộng ${total} mã`,
            current: currentPage + 1,
          }}
          columns={[
            {
              title: 'Mã khóa học',
              dataIndex: 'code',
              key: 'code',
            },
            {
              title: 'Ngày tạo',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (date: string) => moment(date).format('DD/MM/YYYY'),
            },
            {
              title: 'Hạn sử dụng',
              dataIndex: 'expiryDate',
              key: 'expiryDate',
              render: (date: string) => moment(date).format('DD/MM/YYYY'),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              render: (active: boolean, record: any) => {
                if (active) {
                  return <Tag color="green">Đã sử dụng</Tag>;
                }

                const expiryDate = moment(record.expiryDate);
                const now = moment();

                if (expiryDate.isBefore(now)) {
                  return <Tag color="gray">Đã hết hạn</Tag>;
                }

                return <Tag color="red">Chưa sử dụng</Tag>;
              },
            },
            {
              title: 'Hành động',
              key: 'action',
              render: (_: any, record: { id: string, active: boolean }) => (
                <Space size="small">


                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa mã này?"
                    onConfirm={() => deleteCode(record.id)}
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
          ]}
        />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Chỉ học viên có mã khóa học đang kích hoạt mới có thể đăng ký tham gia.</Text>
        </div>
      </Modal>
    </div>
  );
};

export default CourseHUITStudents;