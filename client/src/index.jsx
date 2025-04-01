// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
// import VersionHistoryPage from './pages/VersionHistoryPage';
// import DocumentPage from './pages/DocumentPage';
// import './styles.css';

// // Authentication check function
// const isAuthenticated = () => {
//   return localStorage.getItem("token") !== null;
// };

// // Protected Route component
// const ProtectedRoute = ({ children }) => {
//   if (!isAuthenticated()) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };

// const router = createBrowserRouter([
//   {
//     path: "/login",
//     element: <LoginPage/>
//   },
//   {
//     path: "/register",
//     element: <RegisterPage/>
//   },
//   {
//     path: "/change-password",
//     element: 
//       <ProtectedRoute>
//         <ChangePasswordPage/>
//       </ProtectedRoute>
//   },
//   {
//     path: "/",
//     element: 
//       <ProtectedRoute>
//         <HomePage/>
//       </ProtectedRoute>
//   },
//   {
//     path: "/document/:documentId",
//     element: 
//       <ProtectedRoute>
//         <DocumentPage/>
//       </ProtectedRoute>
//   },
//   {
//     path: "/version-history",
//     element: 
//       <ProtectedRoute>
//         <VersionHistoryPage/>
//       </ProtectedRoute>
//   },
// ])

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <RouterProvider router={router}/>
//   </React.StrictMode>
// );

// import React, { useEffect } from 'react';
// import ReactDOM from 'react-dom/client';
// import { 
//   createBrowserRouter, 
//   RouterProvider, 
//   Navigate,
//   useNavigate
// } from 'react-router-dom';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
// import VersionHistoryPage from './pages/VersionHistoryPage';
// import DocumentPage from './pages/DocumentPage';
// import './styles.css';

// // Authentication check function that validates token
// const isAuthenticated = () => {
//   const token = localStorage.getItem("token");
  
//   if (!token) {
//     return false;
//   }
  
//   try {
//     // Basic JWT structure validation
//     const parts = token.split('.');
//     if (parts.length !== 3) {
//       localStorage.removeItem("token");
//       return false;
//     }
    
//     return true;
//   } catch (error) {
//     localStorage.removeItem("token");
//     return false;
//   }
// };

// // Protected Route component
// const ProtectedRoute = ({ element }) => {
//   return isAuthenticated() ? element : <Navigate to="/login" replace />;
// };

// const router = createBrowserRouter([
//   {
//     path: "/login",
//     element: <LoginPage/>
//   },
//   {
//     path: "/register",
//     element: <RegisterPage/>
//   },
//   {
//     path: "/change-password",
//     element: <ProtectedRoute element={<ChangePasswordPage/>} />
//   },
//   {
//     path: "/",
//     element: <ProtectedRoute element={<HomePage/>} />
//   },
//   {
//     path: "/document/:documentId",
//     element: <ProtectedRoute element={<DocumentPage/>} />
//   },
//   {
//     path: "/version-history",
//     element: <ProtectedRoute element={<VersionHistoryPage/>} />
//   },
// ]);

// // Initial token check on page load
// const Root = () => {
//   useEffect(() => {
//     // Check if token exists and redirect if needed
//     if (!isAuthenticated() && 
//         window.location.pathname !== '/login' && 
//         window.location.pathname !== '/register') {
//       window.location.href = '/login';
//     }
//   }, []);
  
//   return (
//     <RouterProvider router={router} />
//   );
// };

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <Root />
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  // </React.StrictMode>
);