import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faSignOutAlt,
  faHome,
  faKey,
  faCog
} from "@fortawesome/free-solid-svg-icons";
import '../../styles/NavBar.css';
import { useAuth } from '../../context/AuthContext';

export default function NavBar() {
    const { isAuthenticated, logout, user } = useAuth();
    const [showSettings, setShowSettings] = useState(false);
    const [userColour, setUserColour] = useState(user?.colour || "#3498db");
    const settingsRef = useRef(null);
    
    // Extract first name from user object
    const username = user?.username?.split(' ')[0] || user?.username || "User";
    
    // Expanded colour options for user presence
    const colourOptions = [
        "#4285F4", // Google Blue
        "#F4B400", // Google Yellow
        "#DB4437", // Google Red
        "#0F9D58", // Google Green
        "#8E24AA", // Deep Purple
        "#FF6D00", // Bright Orange
        "#1E88E5", // Lighter Blue
        "#D81B60", // Vibrant Pink
        "#009688", 
        "#E53935", 
        "#43A047", 
        "#9E9D24", 
        "#546E7A", 
        "#6D4C41", 
        "#795548"
    ];
    
    // Close settings dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        }
        
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    // Handle colour selection with updated storage key
    const handleColourSelect = async (colour) => {
        try {
            setUserColour(colour);

            const token = localStorage.getItem("token");

            const response = await fetch("http://localhost:3001/api/user-settings/update-colour", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ colour })
            });

            const data = await response.json();
            if (response.status === 200 && data.token) {
                
                localStorage.setItem("token", data.token);

                console.log("Colour preference updated successfully");
            } 
        } catch (error) {
            console.error("Failed to update colour preference:", error);
            setUserColour(colour)
        } finally {
            setShowSettings(false);
        }
    };

    useEffect(() => {
        if (user && user.colour)
            setUserColour(user.colour);
    }, [user]);
    
    return (
        <div className='navigation-menu'>
            {/* Left side - Brand and navigation links */}
            <div className="left-section">
                <div className="nav-brand">
                    <Link to="/" className="brand-link">
                        <span className="brand-text">CoLab</span>
                    </Link>
                </div>
                
                <nav>
                    <ol className="nav-links">
                        {isAuthenticated ? (
                            <li><Link to="/"><FontAwesomeIcon icon={faHome} /> Home</Link></li>
                        ) : (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register">Register</Link></li>
                            </>
                        )}
                    </ol>
                </nav>
            </div>
            
            {/* Right side - User info, icon and settings */}
            {isAuthenticated && (
                <div className="right-section">
                    <div className="user-info">
                        <span className="user-name">Hello, {username}</span>
                        <div className="user-settings">
                            <div className="settings-cog" title="Settings" onClick={() => setShowSettings(!showSettings)}>
                                <FontAwesomeIcon icon={faCog} size="lg"/>
                            </div>
                        </div>
                        <div className="user-settings" ref={settingsRef}>
                            <div className="user-icon" style={{ backgroundColor: userColour }} title="User Icon">
                                <FontAwesomeIcon icon={faUser}/>
                            </div>
                            
                            {showSettings && (
                                <div className="settings-dropdown">
                                    <div className="settings-header">
                                        <h3>Settings</h3>
                                    </div>
                                    
                                    <div className="settings-menu">
                                        <Link to="/change-password" className="settings-item">
                                            <FontAwesomeIcon icon={faKey} />
                                            <span>Change Password</span>
                                        </Link>
                                    </div>
                                    
                                    <div className="colour-picker">
                                        <p>Choose your collaboration colour:</p>
                                        <div className="colour-options">
                                            {colourOptions.map((colour, index) => (
                                                <div 
                                                    key={index}
                                                    className={`colour-option ${colour === userColour ? "selected" : ""}`}
                                                    style={{ backgroundColor: colour }}
                                                    onClick={() => handleColourSelect(colour)}
                                                >
                                                    {colour === userColour && <div className="colour-selected"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="settings-footer">
                                        <button onClick={logout} className="logout-button">
                                            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}