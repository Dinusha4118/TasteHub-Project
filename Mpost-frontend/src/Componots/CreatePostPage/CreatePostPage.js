import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './CreatePostPage.css';
import React, { useState, useEffect } from 'react';
import logo from '../../photos/logo.png';
import { FaPlus, FaTrash, FaImage, FaUpload, FaSignOutAlt, FaUserCircle, FaEye, FaSave } from 'react-icons/fa';

const CreatePostPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { register, handleSubmit, control, setValue } = useForm();
  const [ingredients, setIngredients] = useState([{ quantity: '', unit: '', name: '' }]);
  const [steps, setSteps] = useState([{ description: '', image: null, imageFile: null, imageFileId: null }]);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const difficultyLevels = ['Easy', 'Medium', 'Advanced'];
  const units = ['cups', 'tbsp', 'tsp', 'grams', 'kg', 'pieces'];
  const cuisineTags = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian'];

  // Fetch recipe data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchRecipe = async () => {
        try {
          const response = await axios.get(`http://localhost:8082/api/recipes/${id}`);
          const recipe = response.data;
          
          // Set form values
          setValue('title', recipe.title);
          setValue('description', recipe.description);
          setValue('cookingTime', recipe.cookingTime);
          setValue('servings', recipe.servings);
          setValue('difficulty', recipe.difficulty);
          setValue('difficulty', recipe.difficulty);
          
          // Set other states
          setIngredients(recipe.ingredients || [{ quantity: '', unit: '', name: '' }]);
          setSteps(recipe.steps?.map(step => ({
            description: step.description,
            image: step.imageFileId ? `http://localhost:8082/api/files/${step.imageFileId}` : null,
            imageFileId: step.imageFileId,
            imageFile: null
          })) || [{ description: '', image: null }]);
          setTags(recipe.tags || []);
          setMediaFiles(recipe.mediaFileIds || []);

        } catch (err) {
          console.error('Error fetching recipe:', err);
          alert('Failed to load recipe for editing');
        }
      };
      fetchRecipe();
    }
  }, [id, isEditMode, setValue]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { quantity: '', unit: '', name: '' }]);
  };

  const handleAddStep = () => {
    setSteps([...steps, { description: '', image: null, imageFile: null }]);
  };

  const handleStepImageUpload = (index, file) => {
    const newSteps = [...steps];
    newSteps[index].imageFile = file;
    newSteps[index].image = URL.createObjectURL(file);
    setSteps(newSteps);
    setSteps(newSteps);
  };

  const handleSignOut = () => {
    navigate('/login');
  };

  const handlePreview = (data) => {
    setPreviewData({
      ...data,
      ingredients,
      steps: steps.map(step => ({
        description: step.description,
        image: step.image || null
      })),
      tags,
      mediaFiles: mediaFiles.map(file => 
        file instanceof File ? URL.createObjectURL(file) : `http://localhost:8082/api/files/${file}`
      )
    });
    setShowPreview(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const recipeData = {
        title: data.title,
        description: data.description,
        cookingTime: Number(data.cookingTime),
        servings: Number(data.servings),
        difficulty: data.difficulty,
        tags,
        ingredients,
        steps: steps.map(step => ({
          description: step.description,
          imageFileId: step.imageFileId
        })),
      };

      const formData = new FormData();
      formData.append('recipe', new Blob([JSON.stringify(recipeData)], { type: 'application/json' }));

      // Handle media files
      mediaFiles.forEach(file => {
        if (file instanceof File) {
          formData.append('mediaFiles', file);
        }
      });

      // Handle step images
      steps.forEach((step, index) => {
        if (step.imageFile instanceof File) {
          formData.append('stepImages', step.imageFile);
        }
      });

      if (isEditMode) {
        // Update existing recipe
        await axios.put(`http://localhost:8082/api/recipes/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create new recipe
        await axios.post('http://localhost:8082/api/recipes', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/');
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
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
              {isSubmitting ? 'Submitting...' : isEditMode ? 'Save Changes' : 'Submit Recipe'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2>{isEditMode ? 'Edit Recipe' : 'Create New Recipe'}</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Recipe Title</label>
              <input
                {...register('title', { required: true })}
                placeholder="Name your recipe"
              />
            </div>

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

            <div className="form-group">
              <label>Media Upload</label>
              <div className="media-upload">
                <FaUpload className="upload-icon" />
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => setMediaFiles([...mediaFiles, ...e.target.files])}
                />
                <p>Drag & drop files here, or click to select</p>
              </div>
              {mediaFiles.length > 0 && (
                <div className="media-preview">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="media-preview-item">
                      {file instanceof File ? (
                        <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
                      ) : (
                        <img src={`http://localhost:8082/api/files/${file}`} alt={`Existing ${index}`} />
                      )}
                      <button
                        type="button"
                        className="remove-media-btn"
                        onClick={() => setMediaFiles(mediaFiles.filter((_, i) => i !== index))}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
                {isSubmitting ? (isEditMode ? 'Saving...' : 'Submitting...') : (isEditMode ? 'Save Changes' : 'Create Recipe')}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default CreatePostPage;