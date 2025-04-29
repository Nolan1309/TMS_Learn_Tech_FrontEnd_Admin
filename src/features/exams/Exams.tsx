import React, { useState, useEffect } from 'react';
import {
  Typography, Table, Button, Space, Card, Input, Tag, Dropdown,
  Menu, Select, DatePicker, Modal, Form, Tabs, Tooltip,
  Divider, Badge, Popconfirm, message, Switch, Row, Col, Checkbox, Descriptions, Alert
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, ImportOutlined, ExportOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import useRefreshToken from '../../utils/useRefreshToken';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authTokenLogin } from '../../utils/auth';

export const ADMIN_GET_CHAPTERS_LIST = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/admin-all`;
export const ADMIN_ADD_TEST = `${process.env.REACT_APP_SERVER_HOST}/api/tests/add`;
export const ADMIN_PUT_DELETE_TEST_CLEAR = `${process.env.REACT_APP_SERVER_HOST}/api/tests/delete`;
export const ADMIN_ADD_QUESTION_TO_TEST_V2 = `${process.env.REACT_APP_SERVER_HOST}/api/test-questions/add-questions-v2`;
export const ADMIN_REMOVE_QUESTION_FROM_TEST = `${process.env.REACT_APP_SERVER_HOST}/api/test-questions/delete`;

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// Question type mapping constants
const QUESTION_TYPES = [
  { value: 'multiple-choice', label: 'Trắc nghiệm', color: 'blue' },
  { value: 'essay', label: 'Tự luận', color: 'purple' },
  { value: 'fill-in-the-blank', label: 'Điền khuyết', color: 'green' },
  { value: 'checkbox', label: 'Nhiều lựa chọn', color: 'orange' }
];

interface Exam {
  id: string;
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

interface Chapter {
  id: number;
  title: string;
  course_id: number;
  deleted: boolean;
}

interface Lesson {
  id: number;
  createdAt: string;
  duration: number;
  lessonTitle: string;
  updatedAt: string;
  chapterId: number;
  courseId: number;
  deletedDate: string;
  isDeleted: boolean;
  isTestExcluded: string;
  topic: string | null;
  status: string | null;
}
export interface AdminLessonDTOList {
  id: number;
  createdAt: string; // ISO Date format
  duration: number;
  lessonTitle: string;
  updatedAt: string;
  chapterId: number;
  courseId: number;
  deletedDate: string | null; // Có thể null
  isDeleted: boolean;
  isTestExcluded: string;
  topic: string;
  status: boolean;
}
interface SelectedQuestion {
  id: number;
  level: string;
  type: string;
}



const ExamsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [adding, setAdding] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isAddQuestionsModalVisible, setIsAddQuestionsModalVisible] = useState<boolean>(false);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [editForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedExams, setSelectedExams] = useState<React.Key[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Exams state
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectCourse, setSelectCourse] = useState<string>('');

  // Test questions state
  const [questionTest, setQuestionTest] = useState<any[]>([]);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);

  // Chapters and Lessons state
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsALL, setLessonsALL] = useState<Lesson[]>([]);
  const [lessonDetail, setLessonDetail] = useState<AdminLessonDTOList[]>([]);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<number | null>(null);
  const [selectedChapterForModal, setSelectedChapterForModal] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const [activeQuestionsTab, setActiveQuestionsTab] = useState<string>('auto');
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);
  const [questionPage, setQuestionPage] = useState<number>(0);
  const [questionPageSize, setQuestionPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    fetchCourseList();
    fetchExams();
    if (selectCourse) {
      fetchChapters(Number(selectCourse));
      fetchLessonAll(selectCourse);
    }
  }, [page, rowsPerPage, searchText, selectCourse]);

  // Effect to fetch chapters when a course is selected in the modal
  useEffect(() => {
    if (selectedCourseForModal) {
      fetchChapters(selectedCourseForModal);
    }
  }, [selectedCourseForModal]);

  // Effect to fetch lessons when a chapter is selected in the modal
  useEffect(() => {
    if (selectedChapterForModal) {
      fetchLessons(selectedChapterForModal);
    }
  }, [selectedChapterForModal]);

  // Chạy lại fetch khi bộ lọc thay đổi
  useEffect(() => {
    if (currentExam) { // chỉ fetch khi đang có bài kiểm tra hiện hành
      fetchQuestionsWithFilters();
    }
  }, [typeFilter, levelFilter, searchTerm, questionPage, questionPageSize]);

  useEffect(() => {
    if (currentExam && questionTest.length > 0 && questions.length > 0) {
      // Find questions that already exist in the test and select them
      const existingQuestionIds = questionTest.map(q => q.id);
      const existingSelectedQuestions = questions
        .filter(q => existingQuestionIds.includes(q.id))
        .map(q => ({ id: q.id, level: q.level, type: q.type }));
      
      // Update selected questions to include existing ones
      setSelectedQuestions(prev => {
        // Create a map of current selections to avoid duplicates
        const selectionMap = new Map(prev.map(q => [q.id, q]));
        // Add existing questions
        existingSelectedQuestions.forEach(q => selectionMap.set(q.id, q));
        return Array.from(selectionMap.values());
      });
    }
  }, [questionTest, questions, currentExam]);


  const fetchCourseList = async () => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/get-all-result-list`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch course data");
      }
      const data: Course[] = await response.json();
      setCourses(data);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      message.error("Không thể tải danh sách môn học");
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (courseId: number) => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      const response = await fetch(
        ADMIN_GET_CHAPTERS_LIST,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chapters data");
      }
      const data = await response.json();
      // Filter chapters by courseId
      const filteredChapters = data.filter(
        (chapter: any) => chapter.course_id === courseId
      );
      setChapters(filteredChapters);
    } catch (error: any) {
      console.error("Failed to fetch chapters:", error);
      toast.error("Không thể tải danh sách chương");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (chapterId: number) => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    const searchParams = new URLSearchParams({
      courseId: selectedCourseForModal ? selectedCourseForModal.toString() : "",
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/lessons/chapter/${chapterId}?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch lessons data");
      }
      const data = await response.json();
      setLessons(data);
    } catch (error: any) {
      console.error("Failed to fetch lessons:", error);
      toast.error("Không thể tải danh sách bài học");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonAll = async (courseId: string) => {
    console.log(`Fetching all lessons for course ID: ${courseId}`);
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/lessons/course/${courseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch all lessons data: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Received ${Array.isArray(data) ? data.length : 0} lessons for course ID ${courseId}:`, data);

      // Ensure data is an array before setting it
      if (Array.isArray(data.data)) {
        setLessonsALL(data.data);
      } else {
        console.error("API returned non-array lessons data:", data);
        setLessonsALL([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch all lessons:", error);
      toast.error("Không thể tải tất cả danh sách bài học");
      // Set to empty array on error
      setLessonsALL([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async () => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    const params = new URLSearchParams({
      ...(selectCourse && { courseId: selectCourse }),
      ...(searchText && { title: searchText }),
      page: page.toString(),
      size: rowsPerPage.toString(),
    });
    const url = `${process.env.REACT_APP_SERVER_HOST || 'http://localhost:8080'}/api/tests/filter-all?${params.toString()}`;

    try {
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
      setExams(data.content || []);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      message.error("Không thể tải danh sách bài kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy tên môn học dựa vào courseId
  const getCourseName = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Chưa xác định';
  };

  // Hàm lấy tên chương dựa vào chapterId
  const getChapterName = (chapterId: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    return chapter ? chapter.title : 'Chưa xác định';
  };

  // Hàm lấy tên bài học dựa vào lessonId
  const getLessonName = (lessonId: number) => {
    // Try to find in lessonsALL first
    if (Array.isArray(lessonsALL) && lessonsALL.length > 0) {
      const lesson = lessonsALL.find(l => l.id === lessonId);
      if (lesson) return lesson.lessonTitle;
    }
    return 'Chưa xác định';
  };

  // Add additional properties for UI display
  const examData = exams.map(exam => {
    const chapterName = exam.chapterId > 0 ? getChapterName(exam.chapterId) : '';
    const lessonName = exam.lessonId != null ? getLessonName(exam.lessonId) : '';
    return {
      ...exam,
      examType: exam.lessonId == null && exam.summary ? 'chapter' :
        exam.lessonId != null && !exam.summary ? 'lesson' : 'other',
      courseName: getCourseName(exam.courseId),
      chapterName: chapterName,
      lessonName: lessonName
    };
  });

  const getQuestionTypeTag = (types: string[]) => {
    // Using the QUESTION_TYPES constant with short abbreviations
    return (
      <Space size={2}>
        {types.map(t => {
          const typeInfo = QUESTION_TYPES.find(qt => qt.value === t);
          const shortName = typeInfo ?
            typeInfo.label.split(' ').map(word => word[0]).join('') :
            t.substring(0, 2).toUpperCase();
          return (
            <Tooltip key={t} title={typeInfo ? typeInfo.label : t}>
              <Tag color={typeInfo ? typeInfo.color : 'default'} style={{ margin: 0, padding: '0 4px', cursor: 'help' }}>
                {shortName}
              </Tag>
            </Tooltip>
          );
        })}
      </Space>
    );
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(0); // Reset to first page when searching
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handlePageChange = (pageNumber: number, pageSize: number) => {
    setPage(pageNumber - 1); // API uses 0-based indexing
    setRowsPerPage(pageSize);
  };

  const handleCourseChange = (value: string) => {
    setSelectCourse(value);
    setPage(0); // Reset to first page when changing course
  };

  const handleCourseChangeInModal = (value: number) => {
    setSelectedCourseForModal(value);
    form.setFieldsValue({ chapterId: undefined, lessonId: undefined });
    setSelectedChapterForModal(null);
  };

  const handleChapterChangeInModal = (value: number) => {
    setSelectedChapterForModal(value);
    form.setFieldsValue({ lessonId: undefined });
  };

  const handleLessonChangeInModal = (value: number) => {
    setSelectedLesson(value);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const validateForm = () => {
    // Get all form values
    const {
      title,
      type,
      duration,
      totalQuestion,
      easyQuestion,
      mediumQuestion,
      hardQuestion,
      courseId,
      chapterId,
      point,
      description
    } = form.getFieldsValue();

    // Validate required fields (except lessonId which can be null)
    if (!title || !type || !type.length || !duration || !totalQuestion ||
      !easyQuestion || !mediumQuestion || !hardQuestion || !courseId ||
      !chapterId || !point || !description) {
      message.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return false;
    }

    // Validate question count
    const totalCount = Number(easyQuestion) + Number(mediumQuestion) + Number(hardQuestion);
    if (totalCount !== Number(totalQuestion)) {
      message.error(`Tổng số câu hỏi (${totalQuestion}) phải bằng tổng của số câu dễ, trung bình và khó (${totalCount})`);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    // First validate the form via Ant Design's validation
    form.validateFields()
      .then(async values => {
        // Then perform our custom validation
        if (!validateForm()) {
          return; // Custom error messages are displayed by validateForm
        }

        // Prepare the data for API call
        const formattedValues = {
          ...values,
          type: Array.isArray(values.type) ? values.type : [values.type],
          courseId: Number(values.courseId),
          chapterId: Number(values.chapterId),
          // lessonId can be null, but must be included in the API call
          lessonId: values.lessonId ? Number(values.lessonId) : null,
          // Ensure numeric fields are numbers
          totalQuestion: Number(values.totalQuestion),
          easyQuestion: Number(values.easyQuestion),
          mediumQuestion: Number(values.mediumQuestion),
          hardQuestion: Number(values.hardQuestion),
          duration: Number(values.duration),
          point: Number(values.point),
          // Default values
          format: "test",
          summary: values.summary || false,
          deleted: false
        };

        await handleAddExam(formattedValues);
      })
      .catch(info => {
        console.log('Form validation failed:', info);
        // The Ant Design form will display validation errors on its own
      });
  };

  const handleAddExam = async (examData: any) => {
    setAdding(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      // Always ensure these fields are properly formatted
      const finalData = {
        ...examData,
        format: "test",
        summary: examData.summary || false,
        lessonId: examData.lessonId === undefined ? null : examData.lessonId,
        // Ensure courseId and chapterId are numbers
        courseId: Number(examData.courseId),
        chapterId: Number(examData.chapterId),
        // Ensure numeric fields are numbers
        totalQuestion: Number(examData.totalQuestion),
        easyQuestion: Number(examData.easyQuestion),
        mediumQuestion: Number(examData.mediumQuestion),
        hardQuestion: Number(examData.hardQuestion),
        duration: Number(examData.duration),
        point: Number(examData.point || 0)
      };

      const response = await fetch(ADMIN_ADD_TEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
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
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Đã xảy ra lỗi không mong muốn.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();

      if (!currentExam) return;

      setLoading(true);
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      if (!token) return;

      // Format the data for the API
      const formattedValues = {
        ...values,
        type: Array.isArray(values.type) ? values.type : [values.type],
        format: "test", // Default format is 'test'
        summary: values.summary || false, // Default summary is false
        lessonId: values.lessonId || null, // Ensure lessonId is null when not provided
        chapterId: values.chapterId || null // Ensure chapterId is null when not provided
      };

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST || 'http://localhost:8080'}/api/tests/${currentExam.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues)
      });

      if (!response.ok) {
        throw new Error("Failed to update exam");
      }

      message.success('Đã cập nhật bài kiểm tra!');
      setIsEditModalVisible(false);
      fetchExams(); // Refresh the list
    } catch (error) {
      console.error("Failed to update exam:", error);
      message.error("Không thể cập nhật bài kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalVisible(false);
    setCurrentExam(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setCurrentExam(null);
    setLessonDetail([]);
  };

  const handleAddQuestions = (record: Exam) => {
    if (record) {
      if (!record.assigned) {
        message.error("Bài kiểm tra chưa được phân công. Không thể thêm câu hỏi!");
        return;
      }

      setCurrentExam(record);

      // Reset all question-related states
      setQuestions([]);  // Clear the questions array
      setQuestionTest([]); // Clear the test questions array
      setTotalQuestionsCount(0);
      setSearchTerm('');
      setTypeFilter('all');
      setLevelFilter('all');
      setQuestionPage(0);
      setQuestionPageSize(10); // Reset to default page size
      setSelectedQuestions([]);
      setActiveQuestionsTab('auto');  // Reset to auto tab

      // Fetch lesson details for this exam to get the topic
      fetchLessonDetail(record).then(() => {
        // After fetching lesson details, fetch questions with current filters
        fetchQuestionsWithFilters();
      });

      // Fetch existing questions for this test
      fetchQuestionTest(record.id);

      setIsAddQuestionsModalVisible(true);
    }
  };

  const handleCloseAddQuestionsModal = () => {
    setIsAddQuestionsModalVisible(false);
    setCurrentExam(null);
    setLessonDetail([]);
  };

  const handleQuestionsTabChange = (activeKey: string) => {
    setActiveQuestionsTab(activeKey);

    // If switching to manual tab, make sure we have questions loaded
    if (activeKey === 'manual' && questions.length === 0) {
      fetchQuestionsWithFilters();
    }
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
        // Automatic mode: Server will generate and add questions
        // const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/questions/generate-for-exam/${currentExam.id}`, {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: `Bearer ${token}`,
        //   },
        //   body: JSON.stringify({
        //     // Add any parameters needed for automatic generation
        //     excludeFromChapterTests: true,
        //     excludeFromLessonTests: true,
        //     prioritizeNewest: true
        //   }),
        // });

        // if (!response.ok) {
        //   throw new Error("Failed to auto-generate questions");
        // }

        // message.success(`Đã tự động thêm ${currentExam.totalQuestion} câu hỏi vào bài kiểm tra thành công!`);

      } else {
        // Manual mode: Add selected questions
        if (selectedQuestions.length === 0) {
          message.warning("Vui lòng chọn ít nhất một câu hỏi");
          setLoading(false);
          return;
        }
        
        // Instead of making separate DELETE calls, send all selected questions to the backend
        // The backend will handle adding new questions and removing deselected ones
        const response = await fetch(`${ADMIN_ADD_QUESTION_TO_TEST_V2}/${currentExam.id}`, {
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
      setIsAddQuestionsModalVisible(false);
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

  const columns: ColumnsType<any> = [
    {
      title: 'Tên bài',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <Space direction="vertical" size={0}>
          <strong>{text}</strong>
          <Space>
            <Tag color="blue">{record.format === 'test' ? 'Bài kiểm tra' : 'Đề thi'}</Tag>
            {/* <span style={{ fontSize: '12px', color: '#888' }}>{record.courseName}</span> */}
          </Space>
        </Space>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Thông tin',
      dataIndex: 'info',
      key: 'info',
      render: (_, record: any) => (
        <Space direction="vertical" size={0}>
          <span>Số câu: <strong>{record.totalQuestion}</strong> | Thời gian: <strong>{record.duration} phút</strong></span>
          <span>
            <Tooltip title="Số câu độ khó dễ">
              <span style={{ cursor: 'help' }}>Dễ: <strong>{record.easyQuestion}</strong></span>
            </Tooltip> |
            <Tooltip title="Số câu độ khó trung bình">
              <span style={{ cursor: 'help' }}> TB: <strong>{record.mediumQuestion}</strong></span>
            </Tooltip> |
            <Tooltip title="Số câu độ khó cao">
              <span style={{ cursor: 'help' }}> Khó: <strong>{record.hardQuestion}</strong></span>
            </Tooltip>
          </span>
        </Space>
      ),
    },
    {
      title: 'Loại câu hỏi',
      key: 'questionType',
      width: 120,
      render: (_, record: any) => getQuestionTypeTag(record.type),
    },
    {
      title: 'Loại bài',
      key: 'examType',
      filters: [
        { text: 'Bài test chương', value: 'chapter' },
        { text: 'Bài test thường', value: 'lesson' }
      ],
      onFilter: (value, record) => {
        if (value === 'chapter') return record.lessonId == null && record.summary;
        if (value === 'lesson') return record.lessonId != null && !record.summary;
        return true;
      },
      render: (_, record: any) => (
        <Space direction="vertical" size={0}>
          {record.lessonId == null && record.summary &&
            <Tooltip title="Bài kiểm tra tổng kết sau khi học xong một chương">
              <Tag color="orange" style={{ cursor: 'help' }}>Bài test chương</Tag>
            </Tooltip>
          }
          {record.lessonId != null && !record.summary &&
            <Tooltip title="Bài kiểm tra sau mỗi bài học">
              <Tag color="cyan" style={{ cursor: 'help' }}>Bài test thường</Tag>
            </Tooltip>
          }
          {!(record.lessonId == null && record.summary) && !(record.lessonId != null && !record.summary) &&
            <Tag color="default">Loại khác</Tag>
          }
          {record.chapterName &&
            <div style={{ fontSize: '12px', marginTop: '3px' }}>
              Chương: {record.chapterName}
            </div>
          }
          {record.lessonName &&
            <div style={{ fontSize: '12px', marginTop: '3px', color: '#1890ff' }}>
              Bài: {record.lessonName}
            </div>
          }
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record: any) => (
        <Space direction="vertical" size={0}>
          {record.deleted && <Tag color="gray">Đã lưu trữ</Tag>}
          {record.assigned && !record.deleted && <Tag color="purple">Đã phân công</Tag>}
          {!record.assigned && !record.deleted && <Tag color="gold">Chưa phân công</Tag>}
        </Space>
      ),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontSize: '12px', color: '#888' }}> {new Date(text).toLocaleDateString('vi-VN')}</span>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} shape="circle" onClick={() => handleViewExam(record.id)} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button icon={<EditOutlined />} shape="circle" onClick={() => handleEditExam(record.id)} />
          </Tooltip>
          <Tooltip title={record.assigned ? "Thêm câu hỏi" : "Bài kiểm tra chưa được phân công"}>
            <Button
              icon={<PlusOutlined />}
              shape="circle"
              style={{
                backgroundColor: record.assigned ? '#52c41a' : '#d9d9d9',
                color: 'white'
              }}
              onClick={() => handleAddQuestions(record)}
              disabled={!record.assigned}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa bài kiểm tra này?"
              onConfirm={() => handleDeleteExam(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleViewExam = (id: string) => {
    const exam = exams.find(e => e.id === id);
    if (exam) {
      setCurrentExam(exam);
      setIsViewModalVisible(true);
    }
  };

  const handleEditExam = (id: string) => {
    const exam = exams.find(e => e.id === id);
    if (exam) {
      setCurrentExam(exam);
      // Fetch lesson details for this exam
      fetchLessonDetail(exam);

      // Set form values for editing
      editForm.setFieldsValue({
        ...exam,
        type: Array.isArray(exam.type) ? exam.type : [exam.type],
        point: exam.point
      });

      // Set selected course and chapter for fetching related data
      setSelectedCourseForModal(exam.courseId);
      setSelectedChapterForModal(exam.chapterId);

      setIsEditModalVisible(true);
    }
  };

  const handleDeleteExam = async (id: string) => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_PUT_DELETE_TEST_CLEAR}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        message.success('Đã xóa bài kiểm tra!');
        // Update the local state to mark the exam as deleted
        setExams((prevExams) =>
          prevExams.map((exam) =>
            exam.id === id ? { ...exam, deleted: true } : exam
          )
        );
      } else {
        throw new Error("Failed to delete exam");
      }
    } catch (error) {
      console.error("Failed to delete exam:", error);
      message.error("Không thể xóa bài kiểm tra");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    // Lọc theo tab loại đề
    let filtered = examData;
    if (activeTab === 'assigned') {
      filtered = filtered.filter(e => e.assigned);
    } else if (activeTab === 'unassigned') {
      filtered = filtered.filter(e => !e.assigned && !e.deleted);
    } else if (activeTab === 'deleted') {
      filtered = filtered.filter(e => e.deleted);
    }

    return filtered;
  };

  const handleQuestionsSearchChange = (value: string) => {
    setSearchTerm(value);
    setQuestionPage(0);

  };

  const handleQuestionsTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setQuestionPage(0); // Reset to first page when changing filters

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

  // Add a function to fetch with exact pagination values without relying on state
  const fetchQuestionsWithExactPagination = async (apiPage: number, pageSize: number) => {
    if (!currentExam) return;

    setLoading(true);

    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      // Extract and combine topics from all lessons in lessonDetail
      let topics: string[] = [];

      if (lessonDetail && lessonDetail.length > 0) {
        topics = lessonDetail.map(lesson => lesson.topic).filter(Boolean) as string[];
      }

      // Join all topics with commas
      const topicString = topics.length > 0 ? topics.join(',') : '';

      // Process filter values to ensure proper API parameters
      const typeParam = typeFilter === 'all' ? '' : typeFilter;
      const levelParam = levelFilter === 'all' ? '' : levelFilter;

      // Build query parameters with the EXACT values passed to this function
      const params = new URLSearchParams({
        topic: topicString,
        accountId: "2",
        courseId: currentExam.courseId.toString(),
        ...(typeParam && { type: typeParam }),
        ...(levelParam && { level: levelParam }),
        ...(searchTerm && { content: searchTerm }),
        page: apiPage.toString(),
        size: pageSize.toString(),
      });

      const url = `${process.env.REACT_APP_SERVER_HOST}/api/questions/all-filter?${params.toString()}`;
      console.log(`API URL: ${url}`);

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

  // Also modify the fetchQuestionsWithFilters function to avoid timing issues
  const fetchQuestionsWithFilters = async () => {
    const apiPage = questionPage; // Get current value
    const pageSize = questionPageSize; // Get current value
    // Call the exact pagination function with current values
    fetchQuestionsWithExactPagination(apiPage, pageSize);
  };

  // Remove a question from the test
  const handleRemoveQuestion = async (questionId: string) => {
    if (!currentExam) return;

    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    if (!token) return;

    try {
      const response = await fetch(`${ADMIN_REMOVE_QUESTION_FROM_TEST}/${currentExam.id}/${questionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove question from test");
      }

      message.success("Đã xóa câu hỏi khỏi bài kiểm tra");

      // Update the local state to remove the question
      setQuestionTest(prev => prev.filter(q => q.id.toString() !== questionId.toString()));

    } catch (error) {
      console.error("Error removing question:", error);
      message.error("Không thể xóa câu hỏi khỏi bài kiểm tra!");
    } finally {
      setLoading(false);
    }
  };

  // First, define columns for the questions table
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

  const questionRowSelection = {
    type: 'checkbox' as const,
    selectedRowKeys: selectedQuestions.map(q => q.id), // phải map id ra
  
    onSelect: (record: any, selected: boolean) => {
      if (selected) {
        setSelectedQuestions(prev => [...prev, { id: record.id, level: record.level, type: record.type }]);
      } else {
        setSelectedQuestions(prev => prev.filter(q => q.id !== record.id));
      }
    },
  
    onSelectAll: (selected: boolean, selectedRows: any[], changeRows: any[]) => {
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
    }
  };

  // Define columns for existing questions
  const existingQuestionColumns = [
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
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa câu hỏi này khỏi bài kiểm tra?"
          onConfirm={() => handleRemoveQuestion(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button danger icon={<DeleteOutlined />} size="small">
            Xóa
          </Button>
        </Popconfirm>
      )
    }
  ];

  // Add back the fetchLessonDetail function
  const fetchLessonDetail = async (exam: Exam) => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);

    const searchParams = new URLSearchParams({
      lessonId: exam.lessonId && !isNaN(Number(exam.lessonId)) ? exam.lessonId.toString() : "",
      chapterId: exam.chapterId && !isNaN(Number(exam.chapterId)) ? exam.chapterId.toString() : "",
    });

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/lessons/test/lesson/${exam.id}?${searchParams.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setLessonDetail(data.data);
    } catch (error) {
      console.error("Failed to fetch lesson detail", error);
      message.error("Không thể tải thông tin bài học");
    }
  };

  // Add back the fetchQuestionTest function
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

  return (
    <div>
      <Title level={2}>Quản lý bài kiểm tra</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
              >
                Tạo bài kiểm tra mới
              </Button>
              {/* <Tooltip title="Nhập danh sách bài kiểm tra">
                <Button icon={<ImportOutlined />}>Nhập</Button>
              </Tooltip>
              <Tooltip title="Xuất danh sách bài kiểm tra">
                <Button icon={<ExportOutlined />}>Xuất</Button>
              </Tooltip> */}
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm bài kiểm tra..."
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
            <TabPane
              tab={
                <span>Tất cả bài kiểm tra</span>
              }
              key="all"
            >
              <Table
                columns={columns}
                dataSource={getFilteredData()}
                rowKey="id"
                loading={loading}
                rowSelection={{
                  selectedRowKeys: selectedExams,
                  onChange: setSelectedExams,
                }}
                pagination={{
                  current: page + 1,
                  pageSize: rowsPerPage,
                  total: totalElements,
                  onChange: handlePageChange,

                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài kiểm tra`
                }}
              />
            </TabPane>
            <TabPane
              tab={
                <span>Đã phân công <Badge
                  count={examData.filter(e => e.assigned).length}
                  style={{ marginLeft: 5 }}
                /></span>
              }
              key="assigned"
            >
              <Table
                columns={columns}
                dataSource={getFilteredData()}
                rowKey="id"
                loading={loading}
                rowSelection={{
                  selectedRowKeys: selectedExams,
                  onChange: setSelectedExams,
                }}
                pagination={{
                  current: page + 1,
                  pageSize: rowsPerPage,
                  total: totalElements,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài kiểm tra`
                }}
              />
            </TabPane>
            <TabPane
              tab={
                <span>Chưa phân công <Badge
                  count={examData.filter(e => !e.assigned && !e.deleted).length}
                  style={{ marginLeft: 5 }}
                /></span>
              }
              key="unassigned"
            >
              <Table
                columns={columns}
                dataSource={getFilteredData()}
                rowKey="id"
                loading={loading}
                rowSelection={{
                  selectedRowKeys: selectedExams,
                  onChange: setSelectedExams,
                }}
                pagination={{
                  current: page + 1,
                  pageSize: rowsPerPage,
                  total: totalElements,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài kiểm tra`
                }}
              />
            </TabPane>
            <TabPane
              tab={
                <span>Đã lưu trữ <Badge
                  count={examData.filter(e => e.deleted).length}
                  style={{ marginLeft: 5 }}
                /></span>
              }
              key="deleted"
            >
              <Table
                columns={columns}
                dataSource={getFilteredData()}
                rowKey="id"
                loading={loading}
                rowSelection={{
                  selectedRowKeys: selectedExams,
                  onChange: setSelectedExams,
                }}
                pagination={{
                  current: page + 1,
                  pageSize: rowsPerPage,
                  total: totalElements,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài kiểm tra`
                }}
              />
            </TabPane>
          </Tabs>
        </Space>
      </Card>

      {/* Create Exam Modal */}
      <Modal
        title="Tạo bài kiểm tra mới"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={adding}>
            Tạo
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          name="form_in_modal"
        >
          <Form.Item
            name="title"
            label="Tên bài kiểm tra"
            rules={[{ required: true, message: 'Vui lòng nhập tên bài kiểm tra!' }]}
          >
            <Input placeholder="Nhập tên bài kiểm tra" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả ngắn về bài kiểm tra" />
          </Form.Item>

          <Divider />

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="courseId"
                label="Môn học"
                rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
              >
                <Select
                  placeholder="Chọn môn học"
                  onChange={handleCourseChangeInModal}
                >
                  {courses.map(course => (
                    <Option key={course.id} value={course.id}>{course.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="chapterId"
                label="Chương"
                rules={[{ required: true, message: 'Vui lòng chọn chương!' }]}
              >
                <Select
                  placeholder="Chọn chương"
                  allowClear
                  onChange={handleChapterChangeInModal}
                  disabled={!selectedCourseForModal}
                >
                  {chapters.map(chapter => (
                    <Option key={chapter.id} value={chapter.id}>{chapter.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lessonId"
                label="Bài học"
              >
                <Select
                  placeholder="Chọn bài học"
                  allowClear
                  disabled={!selectedChapterForModal}
                  onChange={handleLessonChangeInModal}
                >
                  {lessons.map(lesson => (
                    <Option key={lesson.id} value={lesson.id}>{lesson.lessonTitle}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="type"
            label="Loại câu hỏi"
            rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi!' }]}
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

          <Divider />

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="totalQuestion"
                label="Tổng số câu hỏi"
                rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi!' }]}
              >
                <Input type="number" placeholder="Nhập số câu hỏi" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="duration"
                label="Thời gian làm bài (phút)"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian làm bài!' }]}
              >
                <Input type="number" placeholder="Nhập thời gian" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="point"
                label="Điểm cộng"
                rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa!' }]}
              >
                <Input type="number" placeholder="Nhập điểm tối đa" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="easyQuestion"
                label="Số câu dễ"
                rules={[{ required: true, message: 'Vui lòng nhập số câu dễ!' }]}
              >
                <Input type="number" placeholder="Nhập số câu dễ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mediumQuestion"
                label="Số câu trung bình"
                rules={[{ required: true, message: 'Vui lòng nhập số câu trung bình!' }]}
              >
                <Input type="number" placeholder="Nhập số câu trung bình" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="hardQuestion"
                label="Số câu khó"
                rules={[{ required: true, message: 'Vui lòng nhập số câu khó!' }]}
              >
                <Input type="number" placeholder="Nhập số câu khó" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="summary"
                label="Loại bài kiểm tra"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch
                  checkedChildren="Bài test chương"
                  unCheckedChildren="Bài test thường"
                  defaultChecked={false}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Exam Modal */}
      <Modal
        title="Xem chi tiết bài kiểm tra"
        visible={isViewModalVisible}
        onCancel={handleCloseViewModal}
        footer={[
          <Button key="close" onClick={handleCloseViewModal}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              handleCloseViewModal();
              handleEditExam(currentExam?.id || '');
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={800}
      >
        {currentExam && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên bài kiểm tra" span={2}>
                {currentExam.title}
              </Descriptions.Item>
              <Descriptions.Item label="Loại bài">
                {currentExam.lessonId == null && currentExam.summary
                  ? <Tag color="orange">Bài test chương</Tag>
                  : currentExam.lessonId != null && !currentExam.summary
                    ? <Tag color="cyan">Bài test thường</Tag>
                    : <Tag color="default">Loại khác</Tag>
                }
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {currentExam.deleted && <Tag color="gray">Đã lưu trữ</Tag>}
                {currentExam.assigned && !currentExam.deleted && <Tag color="purple">Đã phân công</Tag>}
                {!currentExam.assigned && !currentExam.deleted && <Tag color="gold">Chưa phân công</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Môn học">
                {getCourseName(currentExam.courseId)}
              </Descriptions.Item>
              <Descriptions.Item label="Chương">
                {getChapterName(currentExam.chapterId)}
              </Descriptions.Item>
              {currentExam.lessonId && (
                <Descriptions.Item label="Bài học" span={2}>
                  {getLessonName(currentExam.lessonId)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Mô tả" span={2}>
                {currentExam.description || 'Không có mô tả'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số câu hỏi">
                {currentExam.totalQuestion}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian (phút)">
                {currentExam.duration}
              </Descriptions.Item>
              <Descriptions.Item label="Số câu dễ">
                {currentExam.easyQuestion}
              </Descriptions.Item>
              <Descriptions.Item label="Số câu trung bình">
                {currentExam.mediumQuestion}
              </Descriptions.Item>
              <Descriptions.Item label="Số câu khó">
                {currentExam.hardQuestion}
              </Descriptions.Item>
              <Descriptions.Item label="Loại câu hỏi">
                {getQuestionTypeTag(currentExam.type)}
              </Descriptions.Item>
              {currentExam.point && (
                <Descriptions.Item label="Điểm" span={2}>
                  {currentExam.point}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày tạo">
                {new Date(currentExam.createdAt).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {currentExam.updatedAt ? new Date(currentExam.updatedAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Edit Exam Modal */}
      <Modal
        title="Chỉnh sửa bài kiểm tra"
        visible={isEditModalVisible}
        onCancel={handleCloseEditModal}
        footer={[
          <Button key="back" onClick={handleCloseEditModal}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleUpdate} loading={loading}>
            Cập nhật
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          name="edit_form_in_modal"
        >
          <Form.Item
            name="title"
            label="Tên bài kiểm tra"
            rules={[{ required: true, message: 'Vui lòng nhập tên bài kiểm tra!' }]}
          >
            <Input placeholder="Nhập tên bài kiểm tra" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả ngắn về bài kiểm tra" />
          </Form.Item>

          <Divider />

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="courseId"
                label="Môn học"
                rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
              >
                <Select
                  placeholder="Chọn môn học"
                  onChange={handleCourseChangeInModal}
                >
                  {courses.map(course => (
                    <Option key={course.id} value={course.id}>{course.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="chapterId"
                label="Chương"
                rules={[{ required: true, message: 'Vui lòng chọn chương!' }]}
              >
                <Select
                  placeholder="Chọn chương"
                  allowClear
                  onChange={handleChapterChangeInModal}
                  disabled={!selectedCourseForModal}
                >
                  {chapters.map(chapter => (
                    <Option key={chapter.id} value={chapter.id}>{chapter.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="lessonId"
                label="Bài học"
              >
                <Select
                  placeholder="Chọn bài học"
                  allowClear
                  disabled={!selectedChapterForModal}
                  onChange={handleLessonChangeInModal}
                >
                  {lessons.map(lesson => (
                    <Option key={lesson.id} value={lesson.id}>{lesson.lessonTitle}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="type"
            label="Loại câu hỏi"
            rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi!' }]}
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

          <Divider />

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="totalQuestion"
                label="Tổng số câu hỏi"
                rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi!' }]}
              >
                <Input type="number" placeholder="Nhập số câu hỏi" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="duration"
                label="Thời gian làm bài (phút)"
                rules={[{ required: true, message: 'Vui lòng nhập thời gian làm bài!' }]}
              >
                <Input type="number" placeholder="Nhập thời gian" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="point"
                label="Điểm cộng"
                rules={[{ required: true, message: 'Vui lòng nhập điểm tối đa!' }]}
              >
                <Input type="number" placeholder="Nhập điểm tối đa" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                name="easyQuestion"
                label="Số câu dễ"
                rules={[{ required: true, message: 'Vui lòng nhập số câu dễ!' }]}
              >
                <Input type="number" placeholder="Nhập số câu dễ" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="mediumQuestion"
                label="Số câu trung bình"
                rules={[{ required: true, message: 'Vui lòng nhập số câu trung bình!' }]}
              >
                <Input type="number" placeholder="Nhập số câu trung bình" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="hardQuestion"
                label="Số câu khó"
                rules={[{ required: true, message: 'Vui lòng nhập số câu khó!' }]}
              >
                <Input type="number" placeholder="Nhập số câu khó" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="summary"
                label="Loại bài kiểm tra"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch
                  checkedChildren="Bài test chương"
                  unCheckedChildren="Bài test thường"
                  defaultChecked={false}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Add Questions Modal */}
      <Modal
        title={`Thêm câu hỏi cho bài kiểm tra: ${currentExam?.title || ''}`}
        visible={isAddQuestionsModalVisible}
        onCancel={handleCloseAddQuestionsModal}
        footer={[
          <Button key="back" onClick={handleCloseAddQuestionsModal}>
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
                    <li>Loại bài: {currentExam.lessonId == null && currentExam.summary ? 'Bài test chương' : 'Bài test thường'}</li>
                    <li>Môn học: {getCourseName(currentExam.courseId)}</li>
                    <li>Chương: {getChapterName(currentExam.chapterId)}</li>
                    {currentExam.lessonId && (<li>Bài học: {getLessonName(currentExam.lessonId)}</li>)}
                    <li>Tổng số câu hỏi cần thêm: <strong>{currentExam.totalQuestion}</strong></li>
                    <li>Câu hỏi độ khó thấp: <strong>{currentExam.easyQuestion}</strong></li>
                    <li>Câu hỏi độ khó trung bình: <strong>{currentExam.mediumQuestion}</strong></li>
                    <li>Câu hỏi độ khó cao: <strong>{currentExam.hardQuestion}</strong></li>
                    <li>Loại câu hỏi: {currentExam.type.map(typeValue => {
                      const typeInfo = QUESTION_TYPES.find(t => t.value === typeValue);
                      return typeInfo ? typeInfo.label : typeValue;
                    }).join(', ')}</li>
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

export default ExamsPage; 