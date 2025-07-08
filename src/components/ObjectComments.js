import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import axios from 'axios';
import * as constants from './Auth/configs';
import LinearProgress from '@mui/material/LinearProgress';
import { Tabs, Tab, List, ListItem, Typography, Select, MenuItem, Button } from '@mui/material';
import { Tooltip } from '@mui/material';
import FileExtIcon from './FileExtIcon';
import FileExtText from './FileExtText';

const CommentsComponent = (props) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [props.comments]);

  const handleInputChange = (e) => {
    setNewComment(e.target.value);
  };

  const refreshComments = () => {
    props.getObjectComments();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setLoading(true);
      let objectID = props.selectedObject.objectID !== undefined ? props.selectedObject.objectID : props.selectedObject.objectTypeId;

      const url = `${constants.mfiles_api}/api/Comments`;
      const data = {
        comment: `${props.user.first_name} ${props.user.last_name} : ${newComment}`,
        objectId: props.selectedObject.id,
        vaultGuid: `${props.guid}`,
        objectTypeId: objectID,
        userID: props.mfilesID
      };

      try {
        await axios.post(url, data, {
          headers: {
            accept: '*/*',
            'Content-Type': 'application/json',
          },
        });
        props.getObjectComments();
        setNewComment('');
      } catch {
        // console.error('Error posting comment:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="copilot-chat">
      {props.selectedObject?.id ? (
        <>


          {/* Chat Title */}
          <Box className="chat-header">

            {/* <i className="fas fa-comment-alt mx-2" style={{ color: '#2f81f7', fontSize: '35px' }}></i> */}
            <span className='mx-2' style={{ fontWeight: 500, fontSize: '14px' }}>
              Comments & Discussion
            </span>

            {props.comments?.length > 0 && (
              <Tooltip onClick={refreshComments} title="Refresh comments">
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <span style={{ fontSize: '20px', color: '#2757aa' }} className="fas fa-sync-alt mx-2 "></span>
                </div>
              </Tooltip>
            )}
          </Box>
          {/* Header */}
          {props.docTitle && (

            <Box className="chat-header p-2">
              {/* Icon Logic */}
              {props.selectedObject &&
                (props.selectedObject.objectTypeId === 0 || props.selectedObject.objectID === 0) &&
                props.selectedObject.isSingleFile === true ? (
                <>
                  <span className='mx-2'>
                    <FileExtIcon
                      fontSize="20px"
                      guid={props.guid}
                      objectId={props.selectedObject.id}
                      classId={props.selectedObject.classId ?? props.selectedObject.classID}
                      sx={{ fontSize: '25px !important', mr: '10px', flexShrink: 0 }}

                    />
                  </span>
                  <Box sx={{
                    fontSize: '13px',
                    color: '#212529',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {props.selectedObject.title}
                    <FileExtText
                      guid={props.guid}
                      objectId={props.selectedObject.id}
                      classId={props.selectedObject.classId ?? props.selectedObject.classID}
                    />
                  </Box>
                </>
              ) : (
                <>
                  <i
                    className={
                      (props.selectedObject.objectTypeId === 0 || props.selectedObject.objectID === 0) &&
                        props.selectedObject.isSingleFile === false
                        ? 'fas fa-book'
                        : 'fa-solid fa-folder'
                    }
                    style={{
                      color: (props.selectedObject.objectTypeId === 0 || props.selectedObject.objectID === 0) &&
                        props.selectedObject.isSingleFile === false ? '#7cb518' : '#2a68af',
                      fontSize: '20px',
                      marginRight: '10px',
                      flexShrink: 0
                    }}
                  />
                  <Box sx={{
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {props.selectedObject.title}
                  </Box>
                </>
              )}
            </Box>

          )}




          {/* Chat Messages */}
          <div className="chat-messages">
            {props.comments?.length > 0 &&
              props.comments.map((comment, index) => {
                const [boldText, regularText] = comment.coment.split(':');
                return (
                  <div key={index} className="message">
                    <i className="fas fa-user" style={{ color: '#2757aa', fontSize: '20px' }}></i>
                    <div className="message-content user-message">
                      <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                        <strong>{boldText}</strong> • {comment.modifiedDate}
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: 1.4 }}>
                        {regularText}
                      </div>
                    </div>
                  </div>
                );
              })}

            {loading && (
              <div className="message">
                <i className="fas fa-comment-alt" style={{ color: '#2757aa' }}></i>
                <div className="loading-indicator">
                  Posting<span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="d-flex">
            <div style={{ flex: 1, position: 'relative' }}>
              <form onSubmit={handleSubmit} className="input-container">
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="chat-input"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    required
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    className="send-button"
                    disabled={loading || !newComment.trim()}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>

  );
};

export default CommentsComponent;