import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaPlus, 
  FaUserCircle, 
  FaSearch, 
  FaRegThumbsUp, 
  FaThumbsUp, 
  FaRegComment, 
  FaShare,
  FaHeart,
  FaRegHeart,
  FaEllipsisV,
  FaTrash,
  FaEdit
} from 'react-icons/fa';
import { BiHappy, BiSad, BiAngry, BiLike } from 'react-icons/bi';
import './HomePage.css';
import logo from '../../photos/logo.png';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    cuisine: 'All Cuisines',
    cookingTime: '',
    dietary: ''
  });
  const [reactionPickerVisible, setReactionPickerVisible] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null); // Track which post's menu is open
  const navigate = useNavigate();

  // Mock user - replace with actual auth
  const currentUser = {
    id: 'user123',
    name: 'Chef Michael'
  };

  // Reaction types
  const reactionTypes = [
    { type: 'like', icon: <BiLike size={20} />, label: 'Like', color: '#1877f2' },
    { type: 'love', icon: <FaHeart size={16} />, label: 'Love', color: '#f33e58' },
    { type: 'haha', icon: <BiHappy size={20} />, label: 'Haha', color: '#f7b125' },
    { type: 'sad', icon: <BiSad size={20} />, label: 'Sad', color: '#f7b125' },
    { type: 'angry', icon: <BiAngry size={20} />, label: 'Angry', color: '#e9710f' }
  ];

  // Fetch posts with filters
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8082/api/recipes');
      
      const transformedPosts = response.data.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        author: recipe.author || 'Anonymous',
        tags: recipe.tags || [],
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        mediaFiles: recipe.mediaFileIds ? recipe.mediaFileIds.map((fileId) => ({
          id: fileId,
          fileName: `http://localhost:8082/api/files/${fileId}`,
          contentType: 'image/jpeg'
        })) : [],
        reactions: [], // Initialize empty reactions array
        comments: [] // Initialize empty comments array
      }));
      
      setPosts(transformedPosts);
      setError(null);
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete recipe
  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:8082/api/recipes/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
      setMenuVisible(null); // Close the menu after deletion
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  // Handle edit recipe
  const handleEdit = (postId) => {
    navigate(`/edit-recipe/${postId}`);
    setMenuVisible(null); // Close the menu before navigation
  };

  // Toggle menu visibility
  const toggleMenu = (postId) => {
    setMenuVisible(menuVisible === postId ? null : postId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (menuVisible) {
        setMenuVisible(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [menuVisible]);

  // Filter posts based on search and filters
  const filterPosts = () => {
    return posts.filter(post => {
      if (!post) return false;
      
      const title = post.title || '';
      const description = post.description || '';
      const tags = post.tags || [];
      const cookingTime = post.cookingTime || 0;

      const matchesSearch = searchQuery === '' || 
                          title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCuisine = filters.cuisine === 'All Cuisines' || 
                            tags.some(tag => tag && tag.toLowerCase() === filters.cuisine.toLowerCase());
      
      const matchesDietary = !filters.dietary || 
                            tags.some(tag => tag && tag.toLowerCase() === filters.dietary.toLowerCase());
      
      const matchesCookingTime = !filters.cookingTime || (
        filters.cookingTime === '0-30 min' && cookingTime <= 30 ||
        filters.cookingTime === '30-60 min' && cookingTime > 30 && cookingTime <= 60 ||
        filters.cookingTime === '60+ min' && cookingTime > 60
      );
      
      return matchesSearch && matchesCuisine && matchesDietary && matchesCookingTime;
    });
  };

  // Handle reaction
  const handleReaction = async (postId, reactionType) => {
    try {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const existingReactionIndex = post.reactions.findIndex(r => r.userId === currentUser.id);
          
          if (existingReactionIndex >= 0) {
            if (post.reactions[existingReactionIndex].type === reactionType) {
              const updatedReactions = [...post.reactions];
              updatedReactions.splice(existingReactionIndex, 1);
              return { ...post, reactions: updatedReactions };
            } else {
              const updatedReactions = [...post.reactions];
              updatedReactions[existingReactionIndex] = { 
                ...updatedReactions[existingReactionIndex], 
                type: reactionType 
              };
              return { ...post, reactions: updatedReactions };
            }
          } else {
            const newReaction = {
              id: Math.max(...post.reactions.map(r => r.id), 0) + 1,
              userId: currentUser.id,
              type: reactionType
            };
            return { ...post, reactions: [...post.reactions, newReaction] };
          }
        }
        return post;
      });
      
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error adding reaction:', err);
    }
    setReactionPickerVisible(null);
  };

  // Fetch posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Apply filters when search or filters change
  const filteredPosts = filterPosts();

  return (
    <div className="home-container">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="logo-container">
          <img src={logo} alt="TasteHub Logo" className="logo" />
          <h1>TasteHub</h1>
        </div>
        
        <div className="nav-right">
          <button 
            className="add-post-button"
            onClick={() => navigate('/create-post')}
          >
            <FaPlus className="plus-icon" />
            Add Post
          </button>
          <div className="profile-section">
            <FaUserCircle className="profile-icon" />
            <span className="username">{currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-container">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search recipes..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select 
            className="filter-select"
            value={filters.cuisine}
            onChange={(e) => setFilters({...filters, cuisine: e.target.value})}
          >
            <option>All Cuisines</option>
            <option>Mediterranean</option>
            <option>Asian</option>
            <option>Mexican</option>
            <option>Italian</option>
            <option>Indian</option>
          </select>

          <select
            className="filter-select"
            value={filters.cookingTime}
            onChange={(e) => setFilters({...filters, cookingTime: e.target.value})}
          >
            <option value="">All Cooking Times</option>
            <option value="0-30 min">0-30 min</option>
            <option value="30-60 min">30-60 min</option>
            <option value="60+ min">60+ min</option>
          </select>

          <select
            className="filter-select"
            value={filters.dietary}
            onChange={(e) => setFilters({...filters, dietary: e.target.value})}
          >
            <option value="">All Dietary</option>
            <option>Vegetarian</option>
            <option>Vegan</option>
            <option>Gluten-Free</option>
            <option>Dairy-Free</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="loading-spinner">Loading recipes...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredPosts.length === 0 ? (
        <div className="no-results">No recipes found matching your criteria</div>
      ) : (
        <div className="posts-grid">
          {filteredPosts.map(post => {
            const userReaction = post.reactions?.find(r => r.userId === currentUser.id);
            const reactionCounts = post.reactions?.reduce((acc, reaction) => {
              acc[reaction.type] = (acc[reaction.type] || 0) + 1;
              return acc;
            }, {});
            const totalReactions = post.reactions?.length || 0;

            return (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="chef-info">
                    <FaUserCircle className="chef-icon" />
                    <h3 className="chef-name">Chef {post.author || 'Anonymous'}</h3>
                  </div>
                  <div className="post-actions">
                    <button 
                      className="menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(post.id);
                      }}
                    >
                      <FaEllipsisV />
                    </button>
                    {menuVisible === post.id && (
                      <div className="post-menu" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleEdit(post.id)}>
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(post.id)}>
                          <FaTrash /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <h2 className="recipe-title">{post.title}</h2>
                </div>
                
                <div className="post-meta">
                  <span className="cooking-time">{post.cookingTime} min</span>
                  <span className="difficulty">{post.difficulty}</span>
                </div>

                <p className="recipe-description">{post.description}</p>

                {/* Post image/media */}
                {post.mediaFiles?.[0] && (
                  <div className="post-media">
                    <img 
                      src={post.mediaFiles[0].fileName} 
                      alt={post.title}
                      className="post-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Recipe+Image';
                        e.target.style.objectFit = 'contain';
                      }}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}

                {/* Engagement metrics */}
                <div className="engagement-metrics">
                  {totalReactions > 0 && (
                    <div className="reaction-summary">
                      {reactionTypes.map(type => (
                        reactionCounts?.[type.type] > 0 && (
                          <span 
                            key={type.type}
                            style={{ color: type.color }}
                            title={`${reactionCounts[type.type]} ${type.label}`}
                          >
                            {type.icon}
                          </span>
                        )
                      ))}
                      <span className="reaction-count">{totalReactions}</span>
                    </div>
                  )}
                  <div className="comment-count">
                    {post.comments?.length || 0} comments
                  </div>
                </div>

                {/* Reaction bar */}
                <div className="reaction-bar">
                  <div 
                    className="reaction-button"
                    onMouseEnter={() => setReactionPickerVisible(post.id)}
                    onMouseLeave={() => !reactionPickerVisible && setReactionPickerVisible(null)}
                  >
                    {userReaction ? (
                      <>
                        {reactionTypes.find(r => r.type === userReaction.type)?.icon}
                        <span style={{ 
                          color: reactionTypes.find(r => r.type === userReaction.type)?.color 
                        }}>
                          {userReaction.type.charAt(0).toUpperCase() + userReaction.type.slice(1)}
                        </span>
                      </>
                    ) : (
                      <>
                        <FaRegThumbsUp />
                        <span>Like</span>
                      </>
                    )}
                  </div>
                  
                  {reactionPickerVisible === post.id && (
                    <div 
                      className="reaction-picker"
                      onMouseEnter={() => setReactionPickerVisible(post.id)}
                      onMouseLeave={() => setReactionPickerVisible(null)}
                    >
                      {reactionTypes.map(reaction => (
                        <div 
                          key={reaction.type}
                          className="reaction-option"
                          onClick={() => handleReaction(post.id, reaction.type)}
                          style={{ color: reaction.color }}
                          title={reaction.label}
                        >
                          {reaction.icon}
                        </div>
                      ))}
                    </div>
                  )}

                  <button className="comment-button">
                    <FaRegComment />
                    <span>Comment</span>
                  </button>

                  <button className="share-button">
                    <FaShare />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomePage;