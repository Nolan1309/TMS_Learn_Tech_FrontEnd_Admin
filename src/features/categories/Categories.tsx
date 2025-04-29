import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Button, Input, Space, Tag, Modal, Form,
  Popconfirm, Tabs, Badge, Tooltip, Select, message, Tree, Checkbox
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  AppstoreOutlined, FolderOutlined, BookOutlined, FileTextOutlined,
  QuestionCircleOutlined, SaveOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { authTokenLogin } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;

interface Category {
  id: number;
  name: string;
  type: 'COURSE' | 'DOCUMENT' | 'BLOG';
  description?: string;
  parentId?: number;
  level: number;
  orderIndex: number;
  status: 'ACTIVE' | 'INACTIVE';
  itemCount: number;
  deleted?: boolean;
  deletedDate?: string;
  createdAt: string;
  updatedAt?: string;
  children?: Category[];
}

const typeTexts = {
  COURSE: 'Khóa học',
  DOCUMENT: 'Tài liệu',
  BLOG: 'Bài viết',
};

const typeIcons = {
  COURSE: <BookOutlined />,
  DOCUMENT: <FileTextOutlined />,
  BLOG: <FileTextOutlined />,
};

// Thêm interface cho query params
interface CategoryParams {
  page?: number;
  limit?: number;
  name?: string;
  type?: string;
  status?: string;
  isDeleted?: boolean;
}

