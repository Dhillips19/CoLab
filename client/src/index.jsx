import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Version_History from './pages/version_history';
import Document from './pages/document'

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login/>
  },
  {
    path: "/home",
    element: <Home/>
  },
  {
    path: "/",
    element: <Document/>
  },
  {
    path: "/version_history",
    element: <Version_History/>
  }
])

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);