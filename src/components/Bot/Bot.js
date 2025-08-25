import React, { useState, useRef, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { Box, Tooltip, MenuItem, FormControl, Select } from '@mui/material';
import axios from 'axios';
import '../../styles/Bot.css';

// Lazy load heavy dependencies
const ReactMarkdown = lazy(() => import('react-markdown'));
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then(module => ({
    default: module.Prism
})));
const vscDarkPlus = lazy(() => import('react-syntax-highlighter/dist/esm/styles/prism').then(module => ({
    default: module.vscDarkPlus
})));

const API_URL = 'https://chatbot.alignsys.tech/query-topic-base64';

const CodeBlock = memo(({ language, value }) => (
    <Suspense fallback={<pre>{value}</pre>}>
        <SyntaxHighlighter language={language} style={vscDarkPlus}>
            {value}
        </SyntaxHighlighter>
    </Suspense>
));

const Message = memo(({ message }) => (
    <div className={`message ${message.type}`}>
        {message.type !== 'user' && (
            <i className="fa-brands fa-android" style={{ color: '#2757aa', fontSize: '20px' }}></i>
        )}
        <div className={`message-content ${message.type}-message`}>
            <Suspense fallback={<div>{message.content}</div>}>
                <ReactMarkdown components={{ code: CodeBlock }}>
                    {message.content}
                </ReactMarkdown>
            </Suspense>
        </div>
        {message.type === 'user' && (
            <i className="fas fa-user" style={{ color: '#555', fontSize: '20px' }}></i>
        )}
    </div>
));

const LoadingIndicator = memo(() => (
    <div className="message">
        <i className="fa-brands fa-android" style={{ color: '#2757aa', fontSize: '20px' }}></i>
        <div className="loading-indicator">
            Analysing <span>.</span><span>.</span><span>.</span>
        </div>
    </div>
));

const SuggestedActions = memo(({ onSubmit, summarized }) => {
    const actions = useMemo(() => [
        "Summarize this document",
        "What are the main themes of this document?",
        "What conclusions does the author make?"
    ], []);

    return (
        <div className="d-flex flex-column align-items-start justify-content-center p-3">
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={(e) => onSubmit(e, action)}
                    disabled={summarized}
                    className="summarize-btn btn btn-sm rounded-pill m-2 text-dark d-flex align-items-center p-2"
                >
                    <span className="mx-auto">{action}</span>
                </button>
            ))}
        </div>
    );
});

