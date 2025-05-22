import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  IoSend, 
  IoTimeOutline, 
  IoPeopleOutline,
  IoBookmarkOutline
} from "react-icons/io5";
import { 
  FaEdit, 
  FaTrash, 
  FaRegClock,
  FaUtensils,
  FaRegBookmark
} from "react-icons/fa";
import { BiSolidLike, BiTime } from "react-icons/bi";
import { MdLocalDining } from "react-icons/md";
import { GiCook } from "react-icons/gi";
import NavBar from '../../Components/NavBar/NavBar';
import './DetailedPost.css';

function DetailedPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [postOwner, setPostOwner] = useState({});
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients');
  const loggedInUserID = localStorage.getItem('userID');

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch post data
        const postResponse = await axios.get(`http://localhost:8086/posts/${postId}`);
        const postData = postResponse.data;
        
        // Fetch post owner details
        const ownerResponse = await axios.get(`http://localhost:8086/user/${postData.userID}`);
        
        setPost(postData);
        setPostOwner({
          name: ownerResponse.data.fullname || 'Anonymous',
          avatar: ownerResponse.data.profilePicture || '/default-avatar.jpg'
        });
        
      } catch (err) {
        console.error('Error fetching post data:', err);
        setError('Failed to load post. Please try again later.');
        if (err.response?.status === 404) {
          navigate('/posts');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [postId, navigate]);

  const handleLike = async () => {
    if (!loggedInUserID) {
      alert('Please log in to like a post.');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8086/posts/${postId}/like`, null, {
        params: { userID: loggedInUserID },
      });
      setPost(prev => ({
        ...prev,
        likes: response.data.likes
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!loggedInUserID) {
      alert('Please log in to comment.');
      return;
    }
    if (!newComment.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8086/posts/${postId}/comment`, {
        userID: loggedInUserID,
        content: newComment,
      });
      
      // Fetch the user details for the new comment
      const userResponse = await axios.get(`http://localhost:8086/user/${loggedInUserID}`);
      
      setPost(prev => ({
        ...prev,
        comments: [
          ...(prev.comments || []),
          {
            ...response.data,
            userFullName: userResponse.data.fullname || 'Anonymous',
            userAvatar: userResponse.data.profilePicture || '/default-avatar.jpg'
          }
        ]
      }));
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this post?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8086/posts/${postId}`);
      alert('Post deleted successfully!');
      navigate('/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    }
  };

  const handleUpdate = () => {
    navigate(`/updatePost/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="detailed-post-container">
        <NavBar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detailed-post-container">
        <NavBar />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate('/posts')} className="back-button">
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="detailed-post-container">
        <NavBar />
        <div className="not-found-container">
          <p>Recipe not found</p>
          <button onClick={() => navigate('/posts')} className="back-button">
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detailed-post-container">
      <NavBar />
      <br></br>
      
      <div className="post-content">
        {/* Recipe Header */}
        <div className="recipe-header">
          <div className="recipe-meta">
            <div className="author-info">
              <img src={postOwner.avatar} alt={postOwner.name} className="author-avatar" />
              <span className="author-name">{postOwner.name}</span>
            </div>
            {post.userID === loggedInUserID && (
              <div className="post-actions">
                <button onClick={handleUpdate} className="action-button edit">
                  <FaEdit /> Edit
                </button>
                <button onClick={handleDelete} className="action-button delete">
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>
          
          <h1 className="recipe-title">{post.title}</h1>
          
          <div className="recipe-stats">
            <div className="stat-item">
              <BiTime className="stat-icon" />
              <span>{post.cookingTime} mins</span>
            </div>
            <div className="stat-item">
              <GiCook className="stat-icon" />
              <span>{post.difficulty}</span>
            </div>
            <div className="stat-item">
              <MdLocalDining className="stat-icon" />
              <span>{post.servings} servings</span>
            </div>
          </div>
          
          <div className="recipe-tags">
            {post.tags?.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
        
        {/* Recipe Gallery */}
        <div className="recipe-gallery">
          {post.media?.map((media, index) => (
            <div key={index} className="gallery-item">
              {media.endsWith('.mp4') ? (
                <video controls className="media-element">
                  <source src={`http://localhost:8086${media}`} type="video/mp4" />
                </video>
              ) : (
                <img 
                  src={`http://localhost:8086${media}`} 
                  alt={`${post.title} - ${index + 1}`} 
                  className="media-element" 
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Recipe Tabs */}
        <div className="recipe-tabs">
          <button 
            className={`tab-button ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            <FaUtensils className="tab-icon" /> Ingredients
          </button>
          <button 
            className={`tab-button ${activeTab === 'steps' ? 'active' : ''}`}
            onClick={() => setActiveTab('steps')}
          >
            <GiCook className="tab-icon" /> Steps
          </button>
          <button 
            className={`tab-button ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            <FaRegBookmark className="tab-icon" /> Comments
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'ingredients' && (
            <div className="ingredients-content">
              <h3 className="content-title">Ingredients</h3>
              <ul className="ingredients-list">
                {post.ingredients?.map((ingredient, index) => (
                  <li key={index} className="ingredient-item">
                    <span className="ingredient-quantity">{ingredient.quantity} {ingredient.unit}</span>
                    <span className="ingredient-name">{ingredient.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {activeTab === 'steps' && (
            <div className="steps-content">
              <h3 className="content-title">Cooking Steps</h3>
              <div className="steps-list">
                {post.steps?.map((step, index) => (
                  <div key={index} className="step-item">
                    <div className="step-number">{index + 1}</div>
                    <div className="step-details">
                      <p className="step-description">{step.description}</p>
                      {step.image && (
                        <div className="step-image">
                          <img 
                            src={`http://localhost:8086${step.image}`} 
                            alt={`Step ${index + 1}`} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'comments' && (
            <div className="comments-content">
              <div className="add-comment">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button onClick={handleAddComment} className="send-button">
                  <IoSend />
                </button>
              </div>
              
              <div className="comments-list">
                {post.comments?.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <img 
                        src={comment.userAvatar} 
                        alt={comment.userFullName} 
                        className="comment-avatar"
                      />
                      <div className="comment-body">
                        <div className="comment-header">
                          <span className="comment-author">{comment.userFullName}</span>
                          <span className="comment-time">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Like Button */}
        <div className="like-section">
          <button 
            onClick={handleLike} 
            className={`like-button ${post.likes?.[loggedInUserID] ? 'liked' : ''}`}
          >
            <BiSolidLike className="like-icon" />
            <span>
              {Object.values(post.likes || {}).filter(Boolean).length} Likes
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailedPost;