import React, { useState, useEffect } from 'react';
import '../../styles/user_auth/SettingsPage.css';
import Switch from "../ui/switch";
import Button from "../ui/button";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaBell, FaDownload, FaKey, FaLanguage, FaLock, FaSignOutAlt, FaTrash, FaUser , FaUserShield , FaUserTie , FaUsers , FaUsersCog} from "react-icons/fa";


const SettingsPage = ({ userData, onLogout, onPasswordChange, onAccountDelete }) => {
      const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

  // const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const [password, setPassword] = useState('');
    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  // const handleAccountDelete = async () => {
  const [ Role, SetRole] = useState('');
  const [showStreaks, setShowStreaks] = useState(true);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const API_URL = process.env.REACT_APP_API_BASE_URL;
  
    const handleAccountDelete = async () => {   
       const token = localStorage.getItem('token'); // Retrieve token from local storage
      const deviceId = localStorage.getItem('deviceId');

      try {
        // Step 1: Verify user identity
        const verifyResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/delete/verify`, {
          method: 'POST',
          headers: {
            Authorization: `${token}`,
            'X-Device-Id': deviceId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        });
  
        if (!verifyResponse.ok) {
          throw new Error('Verification failed. Please try again.');
        }
  
        // Step 2: Proceed with account deletion
        const deleteResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/delete`, {
          method: 'DELETE',
          headers: {
            Authorization: `${token}`,
          'X-Device-Id': deviceId, 
          'Content-Type': 'application/json',
          },
        });
  
        if (!deleteResponse.ok) {
          throw new Error('Failed to delete account.');
        }
  
        alert('Account deleted successfully!');
        setIsVerificationModalOpen(false);
        navigate('/goodbye'); // Redirect to goodbye page
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
      }
    };
  

  // };
  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem('token');
  
    // Redirect the user to the login page
    navigate('/signin');
  };

  const handleOpenPasswordUpdate = () => {
    const newTab = window.open('/update-password', '_blank', 'noopener,noreferrer');
    if (!newTab) {
      alert('Please allow pop-ups for this site.');
    }
  
  };

  const handleOpenPasswordPopup = () => {
    const popup = window.open(
      '/update-password',
      'PasswordUpdateWindow',
      'width=500,height=600,left=100,top=100,noopener,noreferrer'
    );
  
    const messageListener = (event) => {
      if (event.origin !== window.location.origin) return; // ensure security
  
      if (event.data === 'password-updated') {
        alert('Password updated successfully!');
      } else if (event.data === 'password-update-cancelled') {
        alert('Password update was cancelled.');
      }
  
      window.removeEventListener('message', messageListener);
      popup?.close();
    };
  
    window.addEventListener('message', messageListener);
  };
  
   useEffect(() => {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
  
      if (!token) {
        navigate('/login');
        return;
      }
  
      // Verify admin/teacher role using your existing auth endpoint
      axios.get(`${API_URL}/auth/verify`, {
        headers: { 
          Authorization: `${token}`,
          'X-Device-Id': deviceId 
        }
      })
      .then(response => {
        SetRole(response.data.role);
        console.log('q1',Role);
        console.log('q2',response.data.role);
        // Check if user has admin/teacher privileges
        // You may need to add a role field to your User model
        if (response.data.role !== 'teacher') {
          // alert('Access denied. Teacher privileges required.');

          return;
        }
      })
      .catch(err => {
        console.error("Authentication error:", err);
        // localStorage.removeItem('token');
        // navigate('/Signin');
      });
    }, [navigate]);

    return (
      <>
      {/* <div className="settings-container">
      <div className="settings-header">
      <button className="back-button-s" onClick={() => navigate('/')}>
            <FaArrowLeft />
          </button>
        <h2 className="settings-title">Settings</h2>
        </div>
        <div className="settings-list">
          <SettingItem icon={<FaLock />} text="Manage Subscription" />
          <div  className='setting-item' onClick={() => navigate('/subscription')}>
            <FaUser />          
            <button className='SettingItem'>Link Organization Subscription</button>
          </div>
        
          <div  className='setting-item' onClick={() => navigate('/profile')}>
            <FaUser />          
            <button className='SettingItem' >Account Settings</button>
          </div>
          <div  className='setting-item'  onClick={handleOpenPasswordPopup}
          >
            <FaKey />          
            <button className='SettingItem' >Change Password</button>
          </div>
          <SettingItem icon={<FaBell />} text="Notifications" />
          <SettingItem  icon={<FaDownload />} text="Downloads" />
          
          <ToggleSetting text="Show Streaks" />
          <ToggleSetting text="Auto-Play Next Movement Session" />
          
          <div  className='setting-item' onClick={() => navigate('/language-settings')}>
            <FaLanguage />          
            <button className='SettingItem'>Change Language</button>
          </div>
          <SettingItem icon={<FaUser />} text="Apple Health" />
          
     

            <button 
              className="settings-button logout-button" 
              onClick={() => setIsLogoutModalOpen(true)} 
              >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>

      {isLogoutModalOpen && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <h2>Logout Account</h2>
            <p>Are you sure you want to Logout your account? This action cannot be undone.</p>
            <div className="delete-modal-buttons">
              <button 
                className="cancel-button"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={handleLogout}
              >
                Logout Account
              </button>
            </div>
          </div>
        </div>
      )}

        <button 
          className="settings-button delete-button" 
          onClick={() => setIsVerificationModalOpen(true)}
        ><FaTrash />
          <span>Delete Account</span>
        </button>



      {isVerificationModalOpen && (
        <div className="verification-modal delete-modal">
          <div className="modal-content delete-modal-content">
            <h2>Verify Your Identity</h2>
            <p>Please enter your password to confirm account deletion:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className="delete-modal-buttons">
              <button onClick={() => setIsVerificationModalOpen(false)}                 className="cancel-button"
              >Cancel</button>
              <button className="confirm-delete-button"
               onClick={handleAccountDelete}>Confirm</button>
            </div> 
          </div>
        </div>
      )}
        </div>

      </div> */}

          <div className="clean-page">
            <div className="clean-header">
              <div className="clean-header-content">
                <div className="clean-flex clean-items-center clean-gap-md">
                  <button className="clean-back-btn" onClick={() => navigate('/')}>
                    <FaArrowLeft />
                    Back
                  </button>
                  <h2 className="clean-title">Settings</h2>
                </div>
              </div>
            </div>
      
            <div className="clean-content">
              <div className="clean-container">
                
                {/* Account Section */}
                <div className="clean-section">
                  <div className="clean-section-header">
                    <h3 className="clean-section-title">Account & Security</h3>
                    <p className="clean-section-description">Manage your account settings and security preferences</p>
                  </div>
                  
                  <div className="clean-list">
                    <div className="clean-list-item" onClick={() => navigate('/subscription')}>
                      <div className="clean-list-item-icon">
                        <FaUserShield />
                      </div>
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Manage Subscription</h4>
                        <p className="clean-list-item-description">View and manage your current subscription plan</p>
                      </div>
                      <div className="clean-list-item-action">
                        →
                      </div>
                    </div>
      
                    {/* <div className="clean-list-item" onClick={() => navigate('/subscription')}>
                      <div className="clean-list-item-icon">
                        <FaUser />
                      </div>
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Link Organization Subscription</h4>
                        <p className="clean-list-item-description">Connect to your school or organization account</p>
                      </div>
                      <div className="clean-list-item-action">
                        →
                      </div>
                    </div> */}
      
                    <div className="clean-list-item" 
                    // onClick={() => window.open('/update-password', '_blank', 'noopener,noreferrer')}
                    onClick={() => navigate('/profile')}
                    >
                      <div className="clean-list-item-icon">
                        <FaUsersCog />
                      </div>
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Account Settings</h4>
                        <p className="clean-list-item-description">Update your personal information and preferences</p>
                      </div>
                      <div className="clean-list-item-action">
                        →
                      </div>
                    </div>
      
                    <div className="clean-list-item" onClick={handleOpenPasswordPopup}>
                      <div className="clean-list-item-icon">
                        <FaKey />
                      </div>
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Change Password</h4>
                        <p className="clean-list-item-description">Update your account password</p>
                      </div>
                      <div className="clean-list-item-action">
                        →
                      </div>
                    </div>
      { Role === 'teacher' &&
                    <div className="clean-list-item" onClick={() => navigate('/admin')}>
                      <div className="clean-list-item-icon">
                        <FaUsers />
                      </div>
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Superior Admin</h4>
                        <p className="clean-list-item-description">Welcome to the Superior ✨Admin section💮</p>
                      </div>
                      <div className="clean-list-item-action">
                        →
                      </div>
                    </div>
       }
      
                  </div>
                </div>
      
                {/* Preferences Section */}
                <div className="clean-section">
                  <div className="clean-section-header">
                    <h3 className="clean-section-title">Preferences</h3>
                    <p className="clean-section-description">Customize your app experience</p>
                  </div>
                  
                  <div className="clean-list">

                    <div className="clean-list-item" onClick={() => navigate('/announcements')}>
                      <div className="clean-list-item-icon">
                        <FaBell />
                      </div>
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Notifications</h4>
                        <p className="clean-list-item-description">Manage your notification preferences</p>
                      </div>
                      <div className="clean-list-item-action">
                        →
                      </div>
                    </div>
      
                    <div className="clean-list-item">
                      <div className="clean-list-item-icon">
                        <FaDownload />
                      </div>
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Downloads</h4>
                        <p className="clean-list-item-description">Manage downloaded content</p>
                      </div>
                      <div className="clean-list-item-action">
                        →
                      </div>
                    </div>
      
                    <div className="clean-list-item"  onClick={() => navigate('/language-settings')}>
                      <div className="clean-list-item-icon">
                        <FaLanguage />
                      </div>
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Change Language</h4>
                        <p className="clean-list-item-description">Select your preferred language</p>
                      </div>
                      <div className="clean-list-item-action">
                        →
                      </div>
                    </div>
      
                    {/* <div className="clean-list-item">
                      <div className="clean-list-item-icon">
                        <FaUser />
                      </div>
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Apple Health</h4>
                        <p className="clean-list-item-description">Connect with Apple Health app</p>
                      </div>
                      <div className="clean-list-item-action">
                        →
                      </div>
                    </div> */}
                  </div>
                </div>
      
                {/* App Behavior Section */}
                <div className="clean-section">
                  <div className="clean-section-header">
                    <h3 className="clean-section-title">App Behavior</h3>
                    <p className="clean-section-description">Control how the app behaves</p>
                  </div>
                  
                  <div className="clean-list">
                    <div className="clean-list-item">
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Show Streaks</h4>
                        <p className="clean-list-item-description">Display daily streak counters</p>
                      </div>
                      <div className="clean-toggle">
                        <input 
                          type="checkbox" 
                          checked={showStreaks}
                          onChange={(e) => setShowStreaks(e.target.checked)}
                        />
                        <span className="clean-toggle-slider"></span>
                      </div>
                    </div>
      
                    <div className="clean-list-item">
                      <div className="clean-list-item-content">
                        <h4 className="clean-list-item-title">Auto-Play Next Movement Session</h4>
                        <p className="clean-list-item-description">Automatically start the next session</p>
                      </div>
                      <div className="clean-toggle">
                        <input 
                          type="checkbox" 
                          checked={autoPlayNext}
                          onChange={(e) => setAutoPlayNext(e.target.checked)}
                        />
                        <span className="clean-toggle-slider"></span>
                      </div>
                    </div>
                  </div>
                </div>
      
                {/* Account Actions Section */}
                <div className="clean-section">
                  <div className="clean-section-header">
                    <h3 className="clean-section-title">Account Actions</h3>
                    <p className="clean-section-description">Account management options</p>
                  </div>
                  
                  <div className="clean-flex clean-gap-md">
                    <button 
                      className="clean-btn clean-btn-outline clean-btn-full"
                      onClick={() => setIsLogoutModalOpen(true)}
                      style={{color: 'var(--warning-color)', borderColor: 'var(--warning-color)'}}
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
      
                    <button 
                      className="clean-btn clean-btn-outline clean-btn-full"
                      onClick={() => setIsVerificationModalOpen(true)}
                      style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}
                    >
                      <FaTrash />
                      Delete Account
                    </button>
                  </div>
                </div>
      
              </div>
            </div>
      
            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
              <div className="clean-modal-overlay">
                <div className="clean-modal">
                  <div className="clean-modal-header">
                    <h3 className="clean-modal-title">Confirm Logout</h3>
                  </div>
                  <div className="clean-modal-body">
                    <p className="clean-text-secondary">Are you sure you want to logout? You'll need to sign in again to access your account.</p>
                  </div>
                  <div className="clean-modal-footer">
                    <button 
                      className="clean-btn clean-btn-secondary"
                      onClick={() => setIsLogoutModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="clean-btn clean-btn-primary"
                      onClick={handleLogout}
                      style={{background: 'var(--warning-color)'}}
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
      
            {/* Account Deletion Verification Modal */}
            {isVerificationModalOpen && (
              <div className="clean-modal-overlay">
                <div className="clean-modal">
                  <div className="clean-modal-header">
                    <h3 className="clean-modal-title">Delete Account</h3>
                  </div>
                  <div className="clean-modal-body">
                    <div className="clean-alert clean-alert-error clean-mb-lg">
                      <FaTrash />
                      <div>
                        <strong>Warning: This action cannot be undone!</strong>
                        <br />
                        All your data, progress, and achievements will be permanently deleted.
                      </div>
                    </div>
                    
                    <p className="clean-text-secondary clean-mb-lg">
                      Please enter your password to confirm account deletion:
                    </p>
                    
                    <div className="clean-form-group">
                      <label className="clean-label clean-label-required">Current Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="clean-input"
                      />
                    </div>
                  </div>
                  <div className="clean-modal-footer">
                    <button 
                      className="clean-btn clean-btn-secondary"
                      onClick={() => setIsVerificationModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="clean-btn clean-btn-danger"
                      onClick={handleAccountDelete}
                      disabled={!password}
                    >
                      <FaTrash />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* <div className="mpd-footer bg-slate-800 p-4 fixed bottom-0 w-full flex justify-around border-t border-slate-700">
        <button className="mpd-nav-btn flex flex-col items-center" onClick={() => navigate('/')} >
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1 text-slate-400">Home</span>
        </button>
        <button className="mpd-nav-btn flex flex-col items-center" onClick={() => navigate('/play')}>
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs mt-1 text-slate-400">Play</span>
        </button>
        <button className="mpd-nav-btn flex flex-col items-center"           onClick={() => navigate('/')}>
          <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs mt-1 text-slate-400">Stats</span>
        </button>
        <button className="mpd-nav-btn flex flex-col items-center">
          <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs mt-1 text-purple-500 font-bold"onClick={() => setActiveTab('Setting')}>Settings</span>
        </button>
      </div> */}
      </>
    );
  };
  
  const SettingItem = ({ icon, text }) => (
    <div className="setting-item">
      {icon}
      <span>{text}</span>
    </div>
  );
  
  const ToggleSetting = ({ text }) => (
    <div className="toggle-setting">
      <span>{text}</span>
      <Switch defaultChecked />
    </div>
  );
  
  export default SettingsPage;
  