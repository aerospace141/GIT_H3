import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Eye, 
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  Download,
  Mail,
  User,
  Key,
  School,
  X
} from 'lucide-react';

import "../../styles/admin/Universel_clean.css"

const StudentRegistration = ({ onClose, onStudentCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    class: '',
    mobile: '', // Add this
    section: '',
    password: '',
    confirmPassword: '',
    generatePassword: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdStudent, setCreatedStudent] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        ...(name === 'generatePassword' && checked ? { password: generateRandomPassword() } : {})
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear errors when user starts typing
    if (error) setError('');
  };

  // Generate new password
  const handleGeneratePassword = () => {
    const newPassword = generateRandomPassword();
    setFormData(prev => ({
      ...prev,
      password: newPassword,
      confirmPassword: newPassword
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Student name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.studentId.trim()) {
      setError('Student ID is required');
      return false;
    }
    
    if (!formData.class.trim()) {
      setError('Class is required');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
        if (!formData.mobile.trim()) {
      setError('Mobile number is required');
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
        
    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
          'X-Device-Id': deviceId
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          studentId: formData.studentId,
          class: formData.class,
          section: formData.section,
            mobile: formData.mobile, // Add this

          password: formData.password,
          role: 'student'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create student');
      }

      setCreatedStudent({
        ...data.student,
        password: formData.password // Include password for credentials display
      });
      setSuccess('Student account created successfully!');
      
      // Call parent callback if provided
      if (onStudentCreated) {
        onStudentCreated(data.student);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy credentials to clipboard
  const copyCredentials = async () => {
    if (!createdStudent) return;
    
    const credentials = `Student Login Credentials\n\nName: ${createdStudent.name}\nStudent ID: ${createdStudent.studentId}\nEmail: ${createdStudent.email}\nPassword: ${createdStudent.password}\n\nLogin URL: ${window.location.origin}/signin`;
    
    try {
      await navigator.clipboard.writeText(credentials);
      setCopyStatus('Credentials copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 3000);
    } catch (err) {
      setCopyStatus('Failed to copy credentials');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  // Download credentials as text file
  const downloadCredentials = () => {
    if (!createdStudent) return;
    
    const credentials = `Student Login Credentials

Name: ${createdStudent.name}
Student ID: ${createdStudent.studentId}
Email: ${createdStudent.email}
Mobile: ${createdStudent.mobile}
Password: ${createdStudent.password}
Class: ${createdStudent.class}${createdStudent.section ? ` - ${createdStudent.section}` : ''}

Login URL: ${window.location.origin}/login

Please keep these credentials secure and share them only with the student.
`;

    const blob = new Blob([credentials], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${createdStudent.studentId}_credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
  name: '',
  email: '',
  studentId: '',
  class: '',
  section: '',
  mobile: '', // Add this
  password: '',
  confirmPassword: '',
  generatePassword: true
});
    setCreatedStudent(null);
    setSuccess('');
    setError('');
  };

  // If student was created successfully, show credentials
  if (createdStudent) {
    return (
      <div className="clean-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="clean-modal">
          <div className="clean-modal-header">
            <div className="clean-flex clean-items-center clean-gap-md">
              <div className="clean-avatar clean-avatar-sm clean-bg-success clean-text-success">
                <CheckCircle size={20} />
              </div>
              <div>
                <h3 className="clean-modal-title">Student Account Created!</h3>
                <p className="clean-text-secondary clean-text-sm clean-mt-xs">
                  Please save these credentials and share them with the student.
                </p>
              </div>
            </div>
            <button className="clean-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="clean-modal-body">
            <div className="clean-card clean-bg-secondary clean-border-0">
              <h4 className="clean-font-semibold clean-text-primary clean-mb-md">Login Credentials</h4>
              <div className="clean-list">
                <div className="clean-flex clean-justify-between clean-py-sm">
                  <span className="clean-font-medium clean-text-secondary">Name:</span>
                  <span className="clean-text-primary">{createdStudent.name}</span>
                </div>
                <div className="clean-flex clean-justify-between clean-py-sm">
                  <span className="clean-font-medium clean-text-secondary">Student ID:</span>
                  <span className="clean-text-primary">{createdStudent.studentId}</span>
                </div>
                <div className="clean-flex clean-justify-between clean-py-sm">
                  <span className="clean-font-medium clean-text-secondary">Email:</span>
                  <span className="clean-text-primary">{createdStudent.email}</span>
                </div>
                <div className="clean-flex clean-justify-between clean-py-sm">
                  <span className="clean-font-medium clean-text-secondary">Mobile:</span>
                  <span className="clean-text-primary">{createdStudent.mobile}</span>
                </div>
                <div className="clean-flex clean-justify-between clean-py-sm">
                  <span className="clean-font-medium clean-text-secondary">Password:</span>
                  <span className="clean-text-primary clean-bg-tertiary clean-px-sm clean-py-xs clean-rounded" style={{fontFamily: 'monospace'}}>
                    {createdStudent.password}
                  </span>
                </div>
                <div className="clean-flex clean-justify-between clean-py-sm">
                  <span className="clean-font-medium clean-text-secondary">Class:</span>
                  <span className="clean-text-primary">
                    {createdStudent.class}{createdStudent.section ? ` - ${createdStudent.section}` : ''}
                  </span>
                </div>
              </div>
            </div>

            {copyStatus && (
              <div className="clean-alert clean-alert-info clean-mt-lg">
                {copyStatus}
              </div>
            )}
          </div>

          <div className="clean-modal-footer">
            <button
              onClick={copyCredentials}
              className="clean-btn clean-btn-primary"
            >
              <Copy size={16} />
              Copy Credentials
            </button>
            <button
              onClick={downloadCredentials}
              className="clean-btn clean-btn-success"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={resetForm}
              className="clean-btn clean-btn-secondary"
            >
              Create Another
            </button>
            <button
              onClick={onClose}
              className="clean-btn clean-btn-outline"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="clean-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="clean-modal">
        <div className="clean-modal-header">
          <h3 className="clean-modal-title">Create Student Account</h3>
          <button className="clean-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="clean-modal-body">
          {error && (
            <div className="clean-alert clean-alert-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="clean-form">
            {/* Student Name */}
            <div className="clean-form-group">
              <label className="clean-label clean-label-required">
                <User size={16} />
                Student Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="clean-input"
                placeholder="Enter student's full name"
                required
              />
            </div>

            {/* Student ID */}
            <div className="clean-form-group">
              <label className="clean-label clean-label-required">
                <School size={16} />
                Student ID
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className="clean-input"
                placeholder="Enter unique student ID"
                required
              />
            </div>

            {/* Email */}
            <div className="clean-form-group">
              <label className="clean-label clean-label-required">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="clean-input"
                placeholder="Enter email address"
                required
              />
            </div>

            {/* Mobile Number */}
            <div className="clean-form-group">
              <label className="clean-label clean-label-required">
                <Mail size={16} />
                Mobile Number
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="clean-input"
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                required
              />
            </div>

            {/* Class and Section */}
            <div className="clean-flex clean-gap-md">
              <div className="clean-form-group" style={{flex: 1}}>
                <label className="clean-label clean-label-required">Class</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  className="clean-select"
                  required
                >
                  <option value="">Select Class</option>
                  <option value="1">Class 1</option>
                  <option value="2">Class 2</option>
                  <option value="3">Class 3</option>
                  <option value="4">Class 4</option>
                  <option value="5">Class 5</option>
                  <option value="6">Class 6</option>
                  <option value="7">Class 7</option>
                  <option value="8">Class 8</option>
                  <option value="9">Class 9</option>
                  <option value="10">Class 10</option>
                </select>
              </div>
              <div className="clean-form-group" style={{flex: 1}}>
                <label className="clean-label">Section</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className="clean-select"
                >
                  <option value="">Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>
              </div>
            </div>

            {/* Password Generation Option */}
            <div className="clean-flex clean-items-center clean-gap-md">
              <div className="clean-checkbox">
                <input
                  type="checkbox"
                  id="generatePassword"
                  name="generatePassword"
                  checked={formData.generatePassword}
                  onChange={handleInputChange}
                />
                <label htmlFor="generatePassword" className="clean-text-sm clean-font-medium">
                  Auto-generate secure password
                </label>
              </div>
              {formData.generatePassword && (
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="clean-btn clean-btn-ghost clean-btn-sm"
                >
                  Generate New
                </button>
              )}
            </div>

            {/* Password Field */}
            <div className="clean-form-group">
              <label className="clean-label clean-label-required">
                <Key size={16} />
                Password
              </label>
              <div className="clean-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={formData.generatePassword}
                  className="clean-input"
                  placeholder="Enter password (min 6 characters)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="clean-input-action"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            {!formData.generatePassword && (
              <div className="clean-form-group">
                <label className="clean-label clean-label-required">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="clean-input"
                  placeholder="Confirm password"
                  required
                />
              </div>
            )}
          </form>
        </div>

        <div className="clean-modal-footer">
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="clean-btn clean-btn-primary clean-btn-full"
          >
            {loading ? (
              <>
                <div className="clean-spinner" style={{width: '16px', height: '16px', border: '2px solid currentColor', borderTop: '2px solid transparent'}}></div>
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Student
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="clean-btn clean-btn-secondary clean-btn-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistration;
// import React, { useState } from 'react';
// import { 
//   Users, 
//   Plus, 
//   Eye, 
//   EyeOff,
//   Copy,
//   CheckCircle,
//   AlertCircle,
//   Download,
//   Mail,
//   User,
//   Key,
//   School
// } from 'lucide-react';

// const StudentRegistration = ({ onClose, onStudentCreated }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     studentId: '',
//     class: '',
//     section: '',
//     password: '',
//     confirmPassword: '',
//     generatePassword: true
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [createdStudent, setCreatedStudent] = useState(null);
//   const [copyStatus, setCopyStatus] = useState('');

//   // Generate random password
//   const generateRandomPassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let password = '';
//     for (let i = 0; i < 8; i++) {
//       password += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return password;
//   };

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
    
//     if (type === 'checkbox') {
//       setFormData(prev => ({
//         ...prev,
//         [name]: checked,
//         ...(name === 'generatePassword' && checked ? { password: generateRandomPassword() } : {})
//       }));
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
    
//     // Clear errors when user starts typing
//     if (error) setError('');
//   };

//   // Generate new password
//   const handleGeneratePassword = () => {
//     const newPassword = generateRandomPassword();
//     setFormData(prev => ({
//       ...prev,
//       password: newPassword,
//       confirmPassword: newPassword
//     }));
//   };

//   // Validate form
//   const validateForm = () => {
//     if (!formData.name.trim()) {
//       setError('Student name is required');
//       return false;
//     }
    
//     if (!formData.email.trim()) {
//       setError('Email is required');
//       return false;
//     }
    
//     if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       setError('Please enter a valid email address');
//       return false;
//     }
    
//     if (!formData.studentId.trim()) {
//       setError('Student ID is required');
//       return false;
//     }
    
//     if (!formData.class.trim()) {
//       setError('Class is required');
//       return false;
//     }
    
//     if (!formData.password) {
//       setError('Password is required');
//       return false;
//     }
    
//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters long');
//       return false;
//     }
    
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       return false;
//     }
    
//     return true;
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     try {
//       const token = localStorage.getItem('token');
//       const deviceId = localStorage.getItem('deviceId');
      
//       const response = await fetch('http://localhost:5000/api/admin/students', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': token,
//           'X-Device-Id': deviceId
//         },
//         body: JSON.stringify({
//           name: formData.name,
//           email: formData.email,
//           studentId: formData.studentId,
//           class: formData.class,
//           section: formData.section,
//           password: formData.password,
//           role: 'student'
//         })
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to create student');
//       }

//       setCreatedStudent({
//         ...data.student,
//         password: formData.password // Include password for credentials display
//       });
//       setSuccess('Student account created successfully!');
      
//       // Call parent callback if provided
//       if (onStudentCreated) {
//         onStudentCreated(data.student);
//       }
      
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Copy credentials to clipboard
//   const copyCredentials = async () => {
//     if (!createdStudent) return;
    
//     const credentials = `Student Login Credentials\n\nName: ${createdStudent.name}\nStudent ID: ${createdStudent.studentId}\nEmail: ${createdStudent.email}\nPassword: ${createdStudent.password}\n\nLogin URL: ${window.location.origin}/login`;
    
//     try {
//       await navigator.clipboard.writeText(credentials);
//       setCopyStatus('Credentials copied to clipboard!');
//       setTimeout(() => setCopyStatus(''), 3000);
//     } catch (err) {
//       setCopyStatus('Failed to copy credentials');
//       setTimeout(() => setCopyStatus(''), 3000);
//     }
//   };

//   // Download credentials as text file
//   const downloadCredentials = () => {
//     if (!createdStudent) return;
    
//     const credentials = `Student Login Credentials

// Name: ${createdStudent.name}
// Student ID: ${createdStudent.studentId}
// Email: ${createdStudent.email}
// Password: ${createdStudent.password}
// Class: ${createdStudent.class}${createdStudent.section ? ` - ${createdStudent.section}` : ''}

// Login URL: ${window.location.origin}/login

// Please keep these credentials secure and share them only with the student.
// `;

//     const blob = new Blob([credentials], { type: 'text/plain' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${createdStudent.studentId}_credentials.txt`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       name: '',
//       email: '',
//       studentId: '',
//       class: '',
//       section: '',
//       password: '',
//       confirmPassword: '',
//       generatePassword: true
//     });
//     setCreatedStudent(null);
//     setSuccess('');
//     setError('');
//   };

//   // If student was created successfully, show credentials
//   if (createdStudent) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-90vh overflow-y-auto">
//           <div className="text-center mb-6">
//             <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
//               <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
//               Student Account Created!
//             </h3>
//             <p className="text-sm text-gray-600 dark:text-gray-400">
//               Please save these credentials and share them with the student.
//             </p>
//           </div>

//           <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
//             <h4 className="font-medium text-gray-900 dark:text-white mb-3">Login Credentials</h4>
//             <div className="space-y-2 text-sm">
//               <div>
//                 <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
//                 <span className="ml-2 text-gray-900 dark:text-white">{createdStudent.name}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700 dark:text-gray-300">Student ID:</span>
//                 <span className="ml-2 text-gray-900 dark:text-white">{createdStudent.studentId}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700 dark:text-gray-300">Email:</span>
//                 <span className="ml-2 text-gray-900 dark:text-white">{createdStudent.email}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700 dark:text-gray-300">Password:</span>
//                 <span className="ml-2 font-mono text-gray-900 dark:text-white bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
//                   {createdStudent.password}
//                 </span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700 dark:text-gray-300">Class:</span>
//                 <span className="ml-2 text-gray-900 dark:text-white">
//                   {createdStudent.class}{createdStudent.section ? ` - ${createdStudent.section}` : ''}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {copyStatus && (
//             <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
//               {copyStatus}
//             </div>
//           )}

//           <div className="flex gap-3 mb-4">
//             <button
//               onClick={copyCredentials}
//               className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
//             >
//               <Copy size={16} />
//               Copy Credentials
//             </button>
//             <button
//               onClick={downloadCredentials}
//               className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
//             >
//               <Download size={16} />
//               Download
//             </button>
//           </div>

//           <div className="flex gap-3">
//             <button
//               onClick={resetForm}
//               className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
//             >
//               Create Another
//             </button>
//             <button
//               onClick={onClose}
//               className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-90vh overflow-y-auto">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//             Create Student Account
//           </h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//           >
//             ×
//           </button>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
//             <AlertCircle size={16} />
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Student Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               <User size={16} className="inline mr-2" />
//               Student Name *
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               placeholder="Enter student's full name"
//               required
//             />
//           </div>

//           {/* Student ID */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               <School size={16} className="inline mr-2" />
//               Student ID *
//             </label>
//             <input
//               type="text"
//               name="studentId"
//               value={formData.studentId}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               placeholder="Enter unique student ID"
//               required
//             />
//           </div>

//           {/* Email */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               <Mail size={16} className="inline mr-2" />
//               Email Address *
//             </label>
//             <input
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               placeholder="Enter email address"
//               required
//             />
//           </div>

//           {/* Class and Section */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Class *
//               </label>
//               <select
//                 name="class"
//                 value={formData.class}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 required
//               >
//                 <option value="">Select Class</option>
//                 <option value="1">Class 1</option>
//                 <option value="2">Class 2</option>
//                 <option value="3">Class 3</option>
//                 <option value="4">Class 4</option>
//                 <option value="5">Class 5</option>
//                 <option value="6">Class 6</option>
//                 <option value="7">Class 7</option>
//                 <option value="8">Class 8</option>
//                 <option value="9">Class 9</option>
//                 <option value="10">Class 10</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Section
//               </label>
//               <select
//                 name="section"
//                 value={formData.section}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//               >
//                 <option value="">Select Section</option>
//                 <option value="A">Section A</option>
//                 <option value="B">Section B</option>
//                 <option value="C">Section C</option>
//                 <option value="D">Section D</option>
//               </select>
//             </div>
//           </div>

//           {/* Password Generation Option */}
//           <div className="flex items-center gap-3">
//             <input
//               type="checkbox"
//               id="generatePassword"
//               name="generatePassword"
//               checked={formData.generatePassword}
//               onChange={handleInputChange}
//               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
//             />
//             <label htmlFor="generatePassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
//               Auto-generate secure password
//             </label>
//             {formData.generatePassword && (
//               <button
//                 type="button"
//                 onClick={handleGeneratePassword}
//                 className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
//               >
//                 Generate New
//               </button>
//             )}
//           </div>

//           {/* Password Field */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               <Key size={16} className="inline mr-2" />
//               Password *
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 disabled={formData.generatePassword}
//                 className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
//                 placeholder="Enter password (min 6 characters)"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//               >
//                 {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//               </button>
//             </div>
//           </div>

//           {/* Confirm Password */}
//           {!formData.generatePassword && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Confirm Password *
//               </label>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
//                 placeholder="Confirm password"
//                 required
//               />
//             </div>
//           )}

//           {/* Submit Buttons */}
//           <div className="flex gap-3 mt-6">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Plus size={16} />
//                   Create Student
//                 </>
//               )}
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={loading}
//               className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default StudentRegistration;