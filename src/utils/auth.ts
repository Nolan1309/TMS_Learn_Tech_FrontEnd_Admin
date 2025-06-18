import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

// Định nghĩa interface cho token đã giải mã
interface DecodedToken {
  exp: number;
}

/**
 * Kiểm tra xem token đã hết hạn hay chưa
 * @param {string | null} token - Access token
 * @returns {boolean} - Trả về true nếu token đã hết hạn
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token); // Giải mã token
    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

    return decodedToken.exp < currentTime; // Trả về true nếu token đã hết hạn
  } catch (error) {
    console.error("Không thể giải mã token:", error);
    return true; // Nếu có lỗi, coi như token đã hết hạn
  }
}

/**
 * Định nghĩa kiểu dữ liệu của response từ API refresh token.
 */
interface RefreshTokenResponse {
  jwt: string; // Access token
  refreshToken: string;
  responsiveDTOJWT: {
    id: number;
    fullname: string;
    email: string;
    roleId: number;
  };
}
/**
 * Gọi API để refresh access token.
 * Lưu refresh token vào cookie thay vì localStorage.
 * @returns {Promise<string | null>} - Trả về access token mới nếu thành công, null nếu thất bại.
 */
export async function refreshToken(): Promise<string | null> {

  const refreshToken = Cookies.get("refreshToken");

  if (!refreshToken) {
    console.error("Không tìm thấy refresh token.");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.REACT_APP_SERVER_HOST}/account/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );
    if (response.ok) {
      const data: RefreshTokenResponse = await response.json();

      localStorage.setItem("authToken", data.jwt);

      Cookies.set("refreshToken", data.refreshToken, {
        expires: 7,
        secure: true,
        sameSite: "Strict",
        // httpOnly: true // Cờ này chỉ có thể được đặt bởi server-side (client-side không thể)
      });

      localStorage.setItem("userInfo", JSON.stringify(data.responsiveDTOJWT));

      return data.jwt;
    } else {
      console.error("Lỗi khi refresh token:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Có lỗi khi gọi API refresh token:", error);
    return null;
  }
}


export const authTokenLogin = async (refreshToken: any, refresh: any, navigate: any) => {
  let token = localStorage.getItem("authToken");
  if (token && isTokenExpired(token)) {
    if (!refreshToken) {
      navigate("/dang-nhap");
      return null;
    }
    token = await refresh(refreshToken);
    if (!token) {
      navigate("/dang-nhap");
      return null; 
    }
    localStorage.setItem("authToken", token);
  }

  return token;
}

export interface UserToken {
  AccountId: number;
  isUserVip: boolean;
  isHuitStudent: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
  sub: string; // email
  iat: number;
  exp: number;
}

export const TOKEN_KEY = 'authToken';

// Store token in localStorage
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove token from localStorage
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Decode JWT token
export const decodeToken = (token: string): UserToken | null => {
  try {
    return jwtDecode<UserToken>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

// Get current user from token
export const getCurrentUser = (): UserToken | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = decodeToken(token);
    
    // Check if token is expired
    if (decoded && decoded.exp * 1000 < Date.now()) {
      removeToken();
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Check if user has specific role
export const hasRole = (role: 'admin' | 'teacher' | 'user' | 'vip' | 'huitStudent'): boolean => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) return false;
  
  switch (role) {
    case 'admin':
      return currentUser.isAdmin;
    case 'teacher':
      return currentUser.isTeacher;
    case 'user':
      return currentUser.isUser;
    case 'vip':
      return currentUser.isUserVip;
    case 'huitStudent':
      return currentUser.isHuitStudent;
    default:
      return false;
  }
};
