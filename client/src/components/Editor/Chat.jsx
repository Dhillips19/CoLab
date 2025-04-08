import React, { useState, useEffect, useRef } from "react";
import socket from "../../socket/socket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Chat.css";

const Chat = ({ documentId, username }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!socket) return;

        // Load chat history
        socket.on("loadMessages", (chatHistory) => {
            setMessages(chatHistory);
            console.log(`${socket.id}`);
            setTimeout(scrollToBottom, 100);
        });

        // Receive new messages
        socket.on("receiveMessage", (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            console.log(`${socket.id}`);
            setTimeout(scrollToBottom, 100);
        });

        return () => {
            socket.off("loadMessages");
            socket.off("receiveMessage");
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (message.trim() === "") return;

        console.log(`${socket.id}`);
        
        const newMessage = { 
            documentId, 
            username, 
            message,
            timestamp: new Date().toISOString()
        };

        socket.emit("sendMessage", newMessage);
        setMessage("");
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    return (
        <div className="chat-container">
            <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <FontAwesomeIcon icon={faTimes} /> : <FontAwesomeIcon icon={faCommentDots} />}
            </button>

            {isOpen && (
                <div className="chat-panel">
                    <div className="chat-panel-header">
                        <span>Document Chat</span>
                        <span>{messages.length} message(s)</span>
                    </div>
                    
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`chat-message ${msg.username === username ? "own-message" : ""}`}
                            >
                                <strong>{msg.username}</strong>
                                <p>{msg.message}</p>
                                <small>{new Date(msg.timestamp).toLocaleString('en-GB')}</small>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form className="chat-input" onSubmit={sendMessage}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chat;
