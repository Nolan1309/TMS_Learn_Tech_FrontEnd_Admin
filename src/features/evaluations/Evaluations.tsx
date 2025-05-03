import React, { useState, useEffect } from 'react';
import { Tabs, Card, Typography, message } from 'antd';

import './Evaluations.css';
import CourseEvaluations from './CourseEvaluations';
import ExamEvaluations from './ExamEvaluations';

const { Title } = Typography;
const { TabPane } = Tabs;

const Evaluations: React.FC = () => {
  const [activeTab, setActiveTab] = useState('course');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="evaluations-container">
      <Title level={2}>Quản lý đánh giá</Title>
      
      <Card bordered={false} className="evaluation-card">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Đánh giá khóa học" key="course">
            <CourseEvaluations />
          </TabPane>
          <TabPane tab="Đánh giá đề thi" key="exam">
            <ExamEvaluations />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Evaluations; 