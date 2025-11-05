// Alert.js
import '../../styles/ui/alert.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation, faCircleExclamation, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

// Message.js
import React, { useEffect } from 'react';

const Message = ({ type, text }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Remove the message after 5 seconds
      // You can adjust the duration as needed
      // setMessage({ type: '', text: '' });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`message ${type}`}>
      {/* Render the appropriate icon based on the type */}
      {type === 'info' && (
        <span className='iconc'>
            <FontAwesomeIcon icon={faTriangleExclamation} style={{color: "#ffffff",}} />
       
        </span>
      )}
      {type === 'error' && (
        <span className='iconc'>
            <FontAwesomeIcon icon={faCircleExclamation} style={{color: "#ffffff",}} />
            </span>
      )}
      {type === 'warning' && (
        <span className='iconc'>
          <FontAwesomeIcon icon={faTriangleExclamation} style={{color: "#ffffff",}} />
          </span>
      )}
      {type === 'success' && (
        <span className='iconc'>
          <FontAwesomeIcon icon={faCircleCheck} style={{color: "#ffffff",}} />
          </span>
      )}
      <p>{text}</p>
    </div>
  );
};

export default Message;







// import 'tailwindcss/base';
// import 'tailwindcss/components';
// import 'tailwindcss/utilities';

// import React from 'react';

// function Message({ type, text }) {
//     console.log('Type:', type);
//   console.log('Text:', text);
// //   const alertClass = `${type} show`;
// let alertClass = "bg-blue-500 text-white"; 

// if (type === "error") {
//   alertClass = "bg-red-500 text-white"; 
// } else if (type === "warning") {
//   alertClass = "bg-yellow-500 text-black"; 
// } else if (type === "success") {
//   alertClass = "bg-green-500 text-white"; 
// }


//   const alerts = {
//     info: {
//       icon: `<svg class="w-6 h-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
//       color: "blue-500"
//     },
//     error: {
//       icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
//       color: "red-500"
//     },
//     warning: {
//       icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
//       color: "yellow-500"
//     },
//     success: {
//       icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
//       color: "green-500"
//     }
//   };

//   console.log('Alert:', alerts[type]);
//   if (!alerts[type]) {
//     console.error(`Invalid alert type: ${type}`);
//     return null;
//   }
// //   const alertStyle = `relative flex items-center bg-${alerts[type].color} text-white text-sm font-bold px-4 py-3 rounded-md opacity-0 transform transition-all duration-500 mb-1`;
// const { icon, color } = alerts[type];


//   return (

//    <div className={`relative flex items-center ${alertClass}`}>
//     <span dangerouslySetInnerHTML={{ __html: icon }} />
  
//       <p>{text}</p>
//       <span>{icon}</span>
//     </div> 
  
//   );
// }

// export default Message;