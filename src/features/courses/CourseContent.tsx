import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Button, Tree, Typography, Empty, Spin, Modal, Form,
  Input, Switch, Select, message, Collapse, Tabs, Tag, Upload, Space, Tooltip, Descriptions, Divider, Row, Col, Popconfirm
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  FileOutlined, FolderOutlined, PlayCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, UploadOutlined,
  InboxOutlined, InfoCircleOutlined, DownOutlined, RightOutlined,
  EyeOutlined, EyeInvisibleOutlined, VideoCameraOutlined, FileImageOutlined, DownloadOutlined
} from '@ant-design/icons';
import { Chapter, Lesson, Video, TestExam } from './Courses';
import { useParams, useNavigate } from 'react-router-dom';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils';
import './CourseContent.css';
import TextEditor from './TextEditor';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { Option } = Select;

// API Endpoints
export const ADMIN_POST_CHAPTER = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/add`;
export const ADMIN_HIDE_CHAPTER = `${process.env.REACT_APP_SERVER_HOST}/api/chapters/hide`;
export const ADMIN_UPDATE_CHAPTER = (id: string) => `${process.env.REACT_APP_SERVER_HOST}/api/chapters/edit/${id}`;
export const ADMIN_POST_LESSON = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/add`;
export const ADMIN_UPDATE_LESSON = (lessonId: number) => `${process.env.REACT_APP_SERVER_HOST}/api/lessons/update/${lessonId}`;
export const ADMIN_UPLOAD_BATCH = `${process.env.REACT_APP_SERVER_HOST}/api/lessons/add-lesson-with-video`;
export const ADMIN_PUT_DELETE_LESSON = (lessonId: string) => `${process.env.REACT_APP_SERVER_HOST}/api/lessons/delete/${lessonId}`;
export const ADMIN_POST_ADD_VIDEO = `${process.env.REACT_APP_SERVER_HOST}/api/videos/uploadVideo`;
export const ADMIN_POST_UPDATE_VIDEO = (videoId: number) => `${process.env.REACT_APP_SERVER_HOST}/api/videos/update/${videoId}`;
export const ADMIN_DELETE_VIDEO = (videoId: string) => `${process.env.REACT_APP_SERVER_HOST}/api/videos/${videoId}`;
export const ADMIN_GET_AVAILABLE_TESTS = (courseId: string, chapterId: string) =>
  `${process.env.REACT_APP_SERVER_HOST}/api/tests/course/availible/${courseId}?chapterId=${chapterId}`;
export const ADMIN_ADD_TEST_TO_LESSON = (id: number) => `${process.env.REACT_APP_SERVER_HOST}/api/tests/update-to-lesson/${id}`;
export const ADMIN_DELETE_TEST = (testId: string) => `${process.env.REACT_APP_SERVER_HOST}/api/tests/delete/${testId}`;

// Helper function to format duration from seconds to hours and minutes
const formatDuration = (seconds: number): string => {
  if (!seconds) return '0 phút';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0
      ? `${hours} giờ ${minutes} phút`
      : `${hours} giờ`;
  } else {
    return `${minutes} phút`;
  }
};

interface CourseContentProps {
  courseId: string;
}

// Update the CourseInfo interface to match Course interface
interface CourseInfo {
  id: string;
  title: string;
  course_category_id: string;
  description: string;
  image_url: string;
  language: string;
  author: string;
  courseOutput: string;
  account_id: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
  deletedDate: string;
  deleted: boolean;
  cost: number;
  price: number;
  type: string;
  status: boolean;
}

