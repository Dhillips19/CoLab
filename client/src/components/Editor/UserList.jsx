import React from "react";
import "../../styles/UserList.css";

const UserList = ({ users = [] }) => {
    
    // Max visible avatars before showing +N
    const MAX_VISIBLE = 5;
    
    // Function to get initials from username
    const getInitials = (username) => {
        if (!username) return "?";
        return username
            .split(" ")
            .map(part => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    
    // If no users, show empty state
    if (!users || users.length === 0) {
        return <div className="user-list"><span className="no-users">No active users</span></div>;
    }
    
    // Calculate how many users to show and how many are hidden
    const visibleUsers = users.slice(0, MAX_VISIBLE);
    const remainingCount = Math.max(0, users.length - MAX_VISIBLE);
    
    return (
        <div className="user-list">
            <div className="user-icons-container">
                {visibleUsers.map((user, index) => (
                    <div 
                        key={index}
                        className="user-icon"
                        style={{ backgroundColor: user.colour || "#888" }}
                        title={user.username}
                    >
                        {getInitials(user.username)}
                    </div>
                ))}
                
                {remainingCount > 0 && (
                    <div className="overflow-count">
                        +{remainingCount}
                        
                        <div className="user-tooltip">
                            <div className="tooltip-header">All Users</div>
                            {users.map((user, index) => (
                                <div key={index} className="tooltip-user">
                                    <div 
                                        className="tooltip-icon" 
                                        style={{ backgroundColor: user.colour || "#888" }}
                                    >
                                        {getInitials(user.username)}
                                    </div>
                                    <span className="tooltip-name">{user.username}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;