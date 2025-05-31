import React, { useState, useEffect } from 'react';
import {
  Typography, Card, Table, Button, Space, Tag, Input, Select,
  Popconfirm, message, Modal, Form, Row, Col, Tabs, Avatar,
  Tooltip, Divider, List
} from 'antd';
import {
  UserOutlined, EditOutlined, DeleteOutlined, CheckOutlined,
  CloseOutlined, EyeOutlined, FilterOutlined, SearchOutlined,
  FlagOutlined, MessageOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import TextArea from 'antd/lib/input/TextArea';
import useRefreshToken from '../../utils/useRefreshToken';
import { useNavigate } from 'react-router-dom';
import { authTokenLogin } from '../../utils/auth';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// Custom Comment component
interface CommentProps {
  author: React.ReactNode;
  avatar: React.ReactNode;
  content: React.ReactNode;
  datetime?: React.ReactNode;
  children?: React.ReactNode;
}

const Comment: React.FC<CommentProps> = ({
  author,
  avatar,
  content,
  datetime,
  children
}) => {
  return (
    <div className="ant-comment">
      <div className="ant-comment-inner">
        <div className="ant-comment-avatar">{avatar}</div>
        <div className="ant-comment-content">
          <div className="ant-comment-content-author">
            <span className="ant-comment-content-author-name">{author}</span>
            {datetime && <span className="ant-comment-content-author-time">{datetime}</span>}
          </div>
          <div className="ant-comment-content-detail">{content}</div>
          {children && <div className="ant-comment-children">{children}</div>}
        </div>
      </div>
    </div>
  );
};

interface CommentItem {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  authorId: string;
  authorRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
  targetType: 'COURSE' | 'LESSON' | 'MATERIAL' | 'ARTICLE';
  status: 'PUBLISHED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  replies: number;
  replyTo?: string;
}


const CommentsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
  const [isReplyModalVisible, setIsReplyModalVisible] = useState<boolean>(false);
  const [currentComment, setCurrentComment] = useState<CommentItem | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  // Pagination states
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('');

  const authData = localStorage.getItem('authData') ? JSON.parse(localStorage.getItem('authData') || '{}') : null;

  // Function to refresh the comments list
  const refreshComments = async () => {
    // Reset to page 1
    setCurrentPage(1);

    // Fetch comments directly to refresh totalElements and pagination info
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', '0'); // Reset to first page (index 0)
      params.append('size', pageSize.toString());

      if (searchText) {
        params.append('content', searchText);
      }

      if (statusFilter && statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }

      if (targetTypeFilter && targetTypeFilter !== 'ALL') {
        params.append('targetType', targetTypeFilter);
      }

      if (activeTab !== 'ALL') {
        params.append('status', activeTab);
      }

      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/comments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await response.json();

      if (data.status === 200) {
        const { totalElements, totalPages, size, content } = data.data;
        setComments(content);
        setTotalElements(totalElements);
        setTotalPages(totalPages);
        setPageSize(size);
      } else {
        message.error('Failed to refresh comments');
      }
    } catch (error) {
      console.error('Error refreshing comments:', error);
      message.error('Failed to refresh comments');
    } finally {
      setLoading(false);
    }
  };

  // Combine both useEffects to prevent multiple API calls
  useEffect(() => {
    // Fetch comments from API
    const fetchComments = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', (currentPage - 1).toString());
        params.append('size', pageSize.toString());

        if (searchText) {
          params.append('content', searchText);
        }

        if (statusFilter && statusFilter !== 'ALL') {
          params.append('status', statusFilter);
        }

        if (targetTypeFilter && targetTypeFilter !== 'ALL') {
          params.append('targetType', targetTypeFilter);
        }

        if (activeTab !== 'ALL') {
          params.append('status', activeTab);
        }

        const token = await authTokenLogin(refreshToken, refresh, navigate);
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/comments?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const data = await response.json();

        if (data.status === 200) {
          const { totalElements, totalPages, size, content } = data.data;
          setComments(content);
          setTotalElements(totalElements);
          setTotalPages(totalPages);
          setPageSize(size);
        } else {
          message.error('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        message.error('Failed to fetch comments');
      } finally {
        setLoading(false);
      }
    };

    // For initial load and filter changes
    const loadComments = () => {
      // If search text changes, use a debounce
      if (searchText) {
        const timer = setTimeout(() => {
          fetchComments();
        }, 500);
        return () => clearTimeout(timer);
      } else {
        fetchComments();
        return undefined;
      }
    };

    return loadComments();
  }, [currentPage, pageSize, activeTab, statusFilter, targetTypeFilter, searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  const handleTargetTypeChange = (value: string) => {
    setTargetTypeFilter(value);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const showViewModal = (comment: CommentItem) => {
    setCurrentComment(comment);
    setIsViewModalVisible(true);
  };

  const showReplyModal = (comment: CommentItem) => {
    setCurrentComment(comment);
    setIsReplyModalVisible(true);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setIsViewModalVisible(false);
    setIsReplyModalVisible(false);
    setCurrentComment(null);
    form.resetFields();
  };

  const handleReply = () => {
    form.validateFields().then(async values => {
      try {
        const replyData = {
          content: values.content,
          adminId: authData?.id || '',
        };

        const token = await authTokenLogin(refreshToken, refresh, navigate);
        const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/comments/reply/${currentComment?.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(replyData),
        });

        const data = await response.json();

        if (data.status === 201) {
          // Update status of the original comment if specified
          if (values.status && currentComment) {
            await handleStatusChange(currentComment.id, values.status);
          }

          message.success('Đã gửi phản hồi thành công');
          setIsReplyModalVisible(false);
          setCurrentComment(null);
          form.resetFields();
          await refreshComments(); // Refresh the list with await
        } else {
          message.error('Failed to reply to comment');
        }
      } catch (error) {
        console.error('Error replying to comment:', error);
        message.error('Failed to reply to comment');
      }
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleStatusChange = async (id: string, newStatus: 'PUBLISHED' | 'PENDING' | 'REJECTED') => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/comments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.status === 200) {
        setComments(comments.map(comment => {
          if (comment.id === id) {
            return { ...comment, status: newStatus };
          }
          return comment;
        }));

        let statusText = '';
        switch (newStatus) {
          case 'PUBLISHED':
            statusText = 'xuất bản';
            break;
          case 'PENDING':
            statusText = 'chờ duyệt';
            break;
          case 'REJECTED':
            statusText = 'từ chối';
            break;
        }

        message.success(`Đã ${statusText} bình luận thành công`);
      } else {
        message.error('Failed to update comment status');
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
      message.error('Failed to update comment status');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      const data = await response.json();

      if (data.status === 200) {
        setComments(comments.filter(comment => comment.id !== commentId));
        message.success('Đã xóa bình luận thành công');
        await refreshComments(); // Refresh the list with await
      } else {
        message.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      message.error('Failed to delete comment');
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Tag color="success" icon={<CheckOutlined />}>Đã xuất bản</Tag>;
      case 'PENDING':
        return <Tag color="processing">Chờ duyệt</Tag>;
      case 'REJECTED':
        return <Tag color="error" icon={<CloseOutlined />}>Đã từ chối</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getRoleTag = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Tag color="red">Admin</Tag>;
      case 'TEACHER':
        return <Tag color="green">Giáo viên</Tag>;
      case 'STUDENT':
        return <Tag color="blue">Học viên</Tag>;
      default:
        return <Tag color="default">{role}</Tag>;
    }
  };

  const getTargetTypeTag = (targetType: string) => {
    switch (targetType) {
      case 'COURSE':
        return <Tag color="purple">Khóa học</Tag>;
      case 'LESSON':
        return <Tag color="cyan">Bài học</Tag>;
      case 'MATERIAL':
        return <Tag color="orange">Tài liệu</Tag>;
      case 'ARTICLE':
        return <Tag color="geekblue">Bài viết</Tag>;
      default:
        return <Tag color="default">{targetType}</Tag>;
    }
  };

  const columns: ColumnsType<CommentItem> = [
    {
      title: 'Người bình luận',
      key: 'author',
      render: (_, record) => (
        <Space>
          <Avatar src={record.authorAvatar} icon={!record.authorAvatar && <UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text strong>{record.authorName}</Text>
            {/* <Text type="secondary" style={{ fontSize: '12px' }}>
              {getRoleTag(record.authorRole)}
            </Text> */}
          </Space>
        </Space>
      ),
      sorter: (a, b) => a.authorName.localeCompare(b.authorName),
    },
    {
      title: 'Nội dung',
      key: 'content',
      render: (_, record) => (
        <div>
          <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
            {record.replyTo && <Tag color="blue">Trả lời</Tag>}
            {record.content}
          </Paragraph>
        </div>
      ),
    },
    {
      title: 'Nguồn',
      key: 'target',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {getTargetTypeTag(record.targetType)}
          {/* <Text>{record.targetName}</Text> */}
        </Space>
      ),
      filters: [
        { text: 'Khóa học', value: 'COURSE' },
        { text: 'Bài học', value: 'LESSON' },
        { text: 'Tài liệu', value: 'MATERIAL' },
        { text: 'Bài viết', value: 'ARTICLE' },
      ],
      onFilter: (value, record) => record.targetType === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Đã xuất bản', value: 'PUBLISHED' },
        { text: 'Chờ duyệt', value: 'PENDING' },
        { text: 'Đã từ chối', value: 'REJECTED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: (date: string) => <Typography.Text type="secondary">
        {new Date(date).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })}
      </Typography.Text>,
    },
    {
      title: 'Tương tác',
      key: 'interactions',
      render: (_, record) => (
        <Space>
          <span><MessageOutlined /> {record.replies}</span>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showViewModal(record)}
            />
          </Tooltip>
          <Tooltip title="Trả lời">
            <Button
              icon={<MessageOutlined />}
              size="small"
              onClick={() => showReplyModal(record)}
            />
          </Tooltip>
          {record.status === 'PENDING' && (
            <Tooltip title="Phê duyệt">
              <Button
                icon={<CheckOutlined />}
                size="small"
                style={{ color: '#52c41a' }}
                onClick={() => handleStatusChange(record.id, 'PUBLISHED')}
              />
            </Tooltip>
          )}
          {record.status === 'PENDING' && (
            <Tooltip title="Từ chối">
              <Button
                icon={<CloseOutlined />}
                size="small"
                style={{ color: '#f5222d' }}
                onClick={() => handleStatusChange(record.id, 'REJECTED')}
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa bình luận này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const bulkApprove = async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/comments/bulk/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: selectedRowKeys,
          status: 'PUBLISHED'
        }),
      });

      const data = await response.json();

      if (data.status === 200) {
        setComments(comments.map(comment => {
          if (selectedRowKeys.includes(comment.id)) {
            return { ...comment, status: 'PUBLISHED' };
          }
          return comment;
        }));

        message.success(`Đã phê duyệt ${selectedRowKeys.length} bình luận`);
        setSelectedRowKeys([]);
        await refreshComments(); // Refresh the list with await
      } else {
        message.error('Failed to approve comments in bulk');
      }
    } catch (error) {
      console.error('Error approving comments in bulk:', error);
      message.error('Failed to approve comments in bulk');
    }
  };

  const bulkReject = async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/comments/bulk/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: selectedRowKeys,
          status: 'REJECTED'
        }),
      });

      const data = await response.json();

      if (data.status === 200) {
        setComments(comments.map(comment => {
          if (selectedRowKeys.includes(comment.id)) {
            return { ...comment, status: 'REJECTED' };
          }
          return comment;
        }));

        message.success(`Đã từ chối ${selectedRowKeys.length} bình luận`);
        setSelectedRowKeys([]);
        await refreshComments(); // Refresh the list with await
      } else {
        message.error('Failed to reject comments in bulk');
      }
    } catch (error) {
      console.error('Error rejecting comments in bulk:', error);
      message.error('Failed to reject comments in bulk');
    }
  };

  const bulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/comments/bulk`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedRowKeys }),
      });

      const data = await response.json();

      if (data.status === 200) {
        setComments(comments.filter(comment => !selectedRowKeys.includes(comment.id)));

        message.success(`Đã xóa ${selectedRowKeys.length} bình luận`);
        setSelectedRowKeys([]);
        await refreshComments(); // Refresh the list with await
      } else {
        message.error('Failed to delete comments in bulk');
      }
    } catch (error) {
      console.error('Error deleting comments in bulk:', error);
      message.error('Failed to delete comments in bulk');
    }
  };

  return (
    <div>
      <Title level={2}>Quản lý bình luận</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={bulkApprove}
                disabled={selectedRowKeys.length === 0}
              >
                Phê duyệt ({selectedRowKeys.length})
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={bulkReject}
                disabled={selectedRowKeys.length === 0}
              >
                Từ chối ({selectedRowKeys.length})
              </Button>
              <Popconfirm
                title={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} bình luận đã chọn?`}
                onConfirm={bulkDelete}
                okText="Có"
                cancelText="Không"
                disabled={selectedRowKeys.length === 0}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={selectedRowKeys.length === 0}
                >
                  Xóa ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            </Space>
            <Space>
              <Search
                placeholder="Tìm kiếm bình luận..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />

              <Select
                defaultValue="ALL"
                style={{ width: 150 }}
                onChange={handleTargetTypeChange}
              >
                <Option value="ALL">Tất cả nguồn</Option>
                <Option value="COURSE">Khóa học</Option>
                <Option value="ARTICLE">Bài viết</Option>
              </Select>
            </Space>
          </Space>

          <Tabs defaultActiveKey="ALL" onChange={handleTabChange}>
            <TabPane tab="Tất cả bình luận" key="ALL" />
            <TabPane tab="Đã xuất bản" key="PUBLISHED" />
            <TabPane tab="Chờ duyệt" key="PENDING" />
            <TabPane tab="Đã từ chối" key="REJECTED" />
          </Tabs>

          <Table
            columns={columns}
            dataSource={comments}
            rowKey="id"
            loading={loading}
            rowSelection={rowSelection}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalElements,
              onChange: (page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize || 10);
              },
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bình luận`
            }}
          />
        </Space>
      </Card>

      {/* Modal xem chi tiết bình luận */}
      <Modal
        title="Chi tiết bình luận"
        visible={isViewModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="back" onClick={handleModalCancel}>
            Đóng
          </Button>,
          <Button
            key="reply"
            type="primary"
            onClick={() => {
              setIsViewModalVisible(false);
              showReplyModal(currentComment!);
            }}
          >
            Trả lời
          </Button>,
        ]}
        width={600}
      >
        {currentComment && (
          <div>
            <Comment
              author={<Space>
                <Text strong>{currentComment.authorName}</Text>
                {getRoleTag(currentComment.authorRole)}
              </Space>}
              avatar={
                <Avatar
                  src={currentComment.authorAvatar}
                  icon={!currentComment.authorAvatar && <UserOutlined />}
                />
              }
              content={
                <div>
                  <Paragraph>
                    {currentComment.content}
                  </Paragraph>
                </div>
              }
              datetime={
                <Space direction="vertical" size={0}>
                  <Typography.Text type="secondary">
                    {new Date(currentComment.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    <Space>
                      <span><MessageOutlined /> {currentComment.replies}</span>
                    </Space>
                  </Typography.Text>
                </Space>
              }
            />

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Text type="secondary">Nguồn:</Text>
                <div>
                  {getTargetTypeTag(currentComment.targetType)}
                  {/* <Text strong> {currentComment.targetName}</Text> */}
                </div>
              </Col>
              <Col span={12}>
                <Text type="secondary">Trạng thái:</Text>
                <div>
                  {getStatusTag(currentComment.status)}
                </div>
              </Col>
            </Row>

            {currentComment.replyTo && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Trả lời cho bình luận:</Text>
                <Card size="small" style={{ marginTop: 8 }}>
                  <Text>{comments.find(c => c.id === currentComment.replyTo)?.content || 'Bình luận gốc không còn tồn tại'}</Text>
                </Card>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <Space>
                {currentComment.status === 'PENDING' && (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={async () => {
                      await handleStatusChange(currentComment.id, 'PUBLISHED');
                      setIsViewModalVisible(false);
                      await refreshComments();
                    }}
                  >
                    Phê duyệt
                  </Button>
                )}
                {currentComment.status === 'PENDING' && (
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={async () => {
                      await handleStatusChange(currentComment.id, 'REJECTED');
                      setIsViewModalVisible(false);
                      await refreshComments();
                    }}
                  >
                    Từ chối
                  </Button>
                )}
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa bình luận này?"
                  onConfirm={async () => {
                    await handleDelete(currentComment.id);
                    setIsViewModalVisible(false);
                    await refreshComments();
                  }}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button icon={<DeleteOutlined />} danger>
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal trả lời bình luận */}
      <Modal
        title={`Trả lời bình luận của ${currentComment?.authorName}`}
        visible={isReplyModalVisible}
        onCancel={handleModalCancel}
        onOk={handleReply}
        okText="Gửi trả lời"
        cancelText="Hủy"
        width={600}
      >
        {currentComment && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Comment
                author={<Text strong>{currentComment.authorName}</Text>}
                avatar={
                  <Avatar
                    src={currentComment.authorAvatar}
                    icon={!currentComment.authorAvatar && <UserOutlined />}
                  />
                }
                content={
                  <div>
                    <Paragraph>{currentComment.content}</Paragraph>
                  </div>
                }
                datetime={
                  <Typography.Text type="secondary">
                    {new Date(currentComment.createdAt).toLocaleString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false
                    })}
                  </Typography.Text>
                }
              />
            </Card>

            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="content"
                label="Nội dung trả lời"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung trả lời' }]}
              >
                <TextArea rows={4} placeholder="Nhập nội dung trả lời của bạn..." />
              </Form.Item>

              <Form.Item
                name="status"
                label="Trạng thái bình luận gốc sau khi trả lời"
                initialValue="published"
              >
                <Select>
                  <Option value="PUBLISHED">Xuất bản</Option>
                  <Option value="REJECTED">Từ chối</Option>
                </Select>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommentsPage; 