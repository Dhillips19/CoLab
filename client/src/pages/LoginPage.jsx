import React from 'react'
import NavBar from '../components/NavBar';
import Login from '../components/LoginRegister/Login';

const LoginPage = () => {
  return (
    <div>
      <NavBar/>
      <h1>Login Page</h1>
      <Login/>
    </div>
  )
}

export default LoginPage