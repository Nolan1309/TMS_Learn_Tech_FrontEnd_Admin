import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/assetsLogin/css/fontawesome-all.min.css";
import "../../assets/assetsLogin/css/iofrm-style.css";
import "../../assets/assetsLogin/css/iofrm-theme19.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { POST_ACCOUNT_LOGIN } from "../../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Login.css";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  isAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
  isHuitStudent: boolean;
  sub: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>(() => {
    // Lấy username từ localStorage nếu có
    return localStorage.getItem("username") || "";
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const listenAndSendLoginData = (accountId: number) => {
    // Send login event via WebSocket
    const socket = new SockJS(`${process.env.REACT_APP_SERVER_HOST}/ws`);
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
      console.log('WebSocket connected: ' + frame);

      // Send login event via WebSocket
      const data = {
        activityType: 'login',
        accountId: accountId,
        timestamp: new Date().toISOString(),
      };
      stompClient.publish({
        destination: "/app/login",
        body: JSON.stringify(data)
      });
      if (username) {
        stompClient.publish({
          destination: "/app/status.login",
          body: username,
        });
      }
    };

    stompClient.activate();
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(POST_ACCOUNT_LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password: password }),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("authToken", data.jwt);
        localStorage.setItem("authData", JSON.stringify(data.responsiveDTOJWT));
        localStorage.setItem("refreshToken", data.refreshToken);
        toast.success("Đăng nhập thành công!");

        setTimeout(() => {
          if (!data.jwt) {
            navigate("/dang-nhap");
            return;
          } else {
            listenAndSendLoginData(data.responsiveDTOJWT.id);
            localStorage.setItem("username", data.responsiveDTOJWT.email);

            const decodedToken = jwtDecode(data.jwt) as JwtPayload;
            const isAdmin = decodedToken.isAdmin;
            const isTeacher = decodedToken.isTeacher;
            if (isAdmin || isTeacher) {
              navigate("/admin");
              return;
            } else {
              navigate("/");
              return;
            }
          }
        }, 2500);
      } else {
        const data = await response.text();
        toast.error(data);
      }
    } catch (error) {
      toast.error(
        "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau."
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const googleLogin = () => {
    // Redirect user to Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_SERVER_HOST || 'http://localhost:8080'}/oauth2/authorization/google`;
  };

  return (
    <div className="form-body without-side">
      <div className="row">
        <div className="img-holder">
          <div className="bg"></div>
          <div className="info-holder">
            <img
              src="/assets/assetsLogin/images/graphic3.svg"
              alt=""
            />
          </div>
        </div>
        <div className="form-holder">
          <div className="form-content">
            <div className="form-items">
              <h3 style={{ marginBottom: "50px", textAlign: "center" }}>
                Đăng nhập tài khoản
              </h3>
              <form onSubmit={handleLogin}>
                <input
                  className="form-control"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Email"
                  required
                />
                <div
                  className="password-wrapper"
                >
                  <input
                    className="form-control"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                  <span
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <i className="fa-solid fa-eye-slash"></i>
                    ) : (
                      <i className="fa-solid fa-eye"></i>
                    )}
                  </span>
                </div>

                <div className="form-button">
                  <button id="submit" type="submit" className="ibtn">
                    Login
                  </button>
                  <a href="/forgot-password" className="btn-forget">
                    Quên mật khẩu?
                  </a>
                </div>
              </form>
              <div className="other-links">
                <div className="text">Hoặc đăng nhập</div>

                <a href="#" onClick={googleLogin}>
                  <i className="fab fa-google"></i>Google
                </a>
              </div>
              <div className="page-links">
                <a href="/dang-ky">Đăng kí tài khoản mới</a>
              </div>
            </div>
            <div className="form-sent">Form Sent</div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login; 