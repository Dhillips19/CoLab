import React, {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import './LoginRegister.css'

const Login = () => {
    return (
        <div className='container'>
            <div className='header'>
                <div className='text'>Login</div>
                <div className="underline"></div>
            </div>

            <form className="inputs">
                <div className="input">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <input type="email" placeholder='Email' />
                </div>

                <div className="input">
                    <FontAwesomeIcon icon={faLock} />
                    <input type="password" placeholder='Password' />
                </div>
            </form>

            <div className="forgot-password">
                Forgot Password? <span>Click Here</span>
            </div>

            <div className="submit-container">
                <button className="submit">Login</button>
            </div>
        </div>
    );
};

export default Login;
