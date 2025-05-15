import React, { useState, useEffect } from 'react';
import {
  Typography, Tabs, Card, Row, Col, Statistic, Button, Space,
  message
} from 'antd';
import { 
  TeamOutlined, ShoppingOutlined, DollarOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useRefreshToken from '../../utils/useRefreshToken';
import { authTokenLogin } from '../../utils/auth';

import MembershipPackages from './components/MembershipPackages';
import ComboPackages from './components/ComboPackages';
import './Packages.css';

const { Title } = Typography;
const { TabPane } = Tabs;

const PackagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('membership');
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalPackages: 0,
    activePackages: 0,
    totalSales: 0,
    totalRevenue: 0
  });
  
  const navigate = useNavigate();
  const refresh = useRefreshToken();
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = await authTokenLogin(refreshToken, refresh, navigate);
      // Trong thực tế, bạn sẽ gọi API để lấy thống kê
      // Ví dụ: const response = await fetch(`${process.env.REACT_APP_SERVER_HOST}/api/packages/stats`, ...);
      
      // Giả lập dữ liệu
      setTimeout(() => {
        setStats({
          totalPackages: 12,
          activePackages: 8,
          totalSales: 256,
          totalRevenue: 25600000
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching package stats:", error);
      message.error("Không thể tải thống kê gói");
      setLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div>
      <Title level={2}>Quản lý gói</Title>


      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane 
            tab={
              <span>
                <TeamOutlined /> Gói thành viên
              </span>
            } 
            key="membership"
          >
            <MembershipPackages />
          </TabPane>
          <TabPane 
            tab={
              <span>
                <ShoppingOutlined /> Gói combo khóa học
              </span>
            } 
            key="combo"
          >
            <ComboPackages />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PackagesPage; 