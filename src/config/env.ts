/**
 * Environment configuration file
 * Contains all environment variables and API endpoints used throughout the application
 */

// API Base URLs
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Auth endpoints
export const AUTH = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
};

// User endpoints
export const USERS = {
  PROFILE: `${API_BASE_URL}/users/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/users/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/users/change-password`,
  GET_ALL: `${API_BASE_URL}/users`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
  CREATE: `${API_BASE_URL}/users`,
  UPDATE: (id: string) => `${API_BASE_URL}/users/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/users/${id}`,
};

// Categories endpoints
export const CATEGORIES = {
  GET_ALL: `${API_BASE_URL}/categories`,
  GET_BY_LEVEL: (level: number) => `${API_BASE_URL}/categories/level${level}`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/categories/${id}`,
  CREATE: `${API_BASE_URL}/categories`,
  UPDATE: (id: string) => `${API_BASE_URL}/categories/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/categories/${id}`,
};

// Posts endpoints
export const POSTS = {
  GET_ALL: `${API_BASE_URL}/posts`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/posts/${id}`,
  CREATE: `${API_BASE_URL}/posts`,
  UPDATE: (id: string) => `${API_BASE_URL}/posts/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/posts/${id}`,
};

// Courses endpoints
export const COURSES = {
  GET_ALL: `${API_BASE_URL}/courses`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/courses/${id}`,
  CREATE: `${API_BASE_URL}/courses`,
  UPDATE: (id: string) => `${API_BASE_URL}/courses/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/courses/${id}`,
};

// Students endpoints
export const STUDENTS = {
  GET_ALL: `${API_BASE_URL}/students`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/students/${id}`,
  CREATE: `${API_BASE_URL}/students`,
  UPDATE: (id: string) => `${API_BASE_URL}/students/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/students/${id}`,
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Default values
export const DEFAULTS = {
  PAGINATION_LIMIT: 10,
  LANGUAGE: 'vi',
};

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  TOKEN_EXPIRY_BUFFER: 60000, // 1 minute
}; 