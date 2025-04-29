import React, { useState, useEffect } from 'react';
import {
  Table, Button, Card, Space, Tag, Switch, Popconfirm, message,
  Upload, Modal, Form, Input, Select, DatePicker, InputNumber,
  Typography, Row, Col, Image
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  UploadOutlined, LinkOutlined, PictureOutlined, MobileOutlined,
  DesktopOutlined, GlobalOutlined, ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile, UploadProps } from 'antd/es/upload';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import useRefreshToken from '../../../utils/useRefreshToken';
import { useNavigate } from 'react-router-dom';
import { authTokenLogin } from '../../../utils/auth';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface BannerItem {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  position: string;
  platform: 'ALL' | 'DESKTOP' | 'MOBILE';
  type: 'REGULAR' | 'VOUCHER';
  startDate: string;
  endDate: string;
  status: boolean;
  priority: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
}
interface Author {
  id: string;
  name: string;
}

const Banners: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentBanner, setCurrentBanner] = useState<BannerItem | null>(null);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 0,
    pageSize: 5,
    total: 0
  });
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);

  // API token headers
  const getAuthHeaders = async () => {
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Tải dữ liệu từ API
  const fetchBanners = async (page = 0, pageSize = 5) => {
    setLoading(true);
    try {
      // Đảm bảo tham số hợp lệ
      const validPage = Math.max(0, page); 
      const validPageSize = Math.max(1, pageSize); 
      
      const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/banner-voucher?page=${validPage}&size=${validPageSize}`;
      console.log('Fetching banners with pagination:', { page: validPage, size: validPageSize });

      const headers = await getAuthHeaders();

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`Lỗi khi tải dữ liệu: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data:', { 
        content: data.content?.length || 0, 
        totalElements: data.totalElements,
        number: data.number,
        size: data.size,
        totalPages: data.totalPages
      });

      if (data) {
        // Ensure data.content is an array
        const bannerContent = Array.isArray(data.content) ? data.content : [];

        setBanners(bannerContent);

        // Cập nhật thông tin phân trang từ API
        setPagination({
          current: data.number !== undefined ? data.number : 0,
          pageSize: data.size || validPageSize,
          total: data.totalElements || 0
        });
        
        console.log('Updated pagination state:', {
          current: data.number !== undefined ? data.number : 0,
          pageSize: data.size || validPageSize,
          total: data.totalElements || 0
        });
      } else {
        message.error('Không thể tải dữ liệu banner');
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu banner:', error);
      message.error('Đã xảy ra lỗi khi tải dữ liệu banner');
    } finally {
      setLoading(false);
    }
  };
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
  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchBanners();
    fetchAuthors();
  }, []);

  // Xử lý thay đổi trang và số lượng dữ liệu mỗi trang
  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    console.log('Table params changed:', { 
      pagination: newPagination, 
      filters, 
      sorter 
    });
    
    // Lưu ý: newPagination.current bắt đầu từ 1, nhưng API bắt đầu từ 0
    const apiPage = newPagination.current - 1;
    const apiPageSize = newPagination.pageSize;
    
    console.log(`Fetching page ${apiPage}, size ${apiPageSize}`);
    
    // Gọi API với tham số phân trang mới
    fetchBanners(apiPage, apiPageSize);
  };

  // Xử lý hiển thị modal
  const showModal = (banner?: BannerItem) => {
    if (banner) {
      setCurrentBanner(banner);

      form.setFieldsValue({
        title: banner.title,
        linkUrl: banner.link,
        position: banner.position,
        platform: banner.platform,
        type: banner.type,
        dateRange: [moment(banner.startDate), moment(banner.endDate)],
        status: banner.status,
        priority: banner.priority,
        description: banner.description,
        accountId: banner.accountId
      });
    } else {
      setCurrentBanner(null);
      form.resetFields();
      form.setFieldsValue({
        platform: 'ALL',
        type: 'REGULAR',
        status: true,
        priority: banners.length > 0 ? Math.max(...banners.map(b => b.priority)) + 1 : 1
      });
    }
    setIsModalVisible(true);
  };

  // Xử lý đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentBanner(null);
    form.resetFields();
  };

  // Xử lý lưu banner
  const handleSave = async () => {
    try {
      // Form sẽ tự động validate và hiển thị thông báo lỗi
      const values = await form.validateFields();
      
      console.log('Form values:', values);
      
      // Tạo FormData để gửi cả dữ liệu và file
      const formData = new FormData();

      // Thêm dữ liệu banner vào FormData
      formData.append('title', values.title);
      formData.append('link', values.linkUrl);
      formData.append('position', values.position);
      formData.append('platform', values.platform.toUpperCase());
      formData.append('type', values.type.toUpperCase());

      // Đảm bảo ngày được format đúng
      if (values.dateRange && values.dateRange.length === 2) {
        const startDate = values.dateRange[0];
        const endDate = values.dateRange[1];

        const formattedStartDate = moment(startDate).toISOString();  // Chuyển sang ISO-8601
        const formattedEndDate = moment(endDate).toISOString();      // Chuyển sang ISO-8601

        formData.append('startDate', formattedStartDate);
        formData.append('endDate', formattedEndDate);
      }

      formData.append('status', values.status.toString());
      formData.append('priority', values.priority.toString());
      if (values.description) {
        formData.append('description', values.description);
      }
      if (values.accountId) {
        formData.append('accountId', values.accountId);
      }

      // Nếu có id (cập nhật), thêm vào FormData
      if (currentBanner?.id) {
        formData.append('id', currentBanner.id);
      }

      // Nếu có file ảnh mới, thêm vào FormData
      if (values.image && values.image.fileList && values.image.fileList.length > 0) {
        const fileItem = values.image.fileList[0];
        if (fileItem.originFileObj) {
          formData.append('image', fileItem.originFileObj);
        }
      }

      let response;
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      if (currentBanner) {
        // Cập nhật banner qua API
        response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/banner-voucher/${currentBanner.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
      } else {
        // Tạo banner mới qua API
        response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/banner-voucher`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });
      }

      if (!response.ok) {
        throw new Error('Lỗi khi lưu dữ liệu');
      }

      const data = await response.json();
      if (data) {
        message.success(currentBanner ? 'Cập nhật banner thành công!' : 'Tạo banner mới thành công!');
        setIsModalVisible(false);
        setCurrentBanner(null);
        form.resetFields();
        fetchBanners(pagination.current, pagination.pageSize);
      } else {
        message.error(data.message || 'Lỗi khi lưu banner');
      }
    } catch (error) {
      console.error('Validation failed:', error);
      // Form validation failed, đã hiển thị thông báo lỗi trong form
    }
  };

  // Xử lý xóa banner
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/banner-voucher/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Lỗi khi xóa dữ liệu');
      }

      const data = await response.json();
      if (data) {
        message.success('Đã xóa banner thành công!');
        fetchBanners(pagination.current, pagination.pageSize);
      } else {
        message.error(data.message || 'Lỗi khi xóa banner');
      }
    } catch (error) {
      console.error('Lỗi khi xóa banner:', error);
      message.error('Đã xảy ra lỗi khi xóa banner');
    }
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = async (checked: boolean, id: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/banner-voucher/toggle-status/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Lỗi khi cập nhật trạng thái');
      }

      const data = await response.json();
      if (data) {
        message.success(`Đã ${checked ? 'bật' : 'tắt'} banner thành công!`);

        setBanners(banners.map(item => {
          if (item.id === id) {
            return { ...item, status: checked };
          }
          return item;
        }));
      } else {
        message.error(data.message || 'Lỗi khi thay đổi trạng thái banner');
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái banner:', error);
      message.error('Đã xảy ra lỗi khi thay đổi trạng thái banner');
    }
  };

  // Xử lý xem trước ảnh
  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  // Update fileList when a new image is uploaded
  const handleUploadChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);

    // If there's a new file, set it as preview image
    if (newFileList && newFileList.length > 0) {
      const lastFile = newFileList[newFileList.length - 1];
      if (lastFile.originFileObj) {
        // For new files that have originFileObj
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target && e.target.result) {
            setPreviewImage(e.target.result as string);
            // Optionally show preview modal
            // setPreviewVisible(true);
          }
        };
        reader.readAsDataURL(lastFile.originFileObj);
      } else if (lastFile.url) {
        // For existing files that have URL
        setPreviewImage(lastFile.url);
      }
    }
  };

  // Cấu hình upload ảnh
  const uploadProps: UploadProps = {
    name: 'file',
    action: undefined,
    listType: 'picture-card',
    multiple: false,
    maxCount: 1,
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
    onChange: handleUploadChange,
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess?.("ok");
      }, 0);
    }
  };

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<BannerItem> = [
    {
      title: 'Banner',
      key: 'imageUrl',
      render: (_, record) => (
        <div style={{ width: 120, height: 60, overflow: 'hidden', cursor: 'pointer' }}>
          <img
            src={record.imageUrl}
            alt={record.title}
            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            onClick={() => handlePreview(record.imageUrl)}
          />
        </div>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{text}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description ? record.description.substring(0, 50) + (record.description.length > 50 ? '...' : '') : ''}
          </Typography.Text>
        </Space>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Vị trí hiển thị',
      dataIndex: 'position',
      key: 'position',
      render: (position) => {
        const positionMap: Record<string, string> = {
          'course': 'Khóa học',
          'document': 'Tài liệu',
          'blog': 'Blog',
          'homepage': 'Trang chủ'
        };
        return <Tag color="cyan">{positionMap[position] || position}</Tag>;
      },
      filters: [
        { text: 'Khóa học', value: 'course' },
        { text: 'Tài liệu', value: 'document' },
        { text: 'Blog', value: 'blog' },
        { text: 'Trang chủ', value: 'homepage' },
      ],
      onFilter: (value, record) => record.position === value,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        if (type === 'regular') {
          return <Tag color="blue">Thường</Tag>;
        } else {
          return <Tag color="orange">Voucher</Tag>;
        }
      },
      filters: [
        { text: 'Thường', value: 'REGULAR' },
        { text: 'Voucher', value: 'VOUCHER' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Tác giả',
      dataIndex: 'accountId',
      key: 'accountId',
      render: (accountId: string) => {
        const author = authors.find(a => a.id.toString() === accountId.toString());
        return author ? author.name : 'Không xác định';
      },
      filters: authors.map(author => ({ text: author.name, value: author.id })),
      onFilter: (value, record) => record.accountId === value,
    },
    {
      title: 'Thời gian',
      key: 'createdAt',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{new Date(record.startDate).toLocaleDateString('vi-VN')}</Typography.Text>
          <Typography.Text>đến</Typography.Text>
          <Typography.Text>{new Date(record.endDate).toLocaleDateString('vi-VN')}</Typography.Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: 'Nền tảng',
      dataIndex: 'platform',
      key: 'platform',
      render: (platform) => {
        if (platform === 'ALL') {
          return <Tag icon={<GlobalOutlined />} color="blue">Tất cả</Tag>;
        } else if (platform === 'DESKTOP') {
          return <Tag icon={<DesktopOutlined />} color="green">Desktop</Tag>;
        } else {
          return <Tag icon={<MobileOutlined />} color="orange">Mobile</Tag>;
        }
      },
      filters: [
        { text: 'Tất cả', value: 'ALL' },
        { text: 'Desktop', value: 'DESKTOP' },
        { text: 'Mobile', value: 'MOBILE' },
      ],
      onFilter: (value, record) => record.platform === value,
    },
    {
      title: 'Độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => a.priority - b.priority,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'status',
      render: (status, record) => (
        <Switch
          checked={status}
          onChange={(checked) => handleStatusChange(checked, record.id)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
      filters: [
        { text: 'Bật', value: true },
        { text: 'Tắt', value: false },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          />
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handlePreview(record.imageUrl)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa banner này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Reset phân trang về mặc định
  const resetPagination = () => {
    console.log('Resetting pagination to default values');
    const defaultPage = 0;
    const defaultPageSize = 5;
    setPagination({
      current: defaultPage,
      pageSize: defaultPageSize,
      total: pagination.total
    });
    fetchBanners(defaultPage, defaultPageSize);
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm banner
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchBanners(pagination.current, pagination.pageSize)}
          >
            Làm mới
          </Button>
          <Button onClick={resetPagination}>
            Reset phân trang
          </Button>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={banners}
        rowKey="id"
        loading={loading}
        pagination={{
          current: Math.max(1, pagination.current + 1), // UI là 1-based, API là 0-based
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} banner`,
          position: ['bottomRight']
        }}
        onChange={(paginationInfo, filters, sorter) => {
          console.log('Table onChange:', paginationInfo);
          
          const current = paginationInfo?.current || 1;
          const pageSize = paginationInfo?.pageSize || 5;
          
          // Chuyển từ 1-based của UI sang 0-based của API
          const page = current > 0 ? current - 1 : 0;
          
          console.log('Fetching with params:', { page, pageSize });
          fetchBanners(page, pageSize);
        }}
        scroll={{ x: 'max-content' }}
      />

      {/* Modal thêm/sửa banner */}
      <Modal
        title={currentBanner ? "Chỉnh sửa banner" : "Thêm banner mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            {currentBanner ? "Cập nhật" : "Tạo mới"}
          </Button>,
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          validateMessages={{
            required: '${label} là bắt buộc!',
            types: {
              number: '${label} phải là số!',
              url: '${label} phải là URL hợp lệ!'
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[
                  { required: true, message: 'Vui lòng nhập tiêu đề banner!' },
                  { max: 100, message: 'Tiêu đề không được quá 100 ký tự!' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="linkUrl"
                label="Đường dẫn liên kết"
                rules={[
                  { required: true, message: 'Vui lòng nhập đường dẫn!' },
                  { type: 'url', message: 'Đường dẫn không hợp lệ!', warningOnly: true }
                ]}
              >
                <Input prefix={<LinkOutlined />} placeholder="https://..." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Vị trí hiển thị"
                rules={[{ required: true, message: 'Vui lòng chọn vị trí hiển thị!' }]}
              >
                <Select>
                  <Option value="course">Khóa học</Option>
                  <Option value="document">Tài liệu</Option>
                  <Option value="blog">Blog</Option>
                  <Option value="homepage">Trang chủ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="platform"
                label="Nền tảng hiển thị"
                rules={[{ required: true, message: 'Vui lòng chọn nền tảng hiển thị!' }]}
              >
                <Select>
                  <Option value="ALL">Tất cả thiết bị</Option>
                  <Option value="DESKTOP">Chỉ Desktop</Option>
                  <Option value="MOBILE">Chỉ Mobile</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại banner"
                rules={[{ required: true, message: 'Vui lòng chọn loại banner!' }]}
              >
                <Select>
                  <Option value="REGULAR">Banner thường</Option>
                  <Option value="VOUCHER">Banner voucher</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="accountId"
                label="Tác giả"
                rules={[{ required: true, message: 'Vui lòng chọn tác giả!' }]}
              >
                <Select loading={authorsLoading}>
                  {authors.map(author => (
                    <Option key={author.id} value={author.id}>{author.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Thời gian hiển thị"
                rules={[
                  { 
                    required: true, 
                    message: 'Vui lòng chọn thời gian hiển thị!' 
                  },
                  {
                    validator: (_, value) => {
                      if (!value || value.length !== 2) {
                        return Promise.reject('Vui lòng chọn cả ngày bắt đầu và kết thúc!');
                      }
                      const startDate = value[0];
                      const endDate = value[1];
                      if (!startDate || !endDate) {
                        return Promise.reject('Vui lòng chọn cả ngày bắt đầu và kết thúc!');
                      }
                      if (startDate.isAfter(endDate)) {
                        return Promise.reject('Ngày kết thúc phải sau ngày bắt đầu!');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                  showTime={false}
                  allowClear={false}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Độ ưu tiên"
                rules={[
                  { required: true, message: 'Vui lòng nhập độ ưu tiên!' },
                  { type: 'number', message: 'Độ ưu tiên phải là số!' }
                 
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="image"
                label="Hình ảnh banner"
                getValueProps={(e) => {
                  // Ensure fileList is always an array
                  return { fileList: Array.isArray(e) ? e : fileList };
                }}
                rules={[
                  { 
                    required: !currentBanner?.imageUrl, 
                    message: 'Vui lòng tải lên hình ảnh banner!' 
                  }
                ]}
              >
                <Upload
                  {...uploadProps}
                  fileList={currentBanner?.imageUrl && fileList.length === 0 ? [
                    {
                      uid: '-1',
                      name: 'Ảnh hiện tại',
                      status: 'done',
                      url: currentBanner.imageUrl,
                    }
                  ] : fileList}
                >
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                </Upload>
              </Form.Item>
              {currentBanner?.imageUrl && fileList.length === 0 && (
                <div style={{ marginBottom: 16 }}>
                  <Image
                    src={currentBanner.imageUrl}
                    alt="Banner hiện tại"
                    width={200}
                    style={{ marginTop: 8 }}
                  />
                </div>
              )}
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  { max: 500, message: 'Mô tả không được quá 500 ký tự!' }
                ]}
              >
                <TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal xem trước ảnh */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Xem trước banner" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default Banners; 