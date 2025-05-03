import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Input, Typography, Popconfirm, message, Modal, Form, Select, Upload, Pagination, Tooltip, Row, Col, Statistic, Divider, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, UploadOutlined, FilePdfOutlined, FileImageOutlined, FileAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils';

import './Courses.css';
import TextEditor from './TextEditor';


const { Title } = Typography;
const { Option } = Select;
export const ADMIN_POST_COURSE = `${process.env.REACT_APP_SERVER_HOST}/api/courses/add-course`;
export const ADMIN_PUT_DELETE_COURSE_CLEAR = `${process.env.REACT_APP_SERVER_HOST}/api/courses/delete`;
export const ADMIN_UPDATE_COURSE = (id: string) => `${process.env.REACT_APP_SERVER_HOST}/api/courses/update-course/${id}`;
// Base course information
export interface Course {
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
  level: string;
  categoryName?: string;
  students?: number;
}

// Course chapter information
export interface Chapter {
  id: string;
  course_id: string;
  chapter_title: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedDate: string;
  deleted: boolean;
}
// Lesson information
export interface Lesson {
  id: string;
  lessonTitle: string;
  // description: string;
  duration: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedDate: string;
  deleted: boolean;
  isTestExcluded: string;
  topic: string;
  course_id: number;
  chapterId: number;
}

export interface TestExam {
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
  format: 'exam' | 'test';
  assigned: boolean;
  point?: number;
}
export interface Video {
  id: string;
  lesson_id: string;
  video_title: string;
  url: string;
  documentShort: string;
  documentUrl: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
  deletedDate: string;
  deleted: boolean;
  isViewTest: boolean;
}

// Student enrollment information
export interface EnrollCourse {
  id: string;
  course_id: string;
  account_id: string;
  enrollment_date: string;
  status: string;
}

// Student information
export interface StudentDataHUIT {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  progress: number;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentDate: string;
  note: string;
  courses?: string[];
}

// Progress tracking for chapters and lessons
export interface Progress {
  id: string;
  video_completed: boolean;
  test_completed: boolean;
  is_chapter_test: boolean;
  testScore: number;
  completedAt: string;
  account_id: string;
  course_id: string;
  chapter_id: string;
  lesson_id: string;
}
interface Category {
  id: string;
  name: string;
}
// API Endpoints
const ADMIN_GETALL_RESULT = `${process.env.REACT_APP_SERVER_HOST}/api/courses/all-get-result-search`;
const ADMIN_GET_COURSE_OF_ACCOUNT = `${process.env.REACT_APP_SERVER_HOST}/api/courses/get-courseDTO-of-account`;

