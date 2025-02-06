import React from "react";
import { Link } from "react-router-dom";

export default function NavBar(){        
    return (
        <div className='navigation-menu'>
            <ol>
                <li><Link to={"/"}>Home</Link></li>
                <li><Link to={"/login"}>Login</Link></li>
                <li><Link to={"/register"}>Register</Link></li>
                <li><Link to={"/version-history"}>Version History</Link></li>
                <li><Link to={"/my-documents"}>Documents</Link></li>
            </ol>
        </div>
    )
}