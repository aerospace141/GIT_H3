import React, { useState, useEffect } from "react";
import "../../styles/user_auth/login.css";
import { useNavigate } from 'react-router-dom';
import Message from "../ui/alert";
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import vendorLogoUrl from '../../styles/logo/logo.jpg';
import vendorInitial from '../../styles/logo/logo.jpg';
// Generate device fingerprint

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);
  
const generateDeviceFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Device fingerprint', 2, 2);
  
  return btoa(
    navigator.userAgent +
    navigator.language +
    window.screen.width + 'x' + window.screen.height +
    new Date().getTimezoneOffset() +
    canvas.toDataURL()
  ).substring(0, 32);
};
    // Setup axios interceptor for automatic logout detection
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.data?.forceLogout) {
          localStorage.removeItem('token');
          localStorage.removeItem('deviceId');
          showMessage('error', error.response.data.message);
          setTimeout(() => {
            window.location.href = '/signin';
          }, 2000);
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const deviceFingerprint = generateDeviceFingerprint();

const loginData = {
  email,
  password,
  deviceFingerprint
};

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const responseData = await response.json();

      if (response.ok) {
        const token = responseData.token;
      const deviceId  = responseData.deviceId;

        if (token && deviceId) {
          showMessage("success", "User SignIn successfully!");

          console.log("Login successful:", responseData);

          console.log("deviceId:", deviceId);
          localStorage.setItem('token', token);

          localStorage.setItem('deviceId', deviceId);

              // Set default authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          showMessage('success', 'Login successful!');
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
   
        }
      } else {
        showMessage('error', responseData.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage('error', 'Error during login. Please try again later.');
      showMessage("error", error.response?.data?.error || "Failed.");

    }
    setLoading(false);
  };

  return (
    <div className="Login_page">
      <div className="auth-container">
        <div className="auth-form">
          {/* Company Logo */}
          <div className="company-logo">
            <div className="logo-circle">
              {/* Brain/Education SVG Icon */}
             {vendorLogoUrl ? (
                           <img src={vendorLogoUrl} alt="Vendor Logo" className="logo-circle" />
                         ) : (
                           <span className="text-white font-bold">{vendorInitial || 'B'}</span>
                         )}
            </div>
          </div>
          
          {/* Company Name */}
          <div className="company-name">
            Brain Development Academy
          </div>



          <form onSubmit={handleSubmit}>
            <div className="form-group">
<input
  type="email"
  className="form-input"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

            </div>

            <div className="form-group">
              <input
                type="password"
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
 
            <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Processing..." : "SIGN IN"}

            </button>
          </form>

          <div className="social-login-container">
                <div className="divider">
                  <span>OR</span>
                </div>             
                {/* <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                try {
                  const { credential } = credentialResponse;

                  // Optional: Decode and see user data
                  const userInfo = jwtDecode(credential);
                  console.log(" Google User:", credential);
                  console.log("Decoded Google User:", userInfo);

                  const res = await fetch("http://localhost:5000/api/auth/google", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: credential }),
                  });

                  const data = await res.json();

                  if (data.success) {
                    localStorage.setItem('token', data.token);
                    window.location.href = '/';
                  } else {
                    showMessage('error', data.error || "Google login failed");
                  }
                } catch (err) {
                  showMessage('error', 'Google login error');
                  console.error(err);
                }
              }}
              onError={() => showMessage('error', 'Google login failed')}
            /> */}
<GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      const { credential } = credentialResponse;
      const deviceFingerprint = generateDeviceFingerprint();

      // Optional: Decode and see user data
      const userInfo = jwtDecode(credential);
      console.log("Google User:", credential);
      console.log("Decoded Google User:", userInfo);

      const res = await fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: credential,
          deviceFingerprint: deviceFingerprint 
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('deviceId', data.deviceId); // Store device ID
        
        // Set default authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        
        showMessage('success', 'Google login successful!');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        showMessage('error', data.error || "Google login failed");
      }
    } catch (err) {
      showMessage('error', 'Google login error');
      console.error(err);
    }
  }}
  onError={() => showMessage('error', 'Google login failed')}
/>
          </div>

          <a href="/forgot-password" className="forgot-password">
            Forgot the password? Click here
          </a>
          {/* <a href="/signup" className="forgot-password">
            SIGN UP
          </a> */}
        </div>
      </div>
      <Message type={message.type} text={message.text} />
    </div>
  );
};

export default Login;
