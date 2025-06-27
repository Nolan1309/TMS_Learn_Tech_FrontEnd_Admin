// import React, { useState, useEffect } from 'react';
// import {
//   Table,
//   Button,
//   Input,
//   Space,
//   Modal,
//   Select,
//   Tag,
//   Tooltip,
//   Typography,
//   message,
//   Row,
//   Col,
//   Card,
//   Progress,
//   Statistic,
//   Badge,
//   Avatar,
//   DatePicker
// } from 'antd';
// import {
//   SearchOutlined,
//   EyeOutlined,
//   BarChartOutlined,
//   ReloadOutlined,
//   ExportOutlined,
//   TrophyOutlined,
//   StarOutlined,
//   UserOutlined,
//   TeamOutlined,
//   BookOutlined
// } from '@ant-design/icons';
// import type { ColumnsType } from 'antd/es/table';
// import { RangePickerProps } from 'antd/es/date-picker';

// const { Title, Text, Paragraph } = Typography;
// const { Option } = Select;
// const { RangePicker } = DatePicker;

// interface InstructorRanking {
//   id: string;
//   name: string;
//   avatar: string;
//   department: string;
//   courseCount: number;
//   studentCount: number;
//   rating: number;
//   completionRate: number;
//   responseTime: number; // in hours
//   level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
//   position: number;
//   lastUpdated: string;
// }

// // Mock data
// const mockInstructors: InstructorRanking[] = [
//   {
//     id: '1',
//     name: 'Nguyễn Văn Giảng',
//     avatar: '',
//     department: 'Công nghệ thông tin',
//     courseCount: 8,
//     studentCount: 320,
//     rating: 4.8,
//     completionRate: 94,
//     responseTime: 4,
//     level: 'diamond',
//     position: 1,
//     lastUpdated: '2023-08-15T10:30:00',
//   },
//   {
//     id: '2',
//     name: 'Trần Thị Hướng Dẫn',
//     avatar: '',
//     department: 'Khoa học máy tính',
//     courseCount: 6,
//     studentCount: 280,
//     rating: 4.7,
//     completionRate: 92,
//     responseTime: 5,
//     level: 'platinum',
//     position: 2,
//     lastUpdated: '2023-08-15T10:30:00',
//   },
//   {
//     id: '3',
//     name: 'Lê Văn Mentor',
//     avatar: '',
//     department: 'Kỹ thuật phần mềm',
//     courseCount: 7,
//     studentCount: 250,
//     rating: 4.5,
//     completionRate: 90,
//     responseTime: 6,
//     level: 'platinum',
//     position: 3,
//     lastUpdated: '2023-08-15T10:30:00',
//   },
//   {
//     id: '4',
//     name: 'Phạm Thị Chuyên Viên',
//     avatar: '',
//     department: 'Đồ họa và Thiết kế',
//     courseCount: 5,
//     studentCount: 230,
//     rating: 4.4,
//     completionRate: 88,
//     responseTime: 7,
//     level: 'gold',
//     position: 4,
//     lastUpdated: '2023-08-15T10:30:00',
//   },
//   {
//     id: '5',
//     name: 'Hoàng Minh Tutor',
//     avatar: '',
//     department: 'Mạng máy tính',
//     courseCount: 4,
//     studentCount: 180,
//     rating: 4.2,
//     completionRate: 85,
//     responseTime: 8,
//     level: 'gold',
//     position: 5,
//     lastUpdated: '2023-08-15T10:30:00',
//   },
//   {
//     id: '6',
//     name: 'Đỗ Thanh Giáo Viên',
//     avatar: '',
//     department: 'An ninh mạng',
//     courseCount: 3,
//     studentCount: 150,
//     rating: 4.0,
//     completionRate: 82,
//     responseTime: 10,
//     level: 'silver',
//     position: 6,
//     lastUpdated: '2023-08-15T10:30:00',
//   },
//   {
//     id: '7',
//     name: 'Vũ Hồng Hướng Dẫn',
//     avatar: '',
//     department: 'Trí tuệ nhân tạo',
//     courseCount: 2,
//     studentCount: 120,
//     rating: 3.8,
//     completionRate: 78,
//     responseTime: 12,
//     level: 'silver',
//     position: 7,
//     lastUpdated: '2023-08-15T10:30:00',
//   },
//   {
//     id: '8',
//     name: 'Ngô Thị Giáo Viên',
//     avatar: '',
//     department: 'Big Data',
//     courseCount: 2,
//     studentCount: 90,
//     rating: 3.5,
//     completionRate: 75,
//     responseTime: 15,
//     level: 'bronze',
//     position: 8,
//     lastUpdated: '2023-08-15T10:30:00',
//   },
// ];