const CoursesPage: React.FC = () => {
  const navigate = useNavigate(); 
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form] = Form.useForm();
  const [courseImage, setCourseImage] = useState<any>(null);
  const [courseType, setCourseType] = useState<string>(editingCourse?.type || 'FEE');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);


  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);

  // // Additional filters
  // const [filterField, setFilterField] = useState<string>('');
  // const [filterSector, setFilterSector] = useState<string>('');
  // const [filterSubject, setFilterSubject] = useState<string>('');

  // Auth related functions (stub implementation - replace with your actual auth logic)
  const getAuthData = () => {
    // Replace with your actual auth data retrieval
    const storedData = localStorage.getItem('authData');
    return storedData ? JSON.parse(storedData) : null;
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/categories/level3`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }

      const data = await response.json();

      const apiCategories = data
        .filter((item: any) => item.type === 'COURSE')
        .map((item: any) => ({
          id: item.id.toString(),
          name: item.name
        }));

      setCategories(apiCategories);

    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh mục. Vui lòng thử lại sau.');

    } finally {
      setCategoriesLoading(false);
    }
  };
  // Fetch courses from API
  const fetchCourses = async () => {
    const authData = getAuthData();
    if (!authData) {
      message.error("Vui lòng đăng nhập lại.");
      navigate("/dang-nhap");
      return;
    }

    const { id: accountId, roleId } = authData;
    if (!roleId) {
      message.error("Không thể xác định quyền truy cập.");
      navigate("/dang-nhap");
      return;
    }

    const token = await authTokenLogin(refreshToken, refresh, navigate);

    const params = new URLSearchParams({
      ...(categoryFilter && { categoryId3: categoryFilter }),
      ...(searchText && { searchTerm: searchText }),
      page: page.toString(),
      size: rowsPerPage.toString(),
    });

    const apiEndpoint = roleId === 1
      ? `${ADMIN_GETALL_RESULT}?${params.toString()}`
      : roleId === 3
        ? `${ADMIN_GET_COURSE_OF_ACCOUNT}/${accountId}?${params.toString()}`
        : null;

    if (!apiEndpoint) {
      message.error("Không xác định được API.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(apiEndpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Map API response to Course interface
      const mappedCourses: Course[] = data.content.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        course_category_id: item.categoryIdLevel3?.toString() || '',
        description: item.description || '',
        image_url: item.imageUrl || '',
        language: item.language || 'Tiếng Việt',
        author: item.author || '',
        courseOutput: item.courseOutput || '',
        account_id: item.accountId || 0,
        price: item.price || 0,
        duration: item.duration || 0,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString().split('T')[0] : '',
        deletedDate: item.deletedDate || '',
        deleted: item.deleted || false,
        cost: item.cost || 0,
        type: item.type || 'FEE',
        level: item.level || 'BEGINNER',
        status: item.status,
        categoryName: item.categoryNameLevel3 || '',
        students: item.countStudent || 0
      }));

      setCourses(mappedCourses);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, [page, rowsPerPage, categoryFilter, searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(0); // Reset to first page when searching
  };

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current - 1); // API uses 0-based indexing
    setRowsPerPage(pagination.pageSize);
  };

  const getUniqueCategories = (): string[] => {
    const categories = courses.map(course => course.type);
    return ['', ...Array.from(new Set(categories))];
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setPage(0); // Reset to first page when changing category
  };
  const handleHide = async (id: string) => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);

    try {
      const response = await fetch(
        `${ADMIN_PUT_DELETE_COURSE_CLEAR}/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to hide course");
      }
      message.success("Khóa học đã được xóa thành công!");
      fetchCourses();
    } catch (error) {
      message.error("Có lỗi xảy ra khi xóa Khóa học !");
    }
  };
  const handleDelete = (id: string) => {
    const course = courses.find(course => course.id === id);
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa khóa học "${course?.title}" không?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        handleHide(id);
        setCourses(courses.filter(course => course.id !== id));
      },
    });
  };

  const showModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseType(course.type);
      form.setFieldsValue({
        title: course.title,
        course_category_id: course.course_category_id,
        description: course.description,
        type: course.type,
        author: course.author,
        language: course.language,
        courseOutput: course.courseOutput,
        duration: course.duration,
        price: course.price,
        cost: course.cost,
        level: course.level || 'BEGINNER',
        status: course.status
      });
      setCourseImage(null);
    } else {
      setEditingCourse(null);
      setCourseType('FEE');
      form.resetFields();
      form.setFieldsValue({
        language: 'Tiếng Việt',
        status: true,
        duration: 60,
        type: 'FEE',
        level: 'BEGINNER',
        course_category_id: categories.length > 0 ? categories[0].id : ''
      });
      setCourseImage(null);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCourseImage(null);
  };

  const handleAddCourse = async () => {
    form.validateFields().then(async (values) => {
      if (values.type === 'FREE') {
        values.price = 0;
        values.cost = 0;
      }

      if (!courseImage) {
        message.error('Vui lòng tải lên hình ảnh cho khóa học');
        return;
      }

      const authData = getAuthData();
      if (!authData) {
        message.error("Vui lòng đăng nhập lại.");
        navigate("/dang-nhap");
        return;
      }

      const { id: accountId , fullname : fullname } = authData;
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Sử dụng FormData thay vì JSON
      const formData = new FormData();
      formData.append('coursesTitle', values.title.trim());
      formData.append('author', fullname);
      formData.append('description', values.description || '');
      formData.append('duration', values.duration.toString());
      formData.append('language', values.language);
      formData.append('cost', values.type === "FREE" ? '0' : (values.cost || '0').toString());
      formData.append('price', (values.price || '0').toString());
      formData.append('courseOutput', values.courseOutput || '');
      formData.append('image', courseImage); // Truyền file trực tiếp, không cần chuyển base64
      formData.append('courseCategoryId', values.course_category_id);
      formData.append('accountId', accountId.toString());
      formData.append('type', values.type);
      formData.append('level', values.level);
      formData.append('status', values.status.toString());

      setSubmitting(true);
      try {
        const response = await fetch(ADMIN_POST_COURSE, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
            // Không cần Content-Type với FormData, trình duyệt sẽ tự thêm
          },
          body: formData,
        });
        
        if (response.ok) {
          message.success("Thêm khóa học thành công!");
          setIsModalVisible(false);
          setCourseImage(null);
          form.resetFields();
          fetchCourses(); // Refresh the course list
        } else {
          message.warning("Thêm khóa học thất bại. Vui lòng thử lại!");
        }
      } catch (error) {
        message.warning("Đã xảy ra lỗi khi thêm khóa học. Vui lòng thử lại!");
      } finally {
        setSubmitting(false);
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleUpdateCourse = async () => {
    form.validateFields().then(async (values) => {
      if (!values.cost && values.type === "FEE") {
        message.warning("Vui lòng điền chi phí!");
        return;
      }
      if (values.cost <= 5 && values.type === "FEE") {
        message.warning("Chi phí phải lớn hơn 0!");
        return;
      }

      const authData = getAuthData();
      if (!authData) {
        message.error("Vui lòng đăng nhập lại.");
        navigate("/dang-nhap");
        return;
      }

      const { id: accountId, fullname: fullname } = authData;
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Tạo FormData để gửi dữ liệu
      const formData = new FormData();
      formData.append("coursesTitle", values.title.trim());
      formData.append("description", values.description || '');
      formData.append("courseOutput", values.courseOutput || '');
      formData.append("duration", values.duration.toString());
      formData.append("author", fullname);
      formData.append("cost", values.type === "FREE" ? '0' : (values.cost || '0').toString());
      formData.append("price", (values.price || '0').toString());
      formData.append("language", values.language);
      formData.append("courseCategoryId", values.course_category_id);
      formData.append("accountId", accountId.toString());
      formData.append("type", values.type);
      formData.append("level", values.level);
      formData.append("status", values.status.toString());

      // Nếu có hình ảnh mới, thêm vào FormData
      if (courseImage) {
        formData.append("image", courseImage);
      }

      setSubmitting(true);
      try {
        // Gửi yêu cầu PUT đến API để cập nhật khóa học
        const response = await fetch(ADMIN_UPDATE_COURSE(editingCourse!.id), {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData, // Gửi dữ liệu dưới dạng FormData
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        message.success("Cập nhật khóa học thành công!");
        setIsModalVisible(false);
        setCourseImage(null);
        fetchCourses(); // Refresh the course list
      } catch (error) {
        console.error("Error updating course:", error);
        message.error("Cập nhật khóa học thất bại. Vui lòng thử lại!");
      } finally {
        setSubmitting(false);
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleOk = () => {
    if (editingCourse) {
      handleUpdateCourse();
    } else {
      handleAddCourse();
    }
  };

  const handleCourseTypeChange = (value: string) => {
    setCourseType(value);
    if (value === 'FREE') {
      form.setFieldsValue({
        price: 0,
        cost: 0
      });
    }
  };

  const columns: ColumnsType<Course> = [
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Course) => <Link to={`/courses/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Loại khóa học',
      dataIndex: 'type',
      key: 'type',
      filters: getUniqueCategories().filter(cat => cat !== '').map(category => ({
        text: category,
        value: category,
      })),
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Giảng viên',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toLocaleString(),
      sorter: (a: Course, b: Course) => a.price - b.price,
    },
    {
      title: 'Giá niêm yết',
      dataIndex: 'cost',
      key: 'cost',
    },
    {
      title: 'Học viên',
      dataIndex: 'students',
      key: 'students'
    },

    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => {
        return (
          <Tag color={status ? 'green' : 'gold'}>
            {status ? 'Hoạt động' : 'Nháp'}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Course) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/courses/${record.id}`)}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Quản lý khóa học</Title>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Input
              placeholder="Tìm kiếm khóa học..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              onChange={(e) => handleSearch(e.target.value)}
              value={searchText}
            />
            <Select
              defaultValue=""
              value={categoryFilter}
              style={{ width: 200 }}
              onChange={handleCategoryFilter}
              loading={categoriesLoading}
            >
              <Option value="">Tất cả danh mục</Option>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm khóa học
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page + 1, // API uses 0-based indexing, UI uses 1-based
          pageSize: rowsPerPage,
          total: totalElements,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} khóa học`
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingCourse ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        width={700}
        confirmLoading={submitting}
        okButtonProps={{ disabled: submitting }}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Tên khóa học"
            rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}
          >
            <Input />
          </Form.Item>


          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="type"
              label="Loại khóa học"
              rules={[{ required: true, message: 'Vui lòng chọn loại khóa học!' }]}
              style={{ flex: 1 }}
            >
              <Select onChange={handleCourseTypeChange}>
                <Option value="FEE">Có phí</Option>
                <Option value="FREE">Miễn phí</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="course_category_id"
              label="Danh mục"
              style={{ flex: 1 }}
            >
              <Select loading={categoriesLoading}>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            
            <Form.Item
              name="language"
              label="Ngôn ngữ"
              rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ!' }]}
              style={{ flex: 1 }}
            >
              <Select>
                <Option value="Tiếng Việt">Tiếng Việt</Option>
                <Option value="Tiếng Anh">Tiếng Anh</Option>
              </Select>
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="price"
              label="Giá bán (VNĐ)"
              rules={[{
                required: courseType !== 'FREE',
                message: 'Vui lòng nhập giá khóa học!'
              }]}
              style={{ flex: 1 }}
            >
              <Input
                type="number"
                min={0}
                disabled={courseType === 'FREE'}
                placeholder={courseType === 'FREE' ? 'Miễn phí' : ''}
              />
            </Form.Item>

            <Form.Item
              name="cost"
              label="Giá gốc (VNĐ)"
              style={{ flex: 1 }}
            >
              <Input
                type="number"
                min={0}
                disabled={courseType === 'FREE'}
                placeholder={courseType === 'FREE' ? 'Miễn phí' : ''}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="duration"
            label="Thời lượng (giờ)"
            rules={[{ required: true, message: 'Vui lòng nhập thời lượng!' }]}
          >
            <Input type="number" disabled min={1} />
          </Form.Item>

          <Form.Item
            label="Hình ảnh khóa học"
            name="image"
            rules={[
              {
                required: !editingCourse,
                message: 'Vui lòng tải lên hình ảnh khóa học'
              }
            ]}
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

                setCourseImage(file);
                return false; // Prevent actual upload
              }}
              onRemove={() => {
                setCourseImage(null);
              }}
              fileList={courseImage ? [
                {
                  uid: '-1',
                  name: courseImage.name,
                  status: 'done',
                  url: URL.createObjectURL(courseImage),
                }
              ] : editingCourse && editingCourse.image_url ? [
                {
                  uid: '-1',
                  name: 'existing-image.jpg',
                  status: 'done',
                  url: editingCourse.image_url,
                }
              ] : []}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select>
              <Option value={true}>Hoạt động</Option>
              <Option value={false}>Nháp</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="level"
            label="Cấp độ"
            rules={[{ required: true, message: 'Vui lòng chọn cấp độ khóa học!' }]}
          >
            <Select>
              <Option value="BEGINNER">Cơ bản</Option>
              <Option value="INTERMEDIATE">Trung cấp</Option>
              <Option value="ADVANCED">Nâng cao</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextEditor
              initialData={form.getFieldValue('description') || ''}
              onChange={(data) => {
                form.setFieldValue('description', data);
              }}
            />
          </Form.Item>

          <Form.Item
            name="courseOutput"
            label="Mục tiêu khóa học"
          >
            <TextEditor
              initialData={form.getFieldValue('courseOutput') || ''}
              onChange={(data) => {
                form.setFieldValue('courseOutput', data);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CoursesPage; 