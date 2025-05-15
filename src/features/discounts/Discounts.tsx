import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Tag, Input, Select,
  Popconfirm, message, Modal, Form, Row, Col, Tabs, DatePicker,
  InputNumber, Badge, Tooltip, Switch, Radio, Alert
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined,
  FilterOutlined, PercentageOutlined, DollarOutlined, CopyOutlined,
  GiftOutlined, CheckOutlined, ClockCircleOutlined, StopOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import { authTokenLogin } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import './Discounts.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

interface DiscountItem {
  id: string;
  code: string;
  title: string;
  discountType: 'DISCOUNT' | 'VOUCHER';
  voucherType: 'COURSE' | 'TEST' | 'COMBO';
  value: number;
  description: string;
  startDate: string;
  endDate: string;
  minOrderValue?: number;
  maxUsed?: number;  // Số lượt tối đa sử dụng
  usedCount: number; // Số lượt đã sử dụng
  targetIds?: string[];
  status: 'ACTIVE' | 'EXPIRED' | 'USED' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  isDeleted: boolean;
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

interface Exam {
  testId: string;
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
  status?: 'ACTIVE' | 'INACTIVE';
}

interface CourseBundle {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
const Discounts: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isTargetModalVisible, setIsTargetModalVisible] = useState<boolean>(false);
  const [currentDiscount, setCurrentDiscount] = useState<DiscountItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const [targetForm] = Form.useForm();
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const [courses, setCourses] = useState<Course[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [courseBundles, setCourseBundles] = useState<CourseBundle[]>([]);
  const fetchCourseList = async () => {
    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {
      // Update the URL to point to your actual API
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/courses/get-all-result-list`,
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
      return data;
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      message.error("Không thể tải danh sách khóa học");
      return [];
    } finally {
      setLoading(false);
    }
  };
  const fetchExamList = async () => {

    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/tests/filter-all-exam-list`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam data");
      }

      const rawData = await response.json();
      console.log('Received exam data:', rawData);
      const examData = rawData.data || [];
      setExams(examData);
      return examData;
    } catch (error: any) {
      console.error("Failed to fetch exams:", error);
      message.error("Không thể tải danh sách đề thi");
      setExams([]);
      return [];
    } finally {
      setLoading(false);
    }
  };
  const fetchCourseBundleList = async () => {

    setLoading(true);
    const token = await authTokenLogin(refreshToken, refresh, navigate);
    try {

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_HOST}/api/course-bundle/list-all`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam data");
      }

      const rawData = await response.json();
      console.log('Received course bundle data:', rawData);
      const courseBundleData = rawData.data || [];
      setCourseBundles(courseBundleData);
      return courseBundleData;
    } catch (error: any) {
      console.error("Failed to fetch course bundles:", error);
      message.error("Không thể tải danh sách gói khóa học");
      setCourseBundles([]);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Tải dữ liệu
  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Fetch discounts with optional filters
  const fetchDiscounts = async (filters?: { title?: string, discountType?: string }) => {
    try {
      setLoading(true);
      const token = await authTokenLogin(refreshToken, refresh, navigate);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters?.title) {
        queryParams.append('title', filters.title);
      }
      if (filters?.discountType) {
        queryParams.append('discountType', filters.discountType);
      }

      const queryString = queryParams.toString();
      const endpoint = `${process.env.REACT_APP_SERVER_HOST}/api/discounts/filter-all${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discounts');
      }

      const data = await response.json();
      setDiscounts(data.content);
    } catch (error) {
      console.error('Error loading discounts:', error);
      message.warning('Không thể tải dữ liệu từ server, đang hiển thị dữ liệu mẫu');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchDiscounts({ title: value, discountType: filterType !== 'all' ? filterType : undefined });
  };

