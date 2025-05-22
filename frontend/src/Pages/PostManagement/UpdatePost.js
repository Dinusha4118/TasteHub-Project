import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../Components/NavBar/NavBar';
import { FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import './AddNewPost.css';

function UpdatePost() {
  const { id } = useParams(); // Get the post ID from URL
  const navigate = useNavigate();

  // Post main fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [existingMedia, setExistingMedia] = useState([]);
  const [newMedia, setNewMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Ingredients
  const [ingredients, setIngredients] = useState([
    { quantity: '', unit: '', name: '' },
  ]);
  const units = ['g', 'kg', 'ml', 'l', 'cups', 'tbsp', 'tsp', 'pcs'];

  // Steps
  const [steps, setSteps] = useState([{ description: '', image: null }]);

  // Tags
  const cuisineTags = ['Italian', 'Mexican', 'Chinese', 'Indian', 'French'];
  const [tags, setTags] = useState([]);

  // Other fields
  const [cookingTime, setCookingTime] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const difficultyLevels = ['Easy', 'Medium', 'Hard'];
  const [servings, setServings] = useState('');

  // Fetch existing post data on load
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8086/posts/${id}`);
        const post = response.data;
        setTitle(post.title || '');
        setDescription(post.description || '');
        setCategory(post.category || '');
        setExistingMedia(post.media || []);
        // Initialize ingredients, steps, tags, cookingTime, difficulty, servings if available
        setIngredients(post.ingredients || [{ quantity: '', unit: '', name: '' }]);
        setSteps(post.steps || [{ description: '', image: null }]);
        setTags(post.tags || []);
        setCookingTime(post.cookingTime || '');
        setDifficulty(post.difficulty || '');
        setServings(post.servings || '');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        alert('Failed to fetch post details.');
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Handle media deletion
  const handleDeleteMedia = async (mediaUrl) => {
    if (!window.confirm('Are you sure you want to delete this media file?')) return;
    try {
      await axios.delete(`http://localhost:8086/posts/${id}/media`, {
        data: { mediaUrl },
      });
      setExistingMedia(existingMedia.filter((url) => url !== mediaUrl));
      alert('Media file deleted successfully!');
    } catch (error) {
      console.error('Error deleting media file:', error);
      alert('Failed to delete media file.');
    }
  };

  // Validate video duration
  const validateVideoDuration = (file) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > 30) {
          reject(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
        } else {
          resolve();
        }
      };

      video.onerror = () => {
        reject(`Failed to load video metadata for ${file.name}.`);
      };
    });
  };

  // Handle new media file input
  const handleNewMediaChange = async (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const maxImageCount = 3;

    let imageCount = existingMedia.filter((url) => !url.endsWith('.mp4')).length;
    let videoCount = existingMedia.filter((url) => url.endsWith('.mp4')).length;

    for (const file of files) {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} exceeds the maximum size of 50MB.`);
        return;
      }

      if (file.type.startsWith('image/')) {
        imageCount++;
        if (imageCount > maxImageCount) {
          alert('You can upload a maximum of 3 images.');
          return;
        }
      } else if (file.type === 'video/mp4') {
        videoCount++;
        if (videoCount > 1) {
          alert('You can upload only 1 video.');
          return;
        }
        try {
          await validateVideoDuration(file);
        } catch (error) {
          alert(error);
          return;
        }
      } else {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }
    }

    const previews = files.map(file => ({
      type: file.type,
      url: URL.createObjectURL(file)
    }));
    setMediaPreviews(previews);
    setNewMedia(files);
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleNewMediaChange({ target: { files } });
  };

  // Ingredient handlers
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { quantity: '', unit: '', name: '' }]);
  };

  // Step handlers
  const handleAddStep = () => {
    setSteps([...steps, { description: '', image: null }]);
  };
  const handleStepImageUpload = (index, file) => {
    const newSteps = [...steps];
    if (file) {
      newSteps[index].image = URL.createObjectURL(file);
    }
    setSteps(newSteps);
  };

  // Submit updated post
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct formData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);

    // Convert ingredients and steps to JSON strings (or adjust per backend)
    formData.append('ingredients', JSON.stringify(ingredients));
    formData.append('steps', JSON.stringify(steps));
    formData.append('tags', JSON.stringify(tags));
    formData.append('cookingTime', cookingTime);
    formData.append('difficulty', difficulty);
    formData.append('servings', servings);

    newMedia.forEach((file) => formData.append('newMediaFiles', file));

    try {
      await axios.put(`http://localhost:8086/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Post updated successfully!');
      navigate('/allPost');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="add-post-container">
      <NavBar />
      <div className="post-content-wrapper">
        <div className="post-form-container">
          <h1 className="post-form-title">Update Post</h1>

          <form onSubmit={handleSubmit} className="post-form">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                type="text"
                placeholder="Enter an engaging title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Share your thoughts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="Baking">Baking</option>
                <option value="Grilling">Grilling</option>
                <option value="Vegetarian Cooking">Vegetarian Cooking</option>
                <option value="Seafood Dishes">Seafood Dishes</option>
                <option value="International Cuisine">International Cuisine</option>
                <option value="Healthy Meals">Healthy Meals</option>
                <option value="Desserts">Desserts</option>
                <option value="Quick & Easy Recipes">Quick & Easy Recipes</option>
                <option value="Traditional Recipes">Traditional Recipes</option>

              </select>
            </div>

            {/* Ingredients */}
            <div className="form-group">
              <label>Ingredients</label>
              {ingredients.map((ing, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index].quantity = e.target.value;
                      setIngredients(newIngredients);
                    }}
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index].unit = e.target.value;
                      setIngredients(newIngredients);
                    }}
                  >
                    <option value="">Unit</option>
                    {units.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  <input
                    placeholder="Ingredient name"
                    value={ing.name}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index].name = e.target.value;
                      setIngredients(newIngredients);
                    }}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddIngredient} className="add-btn">
                <FaPlus /> Add Ingredient
              </button>
            </div>

            {/* Cooking Steps */}
            <div className="form-group">
              <label>Cooking Steps</label>
              {steps.map((step, index) => (
                <div key={index} className="step-row">
                  <div className="step-number">{index + 1}.</div>
                  <textarea
                    placeholder="Step description"
                    value={step.description}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[index].description = e.target.value;
                      setSteps(newSteps);
                    }}
                  />
                  <div className="step-image-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleStepImageUpload(index, e.target.files[0])}
                    />
                    <FaImage className="image-icon" />
                    {step.image && <img src={step.image} alt={`Step ${index + 1}`} />}
                  </div>
                </div>
              ))}
              <button type="button" onClick={handleAddStep} className="add-btn">
                <FaPlus /> Add Step
              </button>
            </div>

            {/* Cuisine Tags */}
            <div className="form-group">
              <label>Cuisine Tags</label>
              <div className="tags-container">
                {cuisineTags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    className={`tag ${tags.includes(tag) ? 'active' : ''}`}
                    onClick={() =>
                      setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])
                    }
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Time, Difficulty, Servings */}
            <div className="form-row">
              <div className="form-group">
                <label>Cooking Time (minutes)</label>
                <input
                  type="number"
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  required
                >
                  <option value="">Select difficulty</option>
                  {difficultyLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Serving Size</label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Media Upload */}
            <div className="form-group">
              <label className="form-label">Media</label>
              <div
                className={`file-input ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  id="media-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,video/mp4"
                  multiple
                  onChange={handleNewMediaChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="media-upload" className="file-upload-label">
                  <div className="upload-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div className="upload-text">
                    <p>Drag & drop files here or click to browse</p>
                    <p className="upload-hint">Supports: JPG, PNG, MP4 (max 50MB)</p>
                    <p className="upload-hint">Max 3 images and 1 video, videos max 30s</p>
                  </div>
                </label>
              </div>
              {/* Existing media display */}
              <div className="media-preview-container">
                {existingMedia.map((mediaUrl) => (
                  <div key={mediaUrl} className="media-preview">
                    {mediaUrl.endsWith('.mp4') ? (
                      <video src={mediaUrl} controls width={200} />
                    ) : (
                      <img src={mediaUrl} alt="Uploaded media" width={200} />
                    )}
                    <button
                      type="button"
                      className="delete-media-btn"
                      onClick={() => handleDeleteMedia(mediaUrl)}
                      title="Delete media"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                {/* New previews */}
                {mediaPreviews.map((media, idx) => (
                  <div key={idx} className="media-preview">
                    {media.type === 'video/mp4' ? (
                      <video src={media.url} controls width={200} />
                    ) : (
                      <img src={media.url} alt="Preview" width={200} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="submit-btn">Update Post</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdatePost;
