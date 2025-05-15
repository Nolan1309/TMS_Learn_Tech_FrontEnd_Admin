import React, { useState } from 'react';
import { Tabs, Card, Typography } from 'antd';
import InstructorRankings from './InstructorRankings';
import StudentRankings from './StudentRankings';
import RewardManagement from './RewardManagement';
import {
  TrophyOutlined,
  UserOutlined,
  GiftOutlined
} from '@ant-design/icons';
import './Rankings.css';

const { Title } = Typography;
const { TabPane } = Tabs;

const Rankings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('instructor');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="rankings-container">
      <Title level={2}>Quản lý xếp hạng</Title>
      
      <Card bordered={false} className="ranking-card">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane 
            tab={<span><TrophyOutlined /> Xếp hạng giảng viên</span>} 
            key="instructor"
          >
            <InstructorRankings />
          </TabPane>
          <TabPane 
            tab={<span><UserOutlined /> Xếp hạng học viên</span>} 
            key="student"
          >
            <StudentRankings />
          </TabPane>
          <TabPane 
            tab={<span><GiftOutlined /> Quản lý phần thưởng</span>} 
            key="rewards"
          >
            <RewardManagement />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Rankings; 