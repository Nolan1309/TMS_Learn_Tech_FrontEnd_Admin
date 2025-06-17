import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layout
import AdminLayout from './layouts/AdminLayout';
import { Client } from '@stomp/stompjs';
import SockJS from "sockjs-client";

// Authentication
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute, AdminRoute, TeacherRoute } from './components/ProtectedRoutes';
import Unauthorized from './components/Unauthorized';

// Pages
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
    <AuthProvider>
      <Router>
        <React.Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dang-nhap" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Base Routes - Access requires authentication as admin or teacher */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Admin Routes - Only accessible by administrators */}
            <Route element={<AdminRoute />}>
              <Route path="/" element={<AdminLayout />}>
                <Route path="packages" element={<Packages />} />
                <Route path="categories" element={<Categories />} />
                <Route path="accounts" element={<Accounts />} />
                <Route path="payments" element={<Payments />} />
                <Route path="discounts" element={<Discounts />} />
                <Route path="marketing" element={<Marketing />} />
                <Route path="backup" element={<Backup />} />
                <Route path="trash" element={<Trash />} />
                <Route path="settings" element={<Settings />} />
                <Route path="statistics" element={<Statistics />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>
            </Route>

            {/* Teacher Routes - Can be accessed by teachers and admins */}
            <Route element={<TeacherRoute />}>
              <Route path="/" element={<AdminLayout />}>
                <Route path="documents" element={<Documents />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:id" element={<CourseDetail />} />
                <Route path="question-bank" element={<QuestionBank />} />
                <Route path="exams" element={<Exams />} />
                <Route path="results" element={<Results />} />
                <Route path="mock-exams" element={<MockExams />} />
                <Route path="comments" element={<Comments />} />
                <Route path="posts" element={<Posts />} />
                <Route path="evaluations" element={<Evaluations />} />
                <Route path="rankings" element={<Rankings />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
