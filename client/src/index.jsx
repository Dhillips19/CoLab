import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VersionHistoryPage from './pages/VersionHistoryPage';
import DocumentPage from './pages/DocumentPage';
import MyDocumentsPage from './pages/MyDocumentsPage';
import './styles.css';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage/>
  },
  {
    path: "/Register",
    element: <RegisterPage/>
  },
  {
    path: "/",
    element: <HomePage/>
  },
  {
    path: "/document/:documentId",
    element: <DocumentPage/>
  },
  {
    path: "/version-history",
    element: <VersionHistoryPage/>
  },
  {
    path: "/my-documents",
    element: <MyDocumentsPage/>
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);