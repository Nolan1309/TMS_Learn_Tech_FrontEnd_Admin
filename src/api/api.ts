// API Base URL
const API_BASE_URL = process.env.REACT_APP_SERVER_HOST || 'http://localhost:8080';

// Authentication endpoints
export const POST_ACCOUNT_LOGIN = `${API_BASE_URL}/account/dang-nhap`;
export const POST_ACCOUNT_REGISTER = `${API_BASE_URL}/account/register`;
export const GET_ACCOUNT_REFRESH_TOKEN = `${API_BASE_URL}/account/refresh-token`;
export const POST_ACCOUNT_LOGOUT = `${API_BASE_URL}/account/logout`;
export const POST_ACCOUNT_FORGOT_PASSWORD = `${API_BASE_URL}/account/forgot-password`;
export const POST_ACCOUNT_RESET_PASSWORD = `${API_BASE_URL}/account/reset-password`;
export const GET_ACCOUNT_VERIFY_EMAIL = `${API_BASE_URL}/account/verify-email`;
export const GET_OAUTH2_GOOGLE = `${API_BASE_URL}/oauth2/authorization/google`;

// User endpoints
export const GET_ACCOUNT_PROFILE = `${API_BASE_URL}/account/profile`;
export const PUT_ACCOUNT_PROFILE = `${API_BASE_URL}/account/profile`;
export const PUT_ACCOUNT_CHANGE_PASSWORD = `${API_BASE_URL}/account/change-password`;
export const GET_ACCOUNTS = `${API_BASE_URL}/account`;
export const GET_ACCOUNT_BY_ID = (id: string) => `${API_BASE_URL}/account/${id}`;
export const PUT_ACCOUNT = (id: string) => `${API_BASE_URL}/account/${id}`;
export const DELETE_ACCOUNT = (id: string) => `${API_BASE_URL}/account/${id}`;

// Categories endpoints
export const GET_CATEGORIES = `${API_BASE_URL}/categories`;
export const GET_CATEGORIES_BY_LEVEL = (level: number) => `${API_BASE_URL}/categories/level${level}`;
export const GET_CATEGORY_BY_ID = (id: string) => `${API_BASE_URL}/categories/${id}`;
export const POST_CATEGORY = `${API_BASE_URL}/categories`;
export const PUT_CATEGORY = (id: string) => `${API_BASE_URL}/categories/${id}`;
export const DELETE_CATEGORY = (id: string) => `${API_BASE_URL}/categories/${id}`;

// Courses endpoints
export const GET_COURSES = `${API_BASE_URL}/courses`;
export const GET_COURSE_BY_ID = (id: string) => `${API_BASE_URL}/courses/${id}`;
export const POST_COURSE = `${API_BASE_URL}/courses`;
export const PUT_COURSE = (id: string) => `${API_BASE_URL}/courses/${id}`;
export const DELETE_COURSE = (id: string) => `${API_BASE_URL}/courses/${id}`;

// Posts endpoints
export const GET_POSTS = `${API_BASE_URL}/posts`;
export const GET_POST_BY_ID = (id: string) => `${API_BASE_URL}/posts/${id}`;
export const POST_POST = `${API_BASE_URL}/posts`;
export const PUT_POST = (id: string) => `${API_BASE_URL}/posts/${id}`;
export const DELETE_POST = (id: string) => `${API_BASE_URL}/posts/${id}`;

// WebSocket endpoints
export const WS_ENDPOINT = `${API_BASE_URL}/ws`;
export const WS_LOGIN_DESTINATION = '/app/login';
export const WS_NOTIFICATION_DESTINATION = '/app/notification';
export const WS_CHAT_DESTINATION = '/app/chat';
export const WS_TOPIC_USER = (userId: string) => `/topic/user/${userId}`;
export const WS_TOPIC_NOTIFICATION = '/topic/notification';

// Export default for ES6 modules compatibility
export default {
  API_BASE_URL,
  POST_ACCOUNT_LOGIN,
  GET_ACCOUNT_REFRESH_TOKEN,
  GET_OAUTH2_GOOGLE,
  WS_ENDPOINT,
  WS_LOGIN_DESTINATION
}; 