import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreatePostPage.css';
import React, { useState } from 'react';
import logo from '../../photos/logo.png';
import { FaPlus, FaTrash, FaImage, FaUpload, FaSignOutAlt, FaUserCircle, FaEye } from 'react-icons/fa';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, control } = useForm();
  const [ingredients, setIngredients] = useState([{ quantity: '', unit: '', name: '' }]);
  const [steps, setSteps] = useState([{ description: '', image: null }]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const difficultyLevels = ['Easy', 'Medium', 'Advanced'];
  const units = ['cups', 'tbsp', 'tsp', 'grams', 'kg', 'pieces'];
  const cuisineTags = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian'];

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { quantity: '', unit: '', name: '' }]);
  };

  const handleAddStep = () => {
    setSteps([...steps, { description: '', image: null }]);
  };

  const handleStepImageUpload = (index, file) => {
    const newSteps = [...steps];
    newSteps[index].imageFile = file; // Store File object
    newSteps[index].image = URL.createObjectURL(file); // For preview
    setSteps(newSteps);
  };

  const handleSignOut = () => {
    navigate('/login');
  };

  const handlePreview = (data) => {
    setPreviewData({
      ...data,
      ingredients,
      steps,
      tags,
      mediaFiles: mediaFiles.map(file => URL.createObjectURL(file))
    });
    setShowPreview(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('cookingTime', data.cookingTime);
      formData.append('difficulty', data.difficulty);
      formData.append('servings', data.servings);
      formData.append('tags', JSON.stringify(tags));
      
     // Update ingredients appending
      ingredients.forEach((ing, index) => {
      formData.append(`ingredients[${index}].quantity`, ing.quantity);
      formData.append(`ingredients[${index}].unit`, ing.unit);
      formData.append(`ingredients[${index}].name`, ing.name);
     });

      // Update steps appending (include image files)
     steps.forEach((step, index) => {
     formData.append(`steps[${index}].description`, step.description);
     if (step.imageFile) { // Store the File object here
     formData.append(`steps[${index}].image`, step.imageFile);
     }
   });

      mediaFiles.forEach((file) => {
        formData.append('media', file);
      });

      await axios.post('http://localhost:8081/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image'
  ];

  return (
    <div className="create-post-container">
      {/* Top Navigation Bar */}
      <div className="top-nav">
        <div className="logo-container">
          <img src={logo} alt="TasteHub Logo" className="logo" />
          <h1>TasteHub</h1>
        </div>
        
        <div className="nav-right">
          <div className="profile-section">
            <div className="profile-icon-container">
              <FaUserCircle className="profile-icon" />
              <span className="username">Chef Michael</span>
            </div>
            <button 
              className="sign-out-btn"
              onClick={handleSignOut}
            >
              <FaSignOutAlt className="sign-out-icon" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {showPreview ? (
        <div className="preview-container">
          <h2>Recipe Preview</h2>
          
          <div className="preview-header">
            <h1>{previewData.title}</h1>
            <div className="preview-meta">
              <span>Cooking Time: {previewData.cookingTime} minutes</span>
              <span>Difficulty: {previewData.difficulty}</span>
              <span>Servings: {previewData.servings}</span>
            </div>
          </div>

          <div className="preview-content">
            <div className="preview-section">
              <h3>Description</h3>
              <div dangerouslySetInnerHTML={{ __html: previewData.description }} />
            </div>

            <div className="preview-section">
              <h3>Ingredients</h3>
              <ul>
                {previewData.ingredients.map((ing, index) => (
                  <li key={index}>
                    {ing.quantity} {ing.unit} {ing.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className="preview-section">
              <h3>Steps</h3>
              <ol>
                {previewData.steps.map((step, index) => (
                  <li key={index}>
                    <p>{step.description}</p>
                    {step.image && <img src={step.image} alt={`Step ${index + 1}`} />}
                  </li>
                ))}
              </ol>
            </div>

            {previewData.mediaFiles.length > 0 && (
              <div className="preview-section">
                <h3>Media</h3>
                <div className="preview-media">
                  {previewData.mediaFiles.map((file, index) => (
                    <img key={index} src={file} alt={`Media ${index + 1}`} />
                  ))}
                </div>
              </div>
            )}

            <div className="preview-tags">
              {previewData.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="preview-actions">
            <button 
              className="edit-btn"
              onClick={() => setShowPreview(false)}
            >
              Back to Editing
            </button>
            <button 
              className="submit-btn"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Recipe'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2>Create New Recipe</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
          <label>Recipe Title</label>
          <input
            {...register('title', { required: true })}
            placeholder="Name your recipe"
          />
        </div>

        {/* Description Editor */}
        <div className="form-group">
          <label>Recipe Description</label>
          <Controller
            name="description"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <ReactQuill
                theme="snow"
                modules={modules}
                formats={formats}
                {...field}
                onChange={(content, delta, source, editor) => {
                  field.onChange(editor.getHTML());
                }}
              />
            )}
          />
        </div>

        {/* Ingredients Section */}
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

        {/* Steps Section */}
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

        {/* Media Upload */}
        <div className="form-group">
          <label>Media Upload</label>
          <div className="media-upload">
            <FaUpload className="upload-icon" />
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={(e) => setMediaFiles([...e.target.files])}
            />
            <p>Drag & drop files here, or click to select</p>
          </div>
        </div>

        {/* Tags and Metadata */}
        <div className="form-row">
          <div className="form-group">
            <label>Cuisine Tags</label>
            <div className="tags-container">
              {cuisineTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`tag ${tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Cooking Time (minutes)</label>
            <input
              type="number"
              {...register('cookingTime', { required: true })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Difficulty Level</label>
            <select {...register('difficulty', { required: true })}>
              {difficultyLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Serving Size</label>
            <input
              type="number"
              {...register('servings', { required: true })}
            />
          </div>
        </div>
            <div className="form-actions">
              <button 
                type="button" 
                className="preview-btn"
                onClick={handleSubmit(handlePreview)}
              >
                <FaEye /> Preview
              </button>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Create Recipe'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CreatePostPage;