import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/user_auth/PrivateRoute";
import { GoogleOAuthProvider } from '@react-oauth/google';

import CombinedAuth from "./components/user_auth/signup";
import SignIn from "./components/user_auth/GoogleLogin";
import Dashboard from "./components/home/Deshboard";
// import App1 from "./components/SetUp_State/index11";
import App1 from "./components/home/index_x";
import App2 from "./components/ui/index8";

import Setting from "./components/user_auth/SettingsPage";
import Profile from "./components/user_auth/ProfilePage";
import Updatepassword from "./components/setting/update-password";
import LanguageSettingsPage from "./components/setting/LanguageSettingsPage"
import Subscription from "./components/setting/PricingPage"
import GL from "./components/user_auth/GoogleLogin" 
import SignUp from "./components/user_auth/CombinedAuth";

import AdminDashboard from "./components/admin/AdminDashboard ";
import StudentTest from "./components/admin/StudentTestComponent ";
import StudentRewards from "./components/rewards_notification/StudentRewards";
import Announcement from "./components/rewards_notification/StudentAnnouncements";
import ThreeGames from "./components/home/8GP";

export default function App() {

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/signup" element={<SignUp />} /> */}
        <Route path="/signin" element={
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>              <SignIn />
            </GoogleOAuthProvider>

          } />
                  <Route path="/ca" element={<CombinedAuth />} />


        {/* Private Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/play"
          element={
            <PrivateRoute>
              <App1 />
            </PrivateRoute>
          }
        />
        <Route
          path="/play2"
          element={
            <PrivateRoute>
              <App2 />
            </PrivateRoute>
          }
        />
        <Route
          path="/setting"
          element={
            <PrivateRoute>
              <Setting />
            </PrivateRoute>
          }
        />
         <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      <Route
          path="/update-password"
          element={
            <PrivateRoute>
              <Updatepassword />
            </PrivateRoute>
          }
        />
              <Route
          path="/language-settings"
          element={
            <PrivateRoute>
              <LanguageSettingsPage  />
            </PrivateRoute>
          }
        />
           <Route
        path="/subscription"
        element={
          <PrivateRoute>
            <Subscription  />
          </PrivateRoute>
        }
      />
        <Route
        path="/gl"
        element={
          // <PrivateRoute>      
<GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>

            <GL  />
                  </GoogleOAuthProvider>
          // </PrivateRoute>
        }
      />

            <Route
          path="/admin"
          element={
            <PrivateRoute>
              < AdminDashboard/>
            </PrivateRoute>
          }
        />

        <Route
          path="/test"
          element={
            <PrivateRoute>
              <StudentTest />
            </PrivateRoute>
          }
        />
                <Route
          path="/StudentRewards"
          element={
            <PrivateRoute>
              <StudentRewards />
            </PrivateRoute>
          }
        />
        <Route path="/announcements" element={
            <PrivateRoute>
              <Announcement/>
            </PrivateRoute>
        }
        />

                <Route path="/xtra_creation" element={<ThreeGames />} />

      </Routes>
    </Router>
  );
}
