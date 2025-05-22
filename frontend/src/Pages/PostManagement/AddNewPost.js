import React, { useState } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import NavBar from '../../Components/NavBar/NavBar';
import './AddNewPost.css';

function AddNewPost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState([{ quantity: '', unit: '', name: '' }]);
  const [steps, setSteps] = useState([{ description: '', imageFile: null }]);
  const [tags, setTags] = useState([]);
  const [cookingTime, setCookingTime] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [servings, setServings] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const difficultyLevels = ['Easy', 'Medium', 'Advanced'];
  const units = ['cups', 'tbsp', 'tsp', 'grams', 'kg', 'pieces'];
  const cuisineTags = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian'];
  const userID = localStorage.getItem('userID');

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    processMediaFiles(files);
  };

  // Ingredient handlers
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { quantity: '', unit: '', name: '' }]);
  };
  const handleIngredientChange = (i, field, val) => {
    const arr = [...ingredients];
    arr[i][field] = val;
    setIngredients(arr);
  };
  const handleRemoveIngredient = i => {
    setIngredients(ingredients.filter((_, idx) => idx !== i));
  };

  // Step handlers
  const handleAddStep = () => {
    setSteps([...steps, { description: '', imageFile: null }]);
  };
  const handleStepChange = (i, val) => {
    const arr = [...steps];
    arr[i].description = val;
    setSteps(arr);
  };
  const handleStepImageUpload = (index, file) => {
  const newSteps = [...steps];
  newSteps[index].imageFile = file;
  setSteps(newSteps);
};