  // Fetch new discount code
  const fetchNewDiscountCode = async () => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/discounts/new/code`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch new discount code');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching new discount code:', error);
      message.error('Không thể lấy mã giảm giá mới');
      return '';
    }
  };

  // Xử lý thay đổi tab
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // Xử lý lọc theo loại giảm giá
  const handleTypeFilter = (value: string) => {
    setFilterType(value);
    fetchDiscounts({ title: searchText || undefined, discountType: value !== 'all' ? value : undefined });
  };

  // Xử lý hiển thị modal
  const showModal = async (discount?: DiscountItem) => {
    if (discount) {
      setCurrentDiscount(discount);
      form.setFieldsValue({
        code: discount.code,
        title: discount.title,
        discountType: discount.discountType,
        value: discount.value,
        description: discount.description,
        dateRange: [moment(discount.startDate), moment(discount.endDate)],
        minOrderValue: discount.minOrderValue,
        maxUsed: discount.maxUsed,
        voucherType: discount.voucherType,
        targetIds: discount.targetIds?.join(', '),
        status: discount.status === 'ACTIVE'
      });
    } else {
      setCurrentDiscount(null);
      form.resetFields();

      // Fetch new discount code
      setLoading(true);
      const newCode = await fetchNewDiscountCode();
      setLoading(false);

      form.setFieldsValue({
        code: newCode,
        discountType: 'DISCOUNT',
        voucherType: 'COURSE',
        value: 10,
        status: true
      });
    }
    setIsModalVisible(true);
  };

  // Xử lý đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentDiscount(null);
    form.resetFields();
  };

  // Xử lý lưu mã giảm giá
  const handleSave = () => {
    form.validateFields().then(async values => {
      const discountData = {
        code: values.code,
        title: values.title,
        discountType: values.discountType,
        voucherType: values.voucherType,
        value: values.value,
        description: values.description,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        minOrderValue: values.minOrderValue ? values.minOrderValue : null,
        maxUsed: values.discountType === 'VOUCHER' ? values.maxUsed : null,
        targetIds: values.discountType === 'DISCOUNT' && values.targetIds ?
          values.targetIds.split(',').map((id: string) => id.trim()) : null,
        status: values.status ? 'ACTIVE' : 'DISABLED' as 'ACTIVE' | 'DISABLED'
      };

      setIsModalVisible(false);
      setLoading(true);

      try {
        if (currentDiscount) {
          // Update existing discount
          const token = await authTokenLogin(refreshToken, refresh, navigate);
          const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/discounts/update/${currentDiscount.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(discountData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi cập nhật mã giảm giá');
          }

          const data = await response.json();
          const updatedDiscount = {
            ...currentDiscount,
            ...discountData,
            updatedAt: new Date().toISOString(),
          };

          setDiscounts(discounts.map(item =>
            item.id === currentDiscount.id ? updatedDiscount : item
          ));
          message.success(`Cập nhật ${values.discountType === 'DISCOUNT' ? 'Discount' : 'Voucher'} thành công!`);
        } else {
          // Create new discount
          const token = await authTokenLogin(refreshToken, refresh, navigate);
          const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/discounts/add`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(discountData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi thêm mã giảm giá');
          }

