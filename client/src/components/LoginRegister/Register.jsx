import React, {useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import './LoginRegister.css';
import axios from 'axios';

const Register = () => {

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        try {
            const res = await axios.post("http://localhost:3001/api/auth/register", formData);
            console.log("Server Response:", res.data);
            
            setSuccess("User registered successfully!");
            setFormData({ username: "", email: "", password: "", confirmPassword: "" }); // Reset form

            // Optionally store JWT in localStorage
            localStorage.setItem("token", res.data.token);
        } catch (error) {
            setError(error.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className='container'>
            <div className='header'>
                <div className='text'>Register</div>
                <div className="underline"></div>
            </div>
        
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <form className="inputs" onSubmit={handleSubmit}>
                <div className="input">
                    <FontAwesomeIcon icon={faUser} />
                    <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required/>
                </div>

                <div className="input">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required/>
                </div>

                <div className="input">
                    <FontAwesomeIcon icon={faLock} />
                    <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required/>
                </div>

                <div className="input">
                    <FontAwesomeIcon icon={faLock} />
                    <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required/>
                </div>

                <div className="submit-container">
                    <button type="submit" className="submit">Register</button>
                </div>
            </form>
        </div>
    );
};

export default Register;