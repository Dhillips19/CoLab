import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './LoginRegister.css';
import axios from 'axios';

const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/auth/request-reset', {
                email
            });
            setSuccess('If an account exists with this email, you will receive a reset link');
            setError('');
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className='wrapper'>
            <div className='container'>
                <div className='header'>
                    <div className='text'>Reset Password</div>
                    <div className="underline"></div>
                </div>

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <form className="inputs" onSubmit={handleSubmit}>
                    <div className="input">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <input
                            type="email"
                            placeholder='Enter your email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="submit-container">
                        <button type="submit" className="submit">Send Reset Link</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestPasswordReset;