import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import './LoginRegister.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Check if new passwords match
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                'http://localhost:3001/api/auth/change-password',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setSuccess('Password changed successfully!');
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        }
    };

    return (
        <div className='wrapper'>
            <div className='container'>
                <div className='header'>
                    <div className='text'>Change Password</div>
                    <div className="underline"></div>
                </div>

                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                <form className="inputs" onSubmit={handleSubmit}>
                    <div className="input">
                        <FontAwesomeIcon icon={faLock} />
                        <input
                            type="password"
                            name="currentPassword"
                            placeholder='Current Password'
                            value={formData.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input">
                        <FontAwesomeIcon icon={faLock} />
                        <input
                            type="password"
                            name="newPassword"
                            placeholder='New Password'
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input">
                        <FontAwesomeIcon icon={faLock} />
                        <input
                            type="password"
                            name="confirmNewPassword"
                            placeholder='Confirm New Password'
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="submit-container">
                        <button type="submit" className="submit">Change Password</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;