// // API URL
// const API_URL = 'http://localhost:8080/api';

// const InstructorRankings: React.FC = () => {
//   const [rankings, setRankings] = useState<InstructorRanking[]>(mockInstructors);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [searchText, setSearchText] = useState<string>('');
//   const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
//   const [currentInstructor, setCurrentInstructor] = useState<InstructorRanking | null>(null);
//   const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);

//   // Filter states
//   const [filterDepartment, setFilterDepartment] = useState<string | null>(null);
//   const [filterLevel, setFilterLevel] = useState<string | null>(null);

//   // Fetch rankings data
//   // const fetchRankings = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const response = await fetch(`${API_URL}/instructor/rankings`);
//   //     if (!response.ok) {
//   //       throw new Error('Failed to fetch rankings');
//   //     }
//   //     const data = await response.json();
//   //     setRankings(data);
//   //   } catch (error) {
//   //     console.error('Error fetching rankings:', error);
//   //     // Using mock data for demonstration
//   //     setRankings(mockInstructors);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // useEffect(() => {
//   //   fetchRankings();
//   // }, []);

//   // Filter function
//   const getFilteredRankings = () => {
//     return rankings.filter(instructor => {
//       const matchesSearch = 
//         instructor.name.toLowerCase().includes(searchText.toLowerCase()) ||
//         instructor.department.toLowerCase().includes(searchText.toLowerCase());

//       const matchesDepartment = !filterDepartment || instructor.department === filterDepartment;
//       const matchesLevel = !filterLevel || instructor.level === filterLevel;

//       return matchesSearch && matchesDepartment && matchesLevel;
//     });
//   };

//   // Reset filters
//   const resetFilters = () => {
//     setSearchText('');
//     setFilterDepartment(null);
//     setFilterLevel(null);
//     setDateRange(null);
//   };

//   // Show instructor details
//   const showInstructorDetails = (instructor: InstructorRanking) => {
//     setCurrentInstructor(instructor);
//     setIsDetailModalVisible(true);
//   };

//   // Date range change handler
//   const handleDateRangeChange: RangePickerProps['onChange'] = (dates) => {
//     if (dates) {
//       setDateRange([dates[0]?.toDate() as Date, dates[1]?.toDate() as Date]);
//     } else {
//       setDateRange(null);
//     }
//   };

//   // Get level badge
//   const getLevelBadge = (level: string) => {
//     switch (level) {
//       case 'diamond':
//         return <Badge count={<TrophyOutlined style={{ color: '#36b3ff' }} />} />;
//       case 'platinum':
//         return <Badge count={<TrophyOutlined style={{ color: '#e5e4e2' }} />} />;
//       case 'gold':
//         return <Badge count={<TrophyOutlined style={{ color: '#ffd700' }} />} />;
//       case 'silver':
//         return <Badge count={<TrophyOutlined style={{ color: '#c0c0c0' }} />} />;
//       case 'bronze':
//         return <Badge count={<TrophyOutlined style={{ color: '#cd7f32' }} />} />;
//       default:
//         return null;
//     }
//   };

//   // Get level tag
//   const getLevelTag = (level: string) => {
//     switch (level) {
//       case 'diamond':
//         return <Tag color="#36b3ff">Kim cương</Tag>;
//       case 'platinum':
//         return <Tag color="#e5e4e2">Bạch kim</Tag>;
//       case 'gold':
//         return <Tag color="#ffd700">Vàng</Tag>;
//       case 'silver':
//         return <Tag color="#c0c0c0">Bạc</Tag>;
//       case 'bronze':
//         return <Tag color="#cd7f32">Đồng</Tag>;
//       default:
//         return <Tag>Chưa xác định</Tag>;
//     }
//   };

