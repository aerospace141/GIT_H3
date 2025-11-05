import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/user_auth/ProfilePage.css';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ onUpdateProfile }) => {
    const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: ''
  });

  // Fetch user data from API on mount
  useEffect(() => {
    const fetchUserData = async () => {        
      const token = localStorage.getItem('token');

      try {
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `${token}`,
          'X-Device-Id': localStorage.getItem('deviceId')

         }
        }); // Change URL as needed
        setUserData(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          mobileNumber: response.data.mobileNumber
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
  
    try {
      const response = await axios.put(
        'http://localhost:5000/api/user/profile',
        formData, // ✅ send form data as the body
        {
          headers: { Authorization: `${token}` },
          'X-Device-Id': deviceId 
           // ✅ headers go in third argument
        }
      );
      
      setUserData(response.data);
      setEditMode(false);
      onUpdateProfile?.(response.data); // Use updated response data
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  

  if (!userData) return <div>Loading...</div>;
  // const [editMode, setEditMode] = useState(false);
  // const [formData, setFormData] = useState({
  //   firstName: userData.firstName,
  //   lastName: userData.lastName,
  //   email: userData.email,
  //   mobileNumber: userData.mobileNumber
  // });

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: value
  //   }));
  // };

  // const handleSaveProfile = () => {
  //   onUpdateProfile(formData);
  //   setEditMode(false);
  // };

  return (
    <div className="profile-container-P">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate('/setting')}>&lt;</button>
        <h1>Profile</h1>
        {!editMode && (
          <button 
            className="edit-button"
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-avatar">
          <div className="avatar-placeholder">
            {userData.firstName[0] + userData.lastName[0]}
          </div>
        </div>

        <div className="profile-details">
          {editMode ? (
            <>
              <div className="profile-input-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-input-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="profile-edit-buttons">
                <button 
                  className="cancel-button"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleSaveProfile}
                >
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="profile-detail-row">
                <span className="detail-label">First Name</span>
                <span className="detail-value">{userData.firstName}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Last Name</span>
                <span className="detail-value">{userData.lastName}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Email</span>
                <span className="detail-value">{userData.email}</span>
              </div>
              <div className="profile-detail-row">
                <span className="detail-label">Mobile Number</span>
                <span className="detail-value">{userData.mobileNumber}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;