const handleRemoveStepImage = (index) => {
  const newSteps = [...steps];
  newSteps[index].imageFile = null;
  setSteps(newSteps);
};
  

  // Media handlers
 

  const processMediaFiles = (files) => {
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    let imageCount = 0;
    let videoCount = 0;
    const previews = [];

    for (const file of files) {
      if (file.size > maxFileSize) {
           alert(`File ${file.name} exceeds the maximum size of 50MB.`);
           return;
        }

      if (file.type.startsWith('image/')) {
        imageCount++;
      } else if (file.type === 'video/mp4') {
        videoCount++;

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(file);

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert(`Video ${file.name} exceeds the maximum duration of 30 seconds.`);
            window.location.reload();
          }
        };
      } else {
        alert(`Unsupported file type: ${file.type}`);
        return;
      }

      previews.push({ type: file.type, url: URL.createObjectURL(file) });
    }

    if (imageCount > 3) {
      alert('You can upload a maximum of 3 images.');
      return;
    }

    if (videoCount > 1) {
      alert('You can upload only 1 video.');
      return;
    }

    setMedia([...media, ...files]);
    setMediaPreviews([...mediaPreviews, ...previews]);
  };

  const removeMedia = (index) => {
    const updatedMedia = [...media];
    const updatedPreviews = [...mediaPreviews];
    
    URL.revokeObjectURL(mediaPreviews[index].url);
    
    updatedMedia.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    setMedia(updatedMedia);
    setMediaPreviews(updatedPreviews);
  };

  // Drag & drop
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = e => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = e => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = e => { e.preventDefault(); setIsDragging(false); processMediaFiles(Array.from(e.dataTransfer.files)); };

  // Submit
  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!title||!description||!category||media.length===0) {
      alert('Fill all required & upload media');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('userID', userID);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('ingredients', JSON.stringify(ingredients));
    formData.append(
      'steps',
      JSON.stringify(steps.map(s => ({ description: s.description })))
    );
    formData.append('tags', JSON.stringify(tags));
    formData.append('cookingTime', cookingTime);
    formData.append('difficulty', difficulty);
    formData.append('servings', servings);
    media.forEach((file) => formData.append('mediaFiles', file));
    steps.forEach(s => s.imageFile && formData.append('stepImages', s.imageFile))

    try {
      await axios.post(
        'http://localhost:8086/posts',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      alert('Post created!');
      window.location.href = '/myAllPost';
    } catch (err) {
      console.error(err);
      alert(err.response?.data || 'Create failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-post-container">
      <NavBar />
      <div className="post-content-wrapper">
        <div className="post-form-container">
          <h1>Create New Post</h1>
          <form onSubmit={handleSubmit} className="post-form">
            {/* Title */}
            <div className="form-group">
              <label>Title</label>
              <input value={title}
                     onChange={e => setTitle(e.target.value)}
                     required/>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>Description</label>
              <textarea value={description}
                        onChange={e => setDescription(e.target.value)}
                        required rows={4}/>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category</label>
              <select value={category}
                      onChange={e=>setCategory(e.target.value)}
                      required>
                <option value="">Select…</option>
                <option>Baking</option>
                <option>Grilling</option>
                <option>Vegetarian Cooking</option>
                <option>Seafood Dishes</option>
                <option>International Cuisine</option>
                <option>Healthy Meals</option>
                <option>Desserts</option>
                <option>Quick & Easy Recipes</option>
                <option>Traditional Recipes</option>
              </select>
            </div>

            {/* Ingredients */}
            <div className="form-group">
              <label>Ingredients</label>
              {ingredients.map((ing,i) =>
                <div key={i} className="ingredient-row">
                  <input type="number" placeholder="Qty"
                         value={ing.quantity}
                         onChange={e=>handleIngredientChange(i,'quantity',e.target.value)}/>
                  <select value={ing.unit}
                          onChange={e=>handleIngredientChange(i,'unit',e.target.value)}>
                    <option value="">Unit</option>
                    {units.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <input placeholder="Name"
                         value={ing.name}
                         onChange={e=>handleIngredientChange(i,'name',e.target.value)}/>
                  {i>0 &&
                    <button type="button"
                            className="remove-btn"
                            onClick={()=>handleRemoveIngredient(i)}>
                      <FaTrash/>
                    </button>
                  }
                </div>
              )}
              <button type="button" onClick={handleAddIngredient}
                      className="add-btn"><FaPlus/> Add Ingredient
              </button>
            </div>

            {/* Steps */}
            <div className="form-group">
              <label>Cooking Steps</label>
              {steps.map((s,i) =>
                <div key={i} className="step-row">
                  <div className="step-number">{i+1}.</div>
                  <textarea placeholder="Description"
                            value={s.description}
                            onChange={e=>handleStepChange(i,e.target.value)}/>
                  <div className="step-image-upload">
                    <input type="file"
                           accept="image/*"
                           id={`step-img-${i}`}
                           style={{display:'none'}}
                           onChange={e=>handleStepImageUpload(i,e.target.files[0])}/>
                    <label htmlFor={`step-img-${i}`} className="image-upload-label">
                      <FaImage/>
                      {s.imageFile
                        ? <button type="button"
                                  className="remove-image-btn"
                                  onClick={()=>handleRemoveStepImage(i)}>
                            <FaTrash/>
                          </button>
                        : <span>Add Image</span>
                      }
                    </label>
                  </div>
                </div>
              )}
              <button type="button" onClick={handleAddStep}
                      className="add-btn"><FaPlus/> Add Step
              </button>
            </div>

            {/* Tags + Cooking Time */}
            <div className="form-row">
              <div className="form-group">
                <label>Cuisine Tags</label>
                <div className="tags-container">
                  {cuisineTags.map(tag =>
                    <button key={tag}
                            type="button"
                            className={`tag ${tags.includes(tag)?'active':''}`}
                            onClick={()=>setTags(tags.includes(tag)
                              ? tags.filter(t=>t!==tag)
                              : [...tags,tag])}>
                      {tag}
                    </button>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Cooking Time (mins)</label>
                <input type="number"
                       value={cookingTime}
                       onChange={e=>setCookingTime(e.target.value)}
                       required/>
              </div>
            </div>

            {/* Difficulty + Servings */}
            <div className="form-row">
              <div className="form-group">
                <label>Difficulty</label>
                <select value={difficulty}
                        onChange={e=>setDifficulty(e.target.value)}
                        required>
                  <option value="">Select…</option>
                  {difficultyLevels.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Servings</label>
                <input type="number"
                       value={servings}
                       onChange={e=>setServings(e.target.value)}
                       required/>
              </div>
            </div>

            {/* Media */}
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
                  onChange={handleMediaChange}
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
                    <p className="upload-limits">Limits: 3 images, 1 video (max 30s)</p>
                  </div>
                </label>
              </div>
               {mediaPreviews.length > 0 && (
                <div className="media-preview-grid">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="media-preview-item">
                      {preview.type.startsWith('video/') ? (
                        <video controls className="media-preview">
                          <source src={preview.url} type={preview.type} />
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img className="media-preview" src={preview.url} alt={`Preview ${index + 1}`} />
                      )}
                      <button 
                        type="button" 
                        className="remove-media-btn"
                        onClick={() => removeMedia(index)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            

            <button type="submit" className="submit-button"
                    disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Post'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddNewPost;