//   // Table columns
//   const columns: ColumnsType<InstructorRanking> = [
//     {
//       title: 'Xếp hạng',
//       dataIndex: 'position',
//       key: 'position',
//       width: 100,
//       render: (position: number) => (
//         <span className="ranking-position">{position}</span>
//       ),
//       sorter: (a, b) => a.position - b.position,
//       defaultSortOrder: 'ascend',
//     },
//     {
//       title: 'Giảng viên',
//       dataIndex: 'name',
//       key: 'name',
//       render: (name: string, record: InstructorRanking) => (
//         <Space>
//           <Avatar icon={<UserOutlined />} src={record.avatar} />
//           <span>{name}</span>
//           <span className="ranking-badge">{getLevelBadge(record.level)}</span>
//         </Space>
//       ),
//     },
//     {
//       title: 'Khoa',
//       dataIndex: 'department',
//       key: 'department',
//       width: 200,
//     },
//     {
//       title: 'Khóa học',
//       dataIndex: 'courseCount',
//       key: 'courseCount',
//       width: 120,
//       sorter: (a, b) => a.courseCount - b.courseCount,
//     },
//     {
//       title: 'Học viên',
//       dataIndex: 'studentCount',
//       key: 'studentCount',
//       width: 120,
//       sorter: (a, b) => a.studentCount - b.studentCount,
//     },
//     {
//       title: 'Đánh giá',
//       dataIndex: 'rating',
//       key: 'rating',
//       width: 120,
//       render: (rating: number) => (
//         <Space>
//           <span>{rating.toFixed(1)}</span>
//           <StarOutlined style={{ color: '#fadb14' }} />
//         </Space>
//       ),
//       sorter: (a, b) => a.rating - b.rating,
//     },
//     {
//       title: 'Cấp độ',
//       dataIndex: 'level',
//       key: 'level',
//       width: 120,
//       render: (level: string) => getLevelTag(level),
//     },
//     {
//       title: 'Thao tác',
//       key: 'action',
//       width: 100,
//       render: (_, record) => (
//         <Space>
//           <Tooltip title="Xem chi tiết">
//             <Button 
//               icon={<EyeOutlined />} 
//               size="small" 
//               onClick={() => showInstructorDetails(record)} 
//             />
//           </Tooltip>
//           <Tooltip title="Biểu đồ thống kê">
//             <Button 
//               icon={<BarChartOutlined />} 
//               size="small" 
//             />
//           </Tooltip>
//         </Space>
//       ),
//     },
//   ];

//   // Get unique departments for filter
//   const departments = Array.from(new Set(rankings.map(item => item.department)));

//   // Level options for filter
//   const levelOptions = [
//     { value: 'diamond', label: 'Kim cương' },
//     { value: 'platinum', label: 'Bạch kim' },
//     { value: 'gold', label: 'Vàng' },
//     { value: 'silver', label: 'Bạc' },
//     { value: 'bronze', label: 'Đồng' },
//   ];

//   return (
//     <div>
//       <div className="ranking-description">
//         <Paragraph>
//           Hệ thống xếp hạng giảng viên dựa trên nhiều tiêu chí: số lượng khóa học, số lượng học viên, điểm đánh giá trung bình, 
//           tỷ lệ hoàn thành khóa học và thời gian phản hồi.
//         </Paragraph>
//         <div className="ranking-criteria">
//           Bảng xếp hạng được cập nhật hàng tuần. Cấp độ xếp hạng: Đồng, Bạc, Vàng, Bạch kim, Kim cương.
//         </div>
//       </div>

//       <div className="ranking-filters">
//         <Input
//           placeholder="Tìm kiếm theo tên giảng viên, khoa"
//           value={searchText}
//           onChange={e => setSearchText(e.target.value)}
//           prefix={<SearchOutlined />}
//           style={{ width: 300 }}
//           allowClear
//         />

//         <Select
//           placeholder="Chọn khoa"
//           style={{ width: 200 }}
//           value={filterDepartment}
//           onChange={value => setFilterDepartment(value)}
//           allowClear
//         >
//           {departments.map(department => (
//             <Option key={department} value={department}>{department}</Option>
//           ))}
//         </Select>

//         <Select
//           placeholder="Cấp độ"
//           style={{ width: 150 }}
//           value={filterLevel}
//           onChange={value => setFilterLevel(value)}
//           allowClear
//         >
//           {levelOptions.map(option => (
//             <Option key={option.value} value={option.value}>{option.label}</Option>
//           ))}
//         </Select>

//         <RangePicker onChange={handleDateRangeChange} />

//         <Button 
//           icon={<ReloadOutlined />} 
//           onClick={resetFilters}
//         >
//           Đặt lại
//         </Button>

//         <Button 
//           type="primary" 
//           icon={<ExportOutlined />}
//         >
//           Xuất báo cáo
//         </Button>
//       </div>

//       <div className="ranking-stats">
//         <div className="ranking-stat-card">
//           <Text>Tổng số giảng viên</Text>
//           <div className="ranking-stat-value">{rankings.length}</div>
//         </div>
//         <div className="ranking-stat-card">
//           <Text>Kim cương</Text>
//           <div className="ranking-stat-value">{rankings.filter(i => i.level === 'diamond').length}</div>
//         </div>
//         <div className="ranking-stat-card">
//           <Text>Bạch kim</Text>
//           <div className="ranking-stat-value">{rankings.filter(i => i.level === 'platinum').length}</div>
//         </div>
//         <div className="ranking-stat-card">
//           <Text>Vàng</Text>
//           <div className="ranking-stat-value">{rankings.filter(i => i.level === 'gold').length}</div>
//         </div>
//       </div>

