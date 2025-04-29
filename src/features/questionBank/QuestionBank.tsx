import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Input, Typography, Popconfirm, message, Modal, Form, Select, Radio, Tabs, Divider, Checkbox, Upload, Alert, Dropdown, Menu } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FileSearchOutlined, CopyOutlined, UploadOutlined, InboxOutlined, DownloadOutlined, FileExcelOutlined, FileWordOutlined, MoreOutlined, ImportOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils/auth';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface Question {
  id: string | number;
  content: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  result: string;
  resultCheck: string;
  instruction: string;
  type: string;
  level: string;
  topic: string;
  createdAt?: string;
  deletedDate?: string;
  deleted?: boolean;
  accountId: number;
  courseId: number;
}

interface Option {
  id: string;
  content: string;
  isCorrect: boolean;
}

interface Course {
  id: number;
  name: string;
  author?: string;
  duration?: number;
  cost?: number;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
  status?: boolean;
  type?: string;
  deletedDate?: string;
  accountId?: number;
  categoryNameLevel3?: string;
  categoryIdLevel3?: number;
  categoryNameLevel2?: string;
  categoryIdLevel2?: number;
  categoryNameLevel1?: string;
  categoryIdLevel1?: number;
  deleted?: boolean;
}

export const ADMIN_ADD_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/add`;
export const ADMIN_ADD_CHECKBOX_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/add-checkbox`;
export const ADMIN_UPDATE_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/update-v2`;
export const ADMIN_EXPORT_EXCEL = `${process.env.REACT_APP_SERVER_HOST}/api/questions/export-excel`;
export const ADMIN_EXPORT_DOCX = `${process.env.REACT_APP_SERVER_HOST}/api/questions/export-docx`;

export const ADMIN_DELETE_CHOOSE_QUESTION = `${process.env.REACT_APP_SERVER_HOST}/api/questions/delete-choose`;
export const ADMIN_EXPORT_QUESTION_DOCX = `${process.env.REACT_APP_SERVER_HOST}/api/questions/export/docx-list`;
export const ADMIN_UPLOAD_DOCX = `${process.env.REACT_APP_SERVER_HOST}/api/questions/upload-docx`;

const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [form] = Form.useForm();
  const [uploadForm] = Form.useForm();
  const [courses, setCourses] = useState<Course[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");

  // Watch for form field changes
  const questionType = Form.useWatch('type', form);

  // Fetch courses from API
  const fetchCourseList = async () => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

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
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();

      // Map the API response to match our Course interface
      const formattedCourses: Course[] = data.map((course: any) => ({
        id: course.id,
        name: course.title,
        author: course.author,
        duration: course.duration,
        cost: course.cost,
        price: course.price,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        status: course.status,
        type: course.type,
        deletedDate: course.deletedDate,
        accountId: course.accountId,
        categoryNameLevel3: course.categoryNameLevel3,
        categoryIdLevel3: course.categoryIdLevel3,
        categoryNameLevel2: course.categoryNameLevel2,
        categoryIdLevel2: course.categoryIdLevel2,
        categoryNameLevel1: course.categoryNameLevel1,
        categoryIdLevel1: course.categoryIdLevel1,
        deleted: course.deleted
      }));

      setCourses(formattedCourses);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast.error("Không thể tải danh sách khóa học");
    }
  };

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourseList();
  }, []);

  // Create options for preview
  useEffect(() => {
    if (previewQuestion && previewQuestion.type !== 'essay' && previewQuestion.type !== 'fill-in-the-blank') {
      // Create options from question data
      const questionOptions: Option[] = [
        { id: '1', content: previewQuestion.optionA, isCorrect: previewQuestion.resultCheck.includes('A') },
        { id: '2', content: previewQuestion.optionB, isCorrect: previewQuestion.resultCheck.includes('B') },
        { id: '3', content: previewQuestion.optionC, isCorrect: previewQuestion.resultCheck.includes('C') },
        { id: '4', content: previewQuestion.optionD, isCorrect: previewQuestion.resultCheck.includes('D') },
      ].filter(option => option.content !== '');
      setOptions(questionOptions);
    }
  }, [previewQuestion]);

  // Fetch questions from API
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const params = new URLSearchParams({
        topic: "",
        ...(filterCourse && { courseId: filterCourse }),
        accountId: "2", 
        ...(typeFilter && { type: typeFilter }),
        ...(levelFilter && { level: levelFilter }),
        ...(searchText && { content: searchText }),
        page: (page - 1).toString(), // API thường tính page từ 0
        size: rowsPerPage.toString(),
      });

      const url = `${process.env.REACT_APP_SERVER_HOST}/api/questions/all-filter-bank?${params.toString()}`;

      // Gọi API thực tế
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
      toast.error("Không thể tải dữ liệu câu hỏi!");
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi các filter hoặc trang thay đổi
  useEffect(() => {
    fetchQuestions();
  }, [filterCourse, typeFilter, levelFilter, page, rowsPerPage]);

  // Debounce search để tránh gọi API quá nhiều
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchQuestions();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1); // Reset về trang đầu tiên khi search
  };

  const handleTabChange = (key: string) => {
    if (key === 'all') {
      setTypeFilter(null);
    } else {
      setTypeFilter(key);
    }
    setPage(1); // Reset về trang đầu tiên khi đổi tab
  };

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setPage(newPage);
    if (newPageSize) {
      setRowsPerPage(newPageSize);
    }
  };

  const handleCourseFilterChange = (value: string | null) => {
    setFilterCourse(value);
    setPage(1); // Reset về trang đầu tiên khi filter
  };

  const handleLevelFilterChange = (value: string | null) => {
    setLevelFilter(value);
    setPage(1); // Reset về trang đầu tiên khi filter
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter(question => question.id !== id));
    message.success('Xóa câu hỏi thành công');
  };

  const showModal = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      const formValues: any = {
        content: question.content,
        type: question.type,
        level: question.level,
        topic: question.topic,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        result: question.result,
        resultCheck: question.resultCheck,
        courseId: question.courseId,
        instruction: question.instruction
      };

      // Set form fields based on question type
      if (question.type === 'multiple-choice') {
        // For multiple-choice, set result to the selected option (A, B, C, D)
        formValues.result = question.resultCheck;
      }

      // Set checkbox values for checkbox type questions
      if (question.type === 'checkbox') {
        // Parse resultCheck (which contains indexes like "1,3,4" for A,C,D)
        // Convert to letters: 1->A, 2->B, 3->C, 4->D
        const answerIndexes = question.resultCheck.split(',').map(i => i.trim());
        formValues.optionChecks = {
          A: answerIndexes.includes('1'),
          B: answerIndexes.includes('2'),
          C: answerIndexes.includes('3'),
          D: answerIndexes.includes('4')
        };
      }

      form.setFieldsValue(formValues);
    } else {
      setEditingQuestion(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const showPreviewModal = (question: Question) => {
    setPreviewQuestion(question);
    setPreviewVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePreviewCancel = () => {
    setPreviewVisible(false);
    setPreviewQuestion(null);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Convert checkbox values to result format
      let finalValues = { ...values };
      let requestBody = {};

      // If we're editing an existing question
      if (editingQuestion) {
        // Handle updating based on question type
        if (values.type === 'multiple-choice') {
          if (!finalValues.content) {
            toast.warning("Vui lòng nhập nội dung câu hỏi!");
            return;
          }

          if (!finalValues.optionA || !finalValues.optionB) {
            toast.warning("Vui lòng nhập ít nhất hai câu trả lời A và B!");
            return;
          }

          if (!finalValues.result) {
            toast.warning("Vui lòng chọn đáp án đúng!");
            return;
          }

          // Determine the correct answer text based on selected option
          let resultText = '';
          switch (finalValues.result) {
            case 'A':
              resultText = finalValues.optionA;
              break;
            case 'B':
              resultText = finalValues.optionB;
              break;
            case 'C':
              resultText = finalValues.optionC;
              break;
            case 'D':
              resultText = finalValues.optionD;
              break;
            default:
              break;
          }

          requestBody = {
            content: finalValues.content,
            optionA: finalValues.optionA || '',
            optionB: finalValues.optionB || '',
            optionC: finalValues.optionC || '',
            optionD: finalValues.optionD || '',
            result: resultText,
            resultCheck: finalValues.result,
            type: finalValues.type,
            level: finalValues.level,
            topic: finalValues.topic || '',
            courseId: finalValues.courseId,
            accountId: 2,
            instruction: finalValues.instruction || ''
          };

          setLoading(true);
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          const response = await fetch(
            `${ADMIN_UPDATE_QUESTION}/${editingQuestion.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (response.ok) {
            toast.success("Cập nhật câu hỏi thành công!");
            setIsModalVisible(false);
            fetchQuestions();
          } else {
            const errorText = await response.text();
            toast.error(`Có lỗi xảy ra khi cập nhật câu hỏi: ${errorText}`);
          }
        }
        else if (values.type === 'fill-in-the-blank') {
          if (!finalValues.content) {
            toast.warning("Vui lòng nhập nội dung câu hỏi!");
            return;
          }

          if (!finalValues.result) {
            toast.warning("Vui lòng điền từ khuyết!");
            return;
          }

          requestBody = {
            content: finalValues.content,
            result: finalValues.result,
            instruction: finalValues.instruction || '',
            type: finalValues.type,
            level: finalValues.level,
            topic: finalValues.topic || '',
            courseId: finalValues.courseId,
            accountId: 2
          };

          setLoading(true);
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          const response = await fetch(
            `${ADMIN_UPDATE_QUESTION}/${editingQuestion.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (response.ok) {
            toast.success("Cập nhật câu hỏi thành công!");
            setIsModalVisible(false);
            fetchQuestions();
          } else {
            const errorText = await response.text();
            toast.error(`Có lỗi xảy ra khi cập nhật câu hỏi: ${errorText}`);
          }
        }
        else if (values.type === 'checkbox') {
          if (!finalValues.content) {
            toast.warning("Vui lòng nhập nội dung câu hỏi!");
            return;
          }

          // Xử lý các options
          const options = [
            finalValues.optionA || '',
            finalValues.optionB || '',
            finalValues.optionC || '',
            finalValues.optionD || ''
          ].filter(option => option.trim() !== '');

          // Xác định đáp án đúng
          const correctAnswers = [
            finalValues.optionChecks?.A || false,
            finalValues.optionChecks?.B || false,
            finalValues.optionChecks?.C || false,
            finalValues.optionChecks?.D || false
          ].slice(0, options.length);

          if (options.length < 2) {
            toast.warning("Vui lòng nhập ít nhất hai đáp án!");
            return;
          }

          if (!correctAnswers.some(isChecked => isChecked)) {
            toast.warning("Vui lòng chọn ít nhất một đáp án đúng!");
            return;
          }

          if (!finalValues.level) {
            toast.warning("Vui lòng chọn độ khó câu hỏi!");
            return;
          }

          // Tạo filteredOptions theo định dạng API
          const filteredOptions = options.map((option, index) => ({
            text: option,
            isCorrect: correctAnswers[index]
          }));

          // Generate resultCheck in format "1,3,4" for A,C,D
          const resultCheckArray = [];
          if (finalValues.optionChecks?.A) resultCheckArray.push('1');
          if (finalValues.optionChecks?.B) resultCheckArray.push('2');
          if (finalValues.optionChecks?.C) resultCheckArray.push('3');
          if (finalValues.optionChecks?.D) resultCheckArray.push('4');
          const resultCheckString = resultCheckArray.join(',');

          requestBody = {
            content: finalValues.content,
            type: finalValues.type,
            courseId: finalValues.courseId,
            accountId: 2,
            level: finalValues.level,
            instruction: finalValues.instruction || '',
            options: filteredOptions,
            topic: finalValues.topic || '',
            resultCheck: resultCheckString
          };

          setLoading(true);
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          // Gọi API update cho câu hỏi checkbox
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_HOST}/api/questions/update-v2-checkbox/${editingQuestion.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (response.ok) {
            toast.success("Cập nhật câu hỏi thành công!");
            setIsModalVisible(false);
            fetchQuestions();
          } else {
            const errorText = await response.text();
            toast.error(`Có lỗi xảy ra khi cập nhật câu hỏi: ${errorText}`);
          }
        }
        else if (values.type === 'essay') {
          if (!finalValues.content) {
            toast.warning("Vui lòng nhập nội dung câu hỏi!");
            return;
          }

          if (!finalValues.level) {
            toast.warning("Vui lòng chọn độ khó cho câu hỏi!");
            return;
          }

          requestBody = {
            content: finalValues.content,
            instruction: finalValues.instruction || '',
            type: finalValues.type,
            level: finalValues.level,
            topic: finalValues.topic || '',
            courseId: finalValues.courseId,
            accountId: 2
          };

          setLoading(true);
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          const response = await fetch(
            `${ADMIN_UPDATE_QUESTION}/${editingQuestion.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(requestBody),
            }
          );

          if (response.ok) {
            toast.success("Cập nhật câu hỏi thành công!");
            setIsModalVisible(false);
            fetchQuestions();
          } else {
            const errorText = await response.text();
            toast.error(`Có lỗi xảy ra khi cập nhật câu hỏi: ${errorText}`);
          }
        }
        setLoading(false);
        return;
      }

      // Trường hợp câu hỏi checkbox (nhiều lựa chọn với API riêng)
      if (values.type === 'checkbox') {
        if (!finalValues.content) {
          toast.warning("Vui lòng nhập nội dung câu hỏi!");
          return;
        }

        // Xử lý các options
        const options = [
          finalValues.optionA || '',
          finalValues.optionB || '',
          finalValues.optionC || '',
          finalValues.optionD || ''
        ].filter(option => option.trim() !== '');

        // Xác định đáp án đúng
        const correctAnswers = [
          finalValues.optionChecks?.A || false,
          finalValues.optionChecks?.B || false,
          finalValues.optionChecks?.C || false,
          finalValues.optionChecks?.D || false
        ].slice(0, options.length);

        if (options.length < 2) {
          toast.warning("Vui lòng nhập ít nhất hai đáp án!");
          return;
        }

        if (!correctAnswers.some(isChecked => isChecked)) {
          toast.warning("Vui lòng chọn ít nhất một đáp án đúng!");
          return;
        }

        if (!finalValues.level) {
          toast.warning("Vui lòng chọn độ khó câu hỏi!");
          return;
        }

        // Tạo filteredOptions theo định dạng API
        const filteredOptions = options.map((option, index) => ({
          text: option,
          isCorrect: correctAnswers[index]
        }));

        // Generate resultCheck in format "1,3,4" for A,C,D
        const resultCheckArray = [];
        if (finalValues.optionChecks?.A) resultCheckArray.push('1');
        if (finalValues.optionChecks?.B) resultCheckArray.push('2');
        if (finalValues.optionChecks?.C) resultCheckArray.push('3');
        if (finalValues.optionChecks?.D) resultCheckArray.push('4');
        const resultCheckString = resultCheckArray.join(',');

        requestBody = {
          content: finalValues.content,
          type: finalValues.type,
          courseId: finalValues.courseId,
          accountId: 2,
          level: finalValues.level,
          instruction: finalValues.instruction || '',
          options: filteredOptions,
          topic: finalValues.topic || '',
          resultCheck: resultCheckString
        };

        setLoading(true);
        const token = await authTokenLogin(refreshToken, refresh, navigate);

        // Gọi API riêng cho câu hỏi checkbox
        const response = await fetch(ADMIN_ADD_CHECKBOX_QUESTION, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          toast.success("Thêm câu hỏi thành công!");
          setIsModalVisible(false);
          fetchQuestions(); // Refresh danh sách câu hỏi
        } else {
          const errorText = await response.text();
          toast.error(`Có lỗi xảy ra khi thêm câu hỏi: ${errorText}`);
        }
      }
      // Trường hợp câu hỏi một lựa chọn (multiple-choice)
      else if (values.type === 'multiple-choice') {
        if (!finalValues.content) {
          toast.warning("Vui lòng nhập nội dung câu hỏi!");
          return;
        }

        if (!finalValues.optionA || !finalValues.optionB) {
          toast.warning("Vui lòng nhập ít nhất hai câu trả lời A và B!");
          return;
        }

        if (!finalValues.result) {
          toast.warning("Vui lòng chọn đáp án đúng!");
          return;
        }

        requestBody = {
          content: finalValues.content,
          optionA: finalValues.optionA || '',
          optionB: finalValues.optionB || '',
          optionC: finalValues.optionC || '',
          optionD: finalValues.optionD || '',
          result: finalValues.result,
          resultCheck: finalValues.resultCheck,
          type: finalValues.type,
          level: finalValues.level,
          topic: finalValues.topic || '',
          courseId: finalValues.courseId,
          accountId: 2,
          instruction: finalValues.instruction || ''
        };
      }
      // Trường hợp câu hỏi điền khuyết
      else if (values.type === 'fill-in-the-blank') {
        if (!finalValues.content) {
          toast.warning("Vui lòng nhập nội dung câu hỏi!");
          return;
        }

        if (!finalValues.result) {
          toast.warning("Vui lòng điền từ khuyết!");
          return;
        }

        requestBody = {
          content: finalValues.content,
          result: finalValues.result,
          instruction: finalValues.instruction || '',
          type: finalValues.type,
          level: finalValues.level,
          topic: finalValues.topic || '',
          courseId: finalValues.courseId,
          accountId: 2
        };
      }
      // Trường hợp câu hỏi tự luận
      else if (values.type === 'essay') {
        if (!finalValues.content) {
          toast.warning("Vui lòng nhập nội dung câu hỏi!");
          return;
        }

        if (!finalValues.level) {
          toast.warning("Vui lòng chọn độ khó cho câu hỏi!");
          return;
        }

        requestBody = {
          content: finalValues.content,
          instruction: finalValues.instruction || '',
          type: finalValues.type,
          level: finalValues.level,
          topic: finalValues.topic || '',
          courseId: finalValues.courseId,
          accountId: 2
        };
      }

      // Chỉ gọi API chung nếu không phải câu hỏi checkbox (đã xử lý ở trên)
      if (values.type !== 'checkbox') {
        setLoading(true);
        const token = await authTokenLogin(refreshToken, refresh, navigate);

        // Gọi API thêm câu hỏi
        const response = await fetch(ADMIN_ADD_QUESTION, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          toast.success("Thêm câu hỏi thành công!");
          setIsModalVisible(false);
          fetchQuestions(); // Refresh danh sách câu hỏi
        } else {
          const errorText = await response.text();
          toast.error(`Có lỗi xảy ra khi thêm câu hỏi: ${errorText}`);
        }
      }
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error("Có lỗi xảy ra khi thêm câu hỏi!");
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeText = (type: string) => {
    switch (type) {
      case 'checkbox':
        return 'Nhiều lựa chọn';
      case 'multiple-choice':
        return 'Một lựa chọn';
      case 'fill-in-the-blank':
        return 'Điền khuyết';
      case 'essay':
        return 'Tự luận';
      default:
        return type;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '1':
        return 'green';
      case '2':
        return 'blue';
      case '3':
        return 'red';
      default:
        return 'default';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case '1':
        return 'Dễ';
      case '2':
        return 'Trung bình';
      case '3':
        return 'Khó';
      default:
        return level;
    }
  };

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Loại câu hỏi',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => getQuestionTypeText(type),
    },
    {
      title: 'Độ khó',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => (
        <Tag color={getLevelColor(level)}>
          {getLevelText(level)}
        </Tag>
      ),
    },
    {
      title: 'Khóa học',
      dataIndex: 'courseId',
      key: 'courseId',
      render: (courseId: number) => {
        const course = courses.find(c => c.id === courseId);
        return <span>{course ? course.name : 'Không xác định'}</span>;
      }
    },
    {
      title: 'Chủ đề',
      dataIndex: 'topic',
      key: 'topic',
    },
    // {
    //   title: 'Người tạo',
    //   dataIndex: 'createdBy',
    //   key: 'createdBy',
    // },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Question) => (
        <Space size="middle">
          <Button
            icon={<FileSearchOutlined />}
            onClick={() => showPreviewModal(record)}
          />
          <Button
            icon={<CopyOutlined />}
            onClick={() => {
              message.success('Đã sao chép câu hỏi: ' + record.id);
            }}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa câu hỏi này?"
            onConfirm={() => handleDelete(record.id.toString())}
            okText="Có"
            cancelText="Không"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleUploadModalOpen = () => {
    setUploadModalVisible(true);
    setUploadFile(null);
    setUploadError(null);
    uploadForm.resetFields();
  };

  const handleUploadModalClose = () => {
    setUploadModalVisible(false);
  };

  const handleFileChange = (info: any) => {
    console.log("File change event:", info);
    
    // Handle file list changes
    if (info.fileList && info.fileList.length > 0) {
      // Get the last file (most recent)
      const lastFile = info.fileList[info.fileList.length - 1];
      console.log("Last file in list:", lastFile);
      
      // Check if we have the file object
      if (lastFile.originFileObj) {
        console.log("File selected:", lastFile.originFileObj.name);
        setUploadFile(lastFile.originFileObj);
        setUploadError(null);
      } else if (info.file && info.file.originFileObj) {
        // Also try to get it from info.file directly
        console.log("File selected from info.file:", info.file.originFileObj.name);
        setUploadFile(info.file.originFileObj);
        setUploadError(null);
      } else {
        // For debugging, log the entire info object
        console.error("No file originFileObj found in fileList or file. Info:", JSON.stringify(info, null, 2));
        setUploadError("Không thể đọc file, vui lòng thử lại.");
      }
    } else if (info.file && info.file.originFileObj) {
      // Try to get file directly as fallback
      console.log("File selected directly:", info.file.originFileObj.name);
      setUploadFile(info.file.originFileObj);
      setUploadError(null);
    } else if (info.file && info.file.status === 'removed') {
      // Handle file removal
      console.log("File removed");
      setUploadFile(null);
      setUploadError(null);
    } else {
      // For debugging, log the entire info object
      console.error("No file found in event. Info:", JSON.stringify(info, null, 2));
      setUploadError("Không thể đọc file, vui lòng thử lại.");
    }
  };

  const handleUpload = async () => {
    console.log("Upload file:", uploadFile);
    
    if (!uploadFile) {
      setUploadError("Vui lòng chọn một tệp DOCX.");
      return;
    }

    const selectedCourse = uploadForm.getFieldValue('uploadCourseId');
    if (!selectedCourse) {
      setUploadError("Vui lòng chọn khóa học.");
      return;
    }

    const selectedType = uploadForm.getFieldValue('uploadQuestionType');
    if (!selectedType) {
      setUploadError("Vui lòng chọn loại câu hỏi.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("courseId", selectedCourse);
    formData.append("dialogType", selectedType);
    formData.append("accountId", "2"); // Mặc định là người dùng hiện tại

    try {
      setLoading(true);
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      console.log("Sending request to:", ADMIN_UPLOAD_DOCX);
      console.log("Form data:", {
        courseId: selectedCourse,
        questionType: selectedType,
        fileName: uploadFile.name
      });

      // Gọi API thực tế
      const response = await fetch(
        ADMIN_UPLOAD_DOCX,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        message.success("Thêm câu hỏi thành công!");
        handleUploadModalClose();
        fetchQuestions(); // Refresh danh sách câu hỏi
      } else {
        const errorText = await response.text();
        console.error("Upload error response:", response.status, errorText);
        setUploadError(`Lỗi: ${errorText}`);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("Có lỗi xảy ra khi tải lên file!");
    } finally {
      setLoading(false);
    }
  };

  const handleMultipleDelete = async () => {
    try {
      if (selectedQuestions.length === 0) {
        return;
      }
      
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const response = await fetch(
        ADMIN_DELETE_CHOOSE_QUESTION,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedQuestions),
        }
      );

      if (response.ok) {
        message.success("Xóa câu hỏi thành công!");
        // Cập nhật lại state, lọc bỏ các câu hỏi đã bị xóa
        setQuestions(questions.filter(q => !selectedQuestions.includes(q.id.toString())));
        setSelectedQuestions([]);
        // Không cần fetchQuestions() vì đã cập nhật state trực tiếp
      } else {
        const errorText = await response.text();
        toast.error(`Có lỗi xảy ra khi xóa câu hỏi: ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting questions:", error);
      toast.error("Có lỗi xảy ra khi xóa câu hỏi!");
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Create query params for any active filters
      const params = new URLSearchParams({
        ...(filterCourse && { courseId: filterCourse }),
        ...(typeFilter && { type: typeFilter }),
        ...(levelFilter && { level: levelFilter }),
        ...(searchText && { content: searchText }),
      });

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/export-excel?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
          'questions.xlsx';
        a.download = filename;
        // Trigger download
        document.body.appendChild(a);
        a.click();
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success("Tải xuống file Excel thành công!");
      } else {
        const errorText = await response.text();
        toast.error(`Có lỗi xảy ra khi tải xuống file Excel: ${errorText}`);
      }
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Có lỗi xảy ra khi tải xuống file Excel!");
    }
  };

  const handleExportDocx = async () => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Create query params for any active filters
      const params = new URLSearchParams({
        ...(filterCourse && { courseId: filterCourse }),
        ...(typeFilter && { type: typeFilter }),
        ...(levelFilter && { level: levelFilter }),
        ...(searchText && { content: searchText }),
      });

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/questions/export-docx?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
          'questions.docx';
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
        toast.error(`Có lỗi xảy ra khi tải xuống file DOCX: ${errorText}`);
      }
    } catch (error) {
      console.error("Error exporting to DOCX:", error);
      toast.error("Có lỗi xảy ra khi tải xuống file DOCX!");
    }
  };

  const handleExportSelectedQuestionsDocx = async () => {
    try {
      if (selectedQuestions.length <= 0) {
        toast.error("Vui lòng chọn ít nhất một câu hỏi để xuất!");
        return;
      }

      const token = await authTokenLogin(refreshToken, refresh, navigate);
      
      const response = await fetch(
        ADMIN_EXPORT_QUESTION_DOCX,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedQuestions),
        }
      );

      if (response.ok) {
        // Get the file as a blob
        const blob = await response.blob();
        // Create a local URL for the blob
        const url = window.URL.createObjectURL(blob);
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = "selected_questions.docx";
        // Trigger download
        document.body.appendChild(a);
        a.click();
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success("Tải xuống câu hỏi đã chọn thành công!");
      } else {
        const errorText = await response.text();
        toast.error(`Có lỗi xảy ra khi tải xuống câu hỏi: ${errorText}`);
      }
    } catch (error) {
      console.error("Error exporting questions:", error);
      toast.error("Có lỗi xảy ra khi tải xuống câu hỏi!");
    }
  };

  return (
    <div>
      <Title level={2}>Ngân hàng câu hỏi</Title>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Lọc theo khóa học"
              style={{ width: 200 }}
              allowClear
              onChange={handleCourseFilterChange}
              loading={courses.length === 0}
            >
              {courses.map(course => (
                <Option key={course.id} value={course.id.toString()}>{course.name}</Option>
              ))}
            </Select>
            <Select
              placeholder="Độ khó"
              style={{ width: 150 }}
              allowClear
              onChange={handleLevelFilterChange}
            >
              <Option value="1">Dễ</Option>
              <Option value="2">Trung bình</Option>
              <Option value="3">Khó</Option>
            </Select>
          </Space>
          <Space>
            <Dropdown 
              overlay={
                <Menu>
                  <Menu.Item 
                    key="1" 
                    icon={<FileExcelOutlined />} 
                    onClick={handleExportExcel}
                  >
                    Xuất Excel
                  </Menu.Item>
                
                  <Menu.Item 
                    key="2" 
                    icon={<FileWordOutlined />} 
                    onClick={handleExportSelectedQuestionsDocx}
                    disabled={selectedQuestions.length === 0}
                  >
                    Xuất DOCX
                  </Menu.Item>
                  <Menu.Item 
                    key="3" 
                    icon={<UploadOutlined />} 
                    onClick={handleUploadModalOpen}
                  >
                    Thêm từ file
                  </Menu.Item>
                </Menu>
              }
              placement="bottomRight"
            >
              <Button icon={<ImportOutlined />}>
                Nhập/Xuất <DownloadOutlined />
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Thêm câu hỏi
            </Button>
          </Space>
        </div>

        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        
          <Space>

            <Popconfirm
              title="Bạn có chắc chắn muốn xóa các câu hỏi đã chọn?"
              onConfirm={handleMultipleDelete}
              okText="Có"
              cancelText="Không"
              disabled={selectedQuestions.length === 0}
            >
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                disabled={selectedQuestions.length === 0}
              >
                Xóa {selectedQuestions.length > 0 ? selectedQuestions.length : ''} câu hỏi
              </Button>
            </Popconfirm>
            <Button
              onClick={() => setSelectedQuestions([])}
              disabled={selectedQuestions.length === 0}
            >
              Bỏ chọn
            </Button>
            
          </Space>
        </div>

        <Tabs defaultActiveKey="all" onChange={handleTabChange}>
          <TabPane tab="Tất cả" key="all" />
          <TabPane tab="Một lựa chọn" key="multiple-choice" />
          <TabPane tab="Nhiều lựa chọn" key="checkbox" />
          <TabPane tab="Điền khuyết" key="fill-in-the-blank" />
          <TabPane tab="Tự luận" key="essay" />
        </Tabs>
      </Card>

      <Table
        columns={columns}
        dataSource={questions}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: rowsPerPage,
          total: totalQuestionsCount,
          onChange: handlePageChange,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total) => `Tổng cộng ${total} câu hỏi`
        }}
        scroll={{ x: 1200 }}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedQuestions,
          onChange: (selectedRowKeys) => {
            setSelectedQuestions(selectedRowKeys as string[]);
          },
        }}
      />

      <Modal
        title={editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingQuestion ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            // When question type changes, clear answer-related fields
            if (changedValues.type) {
              form.setFieldsValue({
                optionA: '',
                optionB: '',
                optionC: '',
                optionD: '',
                result: '',
                optionChecks: { A: false, B: false, C: false, D: false },
                instruction: ''
              });
            }
          }}
        >
          <Form.Item
            name="courseId"
            label="Khóa học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
          >
            <Select placeholder="Chọn khóa học">
              {courses.map(course => (
                <Option key={course.id} value={course.id}>{course.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại câu hỏi"
            rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi!' }]}
          >
            <Select>
              <Option value="multiple-choice">Một lựa chọn</Option>
              <Option value="checkbox">Nhiều lựa chọn</Option>
              <Option value="fill-in-the-blank">Điền khuyết</Option>
              <Option value="essay">Tự luận</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung câu hỏi"
            extra={questionType === 'fill-in-the-blank' ? "Sử dụng dấu gạch dưới (___, ____, _____) để đánh dấu chỗ cần điền." : undefined}
            rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="level"
            label="Độ khó"
            rules={[{ required: true, message: 'Vui lòng chọn độ khó!' }]}
          >
            <Select>
              <Option value="1">Dễ</Option>
              <Option value="2">Trung bình</Option>
              <Option value="3">Khó</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="topic"
            label="Chủ đề"
            rules={[{ required: true, message: 'Vui lòng nhập chủ đề!' }]}
          >
            <Input />
          </Form.Item>

          {/* Phần này sẽ hiển thị khi cần thêm các lựa chọn cho câu hỏi */}
          {questionType && questionType !== 'essay' && (
            <>
              <Divider orientation="left">
                {questionType === 'fill-in-the-blank' ? 'Đáp án điền khuyết' : 'Các lựa chọn'}
              </Divider>
              {questionType === 'fill-in-the-blank' ? (
                <>
                  <Form.Item
                    name="result"
                    label="Đáp án đúng"
                    rules={[{ required: true, message: 'Vui lòng nhập đáp án đúng!' }]}
                  >
                    <Input placeholder="Nhập đáp án cần điền vào chỗ trống" />
                  </Form.Item>
                  <Form.Item
                    name="instruction"
                    label="Hướng dẫn"
                  >
                    <TextArea rows={2} placeholder="Hướng dẫn cách điền đáp án (không bắt buộc)" />
                  </Form.Item>
                </>
              ) : questionType === 'checkbox' ? (
                <>
                  <Form.Item
                    name="optionA"
                    label="Lựa chọn A"
                    rules={[{ required: true, message: 'Vui lòng nhập lựa chọn A!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="optionB"
                    label="Lựa chọn B"
                    rules={[{ required: true, message: 'Vui lòng nhập lựa chọn B!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="optionC"
                    label="Lựa chọn C"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="optionD"
                    label="Lựa chọn D"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Đáp án đúng"
                    required
                  >
                    <div>
                      <Form.Item
                        name={['optionChecks', 'A']}
                        valuePropName="checked"
                        style={{ display: 'inline-block', marginBottom: 8, marginRight: 12 }}
                      >
                        <Checkbox>A</Checkbox>
                      </Form.Item>
                      <Form.Item
                        name={['optionChecks', 'B']}
                        valuePropName="checked"
                        style={{ display: 'inline-block', marginBottom: 8, marginRight: 12 }}
                      >
                        <Checkbox>B</Checkbox>
                      </Form.Item>
                      <Form.Item
                        name={['optionChecks', 'C']}
                        valuePropName="checked"
                        style={{ display: 'inline-block', marginBottom: 8, marginRight: 12 }}
                      >
                        <Checkbox>C</Checkbox>
                      </Form.Item>
                      <Form.Item
                        name={['optionChecks', 'D']}
                        valuePropName="checked"
                        style={{ display: 'inline-block', marginBottom: 8 }}
                      >
                        <Checkbox>D</Checkbox>
                      </Form.Item>
                    </div>
                  </Form.Item>
                  <Form.Item
                    name="instruction"
                    label="Hướng dẫn"
                  >
                    <TextArea rows={2} placeholder="Hướng dẫn thêm về câu hỏi (không bắt buộc)" />
                  </Form.Item>
                </>
              ) : (
                <>
                  <Form.Item
                    name="optionA"
                    label="Lựa chọn A"
                    rules={[{ required: true, message: 'Vui lòng nhập lựa chọn A!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="optionB"
                    label="Lựa chọn B"
                    rules={[{ required: true, message: 'Vui lòng nhập lựa chọn B!' }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="optionC"
                    label="Lựa chọn C"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="optionD"
                    label="Lựa chọn D"
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="result"
                    label="Đáp án đúng"
                    rules={[{ required: true, message: 'Vui lòng chọn đáp án đúng!' }]}
                  >
                    <Radio.Group>
                      <Radio value="A">A</Radio>
                      <Radio value="B">B</Radio>
                      <Radio value="C">C</Radio>
                      <Radio value="D">D</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item
                    name="instruction"
                    label="Hướng dẫn"
                  >
                    <TextArea rows={2} placeholder="Hướng dẫn thêm về câu hỏi (không bắt buộc)" />
                  </Form.Item>
                </>
              )}
            </>
          )}

          {questionType === 'essay' && (
            <Form.Item
              name="instruction"
              label="Hướng dẫn"
            >
              <TextArea rows={3} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        title="Xem trước câu hỏi"
        open={previewVisible}
        onCancel={handlePreviewCancel}
        footer={[
          <Button key="back" onClick={handlePreviewCancel}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {previewQuestion && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>Nội dung:</strong> {previewQuestion.content}
            </div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <span><strong>Loại câu hỏi:</strong> {getQuestionTypeText(previewQuestion.type)}</span>
                <span><strong>Độ khó:</strong> <Tag color={getLevelColor(previewQuestion.level)}>{getLevelText(previewQuestion.level)}</Tag></span>
                <span><strong>Chủ đề:</strong> {previewQuestion.topic}</span>
              </Space>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <span><strong>Khóa học:</strong> {courses.find(c => c.id === previewQuestion.courseId)?.name || 'Không xác định'}</span>
                <span><strong>Ngày tạo:</strong> {previewQuestion.createdAt}</span>
              </Space>
            </div>

            {previewQuestion.type === 'essay' ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8 }}><strong>Hướng dẫn:</strong></div>
                <div style={{ color: '#666' }}>
                  {previewQuestion.instruction || <em>Câu hỏi tự luận, học sinh sẽ tự nhập câu trả lời.</em>}
                </div>
              </div>
            ) : previewQuestion.type === 'fill-in-the-blank' ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8 }}><strong>Đáp án:</strong> {previewQuestion.result}</div>
                {previewQuestion.instruction && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Hướng dẫn:</strong> {previewQuestion.instruction}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 8 }}><strong>Các lựa chọn:</strong></div>
                {options.map((option, index) => (
                  <div key={option.id} style={{ marginBottom: 8, display: 'flex', alignItems: 'center' }}>
                    <Radio checked={option.isCorrect} disabled />
                    <span style={{ marginLeft: 8 }}>
                      {String.fromCharCode(65 + index)}. {option.content}
                    </span>
                    {option.isCorrect && <Tag color="green" style={{ marginLeft: 8 }}>Đáp án đúng</Tag>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Thêm câu hỏi từ file DOCX"
        open={uploadModalVisible}
        onOk={handleUpload}
        onCancel={handleUploadModalClose}
        okText="Tải lên"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={uploadForm} layout="vertical">
          <Form.Item
            name="uploadCourseId"
            label="Khóa học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học!' }]}
          >
            <Select placeholder="Chọn khóa học cho các câu hỏi" loading={courses.length === 0}>
              {courses.map(course => (
                <Option key={course.id} value={course.id.toString()}>{course.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="uploadQuestionType"
            label="Loại câu hỏi"
            rules={[{ required: true, message: 'Vui lòng chọn loại câu hỏi!' }]}
          >
            <Select placeholder="Chọn loại câu hỏi">
              <Option value="multiple-choice">Một lựa chọn</Option>
              <Option value="checkbox">Nhiều lựa chọn</Option>
              <Option value="fill-in-the-blank">Điền khuyết</Option>
              <Option value="essay">Tự luận</Option>
              <Option value="mixed">Hỗn hợp</Option>
            </Select>
          </Form.Item>

          <Upload.Dragger
            name="file"
            multiple={false}
            maxCount={1}
            beforeUpload={(file) => {
              console.log("beforeUpload called with file:", file.name);
              setUploadFile(file);
              return false; // Prevent auto upload
            }}
            onRemove={() => {
              console.log("onRemove called");
              setUploadFile(null);
              return true;
            }}
            accept=".docx"
            fileList={uploadFile ? [
              {
                uid: '1',
                name: uploadFile.name,
                status: 'done',
                size: uploadFile.size,
                type: uploadFile.type,
              } as UploadFile
            ] : []}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Nhấp hoặc kéo thả file DOCX vào khu vực này</p>
            <p className="ant-upload-hint">
              Chỉ hỗ trợ tệp DOCX. Đảm bảo file có định dạng đúng theo mẫu.
            </p>
          </Upload.Dragger>

          {uploadError && (
            <Alert
              message={uploadError}
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}

          <div style={{ marginTop: 16 }}>
            <Typography.Title level={5}>Hướng dẫn định dạng file</Typography.Title>
            <ul>
              <li>Mỗi câu hỏi phải được đánh dấu bằng "Q:" ở đầu dòng</li>
              <li>Các lựa chọn được đánh dấu bằng "A:", "B:", "C:", "D:" (cho loại lựa chọn)</li>
              <li>Đáp án đúng được đánh dấu bằng "Answer:" (VD: Answer: A hoặc Answer: A,B)</li>
              <li>Độ khó được đánh dấu bằng "Level:" (1, 2, 3)</li>
              <li>Chủ đề được đánh dấu bằng "Topic:"</li>
              <li>Hướng dẫn được đánh dấu bằng "Instruction:" (cho câu hỏi tự luận)</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default QuestionBankPage; 