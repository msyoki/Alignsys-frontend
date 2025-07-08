import React, { useState, useRef, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { Box, Tooltip } from '@mui/material';
import axios from 'axios';
import '../styles/Bot.css';

// Lazy load heavy dependencies
const ReactMarkdown = lazy(() => import('react-markdown'));
const SyntaxHighlighter = lazy(() => import('react-syntax-highlighter').then(module => ({ 
    default: module.Prism 
})));
const vscDarkPlus = lazy(() => import('react-syntax-highlighter/dist/esm/styles/prism').then(module => ({
    default: module.vscDarkPlus
})));

const API_URL = 'https://chatbot.alignsys.tech/query-topic-base64';

// Memoized CodeBlock component
const CodeBlock = memo(({ language, value }) => (
    <Suspense fallback={<pre>{value}</pre>}>
        <SyntaxHighlighter language={language} style={vscDarkPlus}>
            {value}
        </SyntaxHighlighter>
    </Suspense>
));

// Memoized Message component to prevent unnecessary re-renders
const Message = memo(({ message, index }) => (
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

// Memoized LoadingIndicator component
const LoadingIndicator = memo(() => (
    <div className="message">
        <i className="fa-brands fa-android" style={{ color: '#2757aa', fontSize: '20px' }}></i>
        <div className="loading-indicator">
            Analysing <span>.</span><span>.</span><span>.</span>
        </div>
    </div>
));

// Memoized SuggestedActions component
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

const Bot = memo(({ base64, objectTitle, messages, setMessages }) => {
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [summarized, setSummarized] = useState(false);
    const abortControllerRef = useRef(null);

    // Memoized scroll function
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    // Optimized scroll effect with cleanup
    useEffect(() => {
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages.length, scrollToBottom]);

    // Memoized API call function
    const makeAPICall = useCallback(async (topic) => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            const response = await axios.post(
                API_URL,
                new URLSearchParams({
                    topic,
                    base64_data: base64
                }),
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    signal: abortControllerRef.current.signal
                }
            );

            return response.data.response;
        } catch (error) {
            if (error.name === 'AbortError') {
                return null; // Request was cancelled
            }
            throw error;
        }
    }, [base64]);

    // Optimized submit handler with error boundary
    const handleSubmit = useCallback(async (e, value = inputValue) => {
        if (e) e.preventDefault();
        if (!value?.trim() || loading) return;

        const userMessage = {
            type: 'user',
            content: value,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        
        // Only clear input if using the input field
        if (value === inputValue) {
            setInputValue('');
        }
        
        setLoading(true);

        try {
            const responseData = await makeAPICall(value);
            
            if (responseData) {
                const copilotMessage = {
                    type: 'copilot',
                    content: responseData.join('\n\n'),
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, copilotMessage]);
            }
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                type: 'copilot',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    }, [inputValue, loading, makeAPICall, setMessages]);

    // Separate handler for suggested actions
    const handleSubmit2 = useCallback(async (e, value) => {
        setSummarized(true);
        await handleSubmit(e, value);
    }, [handleSubmit]);

    // Memoized input change handler
    const handleInputChange = useCallback((e) => {
        setInputValue(e.target.value);
    }, []);

    // Memoized keydown handler
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    // Memoized clear chat handler
    const handleClearChat = useCallback(() => {
        setMessages([]);
        setSummarized(false);
    }, [setMessages]);

    // Memoized messages rendering
    const renderedMessages = useMemo(() => 
        messages.map((message, index) => (
            <Message key={`${message.timestamp.getTime()}-${index}`} message={message} index={index} />
        )), [messages]
    );

    // Memoized form submission state
    const isSubmitDisabled = useMemo(() => 
        loading || !inputValue.trim(), [loading, inputValue]
    );

    // Cleanup on unmount
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
            <Box className="chat-header">
                <span className='mx-2' style={{ fontWeight: 500, fontSize: '14px' }}>
                    Hello, how can I help with this document?
                </span>

                {messages?.length > 0 && (
                    <Tooltip title="Clear chat and start new ...">
                        <div 
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            onClick={handleClearChat}
                        >
                            <span className="fa-solid fa-eraser mx-2" style={{ fontSize: '20px', color: '#2757aa' }}></span>
                        </div>
                    </Tooltip>
                )}
            </Box>

            {/* Document Info Header */}
            <Box className="chat-header p-2">
                <span className="mx-2">
                    <i className="fas fa-file-pdf text-danger mx-1" style={{ fontSize: '20px' }}></i>
                    <span style={{ fontSize: '13px' }}>{objectTitle}.pdf</span>
                </span>
            </Box>

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

            {/* Chat Input Form */}
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