const Bot = memo(({ blob, objectTitle, messages, setMessages,file_ext }) => {
    const modelOptions = [
        { value: "gpt-4.1", label: "GPT-4.1 (default)" },
        { value: "gpt-5", label: "GPT-5" }
    ];

    const [base64Data, setBase64Data] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [summarized, setSummarized] = useState(false);
    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);
    const [selectedModel, setSelectedModel] = useState(modelOptions[0].value); // Default model


    // Convert blob → base64
    useEffect(() => {
        if (!blob) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (result) {
                const base64String = result.split(',')[1]; // strip data: prefix
                // alert('Blob converted to base64 successfully'); 
                console.log('Base64 Data:', result);
                setBase64Data(base64String);
            }
        };
        reader.readAsDataURL(blob);
    }, [blob]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages.length, scrollToBottom]);

    const makeAPICall = useCallback(async (topic) => {
        if (!base64Data) return null;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            // console.log(selectedModel);
            // console.log(file_ext)
            // console.log(base64Data);
            

            const response = await axios.post(
                API_URL,
                new URLSearchParams({
                    topic,
                    base64_data: base64Data,
                    model: selectedModel,
                    file_ext: file_ext
                }),
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    signal: abortControllerRef.current.signal
                }
            );
            console.log('API Response:', response.data);

            return response.data.response;
        } catch (error) {
            if (error.name === 'AbortError') return null;
            throw error;
        }
    }, [base64Data, selectedModel]);

    const handleSubmit = useCallback(async (e, value = inputValue) => {
        if (e) e.preventDefault();
        if (!value?.trim() || loading) return;

        const userMessage = {
            type: 'user',
            content: value,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        if (value === inputValue) {
            setInputValue('');
        }

        setLoading(true);

        try {
            const responseData = await makeAPICall(value);

            if (responseData) {
                const fullText = responseData.join('\n\n');
                let currentText = '';
                const timestamp = new Date();

                setMessages(prev => [...prev, {
                    type: 'copilot',
                    content: '',
                    timestamp
                }]);

                let index = 0;
                const typingSpeed = 20;

                const interval = setInterval(() => {
                    currentText += fullText.charAt(index);
                    index++;

                    setMessages(prev => {
                        const updated = [...prev];
                        const lastIndex = updated.length - 1;

                        if (updated[lastIndex]?.type === 'copilot') {
                            updated[lastIndex] = {
                                ...updated[lastIndex],
                                content: currentText,
                                timestamp
                            };
                        }

                        return updated;
                    });

                    if (index >= fullText.length) {
                        clearInterval(interval);
                    }
                }, typingSpeed);
            }
        } catch (error) {
            // console.error('Error:', error);
            let errorMessage = "Sorry, I encountered an error. Please try again.";

            // If backend sends { detail: "..."} extract it
            if (error.response && error.response.data) {
                if (typeof error.response.data === "string") {
                    errorMessage = error.response.data;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else {
                    errorMessage = JSON.stringify(error.response.data);
                }
            }

            setMessages(prev => [
                ...prev,
                {
                    type: 'copilot',
                    content: errorMessage,
                    timestamp: new Date()
                }
            ]);
        } finally {
            setLoading(false);
        }
    }, [inputValue, loading, makeAPICall, setMessages]);

    const handleSubmit2 = useCallback(async (e, value) => {
        setSummarized(true);
        await handleSubmit(e, value);
    }, [handleSubmit]);

    const handleInputChange = useCallback((e) => {
        setInputValue(e.target.value);
    }, []);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    const handleClearChat = useCallback(() => {
        setMessages([]);
        setSummarized(false);
    }, [setMessages]);

    const renderedMessages = useMemo(() =>
        messages.map((message, index) => (
            <Message key={`${message.timestamp.getTime()}-${index}`} message={message} />
        )), [messages]
    );

    const isSubmitDisabled = useMemo(() =>
        loading || !inputValue.trim(), [loading, inputValue]
    );

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return (
        <div className="copilot-chat">
            {/* Chat Header */}
            {/* Document Info Header */}

            <>
                {/* Main Chat Header */}
                <Box
                    className="chat-header"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 10px',
                        borderBottom: '1px solid #e0e0e0',
                        backgroundColor: '#ecf4fc',
                        minHeight: 'auto'
                    }}
                >
                    {/* Left Section: Bot Greeting */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <i
                            className="fa-brands fa-android"
                            style={{
                                color: '#2757aa',
                                fontSize: '20px',
                                marginRight: '12px'
                            }}
                        />
                        <span style={{
                            fontWeight: 500,
                            fontSize: '12.8px',
                            color: '#333',
                            lineHeight: 1.2
                        }}>
                            Hello, how can I help with this document?
                        </span>
                    </Box>

                    {/* Right Section: Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Model Selection */}
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                size="small"
                                variant="outlined"
                                sx={{
                                    color: '#1C4690',
                                    fontSize: '12px',
                                    borderRadius: '20px',
                                    backgroundColor: 'white',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#e0e0e0',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#2757aa',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#2757aa',
                                        borderWidth: '1px',
                                    },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            maxHeight: 250,
                                            borderRadius: '8px',
                                            marginTop: '4px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        },
                                    },
                                }}
                            >
                                {modelOptions.map(option => (
                                    <MenuItem
                                        key={option.value}
                                        value={option.value}
                                        sx={{
                                            fontSize: '12.8px',
                                            color: '#333',
                                            backgroundColor: option.value === selectedModel ? '#f0f4ff' : 'transparent',
                                            '&:hover': {
                                                backgroundColor: '#f0f4ff',
                                            },
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            {option.value === selectedModel && (
                                                <i
                                                    className="fas fa-check"
                                                    style={{
                                                        color: '#2757aa',
                                                        fontSize: '10px',
                                                        marginRight: '8px'
                                                    }}
                                                />
                                            )}
                                            {option.label}
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Clear Chat Button */}
                        {messages?.length > 0 && (
                            <Tooltip title="Clear chat and start new..." arrow>
                                <Box
                                    onClick={handleClearChat}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: 'transparent',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: '#f0f4ff',
                                            transform: 'scale(1.05)',
                                        },
                                    }}
                                >
                                    <i
                                        className="fa-solid fa-eraser"
                                        style={{
                                            fontSize: '18px',
                                            color: '#2757aa'
                                        }}
                                    />
                                </Box>
                            </Tooltip>
                        )}
                    </Box>
                </Box>

                {/* Document Info Header */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        backgroundColor: '#ecf4fc',
                        borderBottom: '1px solid #e9ecef',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <i
                            className="fas fa-file-pdf"
                            style={{
                                color: '#dc3545',
                                fontSize: '16px',
                                marginRight: '8px'
                            }}
                        />
                        <span style={{
                            fontSize: '12.8px',
                            color: 'black',
                            fontWeight: 500
                        }}>
                            {objectTitle}.pdf
                        </span>
                    </Box>
                </Box>
            </>



            {/* Chat Messages */}
            <div className="chat-messages">
                {messages?.length < 1 ? (
                    <SuggestedActions onSubmit={handleSubmit2} summarized={summarized} />
                ) : (
                    renderedMessages
                )}

                {loading && <LoadingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSubmit} className="input-container">
                <div>
                    <textarea
                        className="chat-input"
                        placeholder="Ask your own question..."
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="submit"
                        className="send-button"
                        disabled={isSubmitDisabled}
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </form>


        </div>
    );
});

Bot.displayName = 'Bot';

export default Bot;
