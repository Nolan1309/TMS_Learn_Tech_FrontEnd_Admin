import React, { useState } from 'react';
import { Tabs, Card, Typography } from 'antd';
import InstructorRankings from './InstructorRankings';
import StudentRankings from './StudentRankings';
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
          <TabPane tab="Xếp hạng giảng viên" key="instructor">
            <InstructorRankings />
          </TabPane>
          <TabPane tab="Xếp hạng học viên" key="student">
            <StudentRankings />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Rankings; 