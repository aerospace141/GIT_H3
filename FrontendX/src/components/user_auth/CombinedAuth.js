import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Message from "../ui/alert";
// import "../../style/user_auth/Login.css";
// import "../../style/user_auth/CombinedAuth.css"
import "../../styles/user_auth/login.css"
import "../../styles/user_auth/CombinedAuth.css"  
import HCaptcha from "@hcaptcha/react-hcaptcha";
import emailjs from 'emailjs-com';


const CombinedAuth = () => {
  const [userOtp, setUserOtp] = useState('');
  const [verified, setVerified] = useState(false);

  // const [password, setPassword] = useState("");
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
    // const [message, setMessage] = useState({ type: "", text: "" });
    const [passwordMatch, setPasswordMatch] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recaptchaValue, setRecaptchaValue] = useState(null);
    const [token, setToken] = useState(null);

  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Login, 2: OTP Verification
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Array of 6 empty strings
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const [generatedOtp, setGeneratedOtp] = useState(""); // holds the real OTP (not shown in inputs)


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

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
    
    //   if (!token) {
    //     alert('Please complete the CAPTCHA');
    //     return;
    //   }
    
      // Don't send data to backend yet
      try {
        await sendOtp(); // Generate + send OTP to email
        showMessage("success", "OTP sent to email. Please verify.");
        setStep(2); // Show OTP input
      } catch (err) {
        showMessage("error", "Failed to send OTP.");
      }
    };
    

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();


  const sendOtp = async () => {
    const generatedOtp = generateOtp();
    setGeneratedOtp(generatedOtp); // don't show it in inputs
    setUserOtp(["", "", "", "", "", ""]); // clear user inputs // convert to array of characters

    const templateParams = {
      email: formData.email,
      passcode: generatedOtp
    };

    emailjs.send(
      'service_eujikip',     // Replace
      'template_btttiss',    // Replace
      templateParams,
      'YMx9-O4Luo0IkGjSP'      // Replace
    )
    .then(() => alert('OTP sent to email'),        startResendTimer() // Start the resend timer
  )
    

    .catch(err => alert('Failed to send OTP', err));
  };

  const verifyOtp = async () => {
    const enteredOtp = userOtp.join("");
  
    if (enteredOtp === generatedOtp) {
      setVerified(true);
      try {
        const response = await axios.post("http://localhost:5000/api/signup", {
          ...formData,
          userId: `${formData.firstName}${formData.lastName}${Math.floor(100 + Math.random() * 900)}`.toLowerCase(),
          token,
        });
  
        if (response.status === 200) {
          alert("Email verified and user registered successfully!");
          setTimeout(() => navigate("/signin"), 2000);
        } else {
          showMessage("error", "Something went wrong during registration.");
        }
      } catch (error) {
        showMessage("error", error.response?.data?.error || "Failed to register user.");
      }
    } else {
      alert("Incorrect OTP");
    }
  };
  
  

  const handleOtpChange = (value, index) => {
    if (/^\d*$/.test(value)) {
      const updatedOtp = [...userOtp];
      updatedOtp[index] = value;
      setUserOtp(updatedOtp);
  
      if (value && index < userOtp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };
  

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(""));
      document.getElementById(`otp-input-5`).focus();
    }
  };

  const startResendTimer = () => {
    // setOtp("")
    setIsResendDisabled(true);
    setResendTimer(60);

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="log-body">
       
      
      {step === 1 ? (
        <>
  <div className="auth-container_signup">
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
        <HCaptcha
          sitekey="5802b3c2-cac6-4ae0-b450-107cb7244ace" // ← Replace with your real key
          onVerify={(token) => setToken(token)}
          onExpire={() => setToken(null)}
        />
        {/* <ReCAPTCHA  sitekey="" onChange={setRecaptchaValue}             size="invisible"
 /> */}
        <button type="submit" className="auth-button" disabled={!passwordMatch || loading}>
          {loading ? "Processing..." : "Sign Up"}
        </button>
      </form>
      {/* <div className="auth-toggle">
        <a href="/signin">Already have an account? Login</a>
      </div> */}
    </div>
    <Message type={message.type} text={message.text} />
  </div>
        </>
      ) : (
        <div className="auth-container"> 
        <div className="otp-container">
            <h2>Enter OTP Code</h2>
            <div className="otp-inputs" onPaste={handlePaste} >
              {userOtp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}

                  onKeyDown={(e) => handleKeyDown(e, index)}

                  className="otp-input"
                />
             ))
             }
            </div>
            <button onClick={verifyOtp} className="otp-button">
              Verify OTP
            </button>
            <button
              onClick={sendOtp}
              disabled={isResendDisabled}
              className="otp-resend-button"
            >
              {isResendDisabled
                ? `Resend OTP in ${resendTimer}s`
                : "Resend OTP"}
            </button>
          </div>
        </div>
        )}
        {/* {message.text && (
          <p
            className={`auth-message ${
              message.type === "success" ? "success" : "error"
            }`}
          >
            {message.text}
          </p>
        )} */}
      <Message type={message.type} text={message.text} />
 
    </div>
  );
};

export default CombinedAuth;
