import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Space, Tag, Input, Typography, Popconfirm, 
  message, Modal, Form, Select, Upload, List, Avatar, Tooltip
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, 
  UploadOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined,
  FileExcelOutlined, FileZipOutlined, FileImageOutlined, FileUnknownOutlined,
  EyeOutlined
} from '@ant-design/icons';
import useRefreshToken from '../../utils/useRefreshToken';
import { useNavigate } from 'react-router-dom';
import { authTokenLogin } from '../../utils/auth';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { Dragger } = Upload;

interface Video {
  id: string;
  lesson_id: string;
  video_title: string;
  url: string;
  documentShort: string;
  documentUrl: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
  deletedDate: string;
  deleted: boolean;
  isViewTest: boolean;
  title?: string;
  description?: string;
  type?: string;
  file_name?: string;
  file_size?: number;
  upload_date?: string;
  author?: string;
  downloads?: number;
}

interface CourseMaterialsProps {
  courseId: string;
}

const CourseMaterials: React.FC<CourseMaterialsProps> = ({ courseId }) => {
  const [materials, setMaterials] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<Video | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<Video | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");

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

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      // Fetch videos from API
      const videos = await getVideos(courseId);
      
      // Convert videos with documentUrl to materials
      const materialsList: Video[] = videos
        .filter((video: Video) => video.documentUrl && video.documentUrl.toString().trim() !== '')
        .map((video: Video) => {
          const fileName = video.documentUrl.toString().split('/').pop() || '';
          const fileType = fileName.split('.').pop()?.toLowerCase() || '';
          
          return {
            ...video,
            title: video.video_title,
            description: video.documentShort || 'Tài liệu hướng dẫn',
            type: fileType,
            file_name: fileName,
            file_size: 0, // Size unknown from API
            upload_date: video.createdAt || new Date().toISOString().split('T')[0],
            author: 'Giảng viên',
            downloads: 0
          };
        });
      
      setMaterials(materialsList);
    } catch (error) {
      console.error('Error fetching materials:', error);
      message.error('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredMaterials = materials.filter(material =>
    material.title?.toLowerCase().includes(searchText.toLowerCase()) 
  );

  const handleDelete = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id));
    message.success('Xóa tài liệu thành công');
  };

  const showModal = (material?: Video) => {
    setFileList([]);
    if (material) {
      setEditingMaterial(material);
      form.setFieldsValue({
        title: material.title,
        description: material.description,
        author: material.author,
        lesson_id: material.lesson_id,
      });
    } else {
      setEditingMaterial(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (fileList.length === 0 && !editingMaterial) {
        message.error('Vui lòng tải lên tài liệu!');
        return;
      }

      const file = fileList[0]?.originFileObj;
      const fileName = file?.name || editingMaterial?.file_name || '';
      const fileType = fileName.split('.').pop()?.toLowerCase() || '';
      
      if (editingMaterial) {
        // Update material
        setMaterials(
          materials.map(material =>
            material.id === editingMaterial.id
              ? { 
                  ...material, 
                  ...values,
                  file_name: file ? fileName : material.file_name,
                  type: file ? fileType : material.type,
                  file_size: file ? Math.round(file.size / 1024) : material.file_size,
                  upload_date: new Date().toISOString().split('T')[0],
                }
              : material
          )
        );
        message.success('Cập nhật tài liệu thành công');
      } else {
        // Add new material
        const newMaterial: Video = {
          id: Math.floor(Math.random() * 10000).toString(),
          video_title: values.title,
          title: values.title,
          description: values.description || '',
          type: fileType,
          url: file ? URL.createObjectURL(file) : '',
          documentUrl: '',
          documentShort: values.description || '',
          file_name: fileName,
          file_size: file ? Math.round(file.size / 1024) : 0,
          upload_date: new Date().toISOString().split('T')[0],
          author: values.author,
          downloads: 0,
          lesson_id: values.lesson_id,
          duration: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedDate: '',
          deleted: false,
          isViewTest: false
        };
        setMaterials([...materials, newMaterial]);
        message.success('Thêm tài liệu mới thành công');
      }
      setIsModalVisible(false);
    });
  };

  const handlePreview = (material: Video) => {
    setPreviewMaterial(material);
    setIsPreviewVisible(true);
  };

  const handlePreviewCancel = () => {
    setIsPreviewVisible(false);
  };

  const handleDownload = (material: Video) => {
    if (material.documentUrl) {
      // Create a temporary anchor element
      const anchor = document.createElement('a');
      anchor.href = material.documentUrl;
      anchor.target = '_blank';
      anchor.download = material.file_name || '';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      
      // Update download count
      setMaterials(
        materials.map(m =>
          m.id === material.id
            ? { ...m, downloads: (m.downloads || 0) + 1 }
            : m
        )
      );
      
      message.success(`Đang tải xuống: ${material.file_name}`);
    } else {
      message.error('Không thể tải xuống tài liệu này');
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'pdf':
        return <FilePdfOutlined style={{ fontSize: 24, color: '#f5222d' }} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={{ fontSize: 24, color: '#1890ff' }} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={{ fontSize: 24, color: '#52c41a' }} />;
      case 'zip':
      case 'rar':
        return <FileZipOutlined style={{ fontSize: 24, color: '#faad14' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImageOutlined style={{ fontSize: 24, color: '#722ed1' }} />;
      default:
        return <FileUnknownOutlined style={{ fontSize: 24, color: '#8c8c8c' }} />;
    }
  };

  const formatFileSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  };

  const columns = [
    {
      title: 'Tài liệu',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Video) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {getFileIcon(record.type)}
          <div style={{ marginLeft: 12 }}>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '0.85em', color: '#888' }}>{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => type.toUpperCase(),
    },
    {
      title: 'Ngày tải lên',
      dataIndex: 'upload_date',
      key: 'upload_date',
      sorter: (a: Video, b: Video) => 
        new Date(a.upload_date || '').getTime() - new Date(b.upload_date || '').getTime(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Video) => (
        <Space size="small">
          <Tooltip title="Tải xuống">
            <Button
              type="primary"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>Tài liệu khóa học</Title>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm kiếm tài liệu..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        {materials.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text type="secondary">Không có tài liệu nào cho khóa học này</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredMaterials}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title={previewMaterial?.title}
        visible={isPreviewVisible}
        footer={[
          <Button key="download" type="primary" onClick={() => handleDownload(previewMaterial!)}>
            <DownloadOutlined /> Tải xuống
          </Button>,
          <Button key="back" onClick={handlePreviewCancel}>
            Đóng
          </Button>,
        ]}
        onCancel={handlePreviewCancel}
        width={800}
      >
        {previewMaterial && (
          <div>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
              {getFileIcon(previewMaterial.type)}
              <div style={{ marginLeft: 12 }}>
                <Text strong>{previewMaterial.file_name}</Text>
                <div>
                  <Text type="secondary">
                    Lượt tải: {previewMaterial.downloads || 0}
                  </Text>
                </div>
              </div>
            </div>
            
            <Divider />
            
            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Mô tả</Title>
              <Text>{previewMaterial.description}</Text>
            </div>
            
            {/* File preview would be here - simplified for this example */}
            <div style={{ 
              background: '#f5f5f5', 
              padding: 24, 
              textAlign: 'center', 
              borderRadius: 4,
              marginBottom: 16,
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}>
              {getFileIcon(previewMaterial.type)}
              <Text style={{ marginTop: 16 }}>
                {previewMaterial.type === 'pdf' ? 
                  'Bản xem trước PDF đang được tải...' : 
                  `Không thể hiển thị bản xem trước cho file ${(previewMaterial.type || '').toUpperCase()}`}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Adding missing Divider component
const Divider = ({ children }: { children?: React.ReactNode }) => (
  <div style={{ 
    borderTop: '1px solid #f0f0f0', 
    margin: '16px 0', 
    paddingTop: children ? '16px' : '0'
  }}>
    {children}
  </div>
);

export default CourseMaterials; 