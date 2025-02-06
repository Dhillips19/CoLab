import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import './LoginRegister.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For navigation after login

const Login = () => {
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '' });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState("");
    const navigate = useNavigate(); // Navigation hook

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors

        try {
            const res = await axios.post('http://localhost:3001/api/auth/login', formData);

            // Save JWT token to localStorage
            localStorage.setItem('token', res.data.token);

            setSuccess("User logged in successfully!");

            // Redirect to a protected route (e.g., dashboard)
            try {
                navigate('/');    
            } catch (error) {
                setError(error.response?.data?.message || 'Redirect failed');
            }
            
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className='wrapper'>
            <div className='container'>
                <div className='header'>
                    <div className='text'>Login</div>
                    <div className="underline"></div>
                </div>

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <form className="inputs" onSubmit={handleSubmit}>
                    <div className="input">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <input 
                            type="email" 
                            name="email" 
                            placeholder='Email' 
                            value={formData.email} 
                            onChange={handleChange}              
                            required 
                        />
                    </div>

                    <div className="input">
                        <FontAwesomeIcon icon={faLock} />
                        <input 
                            type="password" 
                            name="password" 
                            placeholder='Password' 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="submit-container">
                        <button type="submit" className="submit">Login</button>
                    </div>
                </form>

                <div className="forgot-password">
                    Forgot Password? <span>Click Here</span>
                </div>
            </div>
        </div>
    );
};

export default Login;