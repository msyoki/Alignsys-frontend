import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import '../styles/Bot.css';
import { Tooltip } from '@mui/material';

const LLM_API_URL = 'https://llm.alignsys.tech';

const CodeBlock = ({ language, value }) => (
    <SyntaxHighlighter language={language} style={vscDarkPlus}>
        {value}
    </SyntaxHighlighter>
);

const BotLLM = (props) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [summarized, setSummarized] = useState(false);
    const [history, setHistory] = useState([]);
    const [conversationId, setConversationId] = useState('');

    const messagesEndRef = useRef(null);

    // Memoize static values to prevent unnecessary re-renders
    const userParams = useMemo(() => ({
        userId: `${props.userId}`,
        objectId: `${props.objectId}`,
        vaultGuid: `${props.guid}`,
        objectTitle: props.objectTitle
    }), [props.userId, props.objectId, props.guid, props.objectTitle]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Memoized function to create user message
    const createUserMessage = useCallback((content) => ({
        type: 'user',
        content,
        timestamp: new Date()
    }), []);

    // Memoized function to create copilot message
    const createCopilotMessage = useCallback((content) => ({
        type: 'copilot',
        content,
        timestamp: new Date()
    }), []);

    // Generic API call handler to reduce code duplication
    // const handleAPICall = useCallback(async (topic) => {
    //     try {
    //         const response = await axios.post(API_URL,
    //             new URLSearchParams({
    //                 topic,
    //                 base64_data: props.base64
    //             }), {
    //             headers: {
    //                 'Accept': 'application/json',
    //                 'Content-Type': 'application/x-www-form-urlencoded'
    //             }
    //         });

    //         if (response.data.response) {
    //             return response.data.response.join('\n\n');
    //         }
    //         throw new Error('No response data received');
    //     } catch (error) {
    //         console.error('API Error:', error);
    //         throw error;
    //     }
    // }, [props.base64]);
    const handleAPICall = useCallback(async (topic) => {
        try {
            const response = await axios.post(`${LLM_API_URL}/chat`, {
                user_id: `${props.userId}`,
                vault_guid: `${props.guid}`,
                object_id: `${props.objectId}`,
                message: topic, // this replaces `topic` as the message payload
                model: "dolphin-phi",
                conversation_id: `${conversationId}`
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                console.log(response.data)
                return response.data.assistant_reply;
            }
            throw new Error('No response data received');
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }, []);


    // Optimized submit handler that combines both submit functions
    const handleSubmit = useCallback(async (e, predefinedValue = null) => {
        e.preventDefault();
        const value = predefinedValue || inputValue;

        if (!value.trim() || loading) return;

        // Set summarized state if using predefined values
        if (predefinedValue) {
            setSummarized(true);
        }

        const userMessage = createUserMessage(value);
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setLoading(true);

        try {
            const responseContent = await handleAPICall(value);
            const copilotMessage = createCopilotMessage(responseContent);
            setMessages(prev => [...prev, copilotMessage]);
        } catch (error) {
            const errorMessage = createCopilotMessage('Sorry, I encountered an error. Please try again.');
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    }, [inputValue, loading, createUserMessage, createCopilotMessage, handleAPICall]);

    // Handle historic messages
    const handleHistoricMessages = useCallback((e, message) => {
        e.preventDefault();
        if (!message.question.trim() || loading) return;

        setSummarized(true);

        const userMessage = createUserMessage(message.question);
        const copilotMessage = createCopilotMessage(message.answer);

        // Batch state updates
        setMessages(prev => [...prev, userMessage, copilotMessage]);
        setInputValue('');
    }, [loading, createUserMessage, createCopilotMessage]);

    // Optimized fetch conversation function
    const fetchConversation = useCallback(async () => {
        const { userId, objectId, vaultGuid } = userParams;

        try {
            const response = await axios.post(`${LLM_API_URL}/get-conversation`, {
                user_id: userId,
                vault_guid: vaultGuid,
                object_id: objectId,
                conversation_id: ""
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            setConversationId(response.data.conversation_id);
            if (response.data.messages?.length > 0) {
                setHistory(response.data.messages);
            }
            console.log('✅ Conversation Response:', response.data);
        } catch (error) {
            alert("no conversation ID found , sending document for extraction !!!")
            console.warn('⚠️ Initial fetch failed, trying /extract...', error?.response?.status);

            // Only proceed with /extract if it's a 400 error and we have base64 data
            if (error?.response?.status === 404 && props.base64) {
                try {
                    const binary = atob(props.base64);
                    const array = Uint8Array.from(binary, char => char.charCodeAt(0));
                    const blob = new Blob([array], { type: 'application/pdf' });
                    const file = new File([blob], `${userParams.objectTitle}.pdf` || 'uploaded.pdf', { type: 'application/pdf' });

                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('user_id', userId);
                    formData.append('object_id', objectId);
                    formData.append('vault_guid', vaultGuid);

                    const extractResponse = await axios.post(`${LLM_API_URL}/extract`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json'
                        }
                    });

                    setConversationId(extractResponse.data.conversation_id);
                    console.log('✅ Extract fallback successful:', extractResponse.data);
                } catch (extractErr) {
                    console.error('❌ Fallback extract request failed:', extractErr);
                    console.log(props.base64)
                }
            }
        }
    }, [userParams, props.base64]);

    // Effect specifically for base64 and objectId changes
    useEffect(() => {
        // Reset state when key parameters change
        setMessages([]);
        setSummarized(false);
        setHistory([]);
        setConversationId('');

        // Fetch new conversation data
        fetchConversation();
    }, [props.base64, props.objectId, fetchConversation]);

    // Clear chat handler
    const clearChat = useCallback(() => {
        setMessages([]);
        setSummarized(false);
    }, []);

    // Predefined question buttons
    const predefinedQuestions = useMemo(() => [
        "Summarize this document",
        "What are the main themes of this document?",
        "What conclusions does the author make?"
    ], []);

    // Keyboard handler for textarea
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    return (
        <div className="copilot-chat">
            {/* Chat Header */}
            <Box className="chat-header">
                <span className='mx-2' style={{ fontWeight: 500, fontSize: '14px' }}>
                    Hello, how can I help with this document?
                </span>

                {messages?.length > 0 && (
                    <Tooltip title="Clear chat and start new ..." onClick={clearChat}>
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <span className="fa-solid fa-eraser mx-2" style={{ fontSize: '20px', color: '#2757aa' }}></span>
                        </div>
                    </Tooltip>
                )}
            </Box>

            {/* Document Info Header */}
            <Box className="chat-header p-2">
                <span className="mx-2">
                    <i className="fas fa-file-pdf text-danger mx-1" style={{ fontSize: '20px' }}></i>
                    <span style={{ fontSize: '13px' }}>{userParams.objectTitle}.pdf</span>
                </span>
            </Box>

            {/* Chat Messages */}
            <div className="chat-messages">
                {messages?.length < 1 ? (
                    <div className="d-flex flex-column align-items-start justify-content-center p-3">
                        {/* Predefined Questions */}
                        {predefinedQuestions.map((question, index) => (
                            <button
                                key={index}
                                onClick={(e) => handleSubmit(e, question)}
                                disabled={summarized}
                                style={{ width: '60%' }}
                                className="summarize-btn btn btn-sm rounded-pill m-2 text-dark d-flex align-items-center p-2"
                            >
                                <span className="mx-auto">{question}</span>
                            </button>
                        ))}

                        {/* Historic Messages */}
                        {history.map((message, index) => (
                            <button
                                key={`history-${index}`}
                                onClick={(e) => handleHistoricMessages(e, message)}
                                disabled={summarized}
                                style={{ width: '60%' }}
                                className="summarize-btn btn btn-sm rounded-pill m-2 text-dark d-flex align-items-center p-2"
                            >
                                <span className="mx-auto">{message.question}</span>
                            </button>
                        ))}
                    </div>
                ) : null}

                {/* Messages */}
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        {message.type !== 'user' && (
                            <i className="fa-brands fa-android" style={{ color: '#2757aa', fontSize: '20px' }}></i>
                        )}
                        <div className={`message-content ${message.type}-message`}>
                            <ReactMarkdown components={{ code: CodeBlock }}>
                                {message.content}
                            </ReactMarkdown>
                        </div>
                        {message.type === 'user' && (
                            <i className="fas fa-user" style={{ color: '#555', fontSize: '20px' }}></i>
                        )}
                    </div>
                ))}

                {/* Loading Indicator */}
                {loading && (
                    <div className="message">
                        <i className="fa-brands fa-android" style={{ color: '#2757aa', fontSize: '20px' }}></i>
                        <div className="loading-indicator">
                            Analysing <span>.</span><span>.</span><span>.</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSubmit} className="input-container">
                <div>
                    <textarea
                        className="chat-input"
                        placeholder="Ask your own question..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        type="submit"
                        className="send-button"
                        disabled={loading || !inputValue.trim()}
                    >
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BotLLM;