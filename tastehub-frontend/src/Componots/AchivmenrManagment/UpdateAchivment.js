import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import './AddAchievements.css';

function UpdateAchievements() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    postOwnerID: '',
    postOwnerName: '',
    imageUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const response = await fetch(`http://localhost:8086/achievements/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch achievement');
        }
        const data = await response.json();
        setFormData(data);
        if (data.imageUrl) {
          setPreviewImage(`http://localhost:8086/achievements/images/${data.imageUrl}`);
        }
      } catch (error) {
        console.error('Error fetching Achievements data:', error);
        alert('Error loading achievement data');
      }
    };
    fetchAchievement();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processImageFile(file);
  };

  const processImageFile = (file) => {
    const maxFileSize = 50 * 1024 * 1024; // 50MB

    if (file.size > maxFileSize) {
      alert('File exceeds the maximum size of 50MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported.');
      return;
    }

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

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
    const file = e.dataTransfer.files[0];
    processImageFile(file);
  };

  const removeImage = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setSelectedFile(null);
    setPreviewImage(formData.imageUrl ? `http://localhost:8086/achievements/images/${formData.imageUrl}` : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        
        const uploadResponse = await fetch('http://localhost:8086/achievements/upload', {
          method: 'POST',
          body: uploadFormData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }
        imageUrl = await uploadResponse.text();
      }

      // Update achievement data
      const updatedData = { ...formData, imageUrl };
      const response = await fetch(`http://localhost:8086/achievements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert('Achievement updated successfully!');
        window.location.href = '/allAchievements';
      } else {
        throw new Error('Failed to update achievement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred during update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-post-container">
      <NavBar />
      <div className="post-content-wrapper">
        <div className="post-form-container">
          <h1 className="post-form-title">Update Achievement</h1>

          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label className="form-label">Upload Image</label>
              <div 
                className={`file-input ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {!previewImage ? (
                  <label htmlFor="image-upload" className="file-upload-label">
                    <div className="upload-icon">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <div className="upload-text">
                      <p>Drag & drop image here or click to browse</p>
                      <p className="upload-hint">Supports: JPG, PNG (max 50MB)</p>
                    </div>
                  </label>
                ) : (
                  <div className="media-preview-item">
                    <img className="media-preview" src={previewImage} alt="Achievement preview" />
                    <button 
                      type="button" 
                      className="remove-media-btn"
                      onClick={removeImage}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                name="title"
                placeholder="Enter achievement title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                name="description"
                placeholder="Describe your achievement..."
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select a category </option>
                <option value="Tech">Tech</option>
                <option value="Programming">Programming</option>
                <option value="Cooking">Cooking</option>
                <option value="Photography">Photography</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Updating Achievement...' : 'Update Achievement'}
            </button>
          </form>
        </div>
      </div>
    </div>  
  );
}

export default UpdateAchievements;