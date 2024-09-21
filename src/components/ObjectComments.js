import React, { useState } from 'react';
import axios from 'axios';

const CommentsComponent = (props) => {
  const [newComment, setNewComment] = useState(''); // For holding new comment text
  const [loading, setLoading] = useState(false); // Loading state for form submission

  // Handle input change for new comment
  const handleInputChange = (e) => {
    setNewComment(e.target.value);
  };

  // Refresh comments
  const refreshComments = () => {
    props.getObjectComments();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Make sure the comment is not empty
    if (newComment.trim()) {
      setLoading(true); // Start loading

      const url = 'http://192.236.194.251:240/api/Comments';
      const data = {
        comment: `${props.user.first_name} ${props.user.last_name} :  ${newComment}`,
        objectId: 18,
        vaultGuid: '{E19BECA0-7542-451B-81E5-4CADB636FCD5}',
        objectTypeId: 0,
      };

      try {
        // Post the new comment
        await axios.post(url, data, {
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
          },
        });

        // Reload the comments after successful post
        props.getObjectComments();
        setNewComment(''); // Clear input field
      } catch (err) {
        console.error('Error posting comment:', err);
      } finally {
        setLoading(false); // Stop loading after request finishes
      }
    }
  };

  return (
    <div className="bg-white p-4 shadow-lg">
      <h5 className="my-3">Comments</h5>
      {props.comments.length > 0 ? (
        <ul
          style={{ listStyle: 'none', padding: 0, height: '40vh', overflowY: 'scroll' }}
          className="p-3"
        >
          {props.comments.map((comment, index) => {
            const [boldText, regularText] = comment.coment.split(':'); // Split the text at the colon

            return (
              <li
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  flexDirection: 'column',
                  marginBottom: '15px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '5px',
                  }}
                >
                  <i
                    className="fas fa-comment-alt"
                    style={{
                      marginRight: '10px',
                      color: '#a7c957',
                      fontSize: '20px',
                    }}
                  ></i>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#555',
                    }}
                  >
                    <strong>{boldText}:</strong> {/* Make the part before the colon bold */} {comment.modifiedDate}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '12.5px',
                    lineHeight: '1.5',
                    color: '#333',
                  }}
                  className="mx-4"
                >
                 
                  {regularText} {/* Keep the part after the colon as normal text */}
                </span>
              </li>
            );
          })}

        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="form-group">
          <textarea
            className="form-control"
            rows="2"
            value={newComment}
            onChange={handleInputChange}
            placeholder="Write a comment..."
            required
            disabled={loading} // Disable input while loading
          ></textarea>
        </div>
        <div className="my-2">
          <button
            type="button"
            onClick={refreshComments}
            className="btn btn-primary btn-sm mt-2 mx-2"
            disabled={loading}
          >
            <span className="fas fa-sync-alt"></span>
            <small className="mx-2">Refresh</small>
          </button>
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
    </div>
  );
};

export default CommentsComponent;
