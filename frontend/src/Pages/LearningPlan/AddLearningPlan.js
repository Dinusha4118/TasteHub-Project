import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css'; // Import the updated CSS file
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";
function AddLearningPlan() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentURLInput, setShowContentURLInput] = useState(false);
  const [showImageUploadInput, setShowImageUploadInput] = useState(false);
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (startDate === endDate) {
      alert("Start date and end date cannot be the same.");
      setIsSubmitting(false);
      return;
    }

    if (startDate > endDate) {
      alert("Start date cannot be greater than end date.");
      setIsSubmitting(false);
      return;
    }

    const postOwnerID = localStorage.getItem('userID');
    const postOwnerName = localStorage.getItem('userFullName');

    if (!postOwnerID) {
      alert('Please log in to add a post.');
      navigate('/');
      return;
    }

    if (tags.length < 2) {
      alert("Please add at least two tags.");
      setIsSubmitting(false);
      return;
    }

    if (!templateID) {
      alert("Please select a template.");
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = '';
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const uploadResponse = await axios.post('http://localhost:8086/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      }

      // Create the new post object
      const newPost = {
        title,
        description,
        contentURL,
        tags,
        postOwnerID,
        postOwnerName,
        imageUrl,
        templateID,
        startDate, // New field
        endDate,   // New field
        category   // New field
      };

      // Submit the post data
      await axios.post('http://localhost:8086/learningPlan', newPost);
      alert('Post added successfully!');
      navigate('/allLearningPlan');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmbedURL = (url) => {
    try {
      if (url.includes('youtube.com/watch')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url; // Return the original URL if it's not a YouTube link
    } catch (error) {
      console.error('Invalid URL:', url);
      return ''; // Return an empty string for invalid URLs
    }
  };

  return (
    <div className="add-post-container">
      <NavBar />
      <div className="post-content-wrapper">
        <div className="template-preview-container">
          {/* Template 1 */}
          <div className="template template-1">
            <p className='template_id_one'>template 1</p>
            <p className='template_title'>{title || "Title Preview"}</p>
            <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
            <p className='template_description'>{category}</p>
            <hr></hr>
            <p className='template_description'>{description || "Description Preview"}</p>
            <div className="tags_preview">
              {tags.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
            {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
            {contentURL && (
              <iframe
                src={getEmbedURL(contentURL)}
                title="Content Preview"
                className="iframe_preview"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}

          </div>
          {/* Template 2 */}
          <div className="template template-2">
            <p className='template_id_one'>template 2</p>
            <p className='template_title'>{title || "Title Preview"}</p>
            <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
            <p className='template_description'>{category}</p>
            <hr></hr>
            <p className='template_description'>{description || "Description Preview"}</p>
            <div className="tags_preview">
              {tags.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>
            <div className='preview_part'>
              <div className='preview_part_sub'>
                {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview_new" />}
              </div>
              <div className='preview_part_sub'>
                {contentURL && (
                  <iframe
                    src={getEmbedURL(contentURL)}
                    title="Content Preview"
                    className="iframe_preview_new"
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}
              </div>
            </div>
          </div>
          {/* Template 3 */}
          <div className="template template-3">
            <p className='template_id_one'>template 3</p>
            {imagePreview && <img src={imagePreview} alt="Preview" className="iframe_preview" />}
            {contentURL && (
              <iframe
                src={getEmbedURL(contentURL)}
                title="Content Preview"
                className="iframe_preview"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            )}
            <p className='template_title'>{title || "Title Preview"}</p>

            <p className='template_dates'><HiCalendarDateRange /> {startDate} to {endDate} </p>
            <p className='template_description'>{category}</p>
            <hr></hr>
            <p className='template_description'>{description || "Description Preview"}</p>
            <div className="tags_preview">
              {tags.map((tag, index) => (
                <span key={index} className="tagname">#{tag}</span>
              ))}
            </div>

          </div>
        </div>
        <div className="post-form-container">
          <h1 className="post-form-title">Add Learning Plan</h1>
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter plan title"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tag-container">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
              <div className="tag-input-container">
                <input
                  className="form-input"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags"
                />
                <button type="button" onClick={handleAddTag} className="media-button">
                  <IoMdAdd /> Add Tag
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your learning plan"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Template</label>
              <select
                className="form-select"
                value={templateID}
                onChange={(e) => setTemplateID(e.target.value)}
                required
              >
                <option value="">Select Template</option>
                <option value="1">Template 1</option>
                <option value="2">Template 2</option>
                <option value="3">Template 3</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input
                  className="form-input"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <input
                  className="form-input"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
              </select>
            </div>

            <div className="media-controls">
              <button type="button" className="media-button" onClick={() => setShowContentURLInput(!showContentURLInput)}>
                <FaVideo /> Add Video
              </button>
              <button type="button" className="media-button" onClick={() => setShowImageUploadInput(!showImageUploadInput)}>
                <FaImage /> Add Image
              </button>
            </div>

            {showContentURLInput && (
              <div className="form-group">
                <label className="form-label">Content URL</label>
                <input
                  className="form-input"
                  type="url"
                  value={contentURL}
                  onChange={(e) => setContentURL(e.target.value)}
                />
              </div>
            )}
            {showImageUploadInput && (
              <div className="form-group">
                <label className="form-label">Upload Image</label>
                {imagePreview && (
                  <div className="image-preview-achi">
                    <img src={imagePreview} alt="Preview" className="image-preview-achi" />
                  </div>
                )}
                <input
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Plan...' : 'Create Learning Plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddLearningPlan;