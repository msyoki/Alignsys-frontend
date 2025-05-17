import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns'; // Import the format function
import '../styles/Chatbot.css';
import { Box } from '@mui/material';
function Bot(props) {
    const [index, setIndex] = useState(0);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const chatLogsEndRef = useRef(null);

    const generateMessage = (msg, type) => {
        setIndex(prevIndex => prevIndex + 1);
        const timestamp = new Date();
        const formattedTime = format(timestamp, 'hh:mm a'); // Format the timestamp
        const newMessage = {
            id: index,
            type,
            msg,
            timestamp: formattedTime // Add timestamp to the message
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
            const response = await axios.post('https://chatbot.alignsys.tech/query-topic-base64', new URLSearchParams({
                topic: msg,
                base64_data: props.base64
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

 

    useEffect(() => {
        chatLogsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div>
            <Box
                className="p-2"
                sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 'important 12px',
                    backgroundColor: '#ecf4fc',
                    height: '53px',
                    color: '#1d3557' 

                }}
            >


                <i className="fas fa-file-pdf mx-2 text-danger" style={{ fontSize: '15px' }}></i>
                <span style={{ fontSize: '12px' }}>{props.objectTitle}.pdf</span>



            </Box>


            <Box
                className="p-2 bg-white"
                sx={{
                    width: '100%',


                }}
            >
                <form onSubmit={handleChatSubmit} className='input-group  '>
                    <input
                        type="text"
                        id="chat-input"
                        className='form-control form-control-md'
                        placeholder="Query from document..."
                        value={inputValue}
                        autoComplete="off"
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button style={{ backgroundColor: '#6a994e' }} type="submit" className='btn btn-md text-white'>
                        <i className="fas fa-search mx-1" style={{ fontSize: '15px' }}></i>
                        <small>Search</small>
                    </button>
                </form>
            </Box>



            <div
                className=' p-2'
                style={{
                    height: '70vh',
                    overflowY: 'auto',
                    scrollbarColor: '#1d3557',
                    scrollBehavior: 'smooth',
                    backgroundColor: '#fff'
                }}
            >
                {messages.map((message) => (
                    <div key={message.id} className={`chat-msg ${message.type}`}>
                        <span className="msg-avatar">
                            <i
                                className={`fas ${message.type === 'self' ? 'fa-user' : 'fa-robot'}`}
                                style={{ color: '#2757aa', fontSize: '20px' }}
                            />
                        </span>

                        <div
                            className="cm-msg-text"
                            style={{
                                backgroundColor: message.type === 'self' ? '#e76f51' : '#2a68af'
                            }}
                        >
                            {message.msg === "..." ? (
                                <div className="loading-dots">
                                    <small>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </small>
                                </div>
                            ) : (
                                <span>{message.msg}</span>
                            )}
                        </div>

                        <div className="timestamp mx-2" style={{ fontSize: '10px' }}>
                            <small>{message.timestamp}</small>
                        </div>
                    </div>
                ))}
                <div ref={chatLogsEndRef} />
            </div>
        </div>
    );
}

export default Bot;
