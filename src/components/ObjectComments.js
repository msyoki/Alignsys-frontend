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
          {/* Header Section */}
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
              paddingRight: '10px',
            }}
          >

            <Box

              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                fontSize: 'important 13px',
                backgroundColor: '#ecf4fc',
                height: '53px',
                color: '#1d3557'

              }}
            >


              <i className="fas fa-file-pdf text-danger mx-2" style={{ fontSize: '25px' }}></i>
              <span style={{ fontSize: '13px' }}>{props.docTitle}.pdf</span>



            </Box>

            <Box sx={{ textAlign: 'right' }}>

              <span
                className="fas fa-sync-alt btn-sm mx-2 "
                onClick={refreshComments}
                style={{
                  cursor: 'pointer',
                  padding: '8px',



                  fontSize: '15px',
                }}
              // onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1e4a94')}
              // onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2757aa')}
              />
            </Box>
          </Box>

          {/* Comment Input Section */}
          <Box className="p-2" sx={{ width: '100%' }}>
            <form onSubmit={handleSubmit} className="p-2" style={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <textarea
                  className="form-control"
                  rows="2"
                  value={newComment}
                  onChange={handleInputChange}
                  placeholder="Write a comment..."
                  required
                  disabled={loading}
                  style={{ flex: 5 }}
                />
                <button
                  type="submit"
                  className="btn text-white btn-sm rounded-pill"
                  disabled={loading}
                  style={{
                    backgroundColor: '#6a994e',
                    height: '38px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <small className='mx-2'>{loading ? 'Submitting...' : 'Submit Comment'}</small>
                </button>
              </Box>
            </form>
          </Box>
        </>
      )}

      {/* Comments Section */}
      <Box sx={{ backgroundColor: '#fff' }}>
        {props.selectedObject?.id && props.comments.length > 0 ? (
          <ul
            className="bg-white"
            style={{
              listStyle: 'none',
              padding: '0.5rem',
              margin: 0,
              height: '50vh',
              overflowY: 'auto',
            }}
          >
            {props.comments.map((comment, index) => {
              const [boldText, regularText] = comment.coment.split(':');
              return (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i
                      className="fas fa-comment-alt"
                      style={{ color: '#a7c957', fontSize: '18px' }}
                    />
                    <span style={{ fontSize: '13px', color: '#555' }}>
                      <strong>{boldText}:</strong> {comment.modifiedDate}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.4', color: '#333', marginLeft: '26px' }}>
                    {regularText}
                  </div>
                </li>
              );
            })}
          </ul>

        ) : (
          <>
            {!props.selectedObject?.id ?
              <>
                <Box
                  sx={{
                    width: '100%',
                    marginTop: props.selectedObject?.id ? 0 : '20%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                  }}
                >
                  <i className="fas fa-comment-alt my-2" style={{ fontSize: '120px', color: '#2757aa' }}></i>
                  {props.loadingcomments ? (
                    <Typography variant="body2" className="my-2" sx={{ textAlign: 'center' }}>
                      Searching comments...
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body2" className="my-2" sx={{ textAlign: 'center' }}>
                        Comments
                      </Typography>
                      <Typography variant="body2" sx={{ textAlign: 'center', fontSize: '13px' }}>
                        Please select an object to preview comments
                      </Typography>
                    </>
                  )}
                </Box>
              </> : <></>}


          </>
        )}
      </Box>
    </div>

  );
};

export default CommentsComponent;
