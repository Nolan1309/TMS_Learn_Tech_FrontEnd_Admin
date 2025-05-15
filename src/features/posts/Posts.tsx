import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Tag, Input, Select,
  Popconfirm, message, Modal, Form, Row, Col, Tabs, Avatar,
  Tooltip, Switch, Divider, DatePicker, Upload, TablePaginationConfig
} from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import type { Dayjs } from 'dayjs';
import {
  EditOutlined, DeleteOutlined, EyeOutlined,
  SearchOutlined, FilterOutlined, PlusOutlined,
  UserOutlined, FileImageOutlined, UploadOutlined,
  CommentOutlined, LikeOutlined, EyeInvisibleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import TextArea from 'antd/lib/input/TextArea';
import { RcFile, UploadProps } from 'antd/es/upload';
import { authTokenLogin, refreshToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import { SorterResult } from 'antd/es/table/interface';
import { FilterValue } from 'antd/es/table/interface';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// Fix type issue with CKEditor
const ClassicEditorWithTypes = ClassicEditor as any;

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface PostItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  author_id: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
  featured: boolean;
  cat_blog_id: string;
  image: string;
  views: number;
  commentCount: number;
  isDeleted: boolean;
  deletedDate?: string;
}

// Cần tạo một interface đơn giản cho danh mục để hiển thị UI
interface Category {
  id: string;
  name: string;
}

// Cần tạo một interface đơn giản cho tác giả để hiển thị UI
interface Author {
  id: string;
  name: string;
}

const Posts: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [filteredCategory, setFilteredCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<PostItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [contentTabKey, setContentTabKey] = useState<string>('editor');
  const [previewContent, setPreviewContent] = useState<string>('');

  // Fetch authors from API
  const fetchAuthors = async () => {
    setAuthorsLoading(true);
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST || 'http://localhost:8080'}/api/account/author`, {
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

      // Transform API response to match Author interface
      const apiAuthors = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name || 'Unknown'
      }));

      setAuthors(apiAuthors);

    } catch (error) {
      console.error('Error fetching authors:', error);
      message.error('Không thể tải danh sách tác giả. Sử dụng dữ liệu mẫu.');

    } finally {
      setAuthorsLoading(false);
    }
  };

  // Fetch categories from API
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

      const categories = data
      .filter((item: any) => item.type === 'BLOG') // lọc trước
      .map((item: any) => ({
        id: item.id.toString(),
        name: item.name
      }));
      setCategories(categories);

    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh mục. Vui lòng thử lại sau.');

    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch posts from API
  const fetchPosts = async (filters: {
    search?: string,
    category?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    pageSize?: number,
    sortField?: string,
    sortDirection?: string
  } = {}) => {
    setLoading(true);
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      
      // Xây dựng URL với các tham số tìm kiếm
      let url = `${process.env.REACT_APP_SERVER_HOST}/api/blogs`;
      const params = new URLSearchParams();
      
      if (filters.search) {
        params.append('title', filters.search);
      }
      
      if (filters.category && filters.category !== 'all') {
        params.append('categoryId', filters.category);
      }
      
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters.startDate) {
        // Chuyển đổi sang định dạng ISO 8601 DateTime
        const fromDate = new Date(filters.startDate);
        params.append('fromDate', fromDate.toISOString());
      }
      
      if (filters.endDate) {
        // Chuyển đổi sang định dạng ISO 8601 DateTime và thêm thời gian cuối ngày
        const toDate = new Date(filters.endDate);
        toDate.setHours(23, 59, 59, 999);
        params.append('toDate', toDate.toISOString());
      }
      
      // Thêm tham số phân trang
      if (filters.page !== undefined) {
        params.append('page', filters.page.toString());
      }
      
      if (filters.pageSize !== undefined) {
        params.append('size', filters.pageSize.toString());
      }
      
      // Thêm tham số sắp xếp
      if (filters.sortField) {
        params.append('sort', `${filters.sortField},${filters.sortDirection || 'desc'}`);
      }
      
      // Thêm params vào URL nếu có
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      console.log('Fetching posts with URL:', url);
      
      const response = await fetch(url, {
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
      console.log('API response:', data);
      
      // Kiểm tra cấu trúc dữ liệu trả về và xử lý theo đúng format
      if (data && data.content) {
        // Clear existing posts before setting new ones to avoid duplicates
        setPosts([]); 
        // Slight delay to ensure state is updated
        setTimeout(() => {
          
          setPosts(data.content);
          setTotalPosts(data.totalElements || data.content.length);
          setCurrentPage(data.number || 0);
        }, 0);
      } else if (Array.isArray(data)) {
        // API trả về mảng trực tiếp
        setPosts([]);
        // Slight delay to ensure state is updated
        setTimeout(() => {
         
          setPosts(data);
          setTotalPosts(data.length);
          setCurrentPage(0);
        }, 0);
      } else {
        console.error('Unexpected API response format:', data);
        message.error('Định dạng dữ liệu không hợp lệ.');
        setPosts([]);
        setTotalPosts(0);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      message.error('Không thể tải bài viết. Vui lòng thử lại sau.');
      setPosts([]);
      setTotalPosts(0);
    } finally {
      setLoading(false);
    }
  };

  // Save post to API
  const savePost = async (post: PostItem): Promise<boolean> => {
    try {
      const isEditing = !!currentPost;
      const url = isEditing
        ? `${process.env.REACT_APP_SERVER_HOST || 'http://localhost:8080'}/api/blogs/admin/update/${post.id}`
        : `${process.env.REACT_APP_SERVER_HOST || 'http://localhost:8080'}/api/blogs/admin/add`;

      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('title', post.title);
      formData.append('content', post.content); // CKEditor HTML content
      formData.append('summary', post.summary);
      formData.append('author_id', post.author_id);
      formData.append('updatedAt', post.updatedAt);
      formData.append('status', String(post.status));
      formData.append('featured', String(post.featured));
      formData.append('cat_blog_id', post.cat_blog_id);
      formData.append('views', String(post.views));
      formData.append('commentCount', String(post.commentCount));
      formData.append('isDeleted', String(post.isDeleted));

      // Add createdAt only for new posts
      if (!isEditing) {
        formData.append('createdAt', post.createdAt);
      }

      // Get the file from form upload and append to formData
      const uploadedFileList = form.getFieldValue('image');

      if (uploadedFileList) {
        // Get the file from the upload component
        const file = uploadedFileList[0].originFileObj;
        if (file) {
          formData.append('image', file);
        }
      }

      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }

      const savedPost = await response.json();

      // Update local state
      if (isEditing) {
        setPosts(posts.map(item => item.id === post.id ? savedPost.data : item));
      } else {
        setPosts([...posts, savedPost.data]);
      }

      message.success(isEditing ? 'Cập nhật bài viết thành công!' : 'Tạo bài viết mới thành công!');
      return true;
    } catch (error) {
      console.error('Error saving post:', error);
      message.error('Không thể lưu bài viết. Vui lòng thử lại sau.');

      // Update local state anyway (for demo purposes)
      if (currentPost) {
        setPosts(posts.map(item => item.id === currentPost.id ? post : item));
      } else {
        setPosts([...posts, post]);
      }

      return false;
    }
  };

  // Delete post via API
  const deletePost = async (id: string | string[]): Promise<boolean> => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      
      // Convert single ID to array if it's a string
      const ids = Array.isArray(id) ? id : [id];
      
      // Convert string ids to integers for the API
      const intIds = ids.map(id => parseInt(id, 10));
      
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/blogs/hide`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(intIds)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      
      // Remove deleted posts from state
      setPosts(posts.filter(item => !ids.includes(item.id)));
      message.success(`Đã xóa ${ids.length > 1 ? 'các' : ''} bài viết thành công!`);
      
      // Reload data to update total counts and pagination
      fetchPosts({
        search: searchText,
        category: filteredCategory,
        status: activeTab !== 'all' ? activeTab : undefined,
        pageSize: pageSize,
        page: currentPage
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      message.error('Không thể xóa bài viết. Vui lòng thử lại sau.');

      // Update local state anyway (for demo purposes)
      if (Array.isArray(id)) {
        setPosts(posts.filter(item => !id.includes(item.id)));
      } else {
        setPosts(posts.filter(item => item.id !== id));
      }
      return false;
    }
  };

  // Load data
  useEffect(() => {
    // Fetch categories from API
    fetchCategories();
    
    // Fetch authors from API
    fetchAuthors();
  
    fetchPosts({ pageSize: pageSize });

  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchPosts({ 
      search: value, 
      category: filteredCategory, 
      status: activeTab !== 'all' ? activeTab : undefined,
      pageSize: pageSize,
      page: 0 // Reset về trang đầu tiên khi tìm kiếm
    });
  };

  // Xử lý thay đổi tab
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    // Chuyển đổi giá trị 'true'/'false' thành Boolean cho tham số status
    // hoặc không gửi status nếu tab là 'all'
    const statusParam = key === 'all' ? undefined : key === 'true' ? 'true' : 'false';
    
    fetchPosts({ 
      search: searchText, 
      category: filteredCategory, 
      status: statusParam,
      pageSize: pageSize,
      page: 0 // Reset về trang đầu tiên khi chuyển tab
    });
  };

  // Xử lý lọc theo danh mục
  const handleCategoryFilter = (value: string) => {
    setFilteredCategory(value);
    fetchPosts({ 
      search: searchText, 
      category: value, 
      status: activeTab !== 'all' ? activeTab : undefined,
      pageSize: pageSize,
      page: 0 // Reset về trang đầu tiên khi lọc
    });
  };
  
  // Xử lý lọc theo khoảng thời gian
  const handleDateRangeChange: RangePickerProps['onChange'] = (dates, dateStrings) => {
    if (dates) {
      setDateRange(dates as [Dayjs | null, Dayjs | null]);
      fetchPosts({
        search: searchText,
        category: filteredCategory,
        status: activeTab !== 'all' ? activeTab : undefined,
        startDate: dateStrings[0],
        endDate: dateStrings[1],
        pageSize: pageSize,
        page: 0 // Reset về trang đầu tiên khi lọc theo ngày
      });
    } else {
      setDateRange([null, null]);
      fetchPosts({
        search: searchText,
        category: filteredCategory,
        status: activeTab !== 'all' ? activeTab : undefined,
        pageSize: pageSize,
        page: 0 // Reset về trang đầu tiên khi xóa bộ lọc ngày
      });
    }
  };

  // Xử lý hiển thị modal
  const showModal = (post?: PostItem) => {
    if (post) {
      setCurrentPost(post);
      form.setFieldsValue({
        title: post.title,
        summary: post.summary,
        content: post.content,
        cat_blog_id: post.cat_blog_id,
        author_id: post.author_id,
        status: post.status.toString(),
        featured: post.featured
      });
      setPreviewContent(post.content);
    } else {
      setCurrentPost(null);
      form.resetFields();
      setPreviewContent('');
    }
    setIsModalVisible(true);
    setContentTabKey('editor'); // Default to editor tab when opening modal
  };

  // Xử lý đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentPost(null);
    form.resetFields();
    setPreviewContent('');
    setContentTabKey('editor');
  };

  // Effect để khởi tạo form khi chỉnh sửa
  useEffect(() => {
    if (currentPost && isModalVisible) {
      form.setFieldsValue({
        title: currentPost.title,
        content: currentPost.content,
        summary: currentPost.summary,
        cat_blog_id: currentPost.cat_blog_id,
        author_id: currentPost.author_id,
        status: currentPost.status.toString(),
        featured: currentPost.featured,
      });
      
      // CKEditor data is set via the 'data' prop, not here
    }
  }, [form, currentPost, isModalVisible]);

  // Xử lý lưu bài viết
  const handleSave = () => {
    form.validateFields().then(values => {
      const newPost: PostItem = {
        id: currentPost ? currentPost.id : `${posts.length + 1}`,
        title: values.title,
        content: values.content, // CKEditor content is already in form values
        summary: values.summary,
        author_id: values.author_id,
        createdAt: currentPost ? currentPost.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: typeof values.status === 'string' ? values.status === 'true' : Boolean(values.status),
        featured: typeof values.featured === 'string' ? values.featured === 'true' : Boolean(values.featured),
        cat_blog_id: values.cat_blog_id,
        image: currentPost?.image || '',
        views: currentPost?.views || 0,
        commentCount: currentPost?.commentCount || 0,
        isDeleted: false
      };
      
      // Save post via API
      savePost(newPost);

      setIsModalVisible(false);
      setCurrentPost(null);
      form.resetFields();
    });
  };

  // Xử lý xóa nhiều bài viết
  const handleBulkDelete = () => {
    if (selectedRowKeys.length === 0) {
      return;
    }
    
    // Convert selectedRowKeys to string[] since they might be numbers
    const selectedIds = selectedRowKeys.map(key => key.toString());
    
    // Call deletePost with array of IDs
    deletePost(selectedIds).then(success => {
      if (success) {
        // Clear selections after successful delete
        setSelectedRowKeys([]);
      }
    });
  };

  // Xử lý xóa bài viết
  const handleDelete = (id: string) => {
    deletePost(id);
  };

  // Xử lý chọn nhiều hàng
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Xử lý xem trước ảnh
  const handlePreview = (url: string) => {
    console.log('Preview image:', url);
    if (!url) {
      message.warning('Không có ảnh để hiển thị');
      return;
    }
    setPreviewImage(url);
    setPreviewVisible(true);
  };

  // Cấu hình upload ảnh
  const uploadProps: UploadProps = {
    name: 'file',
    // Remove the remote action for file upload since we'll handle it in form submission
    action: undefined,
    beforeUpload: (file: RcFile) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Chỉ có thể tải lên file JPG/PNG!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
      }
      return isJpgOrPng && isLt2M;
    },
    // Store file locally without uploading
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess && onSuccess("ok");
      }, 0);
    },
  };

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<PostItem> = [
    {
      title: 'Tiêu đề',
      key: 'title',
      render: (_, record) => (
        <Space>
          {record.image && (
            <Avatar
              shape="square"
              size={40}
              src={record.image}
              icon={<FileImageOutlined />}
              onClick={() => handlePreview(record.image)}
              style={{ cursor: 'pointer' }}
            />
          )}
          <Space direction="vertical" size={0}>
            <Text strong>{record.title}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Danh mục: {categories.find(c => c.id === record.cat_blog_id)?.name || ''}
            </Text>
          </Space>
        </Space>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
      width: '35%',
    },
    {
      title: 'Tác giả',
      key: 'author_id',
      render: (_, record) => {
        const author = authors.find(a => a.id.toString() === record.author_id.toString());
        return (
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>{author?.name || 'Không xác định'}</span>
          </Space>
        );
      },
      sorter: (a, b) => {
        const authorA = authors.find(author => author.id === a.author_id)?.name || '';
        const authorB = authors.find(author => author.id === b.author_id)?.name || '';
        return authorA.localeCompare(authorB);
      },
    },
    {
      title: 'Thống kê',
      key: 'stats',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Lượt xem">
            <Space>
              <EyeOutlined />
              <span>{record.views}</span>
            </Space>
          </Tooltip>
          <Divider type="vertical" />
          <Tooltip title="Bình luận">
            <Space>
              <CommentOutlined />
              <span>{record.commentCount}</span>
            </Space>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status, record) => (
        <Space>
          {status ? (
            <Tag color="success">Đã xuất bản</Tag>
          ) : (
            <Tag color="default">Bản nháp</Tag>
          )}
          {record.featured && <Tag color="blue">Nổi bật</Tag>}
        </Space>
      ),
      filters: [
        { text: 'Đã xuất bản', value: true },
        { text: 'Bản nháp', value: false },
      ],
      onFilter: (value, record) => record.status === value,
      width: '15%',
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      defaultSortOrder: 'descend',
      width: '15%',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handlePreview(record.image)}/>
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa bài viết này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
      width: '15%',
    },
  ];

  // Cấu hình chọn nhiều hàng
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Xử lý thay đổi pagination, page size và sorting
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<PostItem> | SorterResult<PostItem>[]
  ) => {
    console.log('Table params:', pagination, filters, sorter);
    
    // Lưu page size hiện tại
    if (pagination.pageSize) {
      setPageSize(pagination.pageSize);
    }
    
    // Xử lý sắp xếp
    let sortParams = {};
    
    if (sorter && !Array.isArray(sorter) && sorter.field && sorter.order) {
      // Convert field name nếu cần thiết (ví dụ: updatedAt -> updated_at)
      let fieldName = sorter.field.toString();
      if (fieldName === 'updatedAt') fieldName = 'updated_at';
      if (fieldName === 'createdAt') fieldName = 'created_at';
      
      const sortDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
      
      console.log('Sorting by:', fieldName, sortDirection);
      
      sortParams = {
        sortField: fieldName,
        sortDirection: sortDirection
      };
    }
    
    // Gọi API với các tham số mới
    fetchPosts({
      search: searchText,
      category: filteredCategory,
      status: activeTab !== 'all' ? activeTab : undefined,
      startDate: dateRange?.[0]?.format?.('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format?.('YYYY-MM-DD'),
      page: pagination.current ? pagination.current - 1 : 0, // API sử dụng 0-based index
      pageSize: pagination.pageSize || pageSize,
      ...sortParams
    });
  };

  return (
    <div>
      <Title level={2}>Quản lý bài viết</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
              >
                Thêm bài viết
              </Button>
              <Popconfirm
                title={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} bài viết đã chọn?`}
                onConfirm={handleBulkDelete}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                  danger
                >
                  Xóa đã chọn ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm bài viết..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
              <Select
                defaultValue="all"
                style={{ width: 200 }}
                onChange={handleCategoryFilter}
                loading={categoriesLoading}
              >
                <Option value="all">Tất cả danh mục</Option>
                {categories.map(category => (
                  <Option key={category.id} value={category.id}>{category.name}</Option>
                ))}
              </Select>
        
              <RangePicker 
                format="YYYY-MM-DD"
                placeholder={['Từ ngày', 'Đến ngày']} 
                onChange={handleDateRangeChange} 
              />
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab="Tất cả bài viết" key="all" />
            <TabPane tab="Đã xuất bản" key="true" />
            <TabPane tab="Bản nháp" key="false" />
          </Tabs>

          <Table
            columns={columns}
            dataSource={posts}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              pageSize: pageSize,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài viết`,
              total: totalPosts,
              current: currentPage + 1
            }}
            onChange={handleTableChange}
          />
        </Space>
      </Card>

      {/* Modal thêm/sửa bài viết */}
      <Modal
        title={currentPost ? "Chỉnh sửa bài viết" : "Thêm bài viết mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            {currentPost ? "Cập nhật" : "Tạo mới"}
          </Button>,
        ]}
        width={1000}
        centered
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="summary"
                label="Tóm tắt"
                rules={[{ required: true, message: 'Vui lòng nhập tóm tắt bài viết' }]}
              >
                <TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="content"
                label="Nội dung"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết' }]}
              >
                <Tabs activeKey={contentTabKey} onChange={key => setContentTabKey(key)}>
                  <TabPane tab="Soạn thảo" key="editor">
                    <div className="ck-editor-container" style={{ border: '1px solid #d9d9d9', borderRadius: '2px', padding: '2px' }}>
                      <CKEditor
                        editor={ClassicEditorWithTypes}
                        data={currentPost?.content || ''}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          form.setFieldValue('content', data);
                          setPreviewContent(data);
                        }}
                      />
                    </div>
                  </TabPane>
                  <TabPane tab="Xem trước" key="preview">
                    <div 
                      className="content-preview" 
                      style={{ 
                        border: '1px solid #d9d9d9', 
                        borderRadius: '2px', 
                        padding: '16px', 
                        minHeight: '200px',
                        backgroundColor: '#fff' 
                      }}
                      dangerouslySetInnerHTML={{ __html: previewContent }}
                    />
                  </TabPane>
                </Tabs>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cat_blog_id"
                label="Danh mục"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select loading={categoriesLoading}>
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="author_id"
                label="Tác giả"
                rules={[{ required: true, message: 'Vui lòng chọn tác giả' }]}
              >
                <Select loading={authorsLoading}>
                  {authors.map(author => {
                    const isCurrentAuthor = currentPost && author.id.toString() === currentPost.author_id.toString();
                    return (
                      <Option key={author.id} value={author.id}>{author.name}{isCurrentAuthor ? ' (Tác giả hiện tại)' : ''}</Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="true">Xuất bản</Option>
                  <Option value="false">Lưu nháp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="featured"
                label="Bài viết nổi bật"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Ảnh"
                name="image"
                valuePropName="fileList"
                getValueFromEvent={e => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
                rules={[
                  {
                    required: !currentPost,
                    message: 'Vui lòng tải lên ảnh'
                  }
                ]}
              >
                <Upload {...uploadProps} listType="picture-card">
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </div>
                </Upload>
              </Form.Item>

              {/* Initialize the form with values when editing */}
              {currentPost && (
                <div style={{ marginBottom: 16 }}>
                  <strong>Thumbnail hiện tại:</strong>
                  {currentPost.image && (
                    <img
                      src={currentPost.image}
                      alt="Current thumbnail"
                      style={{ maxWidth: '100%', maxHeight: 120, marginTop: 8, display: 'block' }}
                    />
                  )}
                </div>
              )}

              <Divider />



            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal xem trước ảnh */}
      <Modal
        title="Xem trước ảnh"
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        {previewImage ? (
          <img 
            alt="Xem trước ảnh" 
            style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} 
            src={previewImage} 
            onError={(e) => {
              message.error('Không thể tải ảnh');
              setPreviewVisible(false);
              e.currentTarget.onerror = null;
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <FileImageOutlined style={{ fontSize: 48 }} />
            <p>Không có ảnh để hiển thị</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Posts; 