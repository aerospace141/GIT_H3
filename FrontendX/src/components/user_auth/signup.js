import React, { useState, useEffect, useRef } from "react";
// import "../../style/user_auth/Signup.css";
import axios from "axios";

import "../../styles/user_auth/login.css"
import Message from "../ui/alert";
import ReCAPTCHA from "react-google-recaptcha";
import HCaptcha from "@hcaptcha/react-hcaptcha";

const Signup = () => {
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [email, setEmail] = useState("");
  // const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [message, setMessage] = useState({ type: '', text: '' });
  // const [passwordMatch, setPasswordMatch] = useState(null);
  const recaptchaRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [token, setToken] = useState(null);
 

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };
  
  useEffect(() => {
    // Set timeout to remove the message after 5 seconds
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);

    // Clear the timeout when the component unmounts or when message changes
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    // Check if passwords match   
    // 
     if (password !== confirmPassword) {
      console.log("Passwords do not match - Showing error message");
      showMessage("error", "Passwords do not match.");
      return;
    }
    setPasswordMatch(password && confirmPassword && password === confirmPassword);
  }, [password, confirmPassword]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     console.log("Password:", password);
//     console.log("Confirm Password:", confirmPassword);
//     console.log("Match:", password === confirmPassword);
  


//       // Password Validation Rules
//   const passwordRequirements = [
//     { test: /.{8,}/, message: "Password must be at least 8 characters long." },
//     { test: /[A-Z]/, message: "Password must contain at least one uppercase letter." },
//     { test: /[a-z]/, message: "Password must contain at least one lowercase letter." },
//     { test: /[0-9]/, message: "Password must contain at least one number." },
//     { test: /[\W_]/, message: "Password must contain at least one special character." },
//   ];

//   // Check if password meets all requirements
//   for (const rule of passwordRequirements) {
//     if (!rule.test.test(password)) {
//       showMessage("error", rule.message);
//       return; // Stop form submission if the password is invalid
//     }
//   }
    
//   // if (!passwordMatch) {
//   //   showMessage("error", "Passwords do not match.");
//   //   return;
//   // }



//     const generateUniqueId = (firstName, lastName) => {
//       const formattedName = (firstName + lastName).replace(/\s/g, '').toLowerCase();
//       const randomNumber = Math.floor(100 + Math.random() * 900);
//       return `${formattedName}${randomNumber}`;
//     };
    
//     const userId = generateUniqueId(firstName, lastName);

//     const userData = {
//       firstName,
//       lastName,
//       email,
//       mobileNumber,
//       password,
//       userId,
//     };

//     try {
//       const response = await fetch('http://localhost:5000/api/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//       });

//       const responseData = await response.json(); // Always parse response first

//     if (response.ok) {
//       showMessage('success', 'User registered successfully!');
//       setTimeout(() => {
//         window.location.href = "/signin";
//       }, 2000); // Redirect after showing the message
//     } else {
//       showMessage('error', responseData.error || 'Failed to register user.');
//     }
//   } catch (error) {
//     console.error('Signup error:', error);
//     showMessage('error', 'Error during registration. Please try again later.');
//   }
// };

