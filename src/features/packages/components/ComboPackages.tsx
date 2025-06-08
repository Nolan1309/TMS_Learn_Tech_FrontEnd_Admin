import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Space, Input, Select, Tag, Popconfirm,
  message, Modal, Form, InputNumber, Switch, Divider, Tooltip,
  Row, Col, Typography, Badge, List, Avatar, Checkbox, Statistic, Upload
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SearchOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ReadOutlined, ShoppingOutlined, DollarOutlined, LoadingOutlined, UploadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../../utils/useRefreshToken';
import { authTokenLogin } from '../../../utils/auth';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
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

interface ComboPackage {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  courses: Course[];
  discount: number; // Phần trăm giảm giá
  status: 'ACTIVE' | 'INACTIVE';
  salesCount: number;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string; // Add image URL field
}

const ComboPackages: React.FC = () => {
  const [packages, setPackages] = useState<ComboPackage[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentPackage, setCurrentPackage] = useState<ComboPackage | null>(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [finalPrice, setFinalPrice] = useState<number>(0);

  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    fetchPackages();
    fetchCourseList();
  }, [page, pageSize, searchText, statusFilter]);

  const fetchCourseList = async () => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {
      // Update the URL to point to your actual API
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/get-all-result-list-course`,
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

      const data = await response.json();
      setCourses(data.data);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      message.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', (page - 1).toString()); // API uses 0-based indexing
      params.append('size', pageSize.toString());

      if (searchText) {
        params.append('name', searchText);
      }

      if (statusFilter !== null && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      // Make API request to the real endpoint
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-bundle?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData: any = await response.json();

      if (responseData.status === 200 && responseData.data) {
        // Ensure each package has a courses array
        const packagesWithCourses = responseData.data.content.map((pkg: any) => ({
          ...pkg,
          courses: Array.isArray(pkg.courses) ? pkg.courses : []
        }));
        setPackages(packagesWithCourses);
        setTotal(responseData.data.totalElements);
        setPage(responseData.data.number + 1); // Convert back to 1-based indexing for UI
      } else {
        message.error(responseData.message || 'Lỗi khi tải dữ liệu');
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching combo packages:", error);
      message.error("Không thể tải danh sách gói combo");
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === 'all' ? null : value);
    setPage(1);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event:', e);
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.log('No files selected');
      return;
    }

    const file = files[0];
    console.log('Selected file:', file);

    // Validate file type
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Chỉ có thể tải lên file JPG/PNG!');
      return;
    }

    // Validate file size
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
      return;
    }

    setImageFile(file);

    // Create a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImageFile = () => {
    setImageFile(null);
    setPreviewImage('');
  };

  const showModal = (pkg?: ComboPackage) => {
    if (pkg) {
      // Edit mode
      setCurrentPackage(pkg);
      setPreviewImage(pkg.imageUrl || '');
      
      // Calculate the final price after discount
      const calculatedFinalPrice = Math.round(pkg.price * (1 - pkg.discount / 100));
      setFinalPrice(calculatedFinalPrice);
      
      form.setFieldsValue({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        courseIds: Array.isArray(pkg.courses) ? pkg.courses.map(course => course.id) : [],
        status: pkg.status === 'ACTIVE',
        discount: pkg.discount,
      });
    } else {
      // Add mode
      setCurrentPackage(null);
      setFinalPrice(0);
      clearImageFile();
      form.resetFields();
      form.setFieldsValue({
        status: true,
      });
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentPackage(null);
    form.resetFields();
  };

  const handleSave = () => {
    form.validateFields().then(async values => {
      try {
        const token = await authTokenLogin(refreshToken, refresh, navigate);

        // Calculate original price based on selected courses
        const courseIds = Array.isArray(values.courseIds) ? values.courseIds : [];
        const coursesArray = Array.isArray(courses) ? courses : [];
        const selectedCourses = coursesArray.filter(course => courseIds.includes(course.id));
        const totalOriginalPrice = selectedCourses.reduce((sum, course) => sum + course.price, 0);

        // Calculate discount percentage
        const discountPercent = Math.round((1 - values.price / totalOriginalPrice) * 100);

        // Create FormData object
        const formData = new FormData();

        // Add package data as a JSON blob
        const packageData = {
          name: values.name,
          description: values.description,
          price: values.price,
          originalPrice: totalOriginalPrice,
          courseIds: courseIds,
          discount: discountPercent,
          status: values.status ? 'ACTIVE' : 'INACTIVE',
        };

        formData.append('data', new Blob([JSON.stringify(packageData)], { type: 'application/json' }));

        // Thêm file ảnh nếu có
        if (imageFile) {
          formData.append('image', imageFile);
        }


        let url;
        let method;

        if (currentPackage) {
          // Update existing package
          url = `${process.env.REACT_APP_SERVER_HOST}/api/course-bundle/${currentPackage.id}`;
          method = 'PUT';
        } else {
          // Create new package
          url = `${process.env.REACT_APP_SERVER_HOST}/api/course-bundle/create`;
          method = 'POST';
        }

        const response = await fetch(url, {
          method: method,
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type, let the browser set it with the correct boundary
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();

        if (responseData.status === 200 || responseData.status === 201) {
          message.success(currentPackage ? 'Cập nhật gói combo thành công!' : 'Tạo gói combo mới thành công!');
          fetchPackages(); // Refresh the list after adding/updating
        } else {
          message.error(responseData.message || 'Có lỗi xảy ra');
        }

        setIsModalVisible(false);
        setCurrentPackage(null);
        clearImageFile();
        form.resetFields();
      } catch (error) {
        console.error("Error saving combo package:", error);
        message.error("Không thể lưu gói combo");
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-bundle/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.status === 200 || responseData.status === 204) {
        message.success('Xóa gói combo thành công!');
        fetchPackages(); // Refresh the list after deleting
      } else {
        message.error(responseData.message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      console.error("Error deleting combo package:", error);
      message.error("Không thể xóa gói combo");
    }
  };

  const handleToggleStatus = async (pkg: ComboPackage) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const newStatus = pkg.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/course-bundle/${pkg.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.status === 200) {
        message.success(`Gói combo đã được ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'}!`);
        fetchPackages(); // Refresh the list after updating status
      } else {
        message.error(responseData.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      }
    } catch (error) {
      console.error("Error toggling combo package status:", error);
      message.error("Không thể thay đổi trạng thái gói combo");
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const columns: ColumnsType<ComboPackage> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      fixed: 'left',
      width: 80,
      render: (imageUrl) => (
        <Avatar
          src={imageUrl}
          shape="square"
          size={64}
          icon={!imageUrl && <ReadOutlined />}
        />
      ),
    },
    {
      title: 'Tên gói combo',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {Array.isArray(record.courses) ? record.courses.length : 0} khóa học
          </Text>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: { showTitle: false },
      render: text => (
        <Tooltip title={text}>
          <div style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 170,
      render: (price, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong style={{ color: '#1890ff' }}>{formatCurrency(price)}</Text>
            <Tag color="volcano"> {record.discount}%</Tag>
          </Space>
          {record.originalPrice > price && (
            <Text type="secondary" style={{ textDecoration: 'line-through' }}>
              {formatCurrency(record.originalPrice)}
            </Text>
          )}
        </Space>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    // {
    //   title: 'Giá gốc',
    //   dataIndex: 'originalPrice',
    //   key: 'originalPrice',
    //   width: 170,
    //   render: (originalPrice, record) => formatCurrency(originalPrice),
    // },
    {
      title: 'Lượt mua',
      dataIndex: 'salesCount',
      key: 'salesCount',
      width: 130,
      render: count => (
        <Space>
          <ShoppingOutlined />
          <span>{count}</span>
        </Space>
      ),
      sorter: (a, b) => a.salesCount - b.salesCount,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>
          {status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
      filters: [
        { text: 'Đang hoạt động', value: 'ACTIVE' },
        { text: 'Không hoạt động', value: 'INACTIVE' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <Typography.Text type="secondary">
          {new Date(date).toLocaleDateString('vi-VN')}
        </Typography.Text>
      ),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showPackageDetails(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button
            type="text"
            icon={record.status === 'ACTIVE' ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleStatus(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa gói combo này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
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

  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState<boolean>(false);
  const [detailPackage, setDetailPackage] = useState<ComboPackage | null>(null);

  const showPackageDetails = (pkg: ComboPackage) => {
    setDetailPackage(pkg);
    setIsDetailsModalVisible(true);
  };

  const handleDetailsCancel = () => {
    setIsDetailsModalVisible(false);
    setDetailPackage(null);
  };

  const calculateTotalValue = (courses: Course[]) => {
    return Array.isArray(courses) ? courses.reduce((sum, course) => sum + course.price, 0) : 0;
  };

  const ParserNumber = (value: string | undefined): string => {
    return value?.replace(/\$\s?|(,*)/g, '') || '0';
  };

  const handlePriceChange = (price: number | null) => {
    if (price && currentPackage) {
      const discount = form.getFieldValue('discount') || 0;
      const calculatedFinalPrice = Math.round(price * (1 - discount / 100));
      setFinalPrice(calculatedFinalPrice);
    }
  };

  const handleDiscountChange = (discount: number | null) => {
    if (discount !== null && currentPackage) {
      const price = form.getFieldValue('price') || 0;
      const calculatedFinalPrice = Math.round(price * (1 - discount / 100));
      setFinalPrice(calculatedFinalPrice);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm gói combo mới
        </Button>
        <Space>
          <Search
            placeholder="Tìm kiếm gói combo..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
          />
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={handleStatusFilterChange}
          >
            <Option value="all">Tất cả trạng thái</Option>
            <Option value="ACTIVE">Đang hoạt động</Option>
            <Option value="INACTIVE">Không hoạt động</Option>
          </Select>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={packages}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize || 10);
          },
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} gói combo`,
        }}
        scroll={{ x: 1200 }}
      />

      {/* Modal thêm/chỉnh sửa gói combo */}
      <Modal
        title={currentPackage ? 'Chỉnh sửa gói combo' : 'Thêm gói combo mới'}
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        width={700}
        okText={currentPackage ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên gói combo"
            rules={[{ required: true, message: 'Vui lòng nhập tên gói combo!' }]}
          >
            <Input placeholder="Nhập tên gói combo" />
          </Form.Item>

          <Form.Item
            label="Hình ảnh"
            required
            tooltip="Chọn file hình ảnh cho gói combo"
          >
            <div style={{ marginBottom: 8 }}>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                id="combo-image-upload"
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <Button
                icon={<UploadOutlined />}
                onClick={() => document.getElementById('combo-image-upload')?.click()}
              >
                Chọn ảnh
              </Button>

              {(imageFile || previewImage) && (
                <Button
                  danger
                  style={{ marginLeft: 8 }}
                  onClick={clearImageFile}
                >
                  Xóa ảnh
                </Button>
              )}
            </div>

            {previewImage && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={previewImage}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </div>
            )}

            {!imageFile && !previewImage && (
              <div style={{ color: '#ff4d4f' }}>Vui lòng chọn hình ảnh!</div>
            )}
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả gói!' }]}
          >
            <TextArea rows={3} placeholder="Nhập mô tả ngắn về gói combo" />
          </Form.Item>

          <Form.Item
            name="courseIds"
            label="Chọn khóa học"
            rules={[{
              required: true,
              message: 'Vui lòng chọn ít nhất 2 khóa học!',
              type: 'array',
              min: 2,
            }]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <div style={{ maxHeight: '300px', width: '100%', overflowY: 'auto', border: '1px solid #f0f0f0', padding: '8px', borderRadius: '4px' }}>
                <List
                  dataSource={Array.isArray(courses) ? courses : []}
                  renderItem={course => (
                    <List.Item key={course.id}>
                      <Checkbox value={course.id}>
                        <Space>
                          <Avatar
                            src={course.imageUrl}
                            icon={!course.imageUrl && <ReadOutlined />}
                            shape="square"
                          />
                          <div>
                            <div>{course.title}</div>
                            <div style={{ color: '#1890ff' }}>{formatCurrency(course.price)}</div>
                          </div>
                        </Space>
                      </Checkbox>
                    </List.Item>
                  )}
                />
              </div>
            </Checkbox.Group>
          </Form.Item>

          {/* {currentPackage && (
            <Form.Item
              name="discount"
              label="Giảm giá (%) "
              rules={[{ required: true, message: 'Vui lòng nhập giảm giá!' }]}
            >
              <InputNumber min={0} max={100} onChange={handleDiscountChange} />
            </Form.Item>
          )} */}

          <Form.Item
            name="price"
            label="Giá bán combo (đ)"
            dependencies={['courseIds']}
            rules={[
              { required: true, message: 'Vui lòng nhập giá bán!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const selectedCourseIds = getFieldValue('courseIds') || [];
                  if (selectedCourseIds.length < 2) {
                    return Promise.resolve();
                  }

                  const coursesArray = Array.isArray(courses) ? courses : [];
                  const selectedCourses = coursesArray.filter(course => selectedCourseIds.includes(course.id));
                  const totalOriginalPrice = selectedCourses.reduce((sum, course) => sum + course.price, 0);

                  if (value >= totalOriginalPrice) {
                    return Promise.reject(new Error(`Giá combo phải thấp hơn tổng giá các khóa học (${formatCurrency(totalOriginalPrice)})!`));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="VD: 499000"
              min={0}
              onChange={handlePriceChange}
            />
          </Form.Item>

          {currentPackage && (
            <>
              <Form.Item
                name="discount"
                label="Giảm giá (%) "
                rules={[{ required: true, message: 'Vui lòng nhập giảm giá!' }]}
                dependencies={['price']}
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  disabled
                  onChange={handleDiscountChange}
                />
              </Form.Item>
              
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 8, color: 'rgba(0, 0, 0, 0.85)' }}>Giá sau khi giảm</div>
                <div 
                  style={{ 
                    fontSize: '16px', 
                    color: '#1890ff', 
                    fontWeight: 'bold',
                    padding: '4px 11px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '2px',
                    backgroundColor: '#f5f5f5'
                  }}
                >
                  {formatCurrency(finalPrice)}
                </div>
              </div>
            </>
          )}

          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Hoạt động"
              unCheckedChildren="Không hoạt động"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xem chi tiết gói combo */}
      <Modal
        title="Chi tiết gói combo"
        visible={isDetailsModalVisible}
        onCancel={handleDetailsCancel}
        footer={[
          <Button key="close" onClick={handleDetailsCancel}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              handleDetailsCancel();
              if (detailPackage) {
                // Make sure the courses array is properly initialized
                const safePackage = {
                  ...detailPackage,
                  courses: Array.isArray(detailPackage.courses) ? detailPackage.courses : []
                };
                showModal(safePackage);
              }
            }}
          >
            Chỉnh sửa
          </Button>
        ]}
        width={600}
      >
        {detailPackage && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card
                  className="package-card"
                  title={detailPackage.name}
                  extra={
                    <Tag color={detailPackage.status === 'ACTIVE' ? 'success' : 'default'}>
                      {detailPackage.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                    </Tag>
                  }
                  cover={
                    detailPackage.imageUrl && (
                      <img
                        alt={detailPackage.name}
                        src={detailPackage.imageUrl}
                        style={{ height: 200, objectFit: 'cover' }}
                      />
                    )
                  }
                >
                  <div className="package-price">
                    <Space>
                      <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{formatCurrency(detailPackage.price)}</span>
                      <Tag color="volcano">-{detailPackage.discount}%</Tag>
                    </Space>
                    {detailPackage.originalPrice > detailPackage.price && (
                      <span className="package-original-price">{formatCurrency(detailPackage.originalPrice)}</span>
                    )}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Text>{detailPackage.description}</Text>
                  </div>

                  <Divider orientation="left">Khóa học trong combo</Divider>
                  <List
                    dataSource={Array.isArray(detailPackage.courses) ? detailPackage.courses : []}
                    renderItem={course => (
                      <List.Item key={course.id}>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              src={course.imageUrl}
                              icon={!course.imageUrl && <ReadOutlined />}
                              shape="square"
                              size="large"
                            />
                          }
                          title={course.title}
                          description={
                            <Space>
                              <Text type="secondary">{course.author}</Text>
                              <Text style={{ color: '#1890ff' }}>{formatCurrency(course.price)}</Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />

                  <Divider orientation="left">Thống kê</Divider>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Lượt mua"
                        value={detailPackage.salesCount}
                        prefix={<ShoppingOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Doanh thu"
                        value={detailPackage.price * detailPackage.salesCount}
                        prefix={<DollarOutlined />}
                        suffix="đ"
                      />
                    </Col>
                  </Row>

                  <Divider />
                  <Row>
                    <Col span={12}>
                      <Text type="secondary">Ngày tạo: {new Date(detailPackage.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">Cập nhật: {new Date(detailPackage.updatedAt).toLocaleDateString('vi-VN')}</Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComboPackages; 