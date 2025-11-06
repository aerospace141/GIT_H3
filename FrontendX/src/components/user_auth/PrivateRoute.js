import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from 'axios';

const PrivateRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const deviceId = localStorage.getItem("deviceId");
    
    if (!token) {
      console.log('No token found, redirecting to signin');
      setIsValidating(false);
      setIsAuthenticated(false);
      return;
    }

    // Set auth header for all requests (without Bearer prefix based on your backend)
    // axios.defaults.headers.common['Authorization'] = token;

    // Validate session on mount
    const validateSession = async () => {

      try {
          const token = localStorage.getItem('token');
const deviceId = localStorage.getItem('deviceId');

        console.log('Validating session with token:', token);
        
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/session-status`, {
      headers: { Authorization: `${token}`,
      'X-Device-Id': deviceId }
    });
        
        console.log('Session validation successful:', response.data);
        setIsAuthenticated(true);
        
        // Update user data in localStorage if needed
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
      } catch (error) {
        console.error('Session validation failed:', error.response?.data || error.message);
        
        // Handle different error scenarios
        if (error.response?.status === 401) {
          console.log('Token invalid or expired, clearing session');
          clearSession();
          setIsAuthenticated(false);
          
          const errorMessage = error.response?.data?.message;
          if (errorMessage && errorMessage !== 'undefined') {
            alert(errorMessage);
          }
        } else if (error.response?.status >= 500) {
          console.error('Server error during validation');
          // For server errors, don't clear session immediately
          setIsAuthenticated(false);
        } else {
          clearSession();
          setIsAuthenticated(false);
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();

    // Check session status every 10 minutes (increased interval)
    const sessionCheckInterval = setInterval(async () => {
      const currentToken = localStorage.getItem('token');
      
      if (!currentToken) {
        clearInterval(sessionCheckInterval);
        setIsAuthenticated(false);
        return;
      }

      try {
          const token = localStorage.getItem('token');
          const deviceId = localStorage.getItem('deviceId');

        await axios.get(`${process.env.REACT_APP_API_BASE_URL}/session-status`, {
      headers: { Authorization: `${token}`,
      'X-Device-Id': deviceId }
    });
        console.log('Periodic session check passed');
      } catch (error) {
        console.error('Periodic session check failed:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          clearSession();
          setIsAuthenticated(false);
          
          const errorMessage = error.response?.data?.message;
          if (errorMessage && errorMessage !== 'undefined' && error.response?.data?.forceLogout) {
            alert(errorMessage);
            window.location.href = '/signin';
          }
        }
      }
    }, 10 * 60 * 100); // 10 minutes

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, []); // Remove token and deviceId from dependency array to prevent infinite loops

  // Setup global axios interceptor for handling forced logouts
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Axios interceptor caught error:', error.response?.data || error.message);
        
        if (error.response?.data?.forceLogout) {
          console.log('Force logout triggered');
          clearSession();
          setIsAuthenticated(false);
          
          const errorMessage = error.response?.data?.message || error.response?.data?.error;
          if (errorMessage && errorMessage !== 'undefined') {
            alert(errorMessage);
          }
          window.location.href = '/signin';
        }
        
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Helper function to clear session data
  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (isValidating) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '10px' }}>Validating session...</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Please wait while we verify your authentication
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/signin" replace />;
};

export default PrivateRoute;