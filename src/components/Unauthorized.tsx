import React from 'react';
import { Button, Result, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isTeacher, isUser, logout } = useAuth();

  // Determine the appropriate message based on user role
  let message = "Xin lỗi, bạn không có quyền truy cập trang này.";
  
  if (isAuthenticated) {
    if (isUser) {
      message = "Tài khoản của bạn không có quyền truy cập vào hệ thống quản trị. Vui lòng đăng nhập bằng tài khoản Admin hoặc Teacher để tiếp tục.";
    } else {
      message = "Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ Admin để được cấp quyền.";
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Result
      status="403"
      title="403 - Không có quyền truy cập"
      subTitle={message}
      extra={
        <Space>
          {isAuthenticated ? (
            <>
              <Button type="primary" onClick={() => navigate('/')}>
                Quay lại trang chủ
              </Button>
              <Button onClick={handleLogout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button type="primary" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          )}
        </Space>
      }
    />
  );
};

export default Unauthorized; 