// Thêm interface cho API response
interface CategoryApiResponse {
  content: Category[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

const CategoriesPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  // Thêm state quản lý phân trang
  const [pagination, setPagination] = useState({
    current: 0,
    pageSize: 100,
    total: 0
  });
  
  // Thêm state quản lý bộ lọc
  const [filters, setFilters] = useState<CategoryParams>({
    page: 0,
    limit: 100
  });

  // Hàm fetch categories từ API
  const fetchCategories = async (params: CategoryParams = {}) => {
    setLoading(true);
    try {
      // Lấy token từ localStorage
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      
      // Xây dựng query string từ params
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('size', params.limit.toString());
      if (params.name) queryParams.append('name', params.name);
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);
      if (params.isDeleted !== undefined) queryParams.append('isDeleted', params.isDeleted.toString());

      // Gọi API
      const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/categories?${queryParams.toString()}`;
      console.log('Calling API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      const data: CategoryApiResponse = await response.json();
      console.log('API Response:', data);
      
      // Cập nhật state và pagination
      if (data.content && Array.isArray(data.content)) {
        // Khắc phục vấn đề thiếu trường isDeleted trên giao diện
        const processedContent = data.content.map(processCategory);
        setCategories(processedContent);
        
        setPagination({
          current: data.number,  // Số trang hiện tại (API trả về từ 0)
          pageSize: data.size,   // Kích thước trang
          total: data.totalElements // Tổng số phần tử
        });
      } else {
        console.error('Invalid data format:', data);
        message.error('Dữ liệu không đúng định dạng');
      }
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh mục. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý category để đảm bảo các trường hiển thị đúng
  const processCategory = (category: any): Category => {
    // Tạo một bản sao của category để không ảnh hưởng đến dữ liệu gốc
    const processed = { ...category };
    
    // Xử lý children nếu có
    if (processed.children && Array.isArray(processed.children)) {
      processed.children = processed.children.map(processCategory);
    }
    
    // Đảm bảo các trường cần thiết cho giao diện
    processed.key = processed.id;
    
    return processed;
  };

  // Gọi API khi component mount hoặc filters thay đổi
  useEffect(() => {
    console.log('Fetching categories with filters:', filters);
    fetchCategories(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Thay đổi phương thức handleSearch để cập nhật filters
  const handleSearch = (value: string) => {
    setSearchText(value);
    setFilters(prev => ({
      ...prev,
      name: value || undefined,
      page: 0 // Reset về trang 1 khi tìm kiếm
    }));
  };

  // Thay đổi phương thức handleTabChange để cập nhật filters
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    let typeFilter: string | undefined = undefined;
    let statusFilter: string | undefined = undefined;
    let isDeletedFilter: boolean | undefined = undefined;
    
    // Thiết lập filter dựa trên tab
    if (key === 'COURSE' || key === 'DOCUMENT' || key === 'BLOG') {
      typeFilter = key;
    } 
    // else if (key === 'INACTIVE') {
    //   statusFilter = 'INACTIVE';
    // } else if (key === 'DELETED') {
    //   isDeletedFilter = true;
    // }
    
    setFilters(prev => ({
      ...prev,
      type: typeFilter,
      status: statusFilter,
      isDeleted : isDeletedFilter,
      page: 0 // Reset về trang 1 khi chuyển tab
    }));
  };

  // Sau khi thêm/sửa/xóa, cập nhật lại danh sách
  const refreshCategories = () => {
    fetchCategories(filters);
  };

  const handleSave = () => {
    form.validateFields()
      .then(async values => {
        // Lấy token
        const token = await authTokenLogin(refreshToken, refresh, navigate);

        // Xử lý logic level và parentId
        const level = values.level;
        
        // Đảm bảo cấp 1 không có cha
        if (level === 1) {
          values.parentId = null;
        }
        
        // Đảm bảo cấp 2 và 3 phải có cha
        if ((level === 2 || level === 3) && !values.parentId) {
          message.error(`Danh mục cấp ${level} phải có danh mục cha`);
          return;
        }
        
        // Đảm bảo có orderIndex
        if (!values.orderIndex) {
          values.orderIndex = 1;
        }

        // Xử lý deletedDate nếu trạng thái deleted thay đổi
        if (values.isDeleted) {
          values.deletedDate = values.deletedDate || new Date().toISOString();
          values.deleted = true; // Sử dụng trường deleted thay vì isDeleted cho API
        } else {
          values.deletedDate = undefined;
          values.deleted = false;
        }
        
        // Xóa trường isDeleted vì API không sử dụng
        delete values.isDeleted;
        
        try {
          let response;
          
          if (editingCategory) {
            const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/categories/${editingCategory.id}`;
            console.log('Updating category:', apiUrl, values);
            
            // Cập nhật danh mục
            response = await fetch(apiUrl, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(values)
            });
          } else {
            const apiUrl = `${process.env.REACT_APP_SERVER_HOST}/api/categories`;
            console.log('Creating category:', apiUrl, values);
            
            // Tạo danh mục mới
            response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(values)
            });
          }

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save category: ${response.status} ${response.statusText} - ${errorText}`);
          }

          const responseData = await response.json();
          console.log('Save response:', responseData);

          message.success(
            editingCategory 
              ? `Đã cập nhật danh mục ${values.name}` 
              : `Đã thêm danh mục ${values.name}`
          );
          
          setIsModalVisible(false);
          refreshCategories(); // Tải lại danh sách
          
        } catch (error) {
          console.error('Error saving category:', error);
          message.error('Không thể lưu danh mục. Vui lòng thử lại sau!');
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDelete = async (id: number) => {
    try {
      // Lấy token
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Gọi API xóa (soft delete)
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      message.success('Đã đánh dấu xóa danh mục');
      refreshCategories(); // Tải lại danh sách
      
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Không thể xóa danh mục. Vui lòng thử lại sau!');
    }
  };

  // Chuyển đổi dữ liệu cho Tree
  const convertToTreeData = (data: Category[]): DataNode[] => {
    return data.map(item => ({
      key: item.id,
      title: (
        <Space>
          {typeIcons[item.type]}
          <span>{item.name}</span>
          {item.status === 'INACTIVE' && (
            <Tag color="red">Không hoạt động</Tag>
          )}
          {item.deleted && (
            <Tooltip title={`Đã xóa vào: ${item.deletedDate ? new Date(item.deletedDate).toLocaleString() : ''}`}>
              <Tag color="red">Đã xóa</Tag>
            </Tooltip>
          )}
          <Tag color="blue">{typeTexts[item.type]}</Tag>
          <Tag color="green">{item.itemCount} mục</Tag>
          
          <Space size="small">
            <Tooltip title="Chỉnh sửa">
              <Button 
                icon={<EditOutlined />} 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  showEditModal(item);
                }} 
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa danh mục này?"
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDelete(item.id);
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText="Có"
                cancelText="Không"
              >
                <Button 
                  icon={<DeleteOutlined />} 
                  size="small" 
                  danger 
                  disabled={item.itemCount > 0}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        </Space>
      ),
      children: item.children ? convertToTreeData(item.children) : undefined,
    }));
  };

  // Chuyển đổi dữ liệu cho Tree - sử dụng trực tiếp cấu trúc cây từ API
  const treeData = convertToTreeData(categories);

  // Làm phẳng danh sách category cho việc tìm kiếm và hiển thị bảng
  const flattenCategories = (categoryList: Category[]): Category[] => {
    return categoryList.reduce((acc: Category[], current: Category) => {
      // Thêm danh mục hiện tại
      acc.push(current);
      
      // Nếu có children và được mở rộng, thêm children vào
      if (current.children && current.children.length > 0) {
        acc.push(...flattenCategories(current.children));
      }
      
      return acc;
    }, []);
  };

  // Tạo danh sách phẳng để hiển thị stats và lọc
  const flatCategories = flattenCategories(categories);

  // Lọc categories dựa trên tab và tìm kiếm
  const filteredCategories = flatCategories.filter(cat => {
    const matchesTab = activeTab === 'ALL' || 
                     cat.type === activeTab || 
                     (activeTab === 'INACTIVE' && cat.status === 'INACTIVE') ||
                     (activeTab === 'DELETED' && cat.deleted);
    const matchesSearch = cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        (cat.description && cat.description.toLowerCase().includes(searchText.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // Cập nhật getCategoryStats để hoạt động với dữ liệu API
  const getCategoryStats = () => {
    const courseCats = flatCategories.filter(c => c.type === 'COURSE').length;
    const documentCats = flatCategories.filter(c => c.type === 'DOCUMENT').length;
    const blogCats = flatCategories.filter(c => c.type === 'BLOG').length;
    const inactiveCats = flatCategories.filter(c => c.status === 'INACTIVE').length;
    const deletedCats = flatCategories.filter(c => c.deleted).length;
    
    return { courseCats, documentCats, blogCats, inactiveCats, deletedCats };
  };

  const stats = getCategoryStats();

  const showAddModal = () => {
    setEditingCategory(null);
    form.resetFields();
    
    // Thiết lập giá trị mặc định
    form.setFieldsValue({
      type: 'COURSE',
      level: 1,
      orderIndex: 1, // Mặc định cấp 1 = orderIndex 1
      status: 'ACTIVE',
      isDeleted: false
    });
    
    setIsModalVisible(true);
  };

  const showEditModal = (category: Category) => {
    setEditingCategory(category);
    
    // Khi chỉnh sửa, giữ nguyên thứ tự hiển thị và không tính toán lại theo level
    form.setFieldsValue({
      name: category.name,
      type: category.type,
      description: category.description || '',
      level: category.level,
      parentId: category.parentId || null,
      status: category.status,
      orderIndex: category.orderIndex, // Giữ nguyên giá trị đã có
      isDeleted: category.deleted
    });
    
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Cập nhật getParentOptions để nhận level hiện tại từ tham số
  const getParentOptions = (currentLevel?: number) => {
    // Đảm bảo currentLevel luôn có giá trị, mặc định là 1
    const level = currentLevel ?? form.getFieldValue('level') ?? 1;
    
    // Nếu level là 1, không hiển thị danh mục cha nào
    if (level === 1) {
      return [<Option key="null" value={null} disabled>Không có</Option>];
    }
    
    // Nếu level là 2, chỉ hiển thị danh mục level 1
    // Nếu level là 3, chỉ hiển thị danh mục level 2
    const targetParentLevel = level - 1;
    
    const options = flatCategories
      .filter(cat => 
        cat.level === targetParentLevel && 
        (!editingCategory || cat.id !== editingCategory.id)
      )
      .map(cat => (
        <Option key={cat.id} value={cat.id}>
          {cat.name} ({typeTexts[cat.type]})
        </Option>
      ));
    
    return options.length > 0 ? options : [
      <Option key="null" value={null} disabled>Không tìm thấy danh mục phù hợp</Option>
    ];
  };


  return (
    <div>
      <Title level={2}>Quản lý danh mục</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Thêm danh mục mới
            </Button>
            <Space>
              <Search
                placeholder="Tìm kiếm danh mục..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
              />
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane 
              tab={<span>Tất cả danh mục</span>} 
              key="all"
            />
            <TabPane 
              tab={
                <Badge count={stats.courseCats} showZero>
                  <span>Khóa học</span>
                </Badge>
              } 
              key="COURSE"
            />
            <TabPane 
              tab={
                <Badge count={stats.documentCats} showZero>
                  <span>Tài liệu</span>
                </Badge>
              } 
              key="DOCUMENT"
            />
            <TabPane 
              tab={
                <Badge count={stats.blogCats} showZero>
                  <span>Bài viết</span>
                </Badge>
              } 
              key="BLOG"
            />
            {/* <TabPane 
              tab={
                <Badge count={stats.inactiveCats} showZero>
                  <span>Không hoạt động</span>
                </Badge>
              } 
              key="INACTIVE"
            />
            <TabPane 
              tab={
                <Badge count={stats.deletedCats} showZero>
                  <span>Đã xóa</span>
                </Badge>
              } 
              key="DELETED"
            /> */}
          </Tabs>

          {/* <div>
            <Button 
              onClick={() => {
                console.log('Current categories:', categories);
                if (categories.length > 0) {
                  alert(`Có ${categories.length} danh mục cấp 1. Hãy kiểm tra console để biết chi tiết`);
                } else {
                  alert('Không có dữ liệu danh mục. Hãy kiểm tra console để biết thêm chi tiết');
                }
              }} 
              style={{ marginBottom: 10 }}
            >
              Debug Data ({categories.length})
            </Button>
            {categories && categories.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <Text>Có {categories.length} danh mục gốc, tổng {flatCategories.length} danh mục</Text>
              </div>
            )}
          </div> */}

          {categories.length === 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Title level={4}>Không có dữ liệu</Title>
              <p>Không tìm thấy danh mục nào.</p>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
              <Tree
                showLine={{ showLeafIcon: false }}
                showIcon
                defaultExpandAll
                treeData={treeData}
                expandAction="click"
              />
            </div>
          )}
        </Space>
      </Card>

      <Modal
        title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel} icon={<CloseCircleOutlined />}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave} icon={<SaveOutlined />}>
            {editingCategory ? "Cập nhật" : "Thêm"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          name="category_form"
        >
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn loại danh mục!' }]}
          >
            <Select placeholder="Chọn loại danh mục" disabled={!!editingCategory}>
              <Option value="COURSE">Khóa học</Option>
              <Option value="DOCUMENT">Tài liệu</Option>
              <Option value="BLOG">Bài viết</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="level"
            label="Cấp danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn cấp danh mục!' }]}
          >
            <Select 
              placeholder="Chọn cấp danh mục" 
              disabled={!!editingCategory}
              onChange={(value) => {
                // Khi thay đổi level, reset trường parentId
                form.setFieldsValue({ parentId: null });
                
                // Đặt orderIndex theo level (chỉ khi thêm mới)
                if (!editingCategory) {
                  const level = Number(value);
                  let newOrderIndex = 1;
                  
                  // Cấp 1: orderIndex = 1, Cấp 2: orderIndex = 2, Cấp 3: orderIndex = 3
                  newOrderIndex = level;
                  
                  form.setFieldsValue({ orderIndex: newOrderIndex });
                }
              }}
            >
              <Option value={1}>Cấp 1</Option>
              <Option value={2}>Cấp 2</Option>
              <Option value={3}>Cấp 3</Option>
            </Select>
          </Form.Item>

          <Form.Item
            shouldUpdate={(prevValues, currentValues) => prevValues.level !== currentValues.level}
          >
            {({ getFieldValue }) => {
              const level = getFieldValue('level');
              return (
                <Form.Item
                  name="parentId"
                  label="Danh mục cha"
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const level = getFieldValue('level');
                        if (level === 1 && value) {
                          return Promise.reject('Danh mục cấp 1 không thể có danh mục cha');
                        }
                        if ((level === 2 || level === 3) && !value) {
                          return Promise.reject(`Danh mục cấp ${level} phải chọn danh mục cha`);
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Select 
                    placeholder="Chọn danh mục cha" 
                    disabled={level === 1 || !!editingCategory}
                    allowClear={false}
                  >
                    {getParentOptions(level)}
                  </Select>
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            name="orderIndex"
            label="Thứ tự hiển thị"
            tooltip="Các danh mục cùng cấp sẽ được sắp xếp theo thứ tự này"
            
            rules={[{ required: true, message: 'Vui lòng nhập thứ tự hiển thị!' }]}
          >
            <Input 
              type="number" 
              disabled
              placeholder="Nhập thứ tự hiển thị" 
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả danh mục" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="isDeleted"
            label="Đánh dấu đã xóa"
            valuePropName="checked"
          >
            <Checkbox />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage; 