useEffect(() => {
  if (formData.password && formData.confirmPassword) {
    setPasswordMatch(formData.password === formData.confirmPassword);
  }
}, [formData.password, formData.confirmPassword]);

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!passwordMatch) {
    showMessage("error", "Passwords do not match.");
    return;
  }
  // if (!recaptchaValue) {
  //   showMessage("error", "Please complete the CAPTCHA.");
  //   return;
  // }
  
  if (!token) {
    alert('Please complete the CAPTCHA');
    return;
  }

  
  setLoading(true);
  try {
    // const recaptchaToken = await recaptchaRef.current.executeAsync();
    
    const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/signup`, {
      ...formData,
      // recaptchaToken, // Send the token to your backend
      userId: `${formData.firstName}${formData.lastName}${Math.floor(100 + Math.random() * 900)}`.toLowerCase(),
      token,

    });
    if (response.status === 200) {
      showMessage("success", "User registered successfully!");
      setTimeout(() => window.location.href = "/signin", 2000);
    }
  } catch (error) {
    showMessage("error", error.response?.data || "Email already exists");
  }
  setLoading(false);
};

return (
  <div className="auth-container">
    <div className="auth-form">
      <div className="logo">Create Account</div>
      {message.text && (
        <div className={message.type === "error" ? "error-message" : "success-message"}>{message.text}</div>
      )}
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((field) => (
          <div className="form-group" key={field}>
            <input
              type={field.includes("password") ? "password" : "text"}
              className="form-input"
              placeholder={field.replace(/([A-Z])/g, " $1").trim()}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              required
            />
          </div>
        ))}
        {/* <ReCAPTCHA  sitekey="6Lc4pAYrAAAAACOdhs19wnUNpe8MQD_2uzZMcHQY" onChange={setRecaptchaValue}             size="invisible"
 /> */}

        <HCaptcha
          sitekey="5802b3c2-cac6-4ae0-b450-107cb7244ace" // ← Replace with your real key
          onVerify={(token) => setToken(token)}
          onExpire={() => setToken(null)}
        />
        
        <button type="submit" className="auth-button" disabled={!passwordMatch || loading}>
          {loading ? "Processing..." : "Sign Up"}
        </button>
      </form>
      <div className="auth-toggle">
        <a href="/signin">Already have an account? Login</a>
      </div>
    </div>
    <Message type={message.type} text={message.text} />
  </div>
);



//   return (
//     <>
//     <div className="auth-container">
//       <div className="auth-form">
//         {/* <h2>Create Account</h2> */}
//         <div className="logo" style={{fontSize: '18px', marginBottom: '30px'}}>
//         Create Account
//           </div>
        
//         {message.text && (
//           <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
//             {message.text}
//           </div>
//         )}
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <input
//               type="text"
//               className="form-input"
//               placeholder="First Name"
//               value={firstName}
//               onChange={(e) => setFirstName(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="text"
//               className="form-input"
//               placeholder="Last Name"
//               value={lastName}
//               onChange={(e) => setLastName(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="email"
//               className="form-input"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="text"
//               className="form-input"
//               placeholder="Mobile Number"
//               value={mobileNumber}
//               onChange={(e) => setMobileNumber(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="password"
//               className="form-input"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="password"
//               className="form-input"
//               placeholder="Confirm Password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//             />
//           </div>
          
//           <button 
//             type="submit" 
//             className="auth-button"
//             disabled={!passwordMatch}
//           >
//             Sign Up
//           </button>
//         </form>
        
//         <div className="auth-toggle">
//           <a href="/signin">Already have an account? Login</a>
//         </div>
//       </div>

//     </div>            
//     <Message type={message.type} text={message.text} />
// </>
//   );
};

export default Signup;

// import React, { useState, useEffect } from "react";
// // import "../../style/user_auth/Signup.css";
// import "../../styles/user_auth/login.css"

// const Signup = () => {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [passwordMatch, setPasswordMatch] = useState(null);

//   useEffect(() => {
//     // Check if passwords match
//     setPasswordMatch(password && confirmPassword && password === confirmPassword);
//   }, [password, confirmPassword]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!passwordMatch) {
//       setMessage({ type: 'error', text: 'Passwords do not match.' });
//       return;
//     }

//     const generateUniqueId = (firstName, lastName) => {
//       const formattedName = (firstName + lastName).replace(/\s/g, '').toLowerCase();
//       const randomNumber = Math.floor(100 + Math.random() * 900);
//       return `${formattedName}${randomNumber}`;
//     };
    
//     const userId = generateUniqueId(firstName, lastName);

//     const userData = {
//       firstName,
//       lastName,
//       email,
//       mobileNumber,
//       password,
//       userId,
//     };

//     try {
//       const response = await fetch('http://localhost:5000/api/signup', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//       });

//       if (response.ok) {
//         setMessage({ type: 'success', text: 'User registered successfully!' });
//         window.location.href = "/login";
//       } else {
//         const errorData = await response.json();
//         setMessage({ type: "error", text: errorData.message || "Failed to register user." });
//       }
//     } catch (error) {
//       setMessage({ type: 'error', text: 'Error during registration.' });
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-form">
//         {/* <h2>Create Account</h2> */}
//         <div className="logo" style={{fontSize: '18px', marginBottom: '30px'}}>
//         Create Account
//           </div>
        
//         {message.text && (
//           <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
//             {message.text}
//           </div>
//         )}
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <input
//               type="text"
//               className="form-input"
//               placeholder="First Name"
//               value={firstName}
//               onChange={(e) => setFirstName(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="text"
//               className="form-input"
//               placeholder="Last Name"
//               value={lastName}
//               onChange={(e) => setLastName(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="email"
//               className="form-input"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="text"
//               className="form-input"
//               placeholder="Mobile Number"
//               value={mobileNumber}
//               onChange={(e) => setMobileNumber(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="password"
//               className="form-input"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <input
//               type="password"
//               className="form-input"
//               placeholder="Confirm Password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//             />
//           </div>
          
//           <button 
//             type="submit" 
//             className="auth-button"
//             disabled={!passwordMatch}
//           >
//             Sign Up
//           </button>
//         </form>
        
//         <div className="auth-toggle">
//           <a href="/signin">Already have an account? Login</a>
//         </div>
//       </div>
//             {/* <Message type={message.type} text={message.text} /> */}

//     </div>
//   );
// };

// export default Signup;