import React, { useState, useEffect } from 'react';
import {
  Typography, Table, Button, Space, Card, Input, Tag, Select,
  DatePicker, Modal, Form, Upload, Tabs, Tooltip, Divider,
  Badge, Popconfirm, Row, Col, Statistic, Progress, message, List,
  Checkbox, Alert
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined,
  DownloadOutlined, UploadOutlined, FileOutlined, TeamOutlined,
  FilePdfOutlined, TrophyOutlined, ClockCircleOutlined,
  CheckCircleOutlined, FormOutlined, LockOutlined, UnlockOutlined,
  DollarOutlined, ImportOutlined, ExportOutlined,
  FileWordOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils';
// @ts-ignore - sửa lỗi type cho CKEditor
import { CKEditor } from '@ckeditor/ckeditor5-react';
// @ts-ignore - sửa lỗi type cho ClassicEditor
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import './MockExams.css';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
export const ADMIN_ADD_EXAM = `${process.env.REACT_APP_SERVER_HOST}/api/tests/add-exam`;
export const ADMIN_UPDATE_EXAM = `${process.env.REACT_APP_SERVER_HOST}/api/tests/update-exam`;
export const ADMIN_DELETE_EXAM = `${process.env.REACT_APP_SERVER_HOST}/api/tests/delete-exam`;
export const ADMIN_GET_DELETED_EXAMS = `${process.env.REACT_APP_SERVER_HOST}/api/tests/deleted/list-all-exam`;
export const ADMIN_RESTORE_EXAM = `${process.env.REACT_APP_SERVER_HOST}/api/tests/restore-exam`;
export const ADMIN_ADD_QUESTION_TO_TEST_V2 = `${process.env.REACT_APP_SERVER_HOST}/api/test-questions/add-questions-v2`;
export const ADMIN_EXPORT_DOCX = `${process.env.REACT_APP_SERVER_HOST}/api/tests/export-docx`;

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
interface SelectedQuestion {
  id: number;
  level: string;
  type: string;
}

interface ExamResponse {
  data: {
    totalElements: number;
    totalPages: number;
    size: number;
    content: TestWithExamInfo[];
  };
}

// Question interface for the Add Questions feature
interface Question {
  id: string;
  content: string;
  difficulty: string;
  type: string;
  subject: string;
  answers: { id: string; content: string; isCorrect: boolean }[];
  createdAt: string;
}
// src/types/TestWithExamInfo.ts

export interface TestWithExamInfo {
  testId: number;
  title: string;
  description: string;
  totalQuestion: number;
  easyQuestion: number;
  mediumQuestion: number;
  hardQuestion: number;
  type: string;
  courseId: number;
  courseTitle: string;
  point: number;
  format: string;
  duration: number;
  createdAt: string; // ISO string, dùng Date nếu cần
  updatedAt: string;
  itemCount: number;
  discountStatus: boolean;
  intro: string;
  imageUrl: string;
  level: 'EASY' | 'MEDIUM' | 'HARD';
  price: number;
  cost: number;
  testContent: string;
  knowledgeRequirement: string;
  examType: 'FREE' | 'FEE';
  status: 'ACTIVE' | 'INACTIVE';

  deleted?: boolean;
  deletedDate?: string;
}

// Thêm các thuộc tính được sử dụng nhưng không có trong interface
interface TestWithExamInfoExtended extends TestWithExamInfo {
  id: number;
  subject: string;
  author: string;
}
const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Trắc nghiệm', color: 'blue' },
  { value: 'essay', label: 'Tự luận', color: 'purple' },
  { value: 'fill-in-the-blank', label: 'Điền khuyết', color: 'green' },
  { value: 'checkbox', label: 'Nhiều lựa chọn', color: 'orange' }
];
const MockExamsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [form] = Form.useForm();

  // New state variables for quick view and edit
  const [quickViewVisible, setQuickViewVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [currentExam, setCurrentExam] = useState<TestWithExamInfo | null>(null);
  const [editForm] = Form.useForm();

  // New state variables for Add Questions
  const [addQuestionsVisible, setAddQuestionsVisible] = useState<boolean>(false);
  const [questionSearchText, setQuestionSearchText] = useState<string>('');
  const [questionForm] = Form.useForm();
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);
  const [questionPage, setQuestionPage] = useState<number>(0);
  const [questionPageSize, setQuestionPageSize] = useState<number>(10);
  // New state variables for API integration
  const [exams, setExams] = useState<TestWithExamInfo[]>([]);
  const [deletedExams, setDeletedExams] = useState<TestWithExamInfo[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState<boolean>(false);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalDeletedElements, setTotalDeletedElements] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [deletedPage, setDeletedPage] = useState<number>(1);
  const [deletedRowsPerPage, setDeletedRowsPerPage] = useState<number>(10);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectCourse, setSelectCourse] = useState<string>('');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [questionTest, setQuestionTest] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  // API integration functions
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
  const [activeQuestionsTab, setActiveQuestionsTab] = useState<string>('auto');
  const fetchExams = async () => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);

    const params = new URLSearchParams({
      ...(selectCourse && { courseId: selectCourse }),
      ...(searchText && { title: searchText }),
      page: (page - 1).toString(), // API might use 0-indexed pages
      size: rowsPerPage.toString(),
    });

    const url = `${process.env.REACT_APP_SERVER_HOST}/api/tests/filter-all-exam?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: ExamResponse = await response.json();
      setExams(data.data.content || []);
      setTotalElements(data.data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      message.error("Không thể tải danh sách bài kiểm tra");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (currentExam) { // chỉ fetch khi đang có bài kiểm tra hiện hành
      fetchQuestionsWithFilters();
    }
  }, [typeFilter, levelFilter, searchTerm, questionPage, questionPageSize]);
  // Hàm lấy tên môn học dựa vào courseId
  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Chưa xác định';
  };

  // Helper function to convert seconds to minutes
  const secondsToMinutes = (seconds: number): number => {
    return Math.round(seconds / 60);
  };

  const fetchQuestionsWithExactPagination = async (apiPage: number, pageSize: number) => {
    if (!currentExam) return;

    setLoading(true);

    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {

      // Process filter values to ensure proper API parameters
      const typeParam = typeFilter === 'all' ? '' : typeFilter;
      const levelParam = levelFilter === 'all' ? '' : levelFilter;

      // Build query parameters with the EXACT values passed to this function
      const params = new URLSearchParams({
        accountId: "2",
        courseId: currentExam.courseId.toString(),
        ...(typeParam && { type: typeParam }),
        ...(levelParam && { level: levelParam }),
        ...(searchTerm && { content: searchTerm }),
        page: apiPage.toString(),
        size: pageSize.toString(),
      });

      const url = `${process.env.REACT_APP_SERVER_HOST}/api/questions/exam-all-filter?${params.toString()}`;


      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data.content || []);
      setTotalQuestionsCount(data.totalElements || 0);
    } catch (error) {
      console.error("Error fetching questions:", error);
      message.error("Không thể tải dữ liệu câu hỏi!");
    } finally {
      setLoading(false);
    }
  };


  const fetchQuestionTest = async (examId: string) => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);

    try {
      const url = `${process.env.REACT_APP_SERVER_HOST}/api/test-questions/questions/${examId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Existing test questions:", data);
      setQuestionTest(data);

      // Automatically add existing questions to selectedQuestions
      if (data && data.length > 0) {
        const existingQuestions = data.map((q: { id: number; level: string; type: string }) => ({
          id: q.id,
          level: q.level,
          type: q.type
        }));

        setSelectedQuestions(prev => {
          // Create a map to merge without duplicates
          const selectionMap = new Map(prev.map(q => [q.id, q]));
          existingQuestions.forEach((q: { id: number; level: string; type: string }) => selectionMap.set(q.id, q));
          return Array.from(selectionMap.values());
        });
      }
    } catch (error) {
      console.error("Failed to fetch test questions:", error);
      message.error("Không thể tải danh sách câu hỏi của bài kiểm tra");
    }
  };
  const fetchDeletedExams = async () => {
    if (activeTab !== 'deleted') return; // Only fetch when on deleted tab

    setLoadingDeleted(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);

    const params = new URLSearchParams({
      ...(selectCourse && { courseId: selectCourse }),
      ...(searchText && { title: searchText }),
      page: (deletedPage - 1).toString(),
      size: deletedRowsPerPage.toString(),
    });

    const url = `${ADMIN_GET_DELETED_EXAMS}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: ExamResponse = await response.json();
      setDeletedExams(data.data.content || []);
      setTotalDeletedElements(data.data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch deleted exams:", error);
      message.error("Không thể tải danh sách bài kiểm tra đã xóa");
    } finally {
      setLoadingDeleted(false);
    }
  };

  const handleQuestionsSearchChange = (value: string) => {
    setSearchTerm(value);
    setQuestionPage(0);

  };

  const handleQuestionsTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setQuestionPage(0);
  };

  const handleQuestionsLevelFilterChange = (value: string) => {
    setLevelFilter(value);
    setQuestionPage(0);

  };

  // Improve the question page change handler to use direct values
  const handleQuestionPageChange = (pageNumber: number, pageSize: number) => {
    const apiPage = pageNumber - 1; // Convert to 0-based for API
    // Update state
    setQuestionPage(apiPage);
    setQuestionPageSize(pageSize);
    // Create an explicit API call with these exact values
    fetchQuestionsWithExactPagination(apiPage, pageSize);
  };
  useEffect(() => {
    fetchCourseList();
  }, []);

  useEffect(() => {
    fetchExams();
  }, [page, rowsPerPage, searchText, selectCourse]);

  useEffect(() => {
    if (activeTab === 'deleted') {
      fetchDeletedExams();
    }
  }, [deletedPage, deletedRowsPerPage, searchText, selectCourse, activeTab]);

  const handleCourseChange = (value: string) => {
    setSelectCourse(value);
    setPage(1);
    setDeletedPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    // Reset pagination when searching
    setPage(1);
    setDeletedPage(1);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Reset selectedRowKeys when changing tabs to avoid confusion
    setSelectedRowKeys([]);
  };


  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const fetchQuestionsWithFilters = async () => {
    const apiPage = questionPage; // Get current value
    const pageSize = questionPageSize; // Get current value
    // Call the exact pagination function with current values
    fetchQuestionsWithExactPagination(apiPage, pageSize);
  };

  const handleQuestionsTabChange = (activeKey: string) => {
    setActiveQuestionsTab(activeKey);

    // If switching to manual tab, make sure we have questions loaded
    if (activeKey === 'manual' && questions.length === 0) {
      fetchQuestionsWithFilters();
    }
  };
  const handleCreateMockExam = () => {
    form.validateFields()
      .then(async values => {
        setIsAdding(true);
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        if (!token) return;

        try {
          const formData = new FormData();

          // Thêm trường dữ liệu
          formData.append("title", values.title);
          formData.append("description", values.description || '');
          formData.append("format", "exam");

          formData.append("type", Array.isArray(values.type) ? values.type : [values.type]);
          formData.append("status", values.status);
          formData.append("examType", values.examType);
          formData.append("level", values.level);

          formData.append("courseId", String(values.courseId));
          formData.append("totalQuestion", String(values.totalQuestion));
          formData.append("easyQuestion", String(values.easyQuestion));
          formData.append("mediumQuestion", String(values.mediumQuestion));
          formData.append("hardQuestion", String(values.hardQuestion));
          formData.append("duration", String(values.duration * 60)); // Convert minutes to seconds
          formData.append("point", String(values.point || 0));
          formData.append("price", String(values.price || 0));
          formData.append("cost", String(values.cost || 0));

          formData.append("intro", values.intro || '');
          formData.append("description", values.intro || '');
          formData.append("testContent", values.testContent || '');
          formData.append("knowledgeRequirement", values.knowledgeRequirement || '');
          // Xử lý file ảnh
          if (values.imageUrl && values.imageUrl.length > 0) {
            // Nếu là file mới upload
            if (values.imageUrl[0].originFileObj) {
              formData.append("image", values.imageUrl[0].originFileObj);
            }
            // Nếu là file đã có sẵn (có url)
            else if (values.imageUrl[0].url) {
              formData.append("imageUrl", values.imageUrl[0].url);
            }
          }

          const response = await fetch(ADMIN_ADD_EXAM, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,

            },
            body: formData,
          });

          if (!response.ok) {
            if (response.status === 500) {
              throw new Error('Bài test đã có trong bài test chương!');
            } else {
              throw new Error('Lỗi hệ thống!');
            }
          }

          message.success('Thêm bài kiểm tra thành công!');
          fetchExams();
          form.resetFields();
          setIsModalVisible(false);
        } catch (error) {
          message.error(error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn.");
        } finally {
          setIsAdding(false);
        }
      })
      .catch(error => {
        console.log('Validate failed:', error);
      });
  };


  // New handler functions for quick view
  const showQuickView = (exam: TestWithExamInfo) => {
    setCurrentExam(exam);
    setQuickViewVisible(true);
  };

  const handleQuickViewCancel = () => {
    setQuickViewVisible(false);
    setCurrentExam(null);
  };

  // New handler functions for edit
  const showEditModal = (exam: TestWithExamInfo) => {
    setCurrentExam(exam);
    setEditModalVisible(true);

    // Populate form fields with current exam data
    const info = enrichExamInfo(exam);

    // Process image file list for the upload component if imageUrl exists
    let imageFileList: { uid: string; name: string; status: string; url: string }[] = [];
    if (info.imageUrl) {
      imageFileList = [
        {
          uid: '-1',
          name: 'exam-image.png',
          status: 'done',
          url: info.imageUrl,
        },
      ];
    }

    // If exam is on discount, show an alert to the user
    if (exam.discountStatus) {
      message.warning('Đề thi này đang được áp dụng giảm giá, không thể chỉnh sửa giá bán.');
    }

    editForm.setFieldsValue({
      title: exam.title,
      courseId: exam.courseId,
      subject: exam.courseTitle,
      level: info.level,
      totalQuestion: exam.totalQuestion,
      easyQuestion: exam.easyQuestion,
      mediumQuestion: exam.mediumQuestion,
      hardQuestion: exam.hardQuestion,
      duration: secondsToMinutes(exam.duration),
      type: exam.type,
      examType: exam.examType,
      cost: info.cost,
      price: info.price,
      description: exam.description,
      status: exam.status,
      imageUrl: imageFileList,
      point: exam.point,
      intro: exam.intro,
      testContent: exam.testContent,
      knowledgeRequirement: exam.knowledgeRequirement,
    });
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setCurrentExam(null);
    editForm.resetFields();
  };

  const handleEditSubmit = () => {
    editForm.validateFields()
      .then(async values => {
        setIsAdding(true);
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        if (!token) return;

        try {
          if (!currentExam) {
            throw new Error('Không tìm thấy thông tin đề thi');
          }

          const formData = new FormData();

          // Thêm trường dữ liệu
          formData.append("title", values.title);
          formData.append("format", "exam");

          formData.append("type", Array.isArray(values.type) ? values.type : [values.type]);
          formData.append("status", values.status);
          formData.append("examType", values.examType);
          formData.append("level", values.level);
          formData.append("testContent", values.testContent || '');
          formData.append("knowledgeRequirement", values.knowledgeRequirement || '');

          formData.append("courseId", String(values.courseId || currentExam.courseId));
          formData.append("totalQuestion", String(values.totalQuestion));
          formData.append("easyQuestion", String(values.easyQuestion));
          formData.append("mediumQuestion", String(values.mediumQuestion));
          formData.append("hardQuestion", String(values.hardQuestion));
          formData.append("duration", String(values.duration * 60)); // Convert minutes to seconds
          formData.append("point", String(values.point || 0));
          formData.append("price", String(values.price || 0));
          formData.append("cost", String(values.cost || 0));

          //Xài chung cho 2 bảng
          formData.append("intro", values.intro || '');
          formData.append("description", values.intro || '');
          // Xử lý file ảnh
          if (values.imageUrl && values.imageUrl.length > 0) {
            // Nếu là file mới upload
            if (values.imageUrl[0].originFileObj) {
              formData.append("image", values.imageUrl[0].originFileObj);
            }
            // Nếu là file đã có sẵn (có url)
            else if (values.imageUrl[0].url) {
              formData.append("imageUrl", values.imageUrl[0].url);
            }
          } else if (currentExam.imageUrl) {
            formData.append("imageUrl", currentExam.imageUrl);
          }

          const response = await fetch(`${ADMIN_UPDATE_EXAM}/${currentExam.testId}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Lỗi cập nhật đề thi!');
          }

          message.success('Đã cập nhật đề thi thành công!');
          fetchExams();
          setEditModalVisible(false);
          setCurrentExam(null);
          editForm.resetFields();
        } catch (error) {
          if (error instanceof Error) {
            message.error(error.message);
          } else {
            message.error("Đã xảy ra lỗi không mong muốn.");
          }
        } finally {
          setIsAdding(false);
        }
      })
      .catch(error => {
        console.log('Validate failed:', error);
      });
  };

  // Handler functions for Add Questions
  const showAddQuestionsModal = (exam: TestWithExamInfo) => {
    setCurrentExam(exam);
    setAddQuestionsVisible(true);
    setSelectedQuestions([]);
    setQuestionSearchText('');
  };

  const handleAddQuestionsCancel = () => {
    setAddQuestionsVisible(false);
    setCurrentExam(null);
    setSelectedQuestions([]);
    setQuestionSearchText('');
    questionForm.resetFields();
  };




  const handleAddQuestionsSubmit = async () => {
    if (!currentExam) return;

    if (activeQuestionsTab === 'manual') {
      // Manual mode kiểm tra số lượng
      if (!validateSelectedQuestionsBeforeSubmit()) {
        return; // Dừng lại, không gửi API
      }
    }

    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      if (activeQuestionsTab === 'auto') {

        message.warning("Chức năng tự động chưa được triển khai!");
        return;

      } else {
        // Manual mode: Add selected questions
        if (selectedQuestions.length === 0) {
          message.warning("Vui lòng chọn ít nhất một câu hỏi");
          setLoading(false);
          return;
        }

        // Instead of making separate DELETE calls, send all selected questions to the backend
        // The backend will handle adding new questions and removing deselected ones
        const response = await fetch(`${ADMIN_ADD_QUESTION_TO_TEST_V2}/${currentExam.testId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedQuestions.map(q => ({ id: q.id }))),
        });

        if (!response.ok) {
          throw new Error("Failed to update questions in exam");
        }

        message.success(`Đã cập nhật danh sách câu hỏi cho bài kiểm tra thành công!`);
      }

      // Close modal and reset state
      setAddQuestionsVisible(false);
      setCurrentExam(null);
      setSelectedQuestions([]);

      // Optionally refresh the exam list
      fetchExams();
    } catch (error) {
      console.error("Error updating questions:", error);
      message.error("Không thể cập nhật câu hỏi cho bài kiểm tra!");
    } finally {
      setLoading(false);
    }
  };
  const validateSelectedQuestionsBeforeSubmit = (): boolean => {
    if (!currentExam) return false;

    if (selectedQuestions.length !== currentExam.totalQuestion) {
      message.error(`Bạn cần chọn đúng ${currentExam.totalQuestion} câu hỏi! Hiện tại bạn đã chọn ${selectedQuestions.length} câu.`);
      return false;
    }

    // Đếm số câu theo độ khó
    const easy = selectedQuestions.filter(q => q.level === "1").length;
    const medium = selectedQuestions.filter(q => q.level === "2").length;
    const hard = selectedQuestions.filter(q => q.level === "3").length;

    if (easy !== currentExam.easyQuestion) {
      message.error(`Cần chọn đúng ${currentExam.easyQuestion} câu dễ! Hiện tại chọn ${easy}.`);
      return false;
    }

    if (medium !== currentExam.mediumQuestion) {
      message.error(`Cần chọn đúng ${currentExam.mediumQuestion} câu trung bình! Hiện tại chọn ${medium}.`);
      return false;
    }

    if (hard !== currentExam.hardQuestion) {
      message.error(`Cần chọn đúng ${currentExam.hardQuestion} câu khó! Hiện tại chọn ${hard}.`);
      return false;
    }

    return true;
  };

  // Enhance TestWithExamInfo với các thông tin bổ sung
  const enrichExamInfo = (exam: TestWithExamInfo): TestWithExamInfoExtended => {
    // Find the course that this exam belongs to
    const course = courses.find(c => c.id === exam.courseId);

    return {
      ...exam,
      id: exam.testId,
      subject: exam.courseTitle || course?.title || '',
      author: course?.author || '',
    };
  };

  const getDifficultyTag = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return <Tag color="success">Dễ</Tag>;
      case 'medium':
        return <Tag color="warning">Trung bình</Tag>;
      case 'hard':
        return <Tag color="error">Khó</Tag>;
      default:
        return <Tag color="default">{difficulty}</Tag>;
    }
  };

  const getStatusTag = (status: string, examType: string) => {
    let statusTag;
    switch (status.toLowerCase()) {
      case 'active':
        statusTag = <Tag color="green">Đang hoạt động</Tag>;
        break;
      case 'inactive':
        statusTag = <Tag color="gray">Không hoạt động</Tag>;
        break;
      default:
        statusTag = <Tag color="default">{status}</Tag>;
    }

    return (
      <Space direction="vertical" size={4}>
        {statusTag}
        {examType === 'FEE' ? <Tag color="red">Trả phí</Tag> : <Tag color="blue">Miễn phí</Tag>}
      </Space>
    );
  };

  const columns: ColumnsType<TestWithExamInfo> = [
    {
      title: 'Tên đề thi',
      dataIndex: 'title',
      key: 'title',
      fixed: 'left',
      width: 200,
      render: (text: string, record: TestWithExamInfo) => {
        const info = enrichExamInfo(record);
        return (
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: '12px' }}>{info.subject}</Text>
            </Space>
          </Space>
        );
      },
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Thông tin',
      dataIndex: 'info',
      key: 'info',
      width: 150,
      render: (_, record: TestWithExamInfo) => {
        const info = enrichExamInfo(record);
        return (
          <Space direction="vertical" size={0}>
            <Text>
              <ClockCircleOutlined style={{ marginRight: 4 }} /> {secondsToMinutes(record.duration)} phút | {record.totalQuestion} câu
            </Text>
            <Space size={4}>
              {getDifficultyTag(info.level)}
            </Space>
          </Space>
        );
      },
    },
    {
      title: 'Thống kê',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 130,
      render: (_, record: TestWithExamInfo) => {
        const info = enrichExamInfo(record);
        return (
          info.itemCount > 0 ? (
            <Space direction="vertical" size={0}>
              <Text><TeamOutlined style={{ marginRight: 4 }} /> {info.itemCount} lượt mua</Text>
            </Space>
          ) : (
            <Text type="secondary">Chưa có dữ liệu</Text>
          )
        );
      },

    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (_, record: TestWithExamInfo) => {
        const info = enrichExamInfo(record);
        return getStatusTag(record.status, record.examType);
      },
      filters: [
        { text: 'Đang hoạt động', value: 'ACTIVE' },
        { text: 'Không hoạt động', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 160,
      render: (_, record: TestWithExamInfo) => {
        const info = enrichExamInfo(record);
        const price = record.price;
        const cost = record.cost;

        return (
          <Space direction="vertical" size={0}>
            {price > 0 ? (
              <>
                <Space>
                  <Text type="danger">{price.toLocaleString()}đ</Text>
                  {record.discountStatus && (
                    <Tag color="volcano">Đang giảm giá</Tag>
                  )}
                </Space>
                {cost > price && (
                  <Text type="secondary" style={{ textDecoration: 'line-through', fontSize: '12px' }}>
                    {cost.toLocaleString()}đ
                  </Text>
                )}
              </>
            ) : (
              <Text type="success">Miễn phí</Text>
            )}

          </Space>
        );
      },
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date, record: TestWithExamInfo) => {
        const info = enrichExamInfo(record);
        return (
          <Space direction="vertical" size={0}>
            <Text>{date ? new Date(date).toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }) : 'Không xác định'}</Text>
          </Space>
        );
      },
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 180,
      render: (_, exam: TestWithExamInfo) => (
        <Space size="small" className="action-buttons">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showQuickView(exam)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(exam)}
            />
          </Tooltip>
          <Tooltip title="Thêm câu hỏi">
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => showAddQuestionsModal(exam)}
            />
          </Tooltip>
          <Tooltip title={exam.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              type="text"
              icon={exam.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(exam)}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa?"
            description="Bạn có chắc muốn xóa đề thi này không?"
            onConfirm={() => handleDeleteExam(exam.testId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ loading: isDeleting }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredData = exams.filter(exam => {
    const info = enrichExamInfo(exam);
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return exam.status === 'ACTIVE';
    if (activeTab === 'inactive') return exam.status === 'INACTIVE';
    return true;
  }).filter(exam => {
    const info = enrichExamInfo(exam);
    if (!searchText) return true;
    return (
      exam.title.toLowerCase().includes(searchText.toLowerCase()) ||
      info.subject.toLowerCase().includes(searchText.toLowerCase()) ||
      info.author.toLowerCase().includes(searchText.toLowerCase())
    );
  }).filter(exam => {
    const info = enrichExamInfo(exam);
    if (filterSubject === 'all') return true;
    return info.subject === filterSubject;
  });

  // Column definitions for deleted exams
  const deletedExamColumns: ColumnsType<TestWithExamInfo> = [
    // Reuse most columns from the main columns
    ...columns.filter(col => col.key !== 'actions').map(col => ({ ...col })),
    {
      title: 'Ngày xóa',
      dataIndex: 'deletedDate',
      key: 'deletedDate',
      width: 120,
      render: (date) => (
        <Text type="secondary">{date || 'N/A'}</Text>
      ),
      sorter: (a, b) => {
        if (!a.deletedDate || !b.deletedDate) return 0;
        return new Date(a.deletedDate).getTime() - new Date(b.deletedDate).getTime()
      },
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, exam: TestWithExamInfo) => (
        <Space size="small" className="action-buttons">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showQuickView(exam)}
            />
          </Tooltip>
          <Tooltip title="Khôi phục">
            <Button
              type="text"
              icon={<ImportOutlined />}
              onClick={() => handleRestoreExam(exam.testId)}
              loading={isRestoring}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Thống kê
  const totalExams = exams.length;
  const activeExams = exams.filter(e => e.status === 'ACTIVE').length;
  const freeExams = exams.filter(e => e.examType === 'FREE').length;
  const totalAttempts = exams.length > 0 ?
    exams.reduce((acc, exam) => acc + enrichExamInfo(exam).itemCount, 0) : 0;
  const totalRevenue = exams.length > 0 ?
    exams.reduce((acc, exam) => acc + (exam.price * enrichExamInfo(exam).itemCount), 0) : 0;

  const handleDeleteExam = async (examId: number) => {
    setIsDeleting(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_DELETE_EXAM}/${examId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi xóa đề thi!');
      }

      message.success('Đã xóa đề thi thành công!');
      fetchExams(); // Refresh danh sách đề thi
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Đã xảy ra lỗi không mong muốn.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (exam: TestWithExamInfo) => {
    setIsAdding(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/tests/toggle-status/${exam.testId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Lỗi thay đổi trạng thái đề thi!');
      }

      // Tính toán trạng thái mới dựa trên trạng thái hiện tại
      const newStatus = exam.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      message.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'} đề thi thành công!`);
      fetchExams(); // Refresh danh sách đề thi
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Đã xảy ra lỗi không mong muốn.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đề thi để xóa!');
      return;
    }

    setIsDeleting(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      // Xóa lần lượt từng đề thi đã chọn
      const promises = selectedRowKeys.map(key =>
        fetch(`${ADMIN_DELETE_EXAM}/${key}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const results = await Promise.allSettled(promises);
      const rejectedCount = results.filter(result => result.status === 'rejected').length;

      if (rejectedCount > 0) {
        message.warning(`Không thể xóa ${rejectedCount}/${selectedRowKeys.length} đề thi.`);
      } else {
        message.success('Đã xóa tất cả đề thi đã chọn!');
      }

      setSelectedRowKeys([]);
      fetchExams(); // Refresh danh sách đề thi
    } catch (error) {
      message.error("Đã xảy ra lỗi khi xóa đề thi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreExam = async (examId: number) => {
    setIsRestoring(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_RESTORE_EXAM}/${examId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khôi phục đề thi!');
      }

      message.success('Đã khôi phục đề thi thành công!');
      fetchDeletedExams(); // Refresh danh sách đề thi đã xóa
      fetchExams(); // Cập nhật cả danh sách đề thi hoạt động
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Đã xảy ra lỗi không mong muốn.");
      }
    } finally {
      setIsRestoring(false);
    }
  };
  const questionColumns = [
    {
      title: 'Câu hỏi',
      dataIndex: 'content',
      key: 'content',
      render: (text: string) => (
        <div dangerouslySetInnerHTML={{ __html: text }} />
      )
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeInfo = QUESTION_TYPES.find(t => t.value === type) ||
          { value: type, label: type, color: 'default' };
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      }
    },
    {
      title: 'Độ khó',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => {
        const levelText = level === '1' ? 'Dễ' : level === '2' ? 'TB' : level === '3' ? 'Khó' : level;
        const colorMap: { [key: string]: string } = {
          '1': 'success',
          '2': 'warning',
          '3': 'error'
        };
        return <Tag color={colorMap[level] || 'default'}>{levelText}</Tag>;
      }
    }
  ];
  const handleBatchRestore = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đề thi để khôi phục!');
      return;
    }

    setIsRestoring(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      // Khôi phục lần lượt từng đề thi đã chọn
      const promises = selectedRowKeys.map(key =>
        fetch(`${ADMIN_RESTORE_EXAM}/${key}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const results = await Promise.allSettled(promises);
      const rejectedCount = results.filter(result => result.status === 'rejected').length;

      if (rejectedCount > 0) {
        message.warning(`Không thể khôi phục ${rejectedCount}/${selectedRowKeys.length} đề thi.`);
      } else {
        message.success('Đã khôi phục tất cả đề thi đã chọn!');
      }

      setSelectedRowKeys([]);
      fetchDeletedExams(); // Refresh danh sách đề thi đã xóa
      fetchExams(); // Cập nhật cả danh sách đề thi hoạt động
    } catch (error) {
      message.error("Đã xảy ra lỗi khi khôi phục đề thi.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExportDocx = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một đề thi để xuất!');
      return;
    }

    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      if (!token) return;

      const response = await fetch(`${ADMIN_EXPORT_DOCX}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examIds: selectedRowKeys
        })
      });

      if (response.ok) {
        // Get the file as a blob
        const blob = await response.blob();
        // Create a local URL for the blob
        const url = window.URL.createObjectURL(blob);
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        // Get filename from Content-Disposition or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition ?
          contentDisposition.split('filename=')[1].replace(/"/g, '') :
          'exams.docx';
        a.download = filename;
        // Trigger download
        document.body.appendChild(a);
        a.click();
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success("Tải xuống file DOCX thành công!");
      } else {
        const errorText = await response.text();
        message.error(`Có lỗi xảy ra khi tải xuống file DOCX: ${errorText}`);
      }
    } catch (error) {
      console.error("Error exporting to DOCX:", error);
      message.error("Có lỗi xảy ra khi tải xuống file DOCX");
    }
  };
  return (
    <div>
      <style>{`
        .ck-editor__editable {
          min-height: 150px !important;
          max-height: 400px !important;
          padding: 0 12px !important;
          border: 1px solid #d9d9d9 !important;
          border-radius: 4px !important;
        }
        
        .exam-description {
          padding: 12px;
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          background-color: #fafafa;
          margin-bottom: 16px;
        }
        
        .exam-description h1,
        .exam-description h2,
        .exam-description h3 {
          margin-top: 12px;
          margin-bottom: 8px;
        }
        
        .exam-description ul,
        .exam-description ol {
          padding-left: 24px;
          margin-bottom: 12px;
        }
        
        .exam-description p {
          margin-bottom: 12px;
        }
        
        .exam-description img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
      <Title level={2}>Đề thi thử</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng số đề thi"
              value={totalExams}
              prefix={<FormOutlined />}
              suffix={<small style={{ fontSize: '15px', marginLeft: '8px' }}>({activeExams} hoạt động)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng lượt mua"
              value={totalAttempts}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Đề thi miễn phí"
              value={freeExams}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix={<small style={{ fontSize: '15px', marginLeft: '8px' }}>({((freeExams / totalExams) * 100).toFixed(0)}%)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
              >
                Tạo đề thi thử mới
              </Button>
              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title="Xác nhận xóa?"
                  description={`Bạn có muốn xóa ${selectedRowKeys.length} đề thi đã chọn không?`}
                  onConfirm={handleBatchDelete}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ loading: isDeleting }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Xóa ({selectedRowKeys.length})
                  </Button>
                </Popconfirm>
              )}              <Button icon={<FileWordOutlined />} onClick={handleExportDocx}>
                Xuất DOCX ({selectedRowKeys.length})
              </Button>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm đề thi..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select
                defaultValue=""
                style={{ width: 160 }}
                onChange={handleCourseChange}
                placeholder="Chọn môn học"
              >
                <Option value="">Tất cả môn học</Option>
                {courses.map(course => (
                  <Option key={course.id} value={course.id.toString()}>{course.title}</Option>
                ))}
              </Select>
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab={<span>Tất cả đề thi</span>} key="all">
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: rowsPerPage,
                  current: page,
                  total: totalElements,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showSizeChanger: true,
                  onChange: (newPage, newPageSize) => {
                    setPage(newPage);
                    if (newPageSize) {
                      setRowsPerPage(newPageSize);
                    }
                  },
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đề thi`
                }}
              />
            </TabPane>
            <TabPane
              tab={
                <Badge count={exams.filter(e => e.status === 'ACTIVE').length} showZero>
                  <span>Đang hoạt động</span>
                </Badge>
              }
              key="active"
            >
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: rowsPerPage,
                  current: page,
                  total: totalElements,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showSizeChanger: true,
                  onChange: (newPage, newPageSize) => {
                    setPage(newPage);
                    if (newPageSize) {
                      setRowsPerPage(newPageSize);
                    }
                  },
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đề thi`
                }}
              />
            </TabPane>            <TabPane
              tab={
                <Badge count={exams.filter(e => e.status === 'INACTIVE').length} showZero>
                  <span>Không hoạt động</span>
                </Badge>
              }
              key="inactive"
            >
              <Table
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                rowSelection={rowSelection}
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: rowsPerPage,
                  current: page,
                  total: totalElements,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showSizeChanger: true,
                  onChange: (newPage, newPageSize) => {
                    setPage(newPage);
                    if (newPageSize) {
                      setRowsPerPage(newPageSize);
                    }
                  },
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đề thi`
                }}
              />
            </TabPane>
            <TabPane
              tab={
                <Badge count={totalDeletedElements} showZero>
                  <span>Đã xóa</span>
                </Badge>
              }
              key="deleted"
            >
              <div style={{ marginBottom: 16 }}>
                {activeTab === 'deleted' && (
                  <Space>
                    {selectedRowKeys.length > 0 && (
                      <Popconfirm
                        title="Xác nhận khôi phục?"
                        description={`Bạn có muốn khôi phục ${selectedRowKeys.length} đề thi đã chọn không?`}
                        onConfirm={handleBatchRestore}
                        okText="Khôi phục"
                        cancelText="Hủy"
                        okButtonProps={{ loading: isRestoring }}
                      >
                        <Button
                          type="primary"
                          ghost
                          icon={<ImportOutlined />}
                        >
                          Khôi phục ({selectedRowKeys.length})
                        </Button>
                      </Popconfirm>
                    )}
                    <Alert
                      message="Đây là các đề thi đã bị xóa"
                      description="Bạn có thể khôi phục lại các đề thi này nếu cần thiết."
                      type="warning"
                      showIcon
                      style={{ marginBottom: 0 }}
                    />
                  </Space>
                )}
              </div>
              <Table
                columns={deletedExamColumns}
                dataSource={deletedExams}
                rowKey="id"
                loading={loadingDeleted}
                rowSelection={{
                  ...rowSelection,
                  getCheckboxProps: (record) => ({
                    disabled: false, // You can add conditions if needed
                  }),
                }}
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: deletedRowsPerPage,
                  current: deletedPage,
                  total: totalDeletedElements,
                  pageSizeOptions: ['5', '10', '20', '50'],
                  showSizeChanger: true, onChange: (newPage, newPageSize) => {
                    setDeletedPage(newPage);
                    if (newPageSize) setDeletedRowsPerPage(newPageSize);
                  },
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đề thi đã xóa`
                }}
              />
            </TabPane>
          </Tabs>
        </Space>
      </Card>

      <Modal
        title="Tạo đề thi thử mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleCreateMockExam} loading={isAdding}>
            Tạo
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="create_mock_exam_form"
          initialValues={{
            status: 'ACTIVE',
            examType: 'FEE',
            level: 'MEDIUM',
            duration: 45,
            totalQuestion: 40,
            easyQuestion: 16,
            mediumQuestion: 16,
            hardQuestion: 8,
            point: 0,
            price: 0,
            cost: 0,
            type: ['multiple-choice']
          }}
        >
          <Form.Item
            name="title"
            label="Tên đề thi thử"
            rules={[
              { required: true, message: 'Vui lòng nhập tên đề thi thử!' },
              { min: 5, message: 'Tên đề thi phải có ít nhất 5 ký tự!' },
              { max: 200, message: 'Tên đề thi không được vượt quá 200 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên đề thi thử" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="courseId"
                label="Môn học"
                rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
              >
                <Select placeholder="Chọn môn học">
                  {courses.map(course => (
                    <Option key={course.id} value={course.id}>{course.title}</Option>
                  ))}
                </Select>
              </Form.Item>

            </Col>

          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="level"
                label="Độ khó"
                rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
              >
                <Select placeholder="Chọn độ khó">
                  <Option value="EASY">Dễ</Option>
                  <Option value="MEDIUM">Trung bình</Option>
                  <Option value="HARD">Khó</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="totalQuestion"
                label="Số câu hỏi"
                rules={[
                  { required: true, message: 'Vui lòng nhập số câu hỏi!' }

                ]}
              >
                <Input type="number" placeholder="Nhập số câu hỏi" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="duration"
                label="Thời gian làm bài (phút)"
                rules={[
                  { required: true, message: 'Vui lòng nhập thời gian!' }

                ]}
              >
                <Input type="number" placeholder="Nhập thời gian" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="point"
                label="Điểm cộng"
                rules={[
                  { required: true, message: 'Vui lòng nhập điểm cộng!' },
                  { type: 'number', min: 0, message: 'Điểm cộng không được âm!' }
                ]}
              >
                <Input type="number" placeholder="Nhập điểm cộng" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="examType"
                label="Loại đề thi"
                rules={[{ required: true, message: 'Vui lòng chọn loại đề thi!' }]}
              >
                <Select placeholder="Chọn loại đề thi">
                  <Option value="FREE">Miễn phí</Option>
                  <Option value="FEE">Trả phí</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="cost"
                label="Giá niêm yết (đ)"

              >
                <Input type="number" placeholder="Nhập giá niêm yết" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Giá bán (đ)"

              >
                <Input type="number" placeholder="Nhập giá bán" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="type"
            label="Loại câu hỏi"
            rules={[{
              required: true,
              message: 'Vui lòng chọn ít nhất một loại câu hỏi!',
              type: 'array',
              min: 1
            }]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                <Col span={6}>
                  <Checkbox value="multiple-choice">Trắc nghiệm</Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value="essay">Tự luận</Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value="fill-in-the-blank">Điền khuyết</Checkbox>
                </Col>
                <Col span={6}>
                  <Checkbox value="checkbox">Nhiều lựa chọn</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="easyQuestion"
                label="Số câu dễ"
                rules={[
                  { required: true, message: 'Vui lòng nhập số câu dễ!' },

                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const total = getFieldValue('totalQuestion') || 0;
                      const medium = getFieldValue('mediumQuestion') || 0;
                      const hard = getFieldValue('hardQuestion') || 0;
                      const sum = Number(value) + Number(medium) + Number(hard);
                      if (sum > total) {
                        return Promise.reject(new Error(`Tổng số câu (${sum}) vượt quá số câu hỏi (${total})!`));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="number" placeholder="Nhập số câu dễ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mediumQuestion"
                label="Số câu trung bình"
                rules={[
                  { required: true, message: 'Vui lòng nhập số câu trung bình!' },

                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const total = getFieldValue('totalQuestion') || 0;
                      const easy = getFieldValue('easyQuestion') || 0;
                      const hard = getFieldValue('hardQuestion') || 0;
                      const sum = Number(easy) + Number(value) + Number(hard);
                      if (sum > total) {
                        return Promise.reject(new Error(`Tổng số câu (${sum}) vượt quá số câu hỏi (${total})!`));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="number" placeholder="Nhập số câu trung bình" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="hardQuestion"
                label="Số câu khó"
                rules={[
                  { required: true, message: 'Vui lòng nhập số câu khó!' },

                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const total = getFieldValue('totalQuestion') || 0;
                      const easy = getFieldValue('easyQuestion') || 0;
                      const medium = getFieldValue('mediumQuestion') || 0;
                      const sum = Number(easy) + Number(medium) + Number(value);
                      if (sum > total) {
                        return Promise.reject(new Error(`Tổng số câu (${sum}) vượt quá số câu hỏi (${total})!`));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input type="number" placeholder="Nhập số câu khó" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="intro"
            label="Giới thiệu"
            rules={[
              { max: 2000, message: 'Mô tả không được vượt quá 2000 ký tự!' }
            ]}
          >
            <div className="custom-ckeditor-container">
              <CKEditor
                editor={ClassicEditor as any}
                data={form.getFieldValue('intro') || ''}
                config={{
                  toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                  placeholder: 'Nhập giới thiệu về đề thi...',
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  form.setFieldsValue({ intro: data });
                }}
              />
            </div>
          </Form.Item>
          <Form.Item
            name="testContent"
            label="Nội dung đề thi"
            rules={[
              { max: 2000, message: 'Mô tả không được vượt quá 2000 ký tự!' }
            ]}
          >
            <div className="custom-ckeditor-container">
              <CKEditor
                editor={ClassicEditor as any}
                data={form.getFieldValue('testContent') || ''}
                config={{
                  toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                  placeholder: 'Nhập nội dung đề thi...',
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  form.setFieldsValue({ testContent: data });
                }}
              />
            </div>
          </Form.Item>
          <Form.Item
            name="knowledgeRequirement"
            label="Yêu cầu kiến thức"
            rules={[
              { max: 2000, message: 'Mô tả không được vượt quá 2000 ký tự!' }
            ]}
          >
            <div className="custom-ckeditor-container">
              <CKEditor
                editor={ClassicEditor as any}
                data={form.getFieldValue('knowledgeRequirement') || ''}
                config={{
                  toolbar: ['heading', '|', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo'],
                  placeholder: 'Nhập yêu cầu kiến thức về đề thi...',
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  form.setFieldsValue({ knowledgeRequirement: data });
                }}
              />
            </div>
          </Form.Item>

          <Col span={16}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="ACTIVE">Đang hoạt động</Option>
                <Option value="INACTIVE">Không hoạt động</Option>
              </Select>
            </Form.Item>
          </Col>
          <Form.Item
            name="imageUrl"
            label="Ảnh bìa đề thi"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
            rules={[
              {
                validator: (_, fileList) => {
                  if (fileList && fileList.length > 0 && fileList[0].originFileObj) {
                    const file = fileList[0].originFileObj;

                    const isImage = file.type?.startsWith('image/');
                    if (!isImage) {
                      return Promise.reject(new Error('Chỉ chấp nhận file ảnh!'));
                    }

                    const isLt2M = file.size / 1024 / 1024 < 2;
                    if (!isLt2M) {
                      return Promise.reject(new Error('Ảnh phải nhỏ hơn 2MB!'));
                    }
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Upload
              name="image"
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
              onPreview={async (file) => {
                if (!file.url && !file.preview) {
                  file.preview = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file.originFileObj as File);
                    reader.onload = () => resolve(reader.result as string);
                  });
                }
                const image = new Image();
                image.src = file.url || file.preview || '';
                const imgWindow = window.open(file.url || file.preview || '');
                imgWindow?.document.write(image.outerHTML);
              }}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.("ok");
                }, 0);
              }}
              onChange={(info) => {
                const isImage = info.file.type ? info.file.type.startsWith('image/') : false;
                if (!isImage) {
                  message.error('Bạn chỉ có thể tải lên file ảnh!');
                }
                return isImage;
              }}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            </Upload>

          </Form.Item>
        </Form>
      </Modal>

      {/* Quick View Modal */}
      <Modal
        title="Chi tiết đề thi"
        visible={quickViewVisible}
        onCancel={handleQuickViewCancel}
        footer={[
          <Button key="close" onClick={handleQuickViewCancel}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {currentExam && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>{currentExam.title}</Title>
                <Divider style={{ margin: '12px 0' }} />
              </Col>

              {enrichExamInfo(currentExam).imageUrl && (
                <Col span={24} style={{ marginBottom: 16, textAlign: 'center' }}>
                  <img
                    src={enrichExamInfo(currentExam).imageUrl}
                    alt={currentExam.title}
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                  />
                </Col>
              )}

              <Col span={12}>
                <Statistic title="Môn học" value={enrichExamInfo(currentExam).subject} />
              </Col>

              <Col span={8}>
                <Statistic title="Tổng số câu hỏi" value={currentExam.totalQuestion} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Độ khó"
                  value={enrichExamInfo(currentExam).level === 'EASY' ? 'Dễ' :
                    enrichExamInfo(currentExam).level === 'MEDIUM' ? 'Trung bình' : 'Khó'}
                />
              </Col>
              <Col span={8}>
                <Statistic title="Thời gian" value={`${secondsToMinutes(currentExam.duration)} phút`} />
              </Col>

              <Col span={24}>
                <Divider orientation="left">Phân bố câu hỏi</Divider>
              </Col>

              <Col span={8}>
                <Progress
                  type="circle"
                  percent={Math.round((currentExam.easyQuestion / currentExam.totalQuestion) * 100)}
                  format={() => `${currentExam.easyQuestion} câu`}
                  strokeColor="#52c41a"
                />
                <div style={{ textAlign: 'center', marginTop: 8 }}>Dễ</div>
              </Col>
              <Col span={8}>
                <Progress
                  type="circle"
                  percent={Math.round((currentExam.mediumQuestion / currentExam.totalQuestion) * 100)}
                  format={() => `${currentExam.mediumQuestion} câu`}
                  strokeColor="#faad14"
                />
                <div style={{ textAlign: 'center', marginTop: 8 }}>Trung bình</div>
              </Col>
              <Col span={8}>
                <Progress
                  type="circle"
                  percent={Math.round((currentExam.hardQuestion / currentExam.totalQuestion) * 100)}
                  format={() => `${currentExam.hardQuestion} câu`}
                  strokeColor="#f5222d"
                />
                <div style={{ textAlign: 'center', marginTop: 8 }}>Khó</div>
              </Col>

              <Col span={24}>
                <Divider orientation="left">Thông tin bổ sung</Divider>
              </Col>

              <Col span={12}>
                <Statistic
                  title="Giá bán"
                  value={enrichExamInfo(currentExam).price}
                  suffix="đ"
                  valueStyle={{ color: enrichExamInfo(currentExam).examType === 'FEE' ? '#cf1322' : '#52c41a' }}
                  prefix={<DollarOutlined />}
                />
                {enrichExamInfo(currentExam).cost > enrichExamInfo(currentExam).price && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Giá niêm yết: </Text>
                    <Text type="secondary" style={{ textDecoration: 'line-through' }}>
                      {enrichExamInfo(currentExam).cost.toLocaleString()}đ
                    </Text>
                  </div>
                )}
              </Col>


              <Col span={12}>
                <Statistic
                  title="Số lượt mua"
                  value={enrichExamInfo(currentExam).itemCount}
                  prefix={<TeamOutlined />}
                />
              </Col>


              <Col span={24}>
                <Divider orientation="left">Giới thiệu</Divider>
                <div className="exam-description" dangerouslySetInnerHTML={{ __html: currentExam.intro || '' }} />
              </Col>
              <Col span={24}>
                <Divider orientation="left">Nội dung đề thi</Divider>
                <div className="exam-description" dangerouslySetInnerHTML={{ __html: currentExam.testContent || '' }} />
              </Col>
              <Col span={24}>
                <Divider orientation="left">Yêu cầu kiến thức</Divider>
                <div className="exam-description" dangerouslySetInnerHTML={{ __html: currentExam.knowledgeRequirement || '' }} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa đề thi"
        visible={editModalVisible}
        onCancel={handleEditCancel}
        footer={[
          <Button key="back" onClick={handleEditCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditSubmit} loading={isAdding}>
            Lưu
          </Button>,
        ]}
        width={800}
      >
        {currentExam && (
          <Form
            form={editForm}
            layout="vertical"
            name="edit_mock_exam_form"
          >
            <Form.Item
              name="title"
              label="Tên đề thi thử"
              rules={[
                { required: true, message: 'Vui lòng nhập tên đề thi thử!' },
                { min: 5, message: 'Tên đề thi phải có ít nhất 5 ký tự!' },
                { max: 200, message: 'Tên đề thi không được vượt quá 200 ký tự!' }
              ]}
            >
              <Input placeholder="Nhập tên đề thi thử" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="courseId"
                  label="Môn học"
                  rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
                >
                  <Select placeholder="Chọn môn học">
                    {courses.map(course => (
                      <Option key={course.id} value={course.id}>{course.title}</Option>
                    ))}
                  </Select>
                </Form.Item>

              </Col>


            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="level"
                  label="Độ khó"
                  rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
                >
                  <Select placeholder="Chọn độ khó">
                    <Option value="EASY">Dễ</Option>
                    <Option value="MEDIUM">Trung bình</Option>
                    <Option value="HARD">Khó</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="totalQuestion"
                  label="Tổng số câu hỏi"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số câu hỏi!' }

                  ]}
                >
                  <Input type="number" placeholder="Nhập số câu hỏi" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="duration"
                  label="Thời gian làm bài (phút)"
                  rules={[
                    { required: true, message: 'Vui lòng nhập thời gian!' },

                  ]}
                >
                  <Input type="number" placeholder="Nhập thời gian" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="type"
              label="Loại câu hỏi"
              rules={[{
                required: true,
                message: 'Vui lòng chọn ít nhất một loại câu hỏi!',
                type: 'array',
                min: 1
              }]}
            >
              <Checkbox.Group style={{ width: '100%' }}>
                <Row>
                  <Col span={6}>
                    <Checkbox value="multiple-choice">Trắc nghiệm</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="essay">Tự luận</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="fill-in-the-blank">Điền khuyết</Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="checkbox">Nhiều lựa chọn</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="easyQuestion"
                  label="Số câu dễ"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số câu dễ!' },

                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const total = getFieldValue('totalQuestion') || 0;
                        const medium = getFieldValue('mediumQuestion') || 0;
                        const hard = getFieldValue('hardQuestion') || 0;
                        const sum = Number(value) + Number(medium) + Number(hard);
                        if (sum > total) {
                          return Promise.reject(new Error(`Tổng số câu (${sum}) vượt quá số câu hỏi (${total})!`));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input type="number" placeholder="Nhập số câu dễ" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="mediumQuestion"
                  label="Số câu trung bình"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số câu trung bình!' },

                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const total = getFieldValue('totalQuestion') || 0;
                        const easy = getFieldValue('easyQuestion') || 0;
                        const hard = getFieldValue('hardQuestion') || 0;
                        const sum = Number(easy) + Number(value) + Number(hard);
                        if (sum > total) {
                          return Promise.reject(new Error(`Tổng số câu (${sum}) vượt quá số câu hỏi (${total})!`));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input type="number" placeholder="Nhập số câu trung bình" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="hardQuestion"
                  label="Số câu khó"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số câu khó!' },

                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const total = getFieldValue('totalQuestion') || 0;
                        const easy = getFieldValue('easyQuestion') || 0;
                        const medium = getFieldValue('mediumQuestion') || 0;
                        const sum = Number(easy) + Number(medium) + Number(value);
                        if (sum > total) {
                          return Promise.reject(new Error(`Tổng số câu (${sum}) vượt quá số câu hỏi (${total})!`));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input type="number" placeholder="Nhập số câu khó" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="examType"
                  label="Loại đề thi"
                  rules={[{ required: true, message: 'Vui lòng chọn loại đề thi!' }]}
                >
                  <Select placeholder="Chọn loại đề thi">
                    <Option value="FREE">Miễn phí</Option>
                    <Option value="FEE">Trả phí</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="price"
                  label="Giá bán (đ)"
                >
                  {currentExam?.discountStatus ? (
                    <>
                      <Input type="number" placeholder="Nhập giá bán" disabled />
                      <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                        <Text type="danger">Đề thi đang được áp dụng giảm giá</Text>
                      </div>
                    </>
                  ) : (
                    <Input type="number" placeholder="Nhập giá bán" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="point"
                  label="Điểm cộng"
                  rules={[
                    { required: true, message: 'Vui lòng nhập điểm cộng!' }

                  ]}
                >
                  <Input type="number" placeholder="Nhập điểm cộng" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="cost"
                  label="Giá niêm yết (đ)"
                  rules={[

                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (getFieldValue('examType') === 'FEE' && (!value || value <= 0)) {
                          return Promise.reject(new Error('Vui lòng nhập giá niêm yết cho đề thi trả phí!'));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input type="number" placeholder="Nhập giá niêm yết" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Option value="ACTIVE">Đang hoạt động</Option>
                    <Option value="INACTIVE">Không hoạt động</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}></Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="imageUrl"
                  label="Ảnh bìa đề thi"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                >
                  <Upload
                    name="image"
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                    onPreview={async (file) => {
                      if (!file.url && !file.preview) {
                        file.preview = await new Promise((resolve) => {
                          const reader = new FileReader();
                          reader.readAsDataURL(file.originFileObj as File);
                          reader.onload = () => resolve(reader.result as string);
                        });
                      }
                      const image = new Image();
                      image.src = file.url || file.preview || '';
                      const imgWindow = window.open(file.url || file.preview || '');
                      imgWindow?.document.write(image.outerHTML);
                    }}
                    customRequest={({ file, onSuccess }) => {
                      setTimeout(() => {
                        onSuccess?.("ok");
                      }, 0);
                    }}
                    onChange={(info) => {
                      const isImage = info.file.type ? info.file.type.startsWith('image/') : false;
                      if (!isImage) {
                        message.error('Bạn chỉ có thể tải lên file ảnh!');
                      }
                      return isImage;
                    }}
                  >
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                    </div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>

      {/* Add Questions Modal */}
      <Modal
        title={`Thêm câu hỏi cho bài kiểm tra: ${currentExam?.title || ''}`}
        visible={addQuestionsVisible}
        onCancel={handleAddQuestionsCancel}
        footer={[
          <Button key="back" onClick={handleAddQuestionsCancel}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleAddQuestionsSubmit}
            loading={loading}
            disabled={activeQuestionsTab === 'manual' && selectedQuestions.length === 0}
          >
            Thêm câu hỏi
          </Button>,
        ]}
        width={1000}
        style={{ top: 20 }}
        centered
      >
        {currentExam && (
          <div>
            <Alert
              message={
                <>
                  <strong>Thông tin bài kiểm tra:</strong>
                  <ul style={{ margin: '10px 0 0 0', padding: '0 0 0 20px' }}>

                    <li>Môn học: {getCourseName(currentExam.courseId)}</li>

                    <li>Tổng số câu hỏi cần thêm: <strong>{currentExam.totalQuestion}</strong></li>
                    <li>Câu hỏi độ khó thấp: <strong>{currentExam.easyQuestion}</strong></li>
                    <li>Câu hỏi độ khó trung bình: <strong>{currentExam.mediumQuestion}</strong></li>
                    <li>Câu hỏi độ khó cao: <strong>{currentExam.hardQuestion}</strong></li>
                    <li>Loại câu hỏi: {
                      typeof currentExam.type === 'string'
                        ? currentExam.type
                        : Array.isArray(currentExam.type)
                          ? (currentExam.type as string[]).map((typeValue: string) => {
                            const typeInfo = QUESTION_TYPES.find(t => t.value === typeValue);
                            return typeInfo ? typeInfo.label : typeValue;
                          }).join(', ')
                          : currentExam.type
                    }</li>
                  </ul>
                </>
              }
              type="info"
              showIcon
              style={{ marginBottom: 20 }}
            />

            <Tabs defaultActiveKey="auto" activeKey={activeQuestionsTab} onChange={handleQuestionsTabChange}>
              <TabPane tab="Tự động" key="auto">
                <div>
                  <Alert
                    message="Tự động thêm câu hỏi vào bài kiểm tra dựa trên các tiêu chí"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  {/* <Form layout="vertical">
                    <Row gutter={24}>
                      <Col span={12}>
                        <Form.Item label="Chọn chủ đề" name="topic">
                          <Select
                            placeholder="Chọn chủ đề"
                            allowClear
                            mode="multiple"
                          >
                            <Option value="topic1">Chủ đề 1</Option>
                            <Option value="topic2">Chủ đề 2</Option>
                            <Option value="topic3">Chủ đề 3</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Ưu tiên câu hỏi" name="priority">
                          <Select placeholder="Ưu tiên câu hỏi" defaultValue="recent">
                            <Option value="recent">Câu hỏi mới nhất</Option>
                            <Option value="random">Ngẫu nhiên</Option>
                            <Option value="unused">Chưa sử dụng</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Form.Item label="Loại trừ câu hỏi đã sử dụng trong các bài kiểm tra:">
                          <Checkbox.Group>
                            <Row>
                              <Col span={8}>
                                <Checkbox value="chapter_test">Bài test chương</Checkbox>
                              </Col>
                              <Col span={8}>
                                <Checkbox value="lesson_test">Bài test thường</Checkbox>
                              </Col>
                              <Col span={8}>
                                <Checkbox value="final_test">Bài test tổng kết</Checkbox>
                              </Col>
                            </Row>
                          </Checkbox.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form> */}
                </div>
              </TabPane>
              <TabPane tab="Thủ công" key="manual">
                <div>
                  <Alert
                    message="Chọn thủ công các câu hỏi để thêm vào bài kiểm tra"
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Space size="middle">
                      <Search
                        placeholder="Tìm câu hỏi..."
                        allowClear
                        onSearch={handleQuestionsSearchChange}
                        style={{ width: 250 }}
                      />
                      <Select
                        placeholder="Độ khó"
                        style={{ width: 120 }}
                        onChange={handleQuestionsLevelFilterChange}
                        value={levelFilter}
                        defaultValue="all"
                      >
                        <Option value="all">Tất cả</Option>
                        <Option value="1">Dễ</Option>
                        <Option value="2">Trung bình</Option>
                        <Option value="3">Khó</Option>
                      </Select>
                      <Select
                        placeholder="Loại câu hỏi"
                        style={{ width: 150 }}
                        onChange={handleQuestionsTypeFilterChange}
                        value={typeFilter}
                        defaultValue="all"
                      >
                        <Option value="all">Tất cả</Option>
                        {QUESTION_TYPES.map((typeInfo) => (
                          <Option key={typeInfo.value} value={typeInfo.value}>
                            {typeInfo.label}
                          </Option>
                        ))}
                      </Select>
                    </Space>
                    <div style={{ minWidth: '240px', textAlign: 'right' }}>
                      <Space direction="vertical" size={5} style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Tag color="purple">
                          Câu hỏi hiện có: {questionTest.length}
                        </Tag>
                        <Badge
                          count={selectedQuestions.length}
                          style={{ backgroundColor: selectedQuestions.length > 0 ? '#52c41a' : '#d9d9d9' }}
                        >
                          <Tag color="blue">Đã chọn {selectedQuestions.length} câu hỏi</Tag>
                        </Badge>
                      </Space>
                    </div>
                  </div>
                  <Table
                    columns={questionColumns}
                    dataSource={questions}
                    rowKey="id"
                    loading={loading}
                    rowSelection={{
                      type: 'checkbox',
                      selectedRowKeys: selectedQuestions.map(q => q.id),
                      onSelect: (record, selected) => {
                        if (selected) {
                          setSelectedQuestions(prev => [...prev, { id: record.id, level: record.level, type: record.type }]);
                        } else {
                          setSelectedQuestions(prev => prev.filter(q => q.id !== record.id));
                        }
                      },
                      onSelectAll: (selected, selectedRows, changeRows) => {
                        if (selected) {
                          const newSelected = changeRows.map(row => ({ id: row.id, level: row.level, type: row.type }));
                          setSelectedQuestions(prev => {
                            const map = new Map(prev.map(q => [q.id, q]));
                            newSelected.forEach(q => map.set(q.id, q));
                            return Array.from(map.values());
                          });
                        } else {
                          const unselectedIds = changeRows.map(row => row.id);
                          setSelectedQuestions(prev => prev.filter(q => !unselectedIds.includes(q.id)));
                        }
                      },
                      getCheckboxProps: record => ({
                        // Add a special style to highlight existing questions, but allow deselection
                        style: questionTest.some(q => q.id === record.id) ? { backgroundColor: '#f0f5ff' } : {}
                      })
                    }}
                    scroll={{ x: 800, y: 500 }}
                    pagination={{
                      current: questionPage + 1,
                      pageSize: questionPageSize,
                      total: totalQuestionsCount,
                      onChange: handleQuestionPageChange,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '15', '20', '50'],
                      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} câu hỏi`
                    }}
                  />
                </div>
              </TabPane>

            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Mock questions data
const mockQuestions: Question[] = [
  {
    id: 'q1',
    content: 'Tìm giới hạn của hàm số $\\lim_{x \\to 0}\\frac{\\sin x}{x}$',
    difficulty: 'medium',
    type: 'Trắc nghiệm',
    subject: 'Toán',
    answers: [
      { id: 'a1', content: '$0$', isCorrect: false },
      { id: 'a2', content: '$1$', isCorrect: true },
      { id: 'a3', content: '$\\infty$', isCorrect: false },
      { id: 'a4', content: 'Không tồn tại', isCorrect: false },
    ],
    createdAt: '2023-08-15',
  },
  {
    id: 'q2',
    content: 'Đạo hàm của hàm số $f(x) = x^2$ là:',
    difficulty: 'easy',
    type: 'Trắc nghiệm',
    subject: 'Toán',
    answers: [
      { id: 'a1', content: '$f\'(x) = 2x$', isCorrect: true },
      { id: 'a2', content: '$f\'(x) = x^2$', isCorrect: false },
      { id: 'a3', content: '$f\'(x) = 2$', isCorrect: false },
      { id: 'a4', content: '$f\'(x) = x$', isCorrect: false },
    ],
    createdAt: '2023-08-10',
  },
  {
    id: 'q3',
    content: 'Trong các hàm số sau, hàm số nào không có đạo hàm tại $x = 0$?',
    difficulty: 'hard',
    type: 'Trắc nghiệm',
    subject: 'Toán',
    answers: [
      { id: 'a1', content: '$f(x) = |x|$', isCorrect: true },
      { id: 'a2', content: '$f(x) = x^2$', isCorrect: false },
      { id: 'a3', content: '$f(x) = \\sin x$', isCorrect: false },
      { id: 'a4', content: '$f(x) = e^x$', isCorrect: false },
    ],
    createdAt: '2023-09-05',
  },
  {
    id: 'q4',
    content: 'Trong chân không, ánh sáng di chuyển với vận tốc:',
    difficulty: 'easy',
    type: 'Trắc nghiệm',
    subject: 'Vật lý',
    answers: [
      { id: 'a1', content: '$3 \\times 10^7$ m/s', isCorrect: false },
      { id: 'a2', content: '$3 \\times 10^8$ m/s', isCorrect: true },
      { id: 'a3', content: '$3 \\times 10^9$ m/s', isCorrect: false },
      { id: 'a4', content: '$3 \\times 10^6$ m/s', isCorrect: false },
    ],
    createdAt: '2023-07-20',
  },
  {
    id: 'q5',
    content: 'Đơn vị đo điện trở là:',
    difficulty: 'easy',
    type: 'Trắc nghiệm',
    subject: 'Vật lý',
    answers: [
      { id: 'a1', content: 'Volt (V)', isCorrect: false },
      { id: 'a2', content: 'Ampere (A)', isCorrect: false },
      { id: 'a3', content: 'Ohm (Ω)', isCorrect: true },
      { id: 'a4', content: 'Watt (W)', isCorrect: false },
    ],
    createdAt: '2023-07-15',
  },
  {
    id: 'q6',
    content: 'Nguyên tố nào có số nguyên tử là 6?',
    difficulty: 'easy',
    type: 'Trắc nghiệm',
    subject: 'Hóa học',
    answers: [
      { id: 'a1', content: 'Oxy (O)', isCorrect: false },
      { id: 'a2', content: 'Nitơ (N)', isCorrect: false },
      { id: 'a3', content: 'Carbon (C)', isCorrect: true },
      { id: 'a4', content: 'Bo (B)', isCorrect: false },
    ],
    createdAt: '2023-06-20',
  },
  {
    id: 'q7',
    content: 'Một hệ thống được gọi là axit theo thuyết Bronsted-Lowry khi nó:',
    difficulty: 'medium',
    type: 'Trắc nghiệm',
    subject: 'Hóa học',
    answers: [
      { id: 'a1', content: 'Nhận proton', isCorrect: false },
      { id: 'a2', content: 'Nhận electron', isCorrect: false },
      { id: 'a3', content: 'Cho proton', isCorrect: true },
      { id: 'a4', content: 'Cho electron', isCorrect: false },
    ],
    createdAt: '2023-06-15',
  },
  {
    id: 'q8',
    content: 'DNA là viết tắt của:',
    difficulty: 'easy',
    type: 'Trắc nghiệm',
    subject: 'Sinh học',
    answers: [
      { id: 'a1', content: 'Deoxyribonucleic Acid', isCorrect: true },
      { id: 'a2', content: 'Diribonucleic Acid', isCorrect: false },
      { id: 'a3', content: 'Deoxyribose Nucleic Acid', isCorrect: false },
      { id: 'a4', content: 'Deoxyribonuclear Acid', isCorrect: false },
    ],
    createdAt: '2023-05-20',
  },
  {
    id: 'q9',
    content: 'Which of the following is NOT a fruit?',
    difficulty: 'medium',
    type: 'Trắc nghiệm',
    subject: 'Tiếng Anh',
    answers: [
      { id: 'a1', content: 'Apple', isCorrect: false },
      { id: 'a2', content: 'Banana', isCorrect: false },
      { id: 'a3', content: 'Carrot', isCorrect: true },
      { id: 'a4', content: 'Orange', isCorrect: false },
    ],
    createdAt: '2023-04-20',
  },
  {
    id: 'q10',
    content: 'Tác phẩm "Truyện Kiều" được Nguyễn Du sáng tác vào khoảng thời gian nào?',
    difficulty: 'medium',
    type: 'Trắc nghiệm',
    subject: 'Ngữ văn',
    answers: [
      { id: 'a1', content: 'Cuối thế kỷ XVIII - đầu thế kỷ XIX', isCorrect: true },
      { id: 'a2', content: 'Giữa thế kỷ XVIII', isCorrect: false },
      { id: 'a3', content: 'Giữa thế kỷ XIX', isCorrect: false },
      { id: 'a4', content: 'Cuối thế kỷ XVII - đầu thế kỷ XVIII', isCorrect: false },
    ],
    createdAt: '2023-03-15',
  },
];

export default MockExamsPage;