//       <Table
//         className="ranking-table"
//         columns={columns}
//         dataSource={getFilteredRankings()}
//         rowKey="id"
//         loading={loading}
//         pagination={{
//           pageSize: 10,
//           showSizeChanger: true,
//           showTotal: (total) => `Tổng cộng ${total} giảng viên`,
//         }}
//       />

//       {/* Detail Modal */}
//       <Modal
//         title="Chi tiết giảng viên"
//         open={isDetailModalVisible}
//         onCancel={() => setIsDetailModalVisible(false)}
//         footer={null}
//         className="ranking-detail-modal"
//         width={800}
//       >
//         {currentInstructor && (
//           <Row gutter={[24, 24]}>
//             <Col span={24}>
//               <Card>
//                 <Row gutter={16} align="middle">
//                   <Col>
//                     <Avatar size={64} icon={<UserOutlined />} src={currentInstructor.avatar} />
//                   </Col>
//                   <Col flex="auto">
//                     <Title level={4}>{currentInstructor.name} {getLevelBadge(currentInstructor.level)}</Title>
//                     <Text>{currentInstructor.department}</Text>
//                     <div style={{ marginTop: 8 }}>
//                       {getLevelTag(currentInstructor.level)}
//                       <Tag color="blue">Xếp hạng #{currentInstructor.position}</Tag>
//                     </div>
//                   </Col>
//                   <Col>
//                     <Statistic 
//                       title="Đánh giá" 
//                       value={currentInstructor.rating.toFixed(1)} 
//                       suffix={<StarOutlined style={{ color: '#fadb14' }} />} 
//                     />
//                   </Col>
//                 </Row>
//               </Card>
//             </Col>

//             <Col span={12}>
//               <Card title="Số liệu thống kê">
//                 <p><BookOutlined /> <strong>Số khóa học:</strong> {currentInstructor.courseCount}</p>
//                 <p><TeamOutlined /> <strong>Số học viên:</strong> {currentInstructor.studentCount}</p>
//                 <p><strong>Thời gian phản hồi trung bình:</strong> {currentInstructor.responseTime} giờ</p>
//                 <p><strong>Cập nhật lần cuối:</strong> {new Date(currentInstructor.lastUpdated).toLocaleDateString('vi-VN')}</p>
//               </Card>
//             </Col>

//             <Col span={12}>
//               <Card title="Hiệu suất">
//                 <div className="ranking-progress">
//                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <Text>Tỷ lệ hoàn thành</Text>
//                     <Text>{currentInstructor.completionRate}%</Text>
//                   </div>
//                   <Progress percent={currentInstructor.completionRate} status="active" />
//                 </div>

//                 <div className="ranking-progress">
//                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <Text>Đánh giá</Text>
//                     <Text>{currentInstructor.rating}/5</Text>
//                   </div>
//                   <Progress percent={currentInstructor.rating * 20} status="active" />
//                 </div>

//                 <div className="ranking-progress">
//                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//                     <Text>Thời gian phản hồi</Text>
//                     <Text>{10 - Math.min(currentInstructor.responseTime / 2, 10)}/10</Text>
//                   </div>
//                   <Progress percent={(10 - Math.min(currentInstructor.responseTime / 2, 10)) * 10} status="active" />
//                 </div>
//               </Card>
//             </Col>

//             <Col span={24}>
//               <Card title="Tiêu chí xếp hạng">
//                 <p>Hệ thống tính điểm dựa trên các tiêu chí sau:</p>
//                 <ul>
//                   <li>Số lượng khóa học</li>
//                   <li>Số lượng học viên</li>
//                   <li>Điểm đánh giá trung bình</li>
//                   <li>Tỷ lệ hoàn thành khóa học</li>
//                   <li>Thời gian phản hồi trung bình</li>
//                 </ul>
//                 <p>Các cấp độ xếp hạng:</p>
//                 <ul>
//                   <li><strong>Kim cương:</strong> &gt;= 90 điểm</li>
//                   <li><strong>Bạch kim:</strong> 80-89 điểm</li>
//                   <li><strong>Vàng:</strong> 70-79 điểm</li>
//                   <li><strong>Bạc:</strong> 60-69 điểm</li>
//                   <li><strong>Đồng:</strong> &lt; 60 điểm</li>
//                 </ul>
//               </Card>
//             </Col>
//           </Row>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default InstructorRankings; 

export { }; 