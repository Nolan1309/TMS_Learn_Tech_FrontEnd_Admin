import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layout
import AdminLayout from './layouts/AdminLayout';
import { UserStatusProvider } from './utils/UserStatusProvider';
import { Client } from '@stomp/stompjs';
import SockJS from "sockjs-client";
const Dashboard = React.lazy(() => import('./features/dashboard/Dashboard'));
const Login = React.lazy(() => import('./features/auth/Login'));
const Documents = React.lazy(() => import('./features/documents/Documents'));
const Courses = React.lazy(() => import('./features/courses/Courses'));
const CourseDetail = React.lazy(() => import('./features/courses/CourseDetail'));
const Packages = React.lazy(() => import('./features/packages/Packages'));

const QuestionBank = React.lazy(() => import('./features/questionBank/QuestionBank'));
const Exams = React.lazy(() => import('./features/exams/Exams'));
const Results = React.lazy(() => import('./features/results/Results'));
const MockExams = React.lazy(() => import('./features/mockExams/MockExams'));
const Categories = React.lazy(() => import('./features/categories/Categories'));
const Payments = React.lazy(() => import('./features/payments/Payments'));
const Accounts = React.lazy(() => import('./features/accounts/Accounts'));
const Comments = React.lazy(() => import('./features/comments/Comments'));
const Posts = React.lazy(() => import('./features/posts/Posts'));
const Discounts = React.lazy(() => import('./features/discounts/Discounts'));
const Marketing = React.lazy(() => import('./features/marketing/Marketing'));
const Notifications = React.lazy(() => import('./features/notifications/Notifications'));
const Messages = React.lazy(() => import('./features/messages/Messages'));
const Backup = React.lazy(() => import('./features/backup/Backup'));
const Trash = React.lazy(() => import('./features/trash/Trash'));
const Profile = React.lazy(() => import('./features/profile/Profile'));
const Settings = React.lazy(() => import('./features/settings/Settings'));
const Statistics = React.lazy(() => import('./features/statistics/Statistics'));
const Evaluations = React.lazy(() => import('./features/evaluations/Evaluations'));
const Rankings = React.lazy(() => import('./features/rankings/Rankings'));

function App() {

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) return;
  
    const socket = new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  
    client.onConnect = () => {
      client.publish({
        destination: "/app/status.login",
        body: storedUsername,
      });
    };
  
    client.activate();
  
    return () => {
      client.deactivate();
    };
  }, []);
  


  return (
    <UserStatusProvider>
      <Router>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dang-nhap" element={<Login />} />

            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />

              {/* Quản lý */}
              <Route path="documents" element={<Documents />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="packages" element={<Packages />} />

              <Route path="question-bank" element={<QuestionBank />} />
              <Route path="exams" element={<Exams />} />
              <Route path="results" element={<Results />} />
              <Route path="mock-exams" element={<MockExams />} />
              <Route path="categories" element={<Categories />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="payments" element={<Payments />} />
              <Route path="comments" element={<Comments />} />
              <Route path="posts" element={<Posts />} />
              <Route path="discounts" element={<Discounts />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="evaluations" element={<Evaluations />} />
              <Route path="rankings" element={<Rankings />} />

              {/* Report */}
              <Route path="notifications" element={<Notifications />} />
              <Route path="statistics" element={<Statistics />} />

              {/* Support */}
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
              <Route path="backup" element={<Backup />} />
              <Route path="trash" element={<Trash />} />

              {/* Profile */}
              <Route path="profile" element={<Profile />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </React.Suspense>
      </Router>
    </UserStatusProvider>
  );
}

export default App;
