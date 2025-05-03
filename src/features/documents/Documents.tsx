import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Input, Typography, Popconfirm, message, Modal, Form, Select, Upload, DatePicker, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, DownloadOutlined, EyeOutlined, FileImageOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils/auth';
import { getDocument } from 'pdfjs-dist';
import { toast } from 'react-toastify';

// Khởi tạo worker cho PDF.js
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// URL cho thumbnails mặc định dựa vào loại file
const THUMBNAIL_URLS = {
  PDF: 'https://cdn-icons-png.flaticon.com/512/337/337946.png',
  DOCX: 'https://cdn-icons-png.flaticon.com/512/337/337932.png',
  PPTX: 'https://cdn-icons-png.flaticon.com/512/337/337949.png',
  DEFAULT: 'https://cdn-icons-png.flaticon.com/512/2246/2246581.png'
};

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Document {
  id: string;
  title: string;
  categoryName: string;
  categoryId: string;
  updatedAt: string;
  createdAt: string;
  format: string;
  description: string;
  size: string;
  view: number;
  downloads: number;
  status: 'ACTIVE' | 'INACTIVE';
  fileUrl?: string;
}

interface PaginationParams {
  current: number;
  pageSize: number;
  total: number;
}

interface FileData {
  url: string;
  size: number;
  format: string;
}