const CourseContent: React.FC<CourseContentProps> = ({ courseId }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [tests, setTests] = useState<TestExam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [chapterModalVisible, setChapterModalVisible] = useState<boolean>(false);
  const [lessonModalVisible, setLessonModalVisible] = useState<boolean>(false);
  const [videoModalVisible, setVideoModalVisible] = useState<boolean>(false);
  const [testModalVisible, setTestModalVisible] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [chapterForm] = Form.useForm();
  const [lessonForm] = Form.useForm();
  const [videoForm] = Form.useForm();
  const [testForm] = Form.useForm();
  const [batchVideoModalVisible, setBatchVideoModalVisible] = useState<boolean>(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [batchVideoForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [videoFile, setVideoFile] = useState<any>(null);
  const [documentFile, setDocumentFile] = useState<any>(null);
  const [availableTests, setAvailableTests] = useState<TestExam[]>([]);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [courseModalVisible, setCourseModalVisible] = useState<boolean>(false);
  const [courseThumbnail, setCourseThumbnail] = useState<any>(null);
  const [courseForm] = Form.useForm();
  const [courseInfoExpanded, setCourseInfoExpanded] = useState<boolean>(false);
  const [showCourseInfo, setShowCourseInfo] = useState<boolean>(false);
  const [courseInfoModalVisible, setCourseInfoModalVisible] = useState<boolean>(false);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState<boolean>(false);
  const refresh = useRefreshToken();
  const navigate = useNavigate();
  const refreshToken = localStorage.getItem("refreshToken");
  useEffect(() => {
    // Fetch course content data
    fetchCourseContent();
  }, [courseId]);

  // Fetch available tests when component mounts
  useEffect(() => {
    fetchAvailableTests();
  }, []);

  // Add useEffect to fetch course info
  useEffect(() => {
    fetchCourseInfo();
  }, [courseId]);

  const getChapters = async (courseId: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/chapters/courses/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lấy chương');
      }

      const data = await response.json();
      return data.data || []; // Dữ liệu sẽ được trả về trong thuộc tính `data`
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getLessons = async (courseId: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/lessons/course/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lấy bài học');
      }

      const data = await response.json();
      return data.data || []; // Dữ liệu sẽ được trả về trong thuộc tính `data`
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getVideos = async (courseId: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/videos/course/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lấy video');
      }

      const data = await response.json();
      return data.data || []; // Dữ liệu sẽ được trả về trong thuộc tính `data`
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getTests = async (courseId: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/tests/course/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Lỗi khi lấy bài kiểm tra');
      }

      const data = await response.json();
      return data.data || []; // Dữ liệu sẽ được trả về trong thuộc tính `data`
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const fetchCourseContent = async () => {
    setLoading(true);

    try {
      // Fetch all content in parallel
      const [chaptersData, lessonsData, videosData, testsData] = await Promise.all([
        getChapters(courseId),
        getLessons(courseId),
        getVideos(courseId),
        getTests(courseId)
      ]);

      setChapters(chaptersData);
      setLessons(lessonsData);
      setVideos(videosData);
      setTests(testsData);

      if (chaptersData.length > 0) {
        setActiveChapter(chaptersData[0].id?.toString() || '');
      }
    } catch (error) {
      console.error("Error fetching course content:", error);
      message.error("Không thể tải nội dung khóa học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch available tests
  const fetchAvailableTests = async (chapterId?: string) => {
    try {
      setLoading(true);
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // If no chapterId is provided, we'll use the activeChapter or first chapter
      const targetChapterId = chapterId || activeChapter || (chapters.length > 0 ? chapters[0].id : '');

      if (!targetChapterId) {
        setAvailableTests([]);
        setLoading(false);
        return;
      }

      const response = await fetch(ADMIN_GET_AVAILABLE_TESTS(courseId, targetChapterId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Lỗi khi lấy bài kiểm tra');
      }

      const data = await response.json();

      if (data.status === 200 && data.data) {
        setAvailableTests(data.data || []);
      } else {
        message.warning('Không có bài kiểm tra phù hợp cho chương này.');
        setAvailableTests([]);
      }
    } catch (error) {
      console.error('Error fetching available tests:', error);
      message.error('Không thể tải danh sách bài kiểm tra.');
      setAvailableTests([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch course information
  const fetchCourseInfo = async () => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const url = `${process.env.REACT_APP_SERVER_HOST}/api/courses/${courseId}`;

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
        // Map API response to CourseInfo interface
        const courseData = data.data;
        setCourseInfo(courseData);
      } else {
        message.error('Không thể tải thông tin khóa học');
      }
    } catch (error) {
      console.error('Error occurred while fetching the course:', error);
      message.error('Đã xảy ra lỗi khi tải thông tin khóa học');
    }
  };

  const handleAddChapter = () => {
    setEditingItem(null);
    chapterForm.resetFields();
    setChapterModalVisible(true);
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingItem(chapter);
    chapterForm.setFieldsValue({
      chapter_title: chapter.chapter_title,
      status: chapter.status,
    });
    setChapterModalVisible(true);
  };

  const handleSaveChapter = async () => {
    try {
      const values = await chapterForm.validateFields();

      if (editingItem) {
        // Update chapter via API
        setLoading(true);
        const token = await authTokenLogin(refreshToken, refresh, navigate);

        try {
          const response = await fetch(ADMIN_UPDATE_CHAPTER(editingItem.id), {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: values.chapter_title,
              status: values.status
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update chapter");
          }

          // Refresh content to get the updated chapter from the server
          fetchCourseContent();
          message.success('Cập nhật chương học thành công');
          setChapterModalVisible(false);
        } catch (error) {
          console.error("Error updating chapter:", error);
          message.error('Cập nhật chương học thất bại. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      } else {
        // Add new chapter via API
        setLoading(true);
        const token = await authTokenLogin(refreshToken, refresh, navigate);

        const chapterData = {
          title: values.chapter_title,
          id_course: courseId,
          status: values.status
        };

        try {
          const response = await fetch(ADMIN_POST_CHAPTER, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(chapterData),
          });

          if (!response.ok) {
            throw new Error("Failed to add chapter");
          }

          // Refresh content to get the new chapter from the server
          fetchCourseContent();
          message.success('Thêm chương học mới thành công');
          setChapterModalVisible(false);
        } catch (error) {
          console.error("Error adding chapter:", error);
          message.error('Thêm chương học thất bại. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa chương học này? Tất cả bài học, video và bài kiểm tra sẽ bị xóa theo.',
      onOk: async () => {
        try {
          const token = await authTokenLogin(refreshToken, refresh, navigate);
          const response = await fetch(`${ADMIN_HIDE_CHAPTER}/${chapterId}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to delete chapter");
          }
          // Refresh content to reflect the changes
          fetchCourseContent();
          message.success('Xóa chương học thành công');
        } catch (error) {
          console.error("Error deleting chapter:", error);
          message.error('Xóa chương học thất bại. Vui lòng thử lại.');
        }
      },
    });
  };

  // Add Lesson functions
  const handleAddLesson = (chapterId: string) => {
    setEditingItem({
      chapterId: parseInt(chapterId)
    });
    lessonForm.resetFields();
    lessonForm.setFieldsValue({
      chapter_id: parseInt(chapterId),
      duration: 300,
      is_test_excluded: 'EMPTYTEST',
      status: true,
      isRequired: false,
      learningTip: '',
      keyPoint: '',
      overviewLesson: ''
    });
    setLessonModalVisible(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    try {
      console.log("Editing lesson:", lesson); // Debug log
      setEditingItem(lesson);
      lessonForm.setFieldsValue({
        lesson_title: lesson.lessonTitle || '',
        duration: lesson.duration || 300,
        chapter_id: lesson.chapterId || '',
        topic: lesson.topic || '',
        status: lesson.status,
        is_test_excluded: lesson.isTestExcluded || 'EMPTYTEST',
        isRequired: lesson.isRequired || false,
        learningTip: lesson.learningTip || '',
        keyPoint: lesson.keyPoint || '',
        overviewLesson: lesson.overviewLesson || '',
      });
      setLessonModalVisible(true);
    } catch (error) {
      console.error("Error in handleEditLesson:", error);
      message.error("Có lỗi khi mở modal chỉnh sửa bài học");
    }
  };

  const handleSaveLesson = async () => {
    try {
      const values = await lessonForm.validateFields();

      if (editingItem && editingItem.id) {

        setLoading(true);
        const token = await authTokenLogin(refreshToken, refresh, navigate);

        const updatedLessons = {
          title: values.lesson_title,
          chapter_id: values.chapter_id,
          course_id: courseId,
          status: values.status,
          duration: values.duration,
          topic: values.topic || '',
          isTestExcluded: values.is_test_excluded,
          isRequired: values.isRequired,
          learningTip: values.learningTip || '',
          keyPoint: values.keyPoint || '',
          overviewLesson: values.overviewLesson || ''
        };
        try {
          const response = await fetch(ADMIN_UPDATE_LESSON(editingItem.id), {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedLessons),
          });

          if (!response.ok) {
            throw new Error("Failed to edit lesson");
          }

          // Refresh content to get the new lesson from the server
          fetchCourseContent();
          message.success('Cập nhật bài học thành công');
          setLessonModalVisible(false);
        } catch (error) {
          console.error("Error editing lesson:", error);
          message.error('Cập nhật bài học thất bại. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      } else {
        // Add new lesson via API
        setLoading(true);
        const token = await authTokenLogin(refreshToken, refresh, navigate);

        const lessonData = {
          title: values.lesson_title,
          chapter_id: values.chapter_id,
          course_id: courseId,
          status: values.status,
          duration: values.duration,
          topic: values.topic || '',
          isTestExcluded: values.is_test_excluded,
          isRequired: values.isRequired,
          learningTip: values.learningTip || '',
          keyPoint: values.keyPoint || '',
          overviewLesson: values.overviewLesson || ''
        };

        try {
          const response = await fetch(ADMIN_POST_LESSON, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(lessonData),
          });

          if (!response.ok) {
            throw new Error("Failed to add lesson");
          }

          // Refresh content to get the new lesson from the server
          fetchCourseContent();
          message.success('Thêm bài học mới thành công');
          setLessonModalVisible(false);
        } catch (error) {
          console.error("Error adding lesson:", error);
          message.error('Thêm bài học thất bại. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài học này? Tất cả video và bài kiểm tra sẽ bị xóa theo.',
      onOk: async () => {
        try {
          setLoading(true);
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          const response = await fetch(ADMIN_PUT_DELETE_LESSON(lessonId), {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to delete lesson");
          }

          // Refresh content to get updated data
          await fetchCourseContent();
          message.success('Xóa bài học thành công');
        } catch (error) {
          console.error("Error deleting lesson:", error);
          message.error('Xóa bài học thất bại. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Add Video functions
  const handleAddVideo = (lessonId: string) => {
    setEditingItem({
      lesson_id: lessonId
    });
    videoForm.resetFields();
    videoForm.setFieldsValue({
      lesson_id: lessonId,
      isViewTest: true
    });
    setVideoFile(null);
    setDocumentFile(null);
    setVideoModalVisible(true);
  };

  const handleEditVideo = (video: Video) => {
    setEditingItem(video);
    videoForm.setFieldsValue({
      lesson_id: video.lesson_id,
      video_title: video.video_title,
      documentShort: video.documentShort,
      isViewTest: video.isViewTest,
    });
    setVideoFile(null);
    setDocumentFile(null);
    setVideoModalVisible(true);
  };

  // Update the handleSaveVideo function to handle chapter videos
  const handleSaveVideo = async () => {
    try {
      const values = await videoForm.validateFields();

      if (editingItem && 'video_title' in editingItem) {
        try {
          setLoading(true);
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          const formData = new FormData();
          formData.append("lesson_id", values.lesson_id);
          formData.append("video_title", values.video_title);
          formData.append("file", videoFile);
          formData.append("documentFile", documentFile);
          formData.append("documentShort", values.documentShort || '');
          formData.append("isViewTest", values.isViewTest.toString());

          // Send POST request to API
          const response = await fetch(ADMIN_POST_UPDATE_VIDEO(editingItem.id), {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Lỗi khi tải video lên");
          }

          // Refresh content to show the newly added video
          await fetchCourseContent();
          message.success('Cập nhật video thành công');
        } catch (error) {
          console.error("Error uploading video:", error);
          message.error('Cập nhật video thất bại. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }

      } else {
        // Add new video
        if (!videoFile) {
          message.error('Vui lòng chọn file video');
          return;
        }

        try {
          setLoading(true);
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          const formData = new FormData();
          formData.append("lesson_id", values.lesson_id);
          formData.append("video_title", values.video_title);
          formData.append("file", videoFile);
          formData.append("documentFile", documentFile);
          formData.append("documentShort", values.documentShort || '');
          formData.append("isViewTest", values.isViewTest.toString());

          // Send POST request to API
          const response = await fetch(ADMIN_POST_ADD_VIDEO, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Lỗi khi tải video lên");
          }

          // Refresh content to show the newly added video
          await fetchCourseContent();
          message.success('Thêm video mới thành công');
        } catch (error) {
          console.error("Error uploading video:", error);
          message.error('Thêm video thất bại. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      }

      // Reset file states
      setVideoFile(null);
      setDocumentFile(null);
      setVideoModalVisible(false);
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  const handleDeleteVideo = (videoId: string, videoTitle: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa video',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa video này?</p>
          <p><strong>{videoTitle}</strong></p>
          <p style={{ color: 'red' }}>Lưu ý: Hành động này không thể hoàn tác!</p>
        </div>
      ),
      okText: 'Xác nhận',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk() {
        // Second confirmation
        Modal.confirm({
          title: 'Xác nhận lần cuối',
          content: (
            <div>
              <p>Bạn <strong>thật sự chắc chắn</strong> muốn xóa video này?</p>
              <p><strong>{videoTitle}</strong></p>
              <p style={{ color: 'red' }}>Video sẽ bị xóa vĩnh viễn và không thể khôi phục!</p>
            </div>
          ),
          okText: 'Xóa vĩnh viễn',
          okButtonProps: { danger: true },
          cancelText: 'Giữ lại',
          onOk: async () => {
            try {
              setLoading(true);
              const token = await authTokenLogin(refreshToken, refresh, navigate);

              const response = await fetch(ADMIN_DELETE_VIDEO(videoId), {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) {
                throw new Error("Failed to delete video");
              }

              // Refresh content to reflect the changes
              await fetchCourseContent();
              message.success('Xóa video thành công');
            } catch (error) {
              console.error("Error deleting video:", error);
              message.error('Xóa video thất bại. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          },
        });
      },
    });
  };

  // Update the handleAddTest function with better context
  const handleAddTest = (lessonId: string, chapterId: string, isChapterTest: boolean = false) => {
    // Find the lesson or chapter to get the title
    const targetChapter = chapters.find(c => c.id === chapterId);
    const targetLesson = lessonId ? lessons.find(l => l.id === lessonId) : null;

    setEditingItem({
      lessonId: isChapterTest ? null : parseInt(lessonId),
      chapterId: parseInt(chapterId),
      isChapterTest,
      chapterTitle: targetChapter?.chapter_title || '',
      lessonTitle: targetLesson?.lessonTitle || ''
    });

    testForm.resetFields();
    testForm.setFieldsValue({
      lessonId: isChapterTest ? null : parseInt(lessonId),
      chapterId: parseInt(chapterId),
      courseId: parseInt(courseId),
    });

    // Fetch available tests for this chapter
    fetchAvailableTests(chapterId);

    setTestModalVisible(true);
  };

  // Replace Edit Test function with Revoke Test function
  const handleRevokeTest = (test: TestExam, lesson?: Lesson) => {
    Modal.confirm({
      title: 'Thu hồi bài kiểm tra',
      content: (
        <div>
          <p>Bạn có chắc chắn muốn thu hồi bài kiểm tra này?</p>
          <p><strong>{test.title}</strong></p>
          <p>Sau khi thu hồi, bạn có thể thêm bài kiểm tra khác vào {lesson ? 'bài học này' : 'chương này'}.</p>
        </div>
      ),
      okText: 'Thu hồi',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLoading(true);
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          console.log('Revoking test with ID:', test.id);

          const response = await fetch(ADMIN_DELETE_TEST(test.id), {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          console.log('API response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Error response:', errorData);
            throw new Error(errorData?.message || "Failed to revoke test");
          }

          // Refresh content to reflect the changes
          await fetchCourseContent();
          message.success('Thu hồi bài kiểm tra thành công');

          // Show modal to add new test
          if (lesson) {
            handleAddTest(lesson.id, lesson.chapterId ? lesson.chapterId.toString() : '');
          } else if (test.chapterId) {
            handleAddTest('', test.chapterId.toString(), true);
          }
        } catch (error) {
          console.error("Error revoking test:", error);
          message.error('Thu hồi bài kiểm tra thất bại. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Simplify Save Test function
  const handleSaveTest = async () => {
    try {
      const values = await testForm.validateFields();
      setLoading(true);

      // Find the selected test from available tests
      const selectedTest = availableTests.find(test => test.id === values.testId);

      if (!selectedTest) {
        message.error('Vui lòng chọn bài kiểm tra');
        setLoading(false);
        return;
      }

      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const testData = {
        // testId: values.testId,
        lessonId: values.lessonId,
        // chapterId: values.chapterId,
        // courseId: values.courseId,
      };

      try {
        // Use API endpoint to add test to lesson
        const response = await fetch(ADMIN_ADD_TEST_TO_LESSON(values.testId), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error('Error response:', errorData);
          throw new Error(errorData?.message || "Failed to add test");
        }

        const responseData = await response.json();

        // Refresh tests data
        await fetchCourseContent();
        message.success('Thêm bài kiểm tra mới thành công');
        setTestModalVisible(false);
      } catch (error) {
        console.error("Error adding/updating test:", error);
        message.error('Thao tác với bài kiểm tra thất bại. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    } catch (info) {
      console.log('Validate Failed:', info);
      setLoading(false);
    }
  };

  const handleDeleteTest = (testId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài kiểm tra này?',
      onOk: async () => {
        try {
          setLoading(true);
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          console.log('Deleting test with ID:', testId);

          const response = await fetch(ADMIN_DELETE_TEST(testId), {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          console.log('API response status:', response.status);

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Error response:', errorData);
            throw new Error(errorData?.message || "Failed to delete test");
          }

          // Refresh content to reflect the changes
          await fetchCourseContent();
          message.success('Xóa bài kiểm tra thành công');
        } catch (error) {
          console.error("Error deleting test:", error);
          message.error('Xóa bài kiểm tra thất bại. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Update handleBatchVideoUpload to use actual file upload
  const handleBatchVideoUpload = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setBatchVideoModalVisible(true);
    batchVideoForm.resetFields();
    setFileList([]);
  };

  // Updated to use real API for batch upload
  const handleSaveBatchVideos = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn ít nhất một file video');
      return;
    }

    try {
      setLoading(true);
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const formData = new FormData();

      // Append each file to FormData
      fileList.forEach((file) => {
        formData.append("files", file.originFileObj);
      });

      formData.append("chapterId", selectedChapterId || '');
      formData.append("courseId", courseId);

      const response = await fetch(ADMIN_UPLOAD_BATCH, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload videos");
      }

      message.success(`Đã thêm ${fileList.length} video mới vào chương`);
      setBatchVideoModalVisible(false);
      setFileList([]);

      // Refresh content to show the newly added videos
      fetchCourseContent();
    } catch (error) {
      console.error("Error uploading videos:", error);
      message.error('Tải lên video thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle editing course info
  const handleEditCourse = () => {
    if (courseInfo) {
      courseForm.setFieldsValue({
        title: courseInfo.title,
        course_category_id: courseInfo.course_category_id,
        description: courseInfo.description,
        language: courseInfo.language,
        author: courseInfo.author,
        courseOutput: courseInfo.courseOutput,
        duration: courseInfo.duration,
        cost: courseInfo.cost,
        price: courseInfo.price,
        type: courseInfo.type,
        status: courseInfo.status
      });
      setCourseThumbnail(null);
      setCourseModalVisible(true);
    }
  };

  // Function to save course info
  const handleSaveCourse = () => {
    courseForm.validateFields().then(values => {
      const updatedCourseInfo: CourseInfo = {
        ...courseInfo!,
        title: values.title,
        course_category_id: values.course_category_id,
        description: values.description,
        language: values.language,
        author: values.author,
        courseOutput: values.courseOutput,
        duration: values.duration,
        cost: values.cost,
        price: values.price,
        type: values.type,
        status: values.status,
        image_url: courseThumbnail ? URL.createObjectURL(courseThumbnail) : courseInfo!.image_url,
        updatedAt: new Date().toISOString()
      };
      setCourseInfo(updatedCourseInfo);
      message.success('Cập nhật thông tin khóa học thành công');
      setCourseModalVisible(false);
    });
  };

  // Add function to handle video preview
  const handlePreviewVideo = (video: Video) => {
    setPreviewVideo(video);
    setPreviewModalVisible(true);
  };

  // Add function to handle closing the preview modal
  const handleClosePreviewModal = () => {
    setPreviewModalVisible(false);
    // Reset preview video after a short delay to ensure modal is closed first
    setTimeout(() => {
      setPreviewVideo(null);
    }, 300);
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Nội dung khóa học: {courseInfo?.title}</Title>
        <div>
          <Tooltip title="Xem chi tiết khóa học">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => setCourseInfoModalVisible(true)}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
          {/* <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEditCourse}
            style={{ marginRight: 8 }}
          >
            Sửa thông tin
          </Button> */}
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddChapter}>
            Thêm chương học
          </Button>
        </div>
      </div>

      {chapters.length === 0 ? (
        <Empty description="Chưa có nội dung khóa học" />
      ) : (
        <Collapse
          defaultActiveKey={activeChapter ? [activeChapter] : undefined}
          onChange={(key) => {
            if (Array.isArray(key)) {
              setActiveChapter(key.length > 0 ? key[0] as string : null);
            } else {
              setActiveChapter(key as string | null);
            }
          }}
        >
          {chapters.map((chapter, index) => {
            const chapterLessons = lessons.filter(lesson =>
              lesson.chapterId && chapter.id &&
              lesson.chapterId.toString() === chapter.id.toString()
            );

            return (
              <Panel
                key={chapter.id}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>
                      <FolderOutlined /> Chương {index + 1}: {chapter.chapter_title}
                      <Tag color={chapter.status ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                        {chapter.status ? 'Hoạt động' : 'Nháp'}
                      </Tag>
                    </span>
                    <span onClick={e => e.stopPropagation()}>
                      <Button
                        type="text"
                        icon={<UploadOutlined />}
                        onClick={() => handleBatchVideoUpload(chapter.id)}
                        title="Thêm nhiều video vào chương"
                      />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          Modal.confirm({
                            title: 'Chọn loại nội dung',
                            content: 'Bạn muốn thêm loại nội dung nào vào chương này?',
                            okText: 'Bài học',
                            onOk() {
                              handleAddLesson(chapter.id);
                            }
                          });
                        }}
                        title="Thêm nội dung vào chương"
                      />
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditChapter(chapter)}
                        title="Chỉnh sửa chương"
                      />
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteChapter(chapter.id)}
                        title="Xóa chương"
                      />
                    </span>
                  </div>
                }
              >
                {chapterLessons.length === 0 ? (
                  <Empty description="Chưa có bài học trong chương này" />
                ) : (
                  <Collapse>
                    {chapterLessons.map((lesson, indexLesson) => {
                      const lessonVideos = videos.filter(video => video.lesson_id.toString() === lesson.id.toString());
                      const lessonTests = tests.filter(test => test.lessonId === parseInt(lesson.id) && test.format === 'test');

                      return (
                        <Panel
                          key={lesson.id}
                          header={
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                              <span>
                                <FileOutlined />Bài {indexLesson + 1}: {lesson.lessonTitle}
                                <Tag color={lesson.status ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                                  {lesson.status ? 'Hoạt động' : 'Nháp'}
                                </Tag>
                              </span>
                              <span onClick={e => e.stopPropagation()}>
                                <Button
                                  type="text"
                                  icon={<PlusOutlined />}
                                  onClick={() => {
                                    Modal.confirm({
                                      title: 'Chọn loại nội dung',
                                      content: 'Bạn muốn thêm loại nội dung nào vào bài học?',
                                      okText: 'Video',
                                      cancelText: 'Bài kiểm tra',
                                      onOk() {
                                        handleAddVideo(lesson.id);
                                      },
                                      onCancel() {
                                        const existingTests = tests.filter(test =>
                                          test.lessonId === parseInt(lesson.id) &&
                                          test.format === 'test'
                                        );

                                        if (existingTests.length > 0) {
                                          handleRevokeTest(existingTests[0], lesson);
                                        } else {
                                          handleAddTest(lesson.id, lesson.chapterId ? lesson.chapterId.toString() : '');
                                        }
                                      }
                                    });
                                  }}
                                  title="Thêm nội dung bài học"
                                />
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditLesson(lesson)}
                                  title="Chỉnh sửa bài học"
                                />
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  title="Xóa bài học"
                                />
                              </span>
                            </div>
                          }
                        >
                          <Tabs defaultActiveKey="1">
                            <TabPane tab="Video" key="1">
                              {lessonVideos.length === 0 ? (
                                <Empty description={
                                  <div>
                                    <p>Chưa có video trong bài học này</p>
                                    <Button
                                      type="primary"
                                      icon={<PlusOutlined />}
                                      onClick={() => handleAddVideo(lesson.id)}
                                    >
                                      Thêm video
                                    </Button>
                                  </div>
                                } />
                              ) : (
                                lessonVideos.map(video => (
                                  <Card key={video.id} style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <PlayCircleOutlined style={{ fontSize: 24, marginRight: 16 }} />
                                      <div style={{ flex: 1 }}>
                                        <Text strong>{video.video_title}</Text>
                                        <div>Thời lượng: {formatDuration(video.duration)}</div>

                                      </div>
                                      <div>
                                        <Button
                                          type="primary"
                                          icon={<EyeOutlined />}
                                          onClick={() => handlePreviewVideo(video)}
                                          style={{ marginRight: 8 }}
                                          title="Xem nhanh video"
                                        />
                                        <Button
                                          type="primary"
                                          icon={<EditOutlined />}
                                          onClick={() => handleEditVideo(video)}
                                          style={{ marginRight: 8 }}
                                          title="Chỉnh sửa video"
                                        />
                                        <Button
                                          danger
                                          icon={<DeleteOutlined />}
                                          onClick={() => handleDeleteVideo(video.id, video.video_title)}
                                          title="Xóa video"
                                        />
                                      </div>
                                    </div>
                                  </Card>
                                ))
                              )}
                            </TabPane>
                            <TabPane tab="Bài kiểm tra" key="2">
                              {lessonTests.length === 0 ? (
                                <Empty description={
                                  <div>
                                    <p>{lesson.isTestExcluded === "NOTTEST" ?
                                      "Bài học không cần bài kiểm tra" :
                                      "Chưa có bài kiểm tra trong bài học này"
                                    }</p>
                                    {lesson.isTestExcluded !== "NOTTEST" && (
                                      <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={() => handleAddTest(lesson.id, lesson.chapterId ? lesson.chapterId.toString() : '')}
                                      >
                                        Thêm bài kiểm tra
                                      </Button>
                                    )}
                                  </div>
                                } />
                              ) : (
                                lessonTests.map(test => (
                                  <Card key={test.id} style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <FileOutlined style={{ fontSize: 24, marginRight: 16 }} />
                                      <div style={{ flex: 1 }}>
                                        <Text strong>{test.title}</Text>
                                        <div>
                                          <div>Số câu hỏi: {test.totalQuestion} (Dễ: {test.easyQuestion}, Trung bình: {test.mediumQuestion}, Khó: {test.hardQuestion})</div>
                                          <div>Thời gian: {formatDuration(test.duration)}</div>
                                        </div>
                                      </div>
                                      <div>
                                        <Button
                                          type="primary"
                                          icon={<EditOutlined />}
                                          onClick={() => handleRevokeTest(test, lesson)}
                                          style={{ marginRight: 8 }}
                                          title="Thu hồi bài kiểm tra"
                                        >
                                          Thu hồi
                                        </Button>
                                        {/* <Button
                                          danger
                                          icon={<DeleteOutlined />}
                                          onClick={() => handleDeleteTest(test.id)}
                                          title="Xóa bài kiểm tra"
                                        /> */}
                                      </div>
                                    </div>
                                  </Card>
                                ))
                              )}
                            </TabPane>
                          </Tabs>
                        </Panel>
                      );
                    })}
                  </Collapse>
                )}

                {/* Chapter test section */}
                {
                  <div style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <Title level={5}>Bài kiểm tra chương</Title>
                      {tests.filter(test =>
                        test.chapterId && chapter.id && test.lessonId === null && test.summary === true &&
                        test.chapterId.toString() === chapter.id.toString() &&
                        test.format === 'test'
                      ).length === 0 ? (
                        <Button
                          type="primary"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => handleAddTest('', chapter.id, true)}
                        >
                          Thêm bài kiểm tra chương
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            const chapterTests = tests.filter(test =>
                              test.chapterId && chapter.id && test.lessonId === null && test.summary === true &&
                              test.chapterId.toString() === chapter.id.toString() &&
                              test.format === 'test'
                            );
                            if (chapterTests.length > 0) {
                              handleRevokeTest(chapterTests[0]);
                            }
                          }}
                        >
                          Thu hồi bài kiểm tra chương
                        </Button>
                      )}
                    </div>

                    {tests.filter(test =>
                      test.chapterId && chapter.id && test.lessonId === null && test.summary === true &&
                      test.chapterId.toString() === chapter.id.toString() &&
                      test.format === 'test'
                    ).length === 0 ? (
                      <Empty description="Chưa có bài kiểm tra chương" />
                    ) : (
                      tests
                        .filter(test =>
                          test.chapterId && chapter.id && test.lessonId === null && test.summary === true &&
                          test.chapterId.toString() === chapter.id.toString() &&
                          test.format === 'test'
                        )
                        .map(test => (
                          <Card key={test.id} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <FileOutlined style={{ fontSize: 24, marginRight: 16 }} />
                              <div style={{ flex: 1 }}>
                                <Text strong>{test.title}</Text>
                                <div>
                                  <div>Số câu hỏi: {test.totalQuestion} (Dễ: {test.easyQuestion}, Trung bình: {test.mediumQuestion}, Khó: {test.hardQuestion})</div>
                                  <div>Thời gian: {formatDuration(test.duration)}</div>
                                </div>
                              </div>
                              <div>
                                <Button
                                  type="primary"
                                  icon={<EditOutlined />}
                                  onClick={() => handleRevokeTest(test)}
                                  style={{ marginRight: 8 }}
                                  title="Thu hồi bài kiểm tra chương"
                                >
                                  Thu hồi
                                </Button>
                                {/* <Button
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleDeleteTest(test.id)}
                                  title="Xóa bài kiểm tra chương"
                                /> */}
                              </div>
                            </div>
                          </Card>
                        ))
                    )}
                  </div>
                }
              </Panel>
            );
          })}
        </Collapse>
      )}

      {/* Course Info Modal */}
      <Modal
        title="Chi tiết khóa học"
        visible={courseInfoModalVisible}
        onCancel={() => setCourseInfoModalVisible(false)}
        footer={[
          // <Button key="edit" type="primary" onClick={() => {
          //   setCourseInfoModalVisible(false);
          //   handleEditCourse();
          // }}>
          //   Chỉnh sửa
          // </Button>,
          <Button key="close" onClick={() => setCourseInfoModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {courseInfo ? (
          <>
            <div style={{ display: 'flex', marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <Title level={4}>{courseInfo.title}</Title>
                <Tag color={courseInfo.status ? 'green' : 'orange'} style={{ marginBottom: 16 }}>
                  {courseInfo.status ? 'Hoạt động' : 'Nháp'}
                </Tag>
              </div>
              {courseInfo.image_url && (
                <div style={{ width: 120, height: 120, overflow: 'hidden', borderRadius: 4 }}>
                  <img
                    src={courseInfo.image_url}
                    alt={courseInfo.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Tác giả" span={1}>
                {courseInfo.author}
              </Descriptions.Item>
              <Descriptions.Item label="Ngôn ngữ" span={1}>
                {courseInfo.language}
              </Descriptions.Item>
              <Descriptions.Item label="Loại khóa học" span={1}>
                {courseInfo.type}
              </Descriptions.Item>
              <Descriptions.Item label="Thời lượng" span={1}>
                {formatDuration(courseInfo.duration)}
              </Descriptions.Item>
              <Descriptions.Item label="Giá bán" span={1}>
                {courseInfo.price.toLocaleString()} đ
              </Descriptions.Item>
              <Descriptions.Item label="Giá niêm yết" span={1}>
                {courseInfo.cost.toLocaleString()} đ
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo" span={1}>
                {new Date(courseInfo.createdAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật" span={1}>
                {new Date(courseInfo.updatedAt).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                <div dangerouslySetInnerHTML={{ __html: courseInfo.description }} />
              </Descriptions.Item>
              <Descriptions.Item label="Mục tiêu khóa học" span={2}>
                <div dangerouslySetInnerHTML={{ __html: courseInfo.courseOutput }} />
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Empty description="Không có thông tin khóa học" />
        )}
      </Modal>

      {/* Chapter Modal */}
      <Modal
        title={editingItem && 'chapter_title' in editingItem ? "Sửa chương học" : "Thêm chương học mới"}
        visible={chapterModalVisible}
        onOk={handleSaveChapter}
        onCancel={() => setChapterModalVisible(false)}
        okText={editingItem && 'chapter_title' in editingItem ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={chapterForm} layout="vertical">
          <Form.Item
            name="chapter_title"
            label="Tên chương học"
            rules={[{ required: true, message: 'Vui lòng nhập tên chương học' }]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextEditor
              initialData={chapterForm.getFieldValue('description') || ''}
              onChange={(data) => {
                chapterForm.setFieldValue('description', data);
              }}
            />
          </Form.Item> */}
          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Nháp" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Lesson Modal */}
      <Modal
        title={editingItem && 'lessonTitle' in editingItem ? "Sửa bài học" : "Thêm bài học mới"}
        visible={lessonModalVisible}
        onOk={handleSaveLesson}
        onCancel={() => setLessonModalVisible(false)}
        okText={editingItem && 'lessonTitle' in editingItem ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
      >
        <Form form={lessonForm} layout="vertical">
          <Form.Item
            name="lesson_title"
            label="Tên bài học"
            rules={[{ required: true, message: 'Vui lòng nhập tên bài học' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="isRequired"
            label="Bắt buộc học"
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          <Form.Item
            name="learningTip"
            label="Mẹo học tập"
          >
            <TextEditor
              initialData={lessonForm.getFieldValue('learningTip') || ''}
              onChange={(data) => {
                lessonForm.setFieldValue('learningTip', data);
              }}
            />
          </Form.Item>

          <Form.Item
            name="keyPoint"
            label="Điểm chính"
          >
            <TextEditor
              initialData={lessonForm.getFieldValue('keyPoint') || ''}
              onChange={(data) => {
                lessonForm.setFieldValue('keyPoint', data);
              }}
            />
          </Form.Item>

          <Form.Item
            name="overviewLesson"
            label="Tổng quan bài học"
          >
            <TextEditor
              initialData={lessonForm.getFieldValue('overviewLesson') || ''}
              onChange={(data) => {
                lessonForm.setFieldValue('overviewLesson', data);
              }}
            />
          </Form.Item>

          <Form.Item
            name="chapter_id"
            label="Chương học"
            rules={[{ required: true, message: 'Vui lòng chọn chương học' }]}
          >
            <Select disabled={editingItem && 'lesson_title' in editingItem}>
              {chapters.map(chapter => (
                <Option key={chapter.id} value={parseInt(chapter.id)}>
                  {chapter.chapter_title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="topic"
            label="Chủ đề"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Thời lượng (phút)"
            rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
          >
            <Input type="number" disabled min={1} />
          </Form.Item>

          <Form.Item
            name="is_test_excluded"
            label="Bài kiểm tra"
          >
            <Select defaultValue="EMPTYTEST">
              <Option value="EMPTYTEST">Chưa có bài kiểm tra</Option>
              <Option value="NOTTEST">Không cần bài kiểm tra</Option>
              <Option value="FULLTEST" disabled={!editingItem || !editingItem.id}>Đã có bài kiểm tra</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Nháp" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Video Modal */}
      <Modal
        title={editingItem && 'video_title' in editingItem ? "Sửa video" : "Thêm video mới"}
        visible={videoModalVisible}
        onOk={handleSaveVideo}
        onCancel={() => setVideoModalVisible(false)}
        okText={editingItem && 'video_title' in editingItem ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={700}
        confirmLoading={loading}
      >
        <Form form={videoForm} layout="vertical">
          <Form.Item
            name="isChapterVideo"
            hidden
          >
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name="lesson_id"
            label="Bài học"
            hidden={videoForm.getFieldValue('isChapterVideo')}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="chapter_id"
            label="Chương"
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="video_title"
            label="Tiêu đề video"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề video' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="File Video"
            rules={[
              {
                required: !editingItem || !('video_title' in editingItem),
                message: 'Vui lòng chọn file video'
              }
            ]}
          >
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                const isVideo = file.type.startsWith('video/') ||
                  /\.(mp4)$/i.test(file.name);

                if (!isVideo) {
                  message.error('Chỉ upload file video!');
                  return Upload.LIST_IGNORE;
                }

                setVideoFile(file);
                return false; // Prevent actual upload
              }}
              onRemove={() => {
                setVideoFile(null);
              }}
              fileList={videoFile ? [
                {
                  uid: '-1',
                  name: videoFile.name,
                  status: 'done',
                }
              ] : []}
            >
              <Button icon={<UploadOutlined />}>Chọn Video</Button>
              <p className="ant-upload-hint" style={{ marginTop: 8 }}>
                {editingItem && 'video_title' in editingItem ?
                  'Chỉ chọn file khi muốn thay đổi video' :
                  'Hỗ trợ định dạng: .mp4'
                }
              </p>
            </Upload>
          </Form.Item>
          <Form.Item
            name="documentShort"
            label="Mô tả tài liệu kèm theo"
          >
            <TextEditor
              initialData={videoForm.getFieldValue('documentShort') || ''}
              onChange={(data) => {
                videoForm.setFieldValue('documentShort', data);
              }}
            />
          </Form.Item>
          <Form.Item
            label="Tài liệu kèm theo"
          >
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                // Accept PDF, DOC, DOCX files
                const isDocument = /\.(pdf|doc|docx)$/i.test(file.name);

                if (!isDocument) {
                  message.error('Chỉ upload file PDF, DOC, DOCX!');
                  return Upload.LIST_IGNORE;
                }

                setDocumentFile(file);
                return false; // Prevent actual upload
              }}
              onRemove={() => {
                setDocumentFile(null);
              }}
              fileList={documentFile ? [
                {
                  uid: '-1',
                  name: documentFile.name,
                  status: 'done',
                  url: URL.createObjectURL(documentFile),
                }
              ] : []}
            >
              <Button icon={<UploadOutlined />}>Chọn Tài liệu</Button>
              <p className="ant-upload-hint" style={{ marginTop: 8 }}>
                {editingItem && 'video_title' in editingItem ?
                  'Chỉ chọn file khi muốn thay đổi tài liệu' :
                  'Hỗ trợ định dạng: .pdf, .doc, .docx'
                }
              </p>
            </Upload>
          </Form.Item>
          <Form.Item
            name="isViewTest"
            label="Cho phép học viên xem miễn phí"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Test Modal - Simplified */}
      <Modal
        title={
          editingItem?.isChapterTest
            ? `Thêm bài kiểm tra cho chương: ${editingItem?.chapterTitle}`
            : `Thêm bài kiểm tra cho bài học: ${editingItem?.lessonTitle}`
        }
        visible={testModalVisible}
        onOk={handleSaveTest}
        onCancel={() => setTestModalVisible(false)}
        okText="Thêm mới"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Form form={testForm} layout="vertical">
          {editingItem && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <Typography.Text strong>
                {editingItem?.isChapterTest
                  ? `Chương: ${editingItem?.chapterTitle}`
                  : `Bài học: ${editingItem?.title}`
                }
              </Typography.Text>
              {!editingItem?.isChapterTest && editingItem?.chapterTitle && (
                <div>
                  <Typography.Text type="secondary">
                    Thuộc chương: {editingItem?.chapterTitle}
                  </Typography.Text>
                </div>
              )}
            </div>
          )}

          <Form.Item
            name="lessonId"
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="chapterId"
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="courseId"
            hidden
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="testId"
            label="Chọn bài kiểm tra"
            rules={[{ required: true, message: 'Vui lòng chọn bài kiểm tra' }]}
          >
            <Select
              placeholder="Chọn bài kiểm tra"
              showSearch
              optionFilterProp="children"
              loading={availableTests.length === 0}
            >
              {availableTests.map(test => (
                <Option key={test.id} value={test.id}>
                  {test.title} ({test.totalQuestion} câu, {formatDuration(test.duration)})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Batch Video Upload Modal */}
      <Modal
        title="Thêm nhiều video vào chương"
        visible={batchVideoModalVisible}
        onOk={handleSaveBatchVideos}
        onCancel={() => setBatchVideoModalVisible(false)}
        okText="Thêm tất cả video"
        cancelText="Hủy"
        width={700}
        confirmLoading={loading}
      >
        <Form form={batchVideoForm} layout="vertical">
          <Form.Item label="Upload video">
            <Upload.Dragger
              multiple
              listType="picture"
              fileList={fileList}
              beforeUpload={(file) => {
                // Check if it's a video file
                const isVideo = file.type.startsWith('video/') ||
                  /\.(mp4|mov|avi|wmv|flv|mkv)$/i.test(file.name);

                if (!isVideo) {
                  message.error('Chỉ upload file video!');
                  return Upload.LIST_IGNORE;
                }

                return false; // Prevent actual upload, we'll handle it manually
              }}
              onChange={({ fileList: newFileList }) => {
                setFileList(newFileList);
              }}
              onRemove={(file) => {
                setFileList(fileList.filter(item => item.uid !== file.uid));
              }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Kéo thả file video vào đây hoặc click để chọn file</p>
              <p className="ant-upload-hint">Hỗ trợ upload nhiều video cùng lúc.</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* Course Info Modal */}
      <Modal
        title="Chỉnh sửa thông tin khóa học"
        visible={courseModalVisible}
        onOk={handleSaveCourse}
        onCancel={() => setCourseModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
        width={700}
      >
        <Form form={courseForm} layout="vertical">
          <Form.Item
            name="title"
            label="Tên khóa học"
            rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextEditor
              initialData={courseForm.getFieldValue('description') || ''}
              onChange={(data) => {
                courseForm.setFieldValue('description', data);
              }}
            />
          </Form.Item>
          <Form.Item
            name="courseOutput"
            label="Mục tiêu khóa học"
          >
            <TextEditor
              initialData={courseForm.getFieldValue('courseOutput') || ''}
              onChange={(data) => {
                courseForm.setFieldValue('courseOutput', data);
              }}
            />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="course_category_id"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              style={{ flex: 1 }}
            >
              <Select>
                <Option value="1">Toán học</Option>
                <Option value="2">Vật lý</Option>
                <Option value="3">Hóa học</Option>
                <Option value="4">Sinh học</Option>
                <Option value="5">Ngữ văn</Option>
                <Option value="6">Tiếng Anh</Option>
                <Option value="7">Lịch sử</Option>
                <Option value="8">Địa lý</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="language"
              label="Ngôn ngữ"
              rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
              style={{ flex: 1 }}
            >
              <Select>
                <Option value="Vietnamese">Tiếng Việt</Option>
                <Option value="English">Tiếng Anh</Option>
              </Select>
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="author"
              label="Tác giả"
              rules={[{ required: true, message: 'Vui lòng nhập tên tác giả' }]}
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="duration"
              label="Thời lượng (giờ)"
              rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={1} />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="cost"
              label="Giá gốc (VNĐ)"
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} />
            </Form.Item>
            <Form.Item
              name="price"
              label="Giá bán (VNĐ)"
              rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
              style={{ flex: 1 }}
            >
              <Input type="number" min={0} />
            </Form.Item>
          </div>
          <Form.Item
            label="Ảnh khóa học"
          >
            <Upload
              maxCount={1}
              listType="picture-card"
              showUploadList={true}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');

                if (!isImage) {
                  message.error('Chỉ upload file hình ảnh!');
                  return Upload.LIST_IGNORE;
                }

                setCourseThumbnail(file);
                return false; // Prevent actual upload
              }}
              onRemove={() => {
                setCourseThumbnail(null);
              }}
              fileList={courseThumbnail ? [
                {
                  uid: '-1',
                  name: courseThumbnail.name,
                  status: 'done',
                  url: URL.createObjectURL(courseThumbnail),
                }
              ] : []}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="type"
              label="Loại khóa học"
              rules={[{ required: true, message: 'Vui lòng chọn loại khóa học' }]}
              style={{ flex: 1 }}
            >
              <Select>
                <Option value="standard">Tiêu chuẩn</Option>
                <Option value="premium">Cao cấp</Option>
                <Option value="free">Miễn phí</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái"
              valuePropName="checked"
              style={{ flex: 1 }}
            >
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Nháp" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Video Preview Modal */}
      <Modal
        title={previewVideo?.video_title || "Xem trước video"}
        visible={previewModalVisible}
        onCancel={handleClosePreviewModal}
        footer={null}
        width={800}
        centered
        destroyOnClose={true}
      >
        {previewVideo && (
          <div>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <video
                src={previewVideo.url}
                controls
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                autoPlay
              />
            </div>

            {previewVideo.documentUrl && (
              <div style={{ marginTop: 16 }}>
                <Typography.Title level={5}>Tài liệu kèm theo:</Typography.Title>
                <p>{previewVideo.documentShort}</p>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  href={previewVideo.documentUrl?.toString()}
                  target="_blank"
                >
                  Tải tài liệu
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseContent; 