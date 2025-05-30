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
        userID: props.mfilesID

      };
      console.log(data)

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
    <div>
      {props.selectedObject?.id && (
        <>
          {/* Header */}
          <Box
            className="p-2"
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ecf4fc',
              height: '53px',
              fontSize: '13px',
              px: 2,
              color: '#1d3557',
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <i className="fas fa-file-pdf text-danger" style={{ fontSize: '24px' }}></i>
              <span>{props.docTitle}.pdf</span>
            </Box>

            <i
              className="fas fa-sync-alt"
              onClick={refreshComments}
              style={{ cursor: 'pointer', fontSize: '15px', padding: '8px' }}
            />
          </Box>

          {/* Comment Input */}
          <Box sx={{ backgroundColor: '#fff', p: 2 }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <textarea
                  className="form-control"
                  rows="2"
                  value={newComment}
                  onChange={handleInputChange}
                  placeholder="Write a comment..."
                  required
                  disabled={loading}
                  style={{ resize: 'vertical', width: '100%' }}
                />
                <Box textAlign="right">
                  <button
                    type="submit"
                    className="btn text-white btn-sm rounded-pill"
                    disabled={loading}
                    style={{ backgroundColor: '#6a994e', height: '38px' }}
                  >
                    <small className="mx-2">{loading ? 'Submitting...' : 'Submit Comment'}</small>
                  </button>
                </Box>
              </Box>
            </form>
          </Box>
        </>
      )}

      {/* Comments List */}
      <>
        {props.selectedObject?.id && props.comments.length > 0 ? (
           <Box sx={{ backgroundColor: '#fff', px: 2, py: 1 }}>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              maxHeight: '50vh',
              overflowY: 'auto',
            }}
          >
            {props.comments.map((comment, index) => {
              const [boldText, regularText] = comment.coment.split(':');
              return (
                <li key={index} style={{ marginBottom: '12px' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <i className="fas fa-comment-alt" style={{ color: '#a7c957', fontSize: '18px' }} />
                    <span style={{ fontSize: '13px', color: '#555' }}>
                      <strong>{boldText}:</strong> {comment.modifiedDate}
                    </span>
                  </Box>
                  <Box sx={{ fontSize: '13px', color: '#333', ml: '26px', lineHeight: 1.4 }}>
                    {regularText}
                  </Box>
                </li>
              );
            })}
          </ul>
           </Box>
        ) : (
          !props.selectedObject?.id && (
            <Box
              sx={{
                mt: '20%',
                textAlign: 'center',
                color: '#2757aa',
                backgroundColor: '#ecf4fc',
                py: 4,
              }}
            >
              <i className="fas fa-comment-alt" style={{ fontSize: '120px' }} />
              <Typography variant="body2" className="my-2">
                {props.loadingcomments ? 'Searching comments...' : 'Comments'}
              </Typography>
              {!props.loadingcomments && (
                <Typography variant="body2" sx={{ fontSize: '13px' }}>
                  Please select an object to preview comments
                </Typography>
              )}
            </Box>
          )
        )}
      </>
    </div>


  );
};

export default CommentsComponent;