// Thêm interface cho Category API response
interface CategoryItem {
  id: number;
  name: string;
  type: string;
  description: string;
  parentId: number | null;
  level: number;
  orderIndex: number;
  status: string;
  itemCount: number;
  children: CategoryItem[];
  deleted: boolean;
}

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationParams>({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const [pdfImage, setPdfImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [convertingPdf, setConvertingPdf] = useState<boolean>(false);


  // Hàm lấy tất cả danh mục level 3 từ nested categories
  const extractLevel3Categories = (categories: CategoryItem[]): { id: string, name: string }[] => {
    let level3Categories: { id: string, name: string }[] = [];

    // Đệ quy qua cấu trúc cây để tìm tất cả các danh mục level 3
    const traverseCategories = (items: CategoryItem[]) => {
      items.forEach(item => {
        // Chỉ lấy danh mục có type là "DOCUMENT" và không bị deleted
        if (item.level === 3 && !item.deleted && item.type === "DOCUMENT") {
          level3Categories.push({
            id: item.id.toString(),
            name: item.name
          });
        }

        // Kiểm tra nếu có danh mục con và không bị xóa
        if (item.children && item.children.length > 0) {
          traverseCategories(item.children);
        }
      });
    };

    traverseCategories(categories);
    return level3Categories;
  };
  // Fetch documents from API
  const fetchDocuments = async (page: number = 1, pageSize: number = 5) => {
    setLoading(true);
    try {
      // Build query parameters for filtering
      const params = new URLSearchParams();
      params.append('page', (page - 1).toString());
      params.append('size', pageSize.toString());

      if (searchText) {
        params.append('title', searchText);
      }

      if (statusFilter) {
        params.append('status', statusFilter);
      }
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data) {
        // Chuyển đổi ID sang string để tránh lỗi
        const formattedDocuments = data.data.content.map((doc: any) => ({
          ...doc,
          id: doc.id.toString()
        }));

        setDocuments(formattedDocuments);
        setPagination({
          ...pagination,
          current: page,
          pageSize: pageSize,
          total: data.data.totalElements || 0,
        });
        console.log(data.data.content);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      message.error('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };
  // Fetch category from API
  const fetchCategories = async () => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/categories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data && data.content) {
        // Lấy tất cả danh mục level 3 từ cấu trúc cây
        const level3Categories = extractLevel3Categories(data.content);
        setCategories(level3Categories);
        console.log("Level 3 Categories:", data.content);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCategories();
    fetchDocuments(pagination.current, pagination.pageSize);
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
    fetchDocuments(1, pagination.pageSize);
  };

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination({ ...pagination, current: 1 });
    fetchDocuments(1, pagination.pageSize);
  };

  // Handle table pagination change
  const handleTableChange = (pagination: any) => {
    fetchDocuments(pagination.current, pagination.pageSize);
  };

  // Handle document deletion
  const handleDelete = async (id: string) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents/hide/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      message.success('Xóa tài liệu thành công');
      fetchDocuments(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to delete document:', error);
      message.error('Không thể xóa tài liệu');

      // Fallback for development
      setDocuments(documents.filter(document => document.id !== id));
    }
  };

  const showModal = (document?: Document) => {
    setFileList([]);
    if (document) {
      setEditingDocument(document);


      const fetchDocumentDetails = async () => {
        try {
          const token = await authTokenLogin(refreshToken, refresh, navigate);
          const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents/${document.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`Không thể lấy thông tin tài liệu: ${response.status}`);
          }

          const data = await response.json();
          const dataDocument = data.data;
          form.setFieldsValue({
            title: dataDocument.title,
            categoryName: dataDocument.categoryName,
            categoryId: dataDocument.categoryId,
            status: dataDocument.status,
            description: dataDocument.description || '',
          });
        } catch (error) {
          console.error('Failed to fetch document details:', error);
          // Fallback: Sử dụng thông tin hiện có nếu không lấy được từ API
          form.setFieldsValue({
            title: document.title,
            categoryName: document.categoryName,
            categoryId: document.categoryId,
            status: document.status,
            description: document.description || '',
          });
        }
      };

      fetchDocumentDetails();
    } else {
      setEditingDocument(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFileList([]);
  };

  const showViewModal = async (document: Document) => {
    try {
      setViewingDocument(document); // Hiển thị data ban đầu để tránh màn hình trống

      const token = await authTokenLogin(refreshToken, refresh, navigate);
      const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents/${document.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Không thể lấy thông tin tài liệu: ${response.status}`);
      }

      const data = await response.json();
      // Cập nhật thông tin chi tiết từ API
      setViewingDocument({
        ...document,
        ...data,
        id: document.id, // Đảm bảo id luôn là string
      });

      // Cập nhật lượt xem
      // try {
      //   await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents/${document.id}/view`, {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   });
      // } catch (viewError) {
      //   console.error('Failed to track document view:', viewError);
      // }
    } catch (error) {
      console.error('Failed to fetch document details:', error);
      message.error('Không thể lấy thông tin chi tiết của tài liệu');
    }

    setIsViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setViewingDocument(null);
  };

  // Tạo file thumbnail từ URL dựa vào loại file
  const createThumbnailForFileType = async (fileType: string): Promise<File | null> => {
    try {
      let thumbnailUrl;

      // Xác định URL thumbnail dựa vào loại file
      if (fileType === 'application/pdf') {
        thumbnailUrl = THUMBNAIL_URLS.PDF;
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        thumbnailUrl = THUMBNAIL_URLS.DOCX;
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        thumbnailUrl = THUMBNAIL_URLS.PPTX;
      } else {
        thumbnailUrl = THUMBNAIL_URLS.DEFAULT;
      }

      // Lấy hình ảnh từ URL
      const response = await fetch(thumbnailUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch thumbnail: ${response.status}`);
      }

      const blob = await response.blob();

      // Tạo File object từ Blob
      const fileName = fileType === 'application/pdf' ? 'pdf-thumbnail.png' :
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'docx-thumbnail.png' :
          fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ? 'pptx-thumbnail.png' :
            'default-thumbnail.png';

      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error("Error creating thumbnail for file type:", error);
      return null;
    }
  };

  // Tạo thumbnail từ file PDF
  const createThumbnailFromPDFFile = async (file: File): Promise<File | null> => {
    try {
      setConvertingPdf(true);
      const fileUrl = URL.createObjectURL(file);
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);

      const pdf = await getDocument({ data: typedArray }).promise;
      const firstPage = await pdf.getPage(1);

      const viewport = firstPage.getViewport({ scale: 0.2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (canvas && context) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await firstPage.render({ canvasContext: context, viewport }).promise;

        const imageBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => {
            console.log("Blob created:", blob);
            resolve(blob);
          }, "image/png");
        });

        if (imageBlob) {
          const imageFile = new File([imageBlob], "thumbnail.png", {
            type: "image/png",
          });
          return imageFile;
        } else {
          console.error("Failed to create Blob from canvas");
          return null;
        }
      } else {
        console.error("Failed to create canvas or get context");
        return null;
      }
    } catch (error) {
      console.error("Error fetching or processing PDF:", error);
      return null;
    } finally {
      setConvertingPdf(false);
    }
  };

  const handleOk = async () => {
    try {
      setUploading(true);
      const values = await form.validateFields();

      // Validate required fields
      if (!values.title || !values.categoryId) {
        message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        setUploading(false);
        return;
      }

      if (fileList.length === 0 && !editingDocument) {
        message.error('Vui lòng chọn file tài liệu');
        setUploading(false);
        return;
      }

      let thumbnailFile: File | null = null;

      if (fileList.length > 0 && fileList[0].originFileObj) {
        const file = fileList[0].originFileObj;

        // Nếu là file PDF, tạo thumbnail từ nội dung PDF
        if (file.type === 'application/pdf') {
          // thumbnailFile = await createThumbnailFromPDFFile(file);
          // // Nếu không tạo được thumbnail từ nội dung PDF, sử dụng icon mặc định cho PDF
          // if (!thumbnailFile) {
          thumbnailFile = await createThumbnailForFileType(file.type);
          message.info('Sử dụng icon PDF mặc định cho thumbnail');
          // }
        } else {
          // Đối với các loại file khác, sử dụng icon tương ứng
          thumbnailFile = await createThumbnailForFileType(file.type);
          message.info(`Sử dụng icon ${file.type.includes('word') ? 'DOCX' : file.type.includes('presentation') ? 'PPTX' : 'tài liệu'} cho thumbnail`);
        }

        // Tạo FormData để upload file và thumbnail
        const formData = new FormData();
        formData.append('file', file);

        if (thumbnailFile) {
          formData.append('thumbnail', thumbnailFile);
        } else {
          // Nếu không có thumbnail, vẫn gửi một file rỗng để đảm bảo API nhận được field này
          const emptyBlob = new Blob([], { type: 'image/png' });
          const emptyFile = new File([emptyBlob], 'empty-thumbnail.png', { type: 'image/png' });
          formData.append('thumbnail', emptyFile);
        }

        formData.append('title', values.title);
        formData.append('description', values.description || '');
        formData.append('categoryId', values.categoryId.toString());
        formData.append('status', values.status);

        // Upload file và data
        try {
          const token = await authTokenLogin(refreshToken, refresh, navigate);

          if (editingDocument) {
            // Cập nhật tài liệu hiện có
            formData.append('id', editingDocument.id);

            const uploadResponse = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents/generaldocuments-update/${editingDocument.id}`, {
              method: 'PUT',
              body: formData,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!uploadResponse.ok) {
              throw new Error(`Cập nhật tài liệu thất bại: ${uploadResponse.status}`);
            }

            message.success('Cập nhật tài liệu thành công');
          } else {
            // Tạo tài liệu mới
            const uploadResponse = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents/upload`, {
              method: 'POST',
              body: formData,
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (!uploadResponse.ok) {
              throw new Error(`Tải tài liệu lên thất bại: ${uploadResponse.status}`);
            }

            message.success('Thêm tài liệu mới thành công');
          }
        } catch (error) {
          console.error('File upload failed:', error);
          message.error('Tải lên tệp thất bại: ' + (error instanceof Error ? error.message : String(error)));
          setUploading(false);
          return;
        }
      } else if (editingDocument) {

        const emptyBlob = new Blob([], { type: 'image/png' });
        const emptyFile = new File([emptyBlob], 'empty-thumbnail.png', { type: 'image/png' });
        const formData = new FormData();
        const token = await authTokenLogin(refreshToken, refresh, navigate);
        formData.append('id', editingDocument.id);
        formData.append('file', emptyFile);

        if (thumbnailFile) {
          formData.append('thumbnail', thumbnailFile);
        } else {
          // Nếu không có thumbnail, vẫn gửi một file rỗng để đảm bảo API nhận được field này
          const emptyBlob = new Blob([], { type: 'image/png' });
          const emptyFile = new File([emptyBlob], 'empty-thumbnail.png', { type: 'image/png' });
          formData.append('thumbnail', emptyFile);
        }

        formData.append('title', values.title);
        formData.append('description', values.description || '');
        formData.append('categoryId', values.categoryId.toString());
        formData.append('status', values.status);
        const uploadResponse = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents/generaldocuments-update/${editingDocument.id}`, {
          method: 'PUT',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Cập nhật tài liệu thất bại: ${uploadResponse.status}`);
        }

        message.success('Cập nhật tài liệu thành công');
      }

      // Refresh document list
      fetchDocuments(pagination.current, pagination.pageSize);
      setIsModalVisible(false);
      setFileList([]);
      setPdfImage(null);
    } catch (validationError) {
      console.error('Validation failed:', validationError);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '', // Will be handled manually
    customRequest: ({ file, onSuccess }) => {
      // Chỉ giữ file trong state, không gửi lên server ngay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess({});
        }
      }, 100);

      return {
        abort() {
          console.log('Upload aborted');
        }
      };
    },
    fileList: fileList,
    beforeUpload: (file) => {
      // Chấp nhận PDF, DOCX, PPTX
      const isAcceptedType =
        file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

      if (!isAcceptedType) {
        message.error(`${file.name} không phải là định dạng được hỗ trợ.`);
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Tệp phải nhỏ hơn 10MB!');
      }

      // Thêm vào fileList nhưng không upload
      if (isAcceptedType && isLt10M) {
        setFileList([{ ...file, status: 'done' }]);
      }
      return false; // Ngăn upload tự động
    },
    onChange(info) {
      let newFileList = [...info.fileList];
      newFileList = newFileList.slice(-1); // Chỉ giữ file mới nhất
      setFileList(newFileList);
    },
    onRemove: () => {
      setFileList([]);
      setPdfImage(null);
      return true;
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/general_documents/${document.id}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      message.success(`Tải xuống tài liệu: ${document.title}`);

      // Open file in new window
      if (document.fileUrl) {
        window.open(document.fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to track document download:', error);
      message.success(`Tải xuống tài liệu: ${document.title}`);

      // Still try to open the URL in case of tracking error
      if (document.fileUrl) {
        window.open(document.fileUrl, '_blank');
      }
    }
  };

  const columns = [
    {
      title: 'Tên tài liệu',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Định dạng',
      dataIndex: 'format',
      key: 'format',
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: Document, b: Document) => a.createdAt.localeCompare(b.createdAt),
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
    },
  
    {
      title: 'Lượt xem',
      dataIndex: 'view',
      key: 'view',
      sorter: (a: Document, b: Document) => a.view - b.view,
    },
    {
      title: 'Lượt tải',
      dataIndex: 'downloads',
      key: 'downloads',
      sorter: (a: Document, b: Document) => a.downloads - b.downloads,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        let text = 'Đang sử dụng';

        if (status === 'INACTIVE') {
          color = 'red';
          text = 'Đã lưu trữ';
        }

        return (
          <Tag color={color}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Document) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => showViewModal(record)}
          />
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          />
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa tài liệu này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
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
      <Title level={2}>Quản lý tài liệu</Title>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space size="middle">
            <Input
              placeholder="Tìm kiếm tài liệu..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={() => handleSearch(searchText)}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: 200 }}
              onChange={handleStatusFilterChange}
              value={statusFilter}
              allowClear
            >
              <Option value="ACTIVE">Đang sử dụng</Option>
              <Option value="INACTIVE">Đã lưu trữ</Option>
            </Select>
            <Button
              type="primary"
              onClick={() => handleSearch(searchText)}
            >
              Tìm kiếm
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Thêm tài liệu
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={documents}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '30', '50', '100'],
          showTotal: (total) => `Tổng ${total} tài liệu`,
        }}
        onChange={handleTableChange}
        scroll={{ x: 1300 }}
      />

      <Modal
        title={editingDocument ? "Chỉnh sửa tài liệu" : "Thêm tài liệu mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingDocument ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        confirmLoading={uploading || convertingPdf}
      >
        <Spin spinning={uploading || convertingPdf} tip={convertingPdf ? "Đang xử lý PDF..." : "Đang tải lên..."}>
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="title"
              label="Tên tài liệu"
              rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
            >
              <Select>
                {categories.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="file"
              label="Tải lên tài liệu"
              rules={[{
                required: !editingDocument,
                message: 'Vui lòng tải lên tệp!'
              }]}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} disabled={uploading || convertingPdf}>Chọn tệp</Button>
              </Upload>
              {editingDocument && fileList.length === 0 && (
                <div style={{ marginTop: 8 }}>
                  <p>Tệp hiện tại: {editingDocument.title}.{editingDocument.format.toLowerCase()}</p>
                  <p>Kích thước: {editingDocument.size}</p>
                </div>
              )}
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select>
                <Option value="ACTIVE">Đang sử dụng</Option>
                <Option value="INACTIVE">Không sử dụng</Option>
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      <Modal
        title="Xem tài liệu"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button key="close" onClick={handleViewCancel}>
            Đóng
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => {
              if (viewingDocument) {
                handleDownload(viewingDocument);
              }
              handleViewCancel();
            }}
          >
            Tải xuống
          </Button>,
        ]}
        width={800}
      >
        {viewingDocument && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <p><strong>Tên tài liệu:</strong> {viewingDocument.title}</p>
              <p><strong>Danh mục:</strong> {viewingDocument.categoryName}</p>
              <p><strong>Định dạng:</strong> {viewingDocument.format}</p>
              <p><strong>Ngày cập nhật:</strong> {viewingDocument.updatedAt}</p>
              <p><strong>Ngày tạo:</strong> {viewingDocument.createdAt}</p>
              <p><strong>Kích thước:</strong> {viewingDocument.size}</p>
              <p><strong>Lượt xem:</strong> {viewingDocument.view}</p>
              <p><strong>Lượt tải:</strong> {viewingDocument.downloads}</p>
              <p><strong>Trạng thái:</strong> {viewingDocument.status === 'ACTIVE' ? 'Đang sử dụng' : 'Đã lưu trữ'}</p>
            </div>

            <div style={{ border: '1px solid #d9d9d9', padding: 16, borderRadius: 4 }}>
              <p style={{ textAlign: 'center' }}>Xem trước tài liệu</p>
              {viewingDocument.fileUrl ? (
                viewingDocument.format.toLowerCase() === 'pdf' ? (
                  <iframe
                    src={viewingDocument.fileUrl}
                    width="100%"
                    height="400"
                    style={{ border: 'none' }}
                    title={viewingDocument.title}
                  />
                ) : (viewingDocument.format.toLowerCase() === 'docx' || viewingDocument.format.toLowerCase() === 'pptx') ? (
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingDocument.fileUrl)}&embedded=true`}
                    width="100%"
                    height="400"
                    style={{ border: 'none' }}
                    title={viewingDocument.title}
                  >
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p>Nếu không hiển thị được, hãy tải xuống để xem</p>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(viewingDocument)}
                      >
                        Tải xuống để xem
                      </Button>
                    </div>
                  </iframe>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Không thể xem trước định dạng {viewingDocument.format}</p>
                    <a href={viewingDocument.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="primary">Mở trong tab mới</Button>
                    </a>
                  </div>
                )
              ) : (
                <div style={{
                  backgroundColor: '#f5f5f5',
                  height: 400,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column'
                }}>
                  <p>Không có đường dẫn đến tài liệu</p>
                  <p>Định dạng: {viewingDocument.format}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentsPage; 