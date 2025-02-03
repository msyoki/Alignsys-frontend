import React, { useState } from 'react';
import axios from 'axios';
import * as constants from './Auth/configs';
import LinearProgress from '@mui/material/LinearProgress';
import { Tabs, Tab, Box, List, ListItem, Typography, Select, MenuItem, Button } from '@mui/material';

const CommentsComponent = (props) => {
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

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
      } catch (err) {
        console.error('Error posting comment:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={props.selectedObject.id ? "bg-white p-4 shadow-lg" : "p-4"} style={{ height: '100%' }}>
      <span style={{ fontSize: '14px' }}>
        {props.selectedObject.id && (
          <>
            Refresh Comments
            <span
              className="fas fa-sync-alt btn-sm mx-2"
              onClick={refreshComments}
              style={{
                cursor: 'pointer',
                padding: '5px',
                backgroundColor: '#f0f0f0',
                borderRadius: '5px',
                transition: 'background-color 0.3s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
            ></span>
          </>
        )}
      </span>

      {props.selectedObject.id && props.comments.length > 0 ? (
        <ul
          style={{ listStyle: 'none', padding: 0, height: '40vh', overflowY: 'scroll' }}
          className="p-3 my-2"
        >
          {props.comments.map((comment, index) => {
            const [boldText, regularText] = comment.coment.split(':');

            return (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: 'column',
                  marginBottom: '13px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <i className="fas fa-comment-alt" style={{ marginRight: '10px', color: '#a7c957', fontSize: '20px' }}></i>
                  <span style={{ fontSize: '12px', color: '#555' }}>
                    <strong>{boldText}:</strong> {comment.modifiedDate}
                  </span>
                </div>
                <span style={{ fontSize: '12.5px', lineHeight: '1.5', color: '#333' }} className="mx-4">
                  {regularText}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <Box
          sx={
            props.selectedObject.id
              ? { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }
              : { width: '100%', marginTop: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mx: 'auto' }
          }
        >
          <i className="fas fa-comment-alt my-2" style={{ fontSize: '120px', color: '#2757aa' }}></i>
          {props.loadingcomments ? (
            <>
              <Box sx={{ width: '50%' }} className="my-2">
                <LinearProgress />
              </Box>
              <Typography variant="body2" className="my-2" sx={{ textAlign: 'center' }}>
                Searching comments...
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body2"
                className='my-2'
                sx={{ textAlign: 'center' }}>
                Comments
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '12px' }}>
                {props.selectedObject.id ? "No comments found" : "Please select an object to preview comments"}
              </Typography>
            </>
          )}
        </Box>
      )}


      {props.selectedObject.id && (
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="form-group">
            <textarea
              className="form-control"
              rows="2"
              value={newComment}
              onChange={handleInputChange}
              placeholder="Write a comment..."
              required
              disabled={loading}
            ></textarea>
          </div>
          <div className="my-2">
            <button
              type="submit"
              className="btn text-white btn-sm mt-2"
              disabled={loading}
              style={{ backgroundColor: '#6a994e' }}
            >
              <small>{loading ? 'Submitting...' : 'Submit Comment'}</small>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentsComponent;
