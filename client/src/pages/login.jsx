import React, { useState } from 'react'
import Navbar from '../components/NavBar';

// const Login = () => {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     const handleSubmit = (e) => {
//         e.preventDefault();
//     }
// }

export default function Login() {
    return (
        <div>
            <Navbar/>
            <h1>login</h1>
        </div>
    )
}
