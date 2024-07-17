import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import '../styles/Chatbot.css';

function Chatbot() {
    const [index, setIndex] = useState(0);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const chatLogsEndRef = useRef(null);

    const generateMessage = (msg, type) => {
        setIndex(prevIndex => prevIndex + 1);
        const newMessage = {
            id: index,
            type,
            msg,
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        const msg = inputValue.trim();
        if (msg === '') return;

        generateMessage(msg, 'self');
        setInputValue('');
        setLoading(true);

        generateMessage("...", 'user');

        try {
            const filename = uploadedFileName || 'Individual-Sanlam Unit Trust Investment Application form[1]-SHERRY KISILUII.pdf';
            const response = await axios.post('http://192.236.194.251:9000/query-topic', new URLSearchParams({
                topic: msg,
                filename: filename
            }), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = response.data;

            setMessages(prevMessages => prevMessages.filter(message => message.msg !== '...'));

            if (data.response) {
                data.response.forEach((text, index) => {
                    setTimeout(() => {
                        generateMessage(text, 'user');
                        if (index === data.response.length - 1) {
                            setLoading(false);
                        }
                    }, 1000 * (index + 1));
                });
            } else {
                generateMessage("Sorry, I didn't get that. Could you please try again?", 'user');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error:', error);
            generateMessage("There was an error communicating with the server. Please try again later.", 'user');
            setLoading(false);
        }
    };

    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file && file.type === 'application/pdf') {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await axios.post('http://192.236.194.251:9000/upload-file/', formData, {
                    headers: {
                        'accept': 'application/json',
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.status === 200) {
                    setUploadedFileName(file.name);
                    generateMessage(`File "${file.name}" uploaded successfully.`, 'user');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                generateMessage("File upload failed. Please try again.", 'user');
            }
        } else {
            generateMessage("Please upload a valid PDF file.", 'user');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'application/pdf',
        multiple: false
    });

    useEffect(() => {
        const chatCircle = document.getElementById('chat-circle');
        const chatBoxToggle = document.querySelector('.chat-box-toggle');

        const toggleChat = () => {
            chatCircle.classList.toggle('scale');
            document.querySelector('.chat-box').classList.toggle('scale');
        };

        chatCircle.addEventListener('click', toggleChat);
        chatBoxToggle.addEventListener('click', toggleChat);

        return () => {
            chatCircle.removeEventListener('click', toggleChat);
            chatBoxToggle.removeEventListener('click', toggleChat);
        };
    }, []);

    useEffect(() => {
        chatLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div id="body">
            <div id="chat-circle" className="btn btn-raised">
                <i className="fas fa-robot text-white"></i>
            </div>
            <div className="chat-box shadow-sm">
                <div className="chat-box-header">
                    ChatBot
                    <span className="chat-box-toggle">
                        <i className="fas fa-times"></i>
                    </span>
                </div>
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Drop the files here...</p>
                    ) : (
                        <p>Drag 'n' drop a PDF file here, or click to select a file</p>
                    )}
                </div>
                {messages.length > 0 ?
                    <div className="chat-box-body" style={{ backgroundColor: '#1d3557' }}>
                        <div className="chat-logs">
                            {messages.map((message) => (
                                <div key={message.id} className={`chat-msg ${message.type}`}>
                                    <span className="msg-avatar">
                                        <i className={`fas ${message.type === 'self' ? 'fa-user' : 'fa-robot'}`} style={{ color: '#ffff', fontSize: '20px' }}></i>
                                    </span>
                                    <div className="cm-msg-text" style={{
                                        backgroundColor: message.type === 'self' ? '#e76f51' : '#2a68af'
                                    }}>
                                        {message.msg === "..." ? (
                                            <div className="loading-dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        ) : (
                                            message.msg
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatLogsEndRef} /> {/* Scroll to this div */}
                        </div>
                    </div>
                    : <></>}
                <div className="chat-input">
                    <form onSubmit={handleChatSubmit} className='input-group'>
                        <input
                            type="text"
                            id="chat-input"
                            className='form-control form-control-md'
                            placeholder="Send a message..."
                            value={inputValue}
                            autoComplete="off"
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="submit" className="chat-submit btn btn-success" id="chat-submit">
                            <i className="fas fa-paper-plane mx-1"></i> <small className='mx-1'>Send</small>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Chatbot;