          const data = await response.json();
          setDiscounts([...discounts, data.data]);
          message.success(`Tạo ${values.discountType === 'DISCOUNT' ? 'Discount' : 'Voucher'} mới thành công!`);
        }
      } catch (error: any) {
        console.error('Error saving discount:', error);
        message.error(error.message || 'Lỗi khi lưu mã giảm giá');
      } finally {
        setLoading(false);
        setCurrentDiscount(null);
        form.resetFields();
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  // Xử lý xóa mã giảm giá
  const handleDelete = (id: string) => {
    const item = discounts.find(d => d.id === id);
    const itemType = item?.discountType === 'DISCOUNT' ? 'giảm giá' : 'voucher';

    setDiscounts(discounts.filter(item => item.id !== id));
    message.success(`Đã xóa ${itemType} thành công!`);
  };

  // Xử lý tắt/bật mã giảm giá
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      setLoading(true);
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/discounts/toggle-status/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: isActive ? 'ACTIVE' : 'DISABLED' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi thay đổi trạng thái');
      }

      await response.json();

      setDiscounts(discounts.map(item => {
        if (item.id === id) {
          return { ...item, status: isActive ? 'ACTIVE' : 'DISABLED' };
        }
        return item;
      }));

      const item = discounts.find(d => d.id === id);
      const itemType = item?.discountType === 'DISCOUNT' ? 'giảm giá' : 'voucher';
      message.success(`Đã ${isActive ? 'bật' : 'tắt'} ${itemType} thành công!`);
    } catch (error: any) {
      console.error('Error toggling discount status:', error);
      message.error(error.message || 'Lỗi khi thay đổi trạng thái');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý copy mã voucher
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      message.success(`Đã sao chép mã voucher: ${code}`);
    }, () => {
      message.error('Không thể sao chép mã voucher!');
    });
  };

  // Xử lý lưu điều chỉnh áp dụng
  const handleTargetSave = () => {
    targetForm.validateFields().then(async values => {
      if (currentDiscount) {
        setLoading(true);
        let selectedTargetIds = values.targetIds || [];
        const processedIds = selectedTargetIds.flatMap((id: string | number) => {
          if (typeof id === 'string' && id.includes(',')) {
            return id.split(',').map(part => part.trim()).filter(part => part !== '');
          }
          return id && id.toString().trim() !== '' ? id.toString() : [];
        });

        // Convert strings to numbers where possible
        const numericIds = processedIds.map((id: string) => {
          const num = Number(id);
          return !isNaN(num) ? num : id;
        });

        const updateData = {
          discountId: currentDiscount.id,
          voucherType: values.voucherType,
          targetIds: numericIds
        };

        try {
          const token = await authTokenLogin(refreshToken, refresh, navigate);
          const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/discounts/apply`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Lỗi khi cập nhật phạm vi áp dụng');
          }

          const result = await response.json();

          const updatedDiscount: DiscountItem = {
            ...currentDiscount,
            voucherType: values.voucherType,
            targetIds: numericIds.map((id: string | number) => Number(id) || id),
            updatedAt: new Date().toISOString()
          };

          setDiscounts(discounts.map(item =>
            item.id === currentDiscount.id ? updatedDiscount : item
          ));
          message.success(`Đã cập nhật phạm vi áp dụng thành công!`);
        } catch (error: any) {
          console.error('Error updating discount targets:', error);
          message.error(error.message || 'Lỗi khi cập nhật phạm vi áp dụng');
        } finally {
          setLoading(false);
        }
      }

      setIsTargetModalVisible(false);
      setCurrentDiscount(null);
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  // Xử lý hiển thị modal điều chỉnh áp dụng
  const showTargetModal = (discount: DiscountItem) => {
    setCurrentDiscount(discount);
    const targetIdValues = discount.targetIds || [];

    // Check if discount is ACTIVE and trying to apply to tests
    if (discount.status === 'ACTIVE') {
      message.warning('Mã giảm giá đang hoạt động không thể áp dụng cho đề thi. Hãy tắt trạng thái hoạt động trước.');
    } else {
      if (discount.voucherType === 'COURSE') {
        fetchCourseList().then((courseData) => {
          targetForm.setFieldsValue({
            voucherType: discount.voucherType,
            targetIds: targetIdValues.map(id => id.toString())
          });
        });
      } else if (discount.voucherType === 'TEST') {
        fetchExamList().then((examData) => {
          const formattedIds = targetIdValues.map(id => id);
          targetForm.setFieldsValue({
            voucherType: discount.voucherType,
            targetIds: formattedIds
          });
        });
      } 
      else if (discount.voucherType === 'COMBO') {
        fetchCourseBundleList().then((courseBundleData) => {
          targetForm.setFieldsValue({
            voucherType: discount.voucherType,
            targetIds: targetIdValues.map(id => id)
          });
        });
      }
      else {
        targetForm.setFieldsValue({
          voucherType: discount.voucherType,
          targetIds: targetIdValues.map(id => id.toString())
        });
      }

      setIsTargetModalVisible(true);
    }


  };

  // Xử lý chọn nhiều hàng
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  // Lọc dữ liệu theo các điều kiện
  const filteredDiscounts = discounts.filter(discount => {
    // Lọc theo tab
    if (activeTab === 'ACTIVE' && discount.status !== 'ACTIVE') {
      return false;
    } else if (activeTab === 'EXPIRED' && discount.status !== 'EXPIRED') {
      return false;
    } else if (activeTab === 'DISABLED' && discount.status !== 'DISABLED') {
      return false;
    }

    // Lọc theo loại
    if (filterType !== 'all' && discount.discountType !== filterType) {
      return false;
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchText) {
      const searchKeyword = searchText.toLowerCase();
      return (
        discount.code.toLowerCase().includes(searchKeyword) ||
        discount.description.toLowerCase().includes(searchKeyword)
      );
    }

    return true;
  });

  // Định nghĩa các cột cho bảng
  const columns: ColumnsType<DiscountItem> = [
    {
      title: 'Mã',
      key: 'code',
      fixed: 'left',
      width: 180,
      render: (_, record) => (
        <Space>
          <Text strong copyable className="discount-code">{record.code}</Text>
          {record.discountType === 'VOUCHER' && (
            <Tooltip title="Sao chép">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopyCode(record.code)}
              />
            </Tooltip>
          )}
        </Space>
      ),
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: 'Loại',
      key: 'discountType',
      width: 120,
      render: (_, record) => {
        return record.discountType === 'DISCOUNT' ? (
          <Tag color="blue" className="discount-tag">Discount</Tag>
        ) : (
          <Tag color="purple" className="discount-tag">Voucher</Tag>
        );
      },
      filters: [
        { text: 'Discount', value: 'DISCOUNT' },
        { text: 'Voucher', value: 'VOUCHER' },
      ],
      onFilter: (value, record) => record.discountType === value,
    },
    {
      title: 'Giá trị',
      key: 'value',
      width: 100,
      render: (_, record) => (
        <Tag color="green" >
          {record.value}%
        </Tag>
      ),
    },
    {
      title: 'Áp dụng cho',
      key: 'voucherType',
      width: 180,
      render: (_, record) => {
        if (record.discountType === 'DISCOUNT') {
          let targetText = record.voucherType === 'COURSE' ? 'Khóa học' : record.voucherType === 'TEST' ? 'Đề thi' : 'Gói khóa học';
          let targetColor = record.voucherType === 'COURSE' ? 'blue' : record.voucherType === 'TEST' ? 'orange' : 'green';

          return (
            <Space direction="vertical" size={0}>
              <Tag color={targetColor}>{targetText}</Tag>
              {record.targetIds && record.targetIds.length > 0 && (
                <Tooltip title={record.targetIds.join(', ')}>
                  <Text type="secondary">{record.targetIds.length} {targetText.toLowerCase()}</Text>
                </Tooltip>
              )}
            </Space>
          );
        } else {
          return <Text type="secondary">Áp dụng khi thanh toán</Text>;
        }
      },
      filters: [
        { text: 'Khóa học', value: 'COURSE' },
        { text: 'Đề thi', value: 'TEST' },
        { text: 'Gói khóa học', value: 'COMBO' },
      ],
      onFilter: (value, record) => record.discountType === 'DISCOUNT' && record.voucherType === value,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Thời gian',
      key: 'date',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary">
            Từ: {new Date(record.startDate).toLocaleDateString('vi-VN')}
          </Text>
          <Text type="secondary">
            Đến: {new Date(record.endDate).toLocaleDateString('vi-VN')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    },
    {
      title: 'Sử dụng',
      key: 'usage',
      width: 150,
      render: (_, record) => {
        if (record.discountType === 'VOUCHER') {
          let usageLimitText = '';

          if (record.maxUsed) {
            usageLimitText = `Giới hạn: ${record.maxUsed} lượt`;
          }

          return (
            <Space direction="vertical" size={0}>
              <Text>{record.usedCount} lượt sử dụng</Text>
              <Text type="secondary">{usageLimitText}</Text>
            </Space>
          );
        } else {
          return <Text>Không sử dụng</Text>;
        }
      },
      sorter: (a, b) => {
        if (a.discountType === 'VOUCHER' && b.discountType === 'VOUCHER') {
          return a.usedCount - b.usedCount;
        }
        return 0;
      },
      filters: [
        { text: 'Có giới hạn sử dụng', value: 'VOUCHER' }
      ],
      onFilter: (value, record) => record.discountType === value,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => {
        let color = 'success';
        let text = 'Đang hoạt động';
        let icon = <CheckOutlined />;

        if (record.status === 'EXPIRED') {
          color = 'default';
          text = 'Hết hạn';
          icon = <ClockCircleOutlined />;
        } else if (record.status === 'USED') {
          color = 'warning';
          text = 'Đã dùng hết';
          icon = <StopOutlined />;
        } else if (record.status === 'DISABLED') {
          color = 'error';
          text = 'Đã tắt';
          icon = <StopOutlined />;
        }

        return <Badge status={color as any} text={text} />;
      },
      filters: [
        { text: 'Đang hoạt động', value: 'ACTIVE' },
        { text: 'Hết hạn', value: 'EXPIRED' },
        { text: 'Đã dùng hết', value: 'USED' },
        { text: 'Đã tắt', value: 'DISABLED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small" className="action-buttons">
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>

          {record.discountType === 'DISCOUNT' && (
            <Tooltip title="Điều chỉnh áp dụng">
              <Button
                icon={<AppstoreOutlined />}
                size="small"
                onClick={() => showTargetModal(record)}
                style={{ color: '#1890ff' }}
              />
            </Tooltip>
          )}

          {record.status === 'ACTIVE' ? (
            <Tooltip title="Tắt">
              <Button
                icon={<StopOutlined />}
                size="small"
                onClick={() => handleToggleStatus(record.id, false)}
              />
            </Tooltip>
          ) : record.status === 'DISABLED' ? (
            <Tooltip title="Bật">
              <Button
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleToggleStatus(record.id, true)}
                type="primary"
              />
            </Tooltip>
          ) : null}
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa mã giảm giá này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Cấu hình chọn nhiều hàng
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  // Render giá trị dựa trên loại giảm giá
  const renderValueLabel = () => {
    return 'Phần trăm giảm (%)';
  };

  // Add a function to check which exams are active
  const checkActiveExams = (targetIds: string[]) => {
    const activeExams = exams.filter(exam =>
      targetIds.includes(exam.testId) && exam.status === 'ACTIVE'
    );

    if (activeExams.length > 0) {
      const examTitles = activeExams.map(exam => exam.title).join(', ');
      message.warning(`Đề thi đang hoạt động không thể áp dụng giảm giá: ${examTitles}`);
      return true;
    }

    return false;
  };

  return (
    <div>
      <Title level={2}>Quản lý khuyến mãi</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  showModal();
                }}
              >
                Thêm mã giảm giá
              </Button>

              <Button
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                danger
              >
                Xóa ({selectedRowKeys.length})
              </Button>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 200 }}
              />
              <Select
                defaultValue="all"
                style={{ width: 180 }}
                onChange={handleTypeFilter}
              >
                <Option value="all">Tất cả loại</Option>
                <Option value="DISCOUNT">Discount</Option>
                <Option value="VOUCHER">Voucher</Option>
              </Select>
              <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
            </Space>
          </Space>

          <Tabs defaultActiveKey="all" onChange={handleTabChange}>
            <TabPane tab="Tất cả" key="all" />
            <TabPane tab="Đang hoạt động" key="ACTIVE" />
            <TabPane tab="Hết hạn" key="EXPIRED" />
            <TabPane tab="Đã tắt" key="DISABLED" />
          </Tabs>

          <Table
            columns={columns}
            dataSource={filteredDiscounts}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            scroll={{ x: 1500 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
            }}
          />
        </Space>
      </Card>

      {/* Modal thêm/sửa mã giảm giá */}
      <Modal
        title={currentDiscount ? (
          currentDiscount.discountType === 'DISCOUNT' ? "Chỉnh sửa giảm giá" : "Chỉnh sửa voucher"
        ) : "Thêm mới"}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            {currentDiscount ? "Cập nhật" : "Tạo mới"}
          </Button>,
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="Tiêu đề khuyến mãi"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề khuyến mãi' }]}
              >
                <Input placeholder="VD: Giảm giá khóa học Toán cơ bản" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã"

                rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="discountType"
                label="Loại giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
              >
                <Select disabled={!!currentDiscount}>
                  <Option value="DISCOUNT">Discount</Option>
                  <Option value="VOUCHER">Voucher</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>


          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="value"
                label={renderValueLabel()}
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value <= 0 || value > 100) {
                        return Promise.reject('Phần trăm giảm phải từ 1% đến 100%');
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} min={1} max={100} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Thời gian hiệu lực"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian hiệu lực' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
              >
                <TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.discountType !== currentValues.discountType
            }
          >
            {({ getFieldValue }) => {
              const discountType = getFieldValue('discountType');
              if (discountType === 'DISCOUNT') {
                return (
                  <>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="voucherType"
                          label="Áp dụng cho"
                          rules={[{ required: true, message: 'Vui lòng chọn phạm vi áp dụng' }]}
                        >
                          <Radio.Group>
                            <Space direction="vertical">
                              <Radio value="COURSE">Áp dụng cho khóa học</Radio>
                              <Radio value="TEST">Áp dụng cho đề thi</Radio>
                              <Radio value="COMBO">Áp dụng cho gói khóa học</Radio>
                            </Space>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                );
              }

              return null;
            }}
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.discountType !== currentValues.discountType
            }
          >
            {({ getFieldValue }) => {
              const discountType = getFieldValue('discountType');
              if (discountType === 'VOUCHER') {
                return (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="minOrderValue"
                          label="Giá trị đơn hàng tối thiểu"
                        >
                          <InputNumber style={{ width: '100%' }} min={0} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="maxUsed"
                          label="Số lần sử dụng tối đa"
                          rules={[{ required: true, message: 'Vui lòng nhập số lần sử dụng tối đa' }]}
                        >
                          <InputNumber style={{ width: '100%' }} min={1} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                );
              }

              return null;
            }}
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
          </Row>

          {currentDiscount && currentDiscount.discountType === 'VOUCHER' && currentDiscount.usedCount > 0 && (
            <Row gutter={16}>
              <Col span={24}>
                <Alert
                  message={`Voucher này đã được sử dụng ${currentDiscount.usedCount} lần.`}
                  type="info"
                  showIcon
                />
              </Col>
            </Row>
          )}
        </Form>
      </Modal>

      {/* Modal điều chỉnh phạm vi áp dụng */}
      <Modal
        title="Áp dụng giảm giá"
        visible={isTargetModalVisible}
        onCancel={() => setIsTargetModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsTargetModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleTargetSave}>
            Áp dụng
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={targetForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="voucherType"
                label="Áp dụng cho"
                rules={[{ required: true, message: 'Vui lòng chọn phạm vi áp dụng' }]}
              >
                <Radio.Group disabled onChange={(e) => {
                  const type = e.target.value;
                  if (type === 'COURSE') {
                    fetchCourseList();
                  } else if (type === 'TEST') {
                    fetchExamList();
                  } else if (type === 'COMBO') {
                    fetchCourseBundleList();
                  }
                  // Clear selected values when type changes
                  targetForm.setFieldsValue({ targetIds: '' });
                }}>
                  <Space direction="vertical">
                    <Radio value="COURSE">Áp dụng cho khóa học</Radio>
                    <Radio value="TEST">Áp dụng cho đề thi</Radio>
                    <Radio value="COMBO">Áp dụng cho gói khóa học</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.voucherType !== currentValues.voucherType
            }
          >
            {({ getFieldValue }) => {
              const voucherType = getFieldValue('voucherType');
              return voucherType ? (
                <>
                  {voucherType === 'TEST' && (
                    <Row gutter={16} style={{ marginBottom: 16 }}>
                      <Col span={24}>
                        <Alert
                          message="Chú ý về đề thi đang hoạt động"
                          description="Không thể áp dụng giảm giá cho đề thi đang ở trạng thái hoạt động. Vui lòng tắt trạng thái hoạt động của đề thi trước khi áp dụng giảm giá."
                          type="warning"
                          showIcon
                        />
                      </Col>
                    </Row>
                  )}
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="targetIds"
                        label={voucherType === 'COURSE' ? "Khóa học áp dụng" : voucherType === 'TEST' ? "Đề thi áp dụng" : "Gói khóa học áp dụng"}
                        rules={[{ required: true, message: `Vui lòng chọn ${voucherType === 'COURSE' ? 'khóa học' : voucherType === 'TEST' ? 'đề thi' : 'gói khóa học'} áp dụng giảm giá` }]}
                      >
                        <Select
                          mode="multiple"
                          placeholder={`Chọn ${voucherType === 'COURSE' ? 'khóa học' : voucherType === 'TEST' ? 'đề thi' : 'gói khóa học'} để áp dụng giảm giá`}
                          style={{ width: '100%' }}
                          loading={loading}
                          optionFilterProp="children"
                          optionLabelProp="label"
                          onChange={(values) => {
                            if (voucherType === 'TEST') {
                              // Check for active exams when selection changes
                              checkActiveExams(values as string[]);
                            }
                          }}
                        >

                          {voucherType === 'COURSE' ? (
                            courses.map(course => (
                              <Option key={course.id} value={String(course.id)}>
                                {course.title}
                              </Option>
                            ))
                          ) : voucherType === 'TEST' ? (
                            exams.map(exam => (
                              <Option
                                key={exam.testId}
                                value={exam.testId}
                                disabled={exam.status === 'ACTIVE'}
                                label={exam.title}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{exam.title}</span>
                                  {exam.status === 'ACTIVE' ? (
                                    <Tag color="red">Đang hoạt động</Tag>
                                  ) : (
                                    <Tag color="green">Không hoạt động</Tag>
                                  )}
                                </div>
                              </Option>
                            )) 
                          ) : voucherType === 'COMBO' ? (
                            courseBundles.map(courseBundle => (
                              <Option key={courseBundle.id} value={(courseBundle.id)}>
                                {courseBundle.name}
                              </Option>
                            ))
                          ) : null}


                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Alert
                        message={`Đã tải ${voucherType === 'COURSE' ? courses.length : voucherType === 'TEST' ? exams.length : courseBundles.length} ${voucherType === 'COURSE' ? 'khóa học' : voucherType === 'TEST' ? 'đề thi' : 'gói khóa học'}`}
                        type="info"
                        showIcon
                      />
                    </Col>
                  </Row>
                </>
              ) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Discounts; 