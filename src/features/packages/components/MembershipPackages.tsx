import React, { useState, useEffect } from 'react';
import {
    Table, Card, Button, Space, Input, Select, Tag, Popconfirm,
    message, Modal, Form, InputNumber, Switch, Divider, Tooltip,
    Row, Col, Typography, Badge, List, Avatar, Statistic, Checkbox
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
    SearchOutlined, ClockCircleOutlined, CheckCircleOutlined,
    CalendarOutlined, TeamOutlined, DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../../utils/useRefreshToken';
import { authTokenLogin } from '../../../utils/auth';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const SubscriptionFeature = {
    ACCESS_TO_COURSES: 'Truy cập không giới hạn các bài giảng video',
    ACCESS_TO_EXCLUSIVE_CONTENT: 'Truy cập nội dung độc quyền',
    DISCOUNT_ON_PRODUCTS: 'Giảm giá các sản phẩm khác',
    CERTIFICATION: 'Chứng chỉ hoàn thành khóa học',
    PRIVATE_SUPPORT: 'Hỗ trợ riêng tư qua email',
    PREMIUM_SUPPORT: 'Hỗ trợ ưu tiên 24/7',
    ACCESS_TO_TESTS: 'Truy cập các bài kiểm tra và đề thi thử',
    MENTOR_SESSION: 'Mentor cá nhân',
    PERSONALIZED_LEARNING: 'Lộ trình học tập cá nhân hóa',
    LIVE_QA_SESSIONS: 'Buổi hỏi đáp trực tiếp hàng tuần',
    COMMUNITY_ACCESS: 'Quyền truy cập vào cộng đồng học tập riêng',
    EXCLUSIVE_EVENTS: 'Tham gia sự kiện độc quyền',
    NEW_COURSES_FREE: 'Nhận các khóa học mới miễn phí',
    ADVANCED_EXERCISES: 'Bài tập nâng cao',
    SUPPLEMENTARY_MATERIALS: 'Tài liệu học tập bổ sung',
};

// Helper function to convert feature description to feature key
const getFeatureKeyByLabel = (label: string): string | undefined => {
    for (const [key, value] of Object.entries(SubscriptionFeature)) {
        if (value === label) {
            return key;
        }
    }
    return undefined;
};

// Helper function to convert feature key to feature description
const getFeatureLabelByKey = (key: string): string => {
    return SubscriptionFeature[key as keyof typeof SubscriptionFeature] || key;
};

const featureOptions = Object.keys(SubscriptionFeature).map(key => ({
    key: key,
    label: SubscriptionFeature[key as keyof typeof SubscriptionFeature],  // Mô tả tính năng
}));
interface MembershipPackage {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number; // In months
    features: string[]; // List of features included in the package
    // discountPercentage: number;
    status: 'ACTIVE' | 'INACTIVE';
    subscribersCount: number;
    createdAt: string;
    updatedAt: string;
}

const MembershipPackages: React.FC = () => {
    const [packages, setPackages] = useState<MembershipPackage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchText, setSearchText] = useState<string>('');
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState<boolean>(false);
    const [currentPackage, setCurrentPackage] = useState<MembershipPackage | null>(null);
    const [detailPackage, setDetailPackage] = useState<MembershipPackage | null>(null);
    const [form] = Form.useForm();
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);
    const [durationFilter, setDurationFilter] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const navigate = useNavigate();
    const refresh = useRefreshToken();
    const refreshToken = localStorage.getItem("refreshToken");

    // Add constants for special filter values
    const ALL_DURATIONS = -1;

    useEffect(() => {
        fetchPackages();
    }, [page, pageSize, searchText, durationFilter, statusFilter]);

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

            if (durationFilter !== null && durationFilter !== ALL_DURATIONS) {
                params.append('duration', durationFilter.toString());
            }

            if (statusFilter !== null && statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            // Make API request
            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/subscriptions?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();

            if (responseData.status === 200 && responseData.data) {
                setPackages(responseData.data.content);
                setTotal(responseData.data.totalElements);
                setPage(responseData.data.number + 1); // Convert back to 1-based indexing for UI
            } else {
                message.error(responseData.message || 'Lỗi khi tải dữ liệu');
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching membership packages:", error);
            message.error("Không thể tải danh sách gói thành viên");
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setPage(1);
    };

    const handleDurationFilterChange = (value: number | null) => {
        if (value === ALL_DURATIONS) {
            setDurationFilter(null);
        } else {
            setDurationFilter(value);
        }
        setPage(1);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value === 'all' ? null : value);
        setPage(1);
    };

    const showModal = (pkg?: MembershipPackage) => {
        if (pkg) {
            // Edit mode
            setCurrentPackage(pkg);
            
            // Convert feature descriptions to feature keys for checkbox selection
            const featureKeys = pkg.features.map(featureDesc => {
                return getFeatureKeyByLabel(featureDesc);
            }).filter(key => key !== undefined) as string[];
            
            form.setFieldsValue({
                name: pkg.name,
                description: pkg.description,
                price: pkg.price,
                duration: pkg.duration,
                features: featureKeys, // Use the mapped keys for checkboxes
                status: pkg.status === 'ACTIVE',
            });
        } else {
            // Add mode
            setCurrentPackage(null);
            form.resetFields();
            form.setFieldsValue({
                status: true,
                features: [],
            });
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setCurrentPackage(null);
        form.resetFields();
    };

    const showPackageDetails = (pkg: MembershipPackage) => {
        setDetailPackage(pkg);
        setIsDetailsModalVisible(true);
    };

    const handleDetailsCancel = () => {
        setIsDetailsModalVisible(false);
        setDetailPackage(null);
    };

    const handleSave = () => {
        form.validateFields().then(async values => {
            try {
                const token = await authTokenLogin(refreshToken, refresh, navigate);

                // Calculate discount percentage based on duration and features count
                let discountPercentage = 0;

                let packageData;
                
                if (currentPackage) {
                    // For editing: Map feature keys back to descriptions for API
                    // const featureDescriptions = values.features.map((featureKey: string) => 
                    //     getFeatureLabelByKey(featureKey)
                    // );
                    
                    packageData = {
                        name: values.name,
                        description: values.description,
                        price: values.price,
                        duration: values.duration,
                        features: values.features, // Send descriptions to API
                        // discountPercentage: currentPackage.discountPercentage, // Keep existing discount
                        status: values.status ? 'ACTIVE' : 'INACTIVE',
                    };
                } else {
                    // // For adding new: Use keys for form, then convert to descriptions
                    // const featureDescriptions = values.features.map((featureKey: string) => 
                    //     getFeatureLabelByKey(featureKey)
                    // );
                    
                    packageData = {
                        name: values.name,
                        description: values.description,
                        price: values.price,
                        duration: values.duration,
                        features: values.features, // Send descriptions to API
                        discountPercentage, // New discount calculation
                        status: values.status ? 'ACTIVE' : 'INACTIVE',
                    };
                }

                let response;

                if (currentPackage) {
                    // Update existing package
                    response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/subscriptions/${currentPackage.id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(packageData)
                    });
                } else {
                    // Create new package with the specific create endpoint
                    response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/subscriptions/create`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(packageData)
                    });
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const responseData = await response.json();

                if (responseData.status === 200 || responseData.status === 201) {
                    message.success(currentPackage ? 'Cập nhật gói thành viên thành công!' : 'Tạo gói thành viên mới thành công!');
                    fetchPackages(); // Refresh the list after adding/updating
                } else {
                    message.error(responseData.message || 'Có lỗi xảy ra');
                }

                setIsModalVisible(false);
                setCurrentPackage(null);
                form.resetFields();
            } catch (error) {
                console.error("Error saving membership package:", error);
                message.error("Không thể lưu gói thành viên");
            }
        }).catch(info => {
            console.log('Validate Failed:', info);
        });
    };

    const handleDelete = async (id: number) => {
        try {
            const token = await authTokenLogin(refreshToken, refresh, navigate);

            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/subscriptions/${id}`, {
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
                message.success('Xóa gói thành viên thành công!');
                fetchPackages(); // Refresh the list after deleting
            } else {
                message.error(responseData.message || 'Có lỗi xảy ra khi xóa');
            }
        } catch (error) {
            console.error("Error deleting membership package:", error);
            message.error("Không thể xóa gói thành viên");
        }
    };

    const handleToggleStatus = async (pkg: MembershipPackage) => {
        try {
            const token = await authTokenLogin(refreshToken, refresh, navigate);
            const newStatus = pkg.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

            const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/subscriptions/${pkg.id}/status`, {
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
                message.success(`Gói thành viên đã được ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa'}!`);
                fetchPackages(); // Refresh the list after updating status
            } else {
                message.error(responseData.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
            }
        } catch (error) {
            console.error("Error toggling membership package status:", error);
            message.error("Không thể thay đổi trạng thái gói thành viên");
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    const formatDuration = (duration: number) => {
        if (duration === 1) return '1 tháng';
        if (duration === 6) return '6 tháng';
        if (duration === 12) return '1 năm';
        return `${duration} tháng`;
    };

    const columns: ColumnsType<MembershipPackage> = [
        {
            title: 'STT',
            key: 'index',
            width: 60,
            fixed: 'left',
            render: (_, __, index) => (page - 1) * pageSize + index + 1,
        },
        {
            title: 'Tên gói',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: 180,
            render: (text) => <Text strong>{text}</Text>,
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            width: 200,
            ellipsis: { showTitle: false },
            render: text => (
                <Tooltip title={text}>
                    <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 150,
            render: (price, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <Text strong style={{ color: '#1890ff' }}>{formatCurrency(price)}</Text>
                            {/* {record.discountPercentage > 0 && (
                                <Tag color="volcano">-{record.discountPercentage}%</Tag>
                            )} */}
                    </Space>
                </Space>
            ),
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'Thời hạn',
            dataIndex: 'duration',
            key: 'duration',
            width: 120,
            render: (duration) => {
                return (
                    <Space>
                        <CalendarOutlined />
                        <span>{formatDuration(duration)}</span>
                    </Space>
                );
            },
            sorter: (a, b) => a.duration - b.duration,
        },
        {
            title: 'Người dùng',
            dataIndex: 'subscribersCount',
            key: 'subscribersCount',
            width: 120,
            render: count => (
                <Space>
                    <TeamOutlined />
                    <span>{count}</span>
                </Space>
            ),
            sorter: (a, b) => a.subscribersCount - b.subscribersCount,
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
                        title="Bạn có chắc chắn muốn xóa gói thành viên này?"
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

    return (
        <div>
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                >
                    Thêm gói thành viên mới
                </Button>
                <Space>
                    <Search
                        placeholder="Tìm kiếm gói thành viên..."
                        allowClear
                        onSearch={handleSearch}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="Thời hạn"
                        style={{ width: 120 }}
                        onChange={handleDurationFilterChange}
                        allowClear
                        value={durationFilter}
                        defaultValue={ALL_DURATIONS}
                    >
                        <Option value={ALL_DURATIONS}>Tất cả</Option>
                        <Option value={1}>1 tháng</Option>
                        <Option value={6}>6 tháng</Option>
                        <Option value={12}>1 năm</Option>
                    </Select>
                    <Select
                        defaultValue="all"
                        style={{ width: 130 }}
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
                    onChange: (newPage, newPageSize) => {
                        if (newPageSize !== pageSize) {
                            setPageSize(newPageSize || 10);
                            setPage(1); // Reset to first page when page size changes
                        } else {
                            setPage(newPage);
                        }
                        // fetchPackages will be called via useEffect when page or pageSize changes
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total) => `Tổng ${total} gói thành viên`,
                }}
                scroll={{ x: 1100 }}
            />

            {/* Modal thêm/chỉnh sửa gói thành viên */}
            <Modal
                title={currentPackage ? 'Chỉnh sửa gói thành viên' : 'Thêm gói thành viên mới'}
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
                        label="Tên gói thành viên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên gói thành viên!' }]}
                    >
                        <Input placeholder="Nhập tên gói thành viên" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả gói!' }]}
                    >
                        <TextArea rows={3} placeholder="Nhập mô tả ngắn về gói thành viên" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="price"
                                label="Giá (đ)"
                                rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="VD: 99000"
                                    min={0}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="duration"
                                label="Thời hạn"
                                rules={[{ required: true, message: 'Vui lòng chọn thời hạn!' }]}
                            >
                                <Select placeholder="Chọn thời hạn">
                                    <Option value={1}>1 tháng</Option>
                                    <Option value={6}>6 tháng</Option>
                                    <Option value={12}>1 năm</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="features"
                        label="Tính năng gói thành viên"
                        rules={[{
                            required: true,
                            message: 'Vui lòng chọn ít nhất một tính năng!',
                            type: 'array',
                            min: 1,
                        }]}
                    >
                        <Checkbox.Group style={{ width: '100%' }}>
                            <Row>                        
                                {featureOptions.map((feature) => (
                                    <Col span={12} key={feature.key} style={{ marginBottom: '8px' }}>
                                        <Checkbox value={feature.key}>{feature.label}</Checkbox> {/* Hiển thị mô tả tính năng */}
                                    </Col>
                                ))} 
                            </Row>
                        </Checkbox.Group>
                    </Form.Item>

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

            {/* Modal xem chi tiết gói thành viên */}
            <Modal
                title="Chi tiết gói thành viên"
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
                            showModal(detailPackage!);
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                ]}
                width={600}
            >
                {detailPackage && (
                    <div>
                        <Card
                            className="package-card"
                            title={detailPackage.name}
                            extra={
                                <Tag color={detailPackage.status === 'ACTIVE' ? 'success' : 'default'}>
                                    {detailPackage.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                                </Tag>
                            }
                        >
                            <div className="package-price">
                                <Space>
                                    <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{formatCurrency(detailPackage.price)}</span>
                                    {/* {detailPackage.discountPercentage > 0 && (
                                        <Tag color="volcano">-{detailPackage.discountPercentage}%</Tag>
                                    )} */}
                                </Space>
                            </div>

                            <Space>
                                <CalendarOutlined />
                                <Text strong>{formatDuration(detailPackage.duration)}</Text>
                            </Space>

                            <div style={{ marginTop: 16, marginBottom: 16 }}>
                                <Text>{detailPackage.description}</Text>
                            </div>

                            <Divider orientation="left">Tính năng</Divider>
                            <List
                                dataSource={detailPackage.features}
                                renderItem={feature => (
                                    <List.Item>
                                        <Typography.Text>• {feature}</Typography.Text>
                                    </List.Item>
                                )}
                            />

                            <Divider orientation="left">Thống kê</Divider>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic
                                        title="Người đăng ký"
                                        value={detailPackage.subscribersCount}
                                        prefix={<TeamOutlined />}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Doanh thu"
                                        value={detailPackage.price * detailPackage.subscribersCount}
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
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MembershipPackages;
