import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import '../../css/LoginRegister.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setIsLoading(false);
            return;
        }

        try {
            const res = await axios.post("http://localhost:3001/api/auth/register", formData);
            setSuccess("Account created successfully! You can now login.");
            setFormData({ username: "", email: "", password: "", confirmPassword: "" });
        } catch (error) {
            setError(error.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='wrapper'>
            <div className='container'>
                <div className='header'>
                    <div className='text'>Create Account</div>
                    <div className="underline"></div>
                </div>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <form className="inputs" onSubmit={handleSubmit}>
                    <div className="input">
                        <FontAwesomeIcon icon={faUser} />
                        <input 
                            type="text" 
                            name="username" 
                            placeholder="Username" 
                            value={formData.username} 
                            onChange={handleChange} 
                            required 
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email Address" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input">
                        <FontAwesomeIcon icon={faLock} />
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                            disabled={isLoading}
                        />
                    </div>

                    <div className="input">
                        <FontAwesomeIcon icon={faLock} />
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            placeholder="Confirm Password" 
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            required 
                            disabled={isLoading}
                        />
                    </div>

                    <div className="submit-container">
                        <button 
                            type="submit" 
                            className="submit"
                            disabled={isLoading}
                        >
                            Create Account
                            {isLoading && <FontAwesomeIcon icon={faSpinner} className="spinner-icon" />}
                        </button>
                    </div>
                </form>

                <div className="account-link">
                    Already have an account?
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;