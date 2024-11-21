import React from "react";
import { Link } from "react-router-dom";

export default function NavBar(){        
    return (
        <div className='navigation-menu'>
            <ol>
                <li><Link to={"/"}>Home</Link></li>
                <li><Link to={"/login"}>Login</Link></li>
                <li><Link to={"/version_history"}>Version History</Link></li>
                <li><Link to={"/document"}>Documents</Link></li>
            </ol>
        </div>
    )
}