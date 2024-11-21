import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Version from './pages/versionHistory';
import Document from './pages/document';
import MyDocuments from './pages/myDocuments';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login/>
  },
  {
    path: "/",
    element: <Home/>
  },
  {
    path: "/document/:documentId",
    element: <Document/>
  },
  {
    path: "/version-history",
    element: <Version/>
  },
  {
    path: "/my-documents",
    element: <MyDocuments/>
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);