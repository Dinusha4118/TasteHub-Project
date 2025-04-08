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
  FaRegHeart
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
  const navigate = useNavigate();

  // Mock user - replace with actual auth
  const currentUser = {
    id: 'user123',
    name: 'Chef Michael'
  };

  // Sample posts data with proper image URLs
  const samplePosts = [
    {
      id: 1,
      title: 'Classic Margherita Pizza',
      description: 'A simple yet delicious traditional Italian pizza with fresh basil, mozzarella, and tomato sauce.',
      cookingTime: 30,
      difficulty: 'Medium',
      servings: 4,
      author: 'Maria',
      tags: ['Italian', 'Pizza', 'Vegetarian'],
      ingredients: [
        { id: 1, name: 'Pizza dough', amount: '1 ball' },
        { id: 2, name: 'Tomato sauce', amount: '1/2 cup' },
        { id: 3, name: 'Fresh mozzarella', amount: '200g' },
        { id: 4, name: 'Fresh basil', amount: '10 leaves' }
      ],
      steps: [
        { id: 1, stepNumber: 1, instruction: 'Preheat oven to 475°F (245°C)' },
        { id: 2, stepNumber: 2, instruction: 'Roll out the dough on a floured surface' },
        { id: 3, stepNumber: 3, instruction: 'Spread tomato sauce evenly over the dough' },
        { id: 4, stepNumber: 4, instruction: 'Add sliced mozzarella and bake for 10-12 minutes' }
      ],
      mediaFiles: [
        { 
          id: 1, 
          fileName: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 
          contentType: 'image/jpeg' 
        }
      ],
      reactions: [
        { id: 1, userId: 'user456', type: 'love' },
        { id: 2, userId: 'user789', type: 'like' }
      ],
      comments: [
        { id: 1, userId: 'user456', text: 'Looks amazing!', createdAt: '2023-05-15' }
      ]
    },
    {
      id: 2,
      title: 'Spicy Chicken Tacos',
      description: 'Flavorful tacos with marinated chicken, fresh veggies, and a spicy sauce.',
      cookingTime: 45,
      difficulty: 'Easy',
      servings: 3,
      author: 'Carlos',
      tags: ['Mexican', 'Spicy', 'Chicken'],
      ingredients: [
        { id: 1, name: 'Chicken breast', amount: '2 pieces' },
        { id: 2, name: 'Taco seasoning', amount: '2 tbsp' },
        { id: 3, name: 'Corn tortillas', amount: '6 pieces' },
        { id: 4, name: 'Avocado', amount: '1' }
      ],
      steps: [
        { id: 1, stepNumber: 1, instruction: 'Marinate chicken with spices for 30 minutes' },
        { id: 2, stepNumber: 2, instruction: 'Grill chicken until fully cooked' },
        { id: 3, stepNumber: 3, instruction: 'Slice chicken into strips' },
        { id: 4, stepNumber: 4, instruction: 'Assemble tacos with your favorite toppings' }
      ],
      mediaFiles: [
        { 
          id: 1, 
          fileName: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 
          contentType: 'image/jpeg' 
        }
      ],
      reactions: [
        { id: 1, userId: 'user123', type: 'like' },
        { id: 2, userId: 'user789', type: 'haha' }
      ],
      comments: []
    },
    {
      id: 3,
      title: 'Vegetable Stir Fry',
      description: 'Quick and healthy vegetable stir fry with a savory sauce.',
      cookingTime: 20,
      difficulty: 'Easy',
      servings: 2,
      author: 'Ling',
      tags: ['Asian', 'Vegetarian', 'Healthy'],
      ingredients: [
        { id: 1, name: 'Broccoli', amount: '1 cup' },
        { id: 2, name: 'Bell peppers', amount: '1' },
        { id: 3, name: 'Carrots', amount: '2' },
        { id: 4, name: 'Soy sauce', amount: '2 tbsp' }
      ],
      steps: [
        { id: 1, stepNumber: 1, instruction: 'Chop all vegetables into bite-sized pieces' },
        { id: 2, stepNumber: 2, instruction: 'Heat oil in a wok or large pan' },
        { id: 3, stepNumber: 3, instruction: 'Stir fry vegetables for 5-7 minutes' },
        { id: 4, stepNumber: 4, instruction: 'Add sauce and cook for another 2 minutes' }
      ],
      mediaFiles: [
        { 
          id: 1, 
          fileName: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 
          contentType: 'image/jpeg' 
        }
      ],
      reactions: [
        { id: 1, userId: 'user456', type: 'love' }
      ],
      comments: [
        { id: 1, userId: 'user789', text: 'Perfect for weeknight dinners!', createdAt: '2023-05-10' }
      ]
    },
    {
      id: 4,
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies that are soft and chewy.',
      cookingTime: 25,
      difficulty: 'Easy',
      servings: 24,
      author: 'Emma',
      tags: ['Dessert', 'Baking', 'Cookies'],
      ingredients: [
        { id: 1, name: 'All-purpose flour', amount: '2 1/4 cups' },
        { id: 2, name: 'Butter', amount: '1 cup' },
        { id: 3, name: 'Brown sugar', amount: '3/4 cup' },
        { id: 4, name: 'Chocolate chips', amount: '2 cups' }
      ],
      steps: [
        { id: 1, stepNumber: 1, instruction: 'Preheat oven to 375°F (190°C)' },
        { id: 2, stepNumber: 2, instruction: 'Cream together butter and sugars' },
        { id: 3, stepNumber: 3, instruction: 'Mix in eggs and vanilla' },
        { id: 4, stepNumber: 4, instruction: 'Bake for 9-11 minutes until golden brown' }
      ],
      mediaFiles: [
        { 
          id: 1, 
          fileName: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 
          contentType: 'image/jpeg' 
        }
      ],
      reactions: [
        { id: 1, userId: 'user123', type: 'love' },
        { id: 2, userId: 'user456', type: 'love' },
        { id: 3, userId: 'user789', type: 'like' }
      ],
      comments: [
        { id: 1, userId: 'user123', text: 'My family loves these!', createdAt: '2023-05-05' },
        { id: 2, userId: 'user456', text: 'Added nuts for extra crunch', createdAt: '2023-05-06' }
      ]
    }
  ];

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
      const params = {
        search: searchQuery,
        cuisine: filters.cuisine !== 'All Cuisines' ? filters.cuisine : null,
        cookingTime: filters.cookingTime,
        dietary: filters.dietary
      };
      
      // For demo purposes, we'll use the sample posts
      let filteredPosts = samplePosts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCuisine = filters.cuisine === 'All Cuisines' || 
                              post.tags.some(tag => tag.toLowerCase() === filters.cuisine.toLowerCase());
        
        const matchesDietary = !filters.dietary || 
                              post.tags.some(tag => tag.toLowerCase() === filters.dietary.toLowerCase());
        
        const matchesCookingTime = !filters.cookingTime || (
          filters.cookingTime === '0-30 min' && post.cookingTime <= 30 ||
          filters.cookingTime === '30-60 min' && post.cookingTime > 30 && post.cookingTime <= 60 ||
          filters.cookingTime === '60+ min' && post.cookingTime > 60
        );
        
        return matchesSearch && matchesCuisine && matchesDietary && matchesCookingTime;
      });
      
      setPosts(filteredPosts);
      setError(null);
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
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

  // Fetch posts on mount and when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

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
      ) : posts.length === 0 ? (
        <div className="no-results">No recipes found matching your criteria</div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => {
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
                      }}
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