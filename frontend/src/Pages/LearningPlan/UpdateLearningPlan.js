import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { IoMdAdd } from "react-icons/io";
import './post.css';
import './Templates.css';
import NavBar from '../../Components/NavBar/NavBar';
import { FaVideo } from "react-icons/fa";
import { FaImage } from "react-icons/fa";
import { HiCalendarDateRange } from "react-icons/hi2";

function UpdateLearningPost() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentURL, setContentURL] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [templateID, setTemplateID] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [showContentURLInput, setShowContentURLInput] = useState(true);
  const [showImageUploadInput, setShowImageUploadInput] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/learningPlan/${id}`);
        const { title, description, contentURL, tags, imageUrl, templateID, startDate, endDate, category } = response.data;
        setTitle(title);
        setDescription(description);
        setContentURL(contentURL);
        setTags(tags);
        setExistingImage(imageUrl);
        setTemplateID(templateID);
        setStartDate(startDate);
        setEndDate(endDate);
        setCategory(category);
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [id]);

  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (index) => {
    const updatedTags = tags.filter((_, i) => i !== index);
    setTags(updatedTags);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
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
      return url;
    } catch (error) {
      console.error('Invalid URL:', url);
      return '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let imageUrl = existingImage;

    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      try {
        const uploadResponse = await axios.post('http://localhost:8080/learningPlan/planUpload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        imageUrl = uploadResponse.data;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image.');
        setIsSubmitting(false);
        return;
      }
    }

    const updatedPost = { title, description, contentURL, tags, imageUrl, postOwnerID: localStorage.getItem('userID'), templateID, startDate, endDate, category };
    try {
      await axios.put(`http://localhost:8080/learningPlan/${id}`, updatedPost);
      alert('Post updated successfully!');
      window.location.href = '/allLearningPlan';
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-post-container">
      <NavBar />
      <div className="post-content-wrapper">
        <div className="template-preview-container">
          <div className={`template template-1 ${templateID === 1 ? 'selected' : ''}`}>
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
            {imagePreview ? (
              <div className="image-preview-achi">
                <img src={imagePreview} alt="Preview" className="iframe_preview" />
              </div>
            ) : existingImage && (
              <div className="image-preview-achi">
                <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="iframe_preview" />
              </div>
            )}
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
          <div className={`template template-2 ${templateID === 2 ? 'selected' : ''}`}>
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
                {imagePreview ? (
                  <div className="image-preview-achi">
                    <img src={imagePreview} alt="Preview" className="iframe_preview_new" />
                  </div>
                ) : existingImage && (
                  <div className="image-preview-achi">
                    <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="iframe_preview_new" />
                  </div>
                )}
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
          <div className={`template template-3 ${templateID === 3 ? 'selected' : ''}`}>
            <p className='template_id_one'>template 3</p>
            {imagePreview ? (
              <div className="image-preview-achi">
                <img src={imagePreview} alt="Preview" className="iframe_preview" />
              </div>
            ) : existingImage && (
              <div className="image-preview-achi">
                <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="iframe_preview" />
              </div>
            )}
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
          <h1 className="post-form-title">Update Learning Plan</h1>
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div className="tag-container">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                    <button type="button" onClick={() => handleDeleteTag(index)} className="tag-delete-btn">×</button>
                  </span>
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
                required
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Template</label>
              <select
                className="form-select"
                value={templateID}
                onChange={(e) => setTemplateID(Number(e.target.value))}
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
                <option value="" disabled>Select Category</option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
              </select>
            </div>

            <div className="media-controls">
              <button type="button" className="media-button" onClick={() => setShowContentURLInput(!showContentURLInput)}>
                <FaVideo /> {showContentURLInput ? 'Hide Video URL' : 'Add Video'}
              </button>
              <button type="button" className="media-button" onClick={() => setShowImageUploadInput(!showImageUploadInput)}>
                <FaImage /> {showImageUploadInput ? 'Hide Image Upload' : 'Add Image'}
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
                {imagePreview ? (
                  <div className="image-preview-achi">
                    <img src={imagePreview} alt="Preview" className="image-preview-achi" />
                  </div>
                ) : existingImage && (
                  <div className="image-preview-achi">
                    <img src={`http://localhost:8080/learningPlan/planImages/${existingImage}`} alt="Existing" className="image-preview-achi" />
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
              {isSubmitting ? 'Updating Plan...' : 'Update Learning Plan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateLearningPost;
