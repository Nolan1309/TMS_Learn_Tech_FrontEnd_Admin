import React, { useState } from 'react';
import {
  Typography, Card, Tabs
} from 'antd';
import Banners from './components/Banners';

const { Title } = Typography;

const Marketing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('banners');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const items = [
    {
      key: 'banners',
      label: 'Quản lý Banner',
      children: <Banners />
    }
  ];

  return (
    <div>
      <Title level={2}>Quản lý Banner</Title>
      
      <Card>
        <Tabs defaultActiveKey="banners" onChange={handleTabChange} items={items} />
      </Card>
    </div>
  );
};

export default Marketing; 