import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import './UserProfile.css';
import NavBar from '../../Components/NavBar/NavBar';

export const fetchUserDetails = async (userId) => {
    try {
        const response = await fetch(`http://localhost:8086/user/${userId}`);
        if (response.ok) {
            return await response.json();
        } else {
            console.error('Failed to fetch user details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

function UserProfile() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (userId) {
            fetchUserDetails(userId).then((data) => setUserData(data));
        }
    }, []);

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete your profile?")) {
            const userId = localStorage.getItem('userID');
            fetch(`http://localhost:8086/user/${userId}`, {
                method: 'DELETE',
            })
                .then((response) => {
                    if (response.ok) {
                        alert("Profile deleted successfully!");
                        localStorage.removeItem('userID');
                        navigate('/'); // Redirect to home or login page
                    } else {
                        alert("Failed to delete profile.");
                    }
                })
                .catch((error) => console.error('Error:', error));
        }
    };

    return (
        <div className="profile-container">
            <NavBar />
            <div className="profile-layout">
                <div className="profile-sidebar">
                    {userData && userData.id === localStorage.getItem('userID') && (
                        <>
                            <div className="profile-header-section">
                                {userData.profilePicturePath && (
                                    <img
                                        src={`http://localhost:8086/uploads/profile/${userData.profilePicturePath}`}
                                        alt="Profile"
                                        className="profile-avatar"
                                    />
                                )}
                                <h2 className="profile-name">{userData.fullname}</h2>
                                <span className="profile-role">Developer</span>
                            </div>
                            <div className="profile-quick-stats">
                                <div className="stat-box">
                                    <span className="stat-number">12</span>
                                    <span className="stat-label">Posts</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-number">5</span>
                                    <span className="stat-label">Skills</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-number">3</span>
                                    <span className="stat-label">Awards</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="profile-main-content">
                    {userData && userData.id === localStorage.getItem('userID') && (
                        <div className="profile-details-section">
                            <div className="bio-section">
                                <h3>About Me</h3>
                                <p>{userData.bio}</p>
                            </div>
                            <div className="contact-info">
                                <h3>Contact Information</h3>
                                <div className="info-item">
                                    <FaEnvelope className="info-icon" />
                                    <span>{userData.email}</span>
                                </div>
                                <div className="info-item">
                                    <FaPhone className="info-icon" />
                                    <span>{userData.phone}</span>
                                </div>
                            </div>
                            <div className="skills-section">
                                <h3>Skills</h3>
                                <div className="skills-list">
                                    {userData.skills && userData.skills.map((skill, index) => (
                                        <span key={index} className="skill-badge">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="profile-actions">
                                <button 
                                    onClick={() => navigate(`/updateUserProfile/${userData.id}`)} 
                                    className="action-button edit"
                                >
                                    Edit Profile
                                </button>
                                <button 
                                    onClick={handleDelete} 
                                    className="action-button delete"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="dashboard-cards">
                <div className="dashboard-card" onClick={() => (window.location.href = '/myLearningPlan')}>
                    <div className="card-icon learning"></div>
                    <div className="card-content">
                        <h3>Learning Plan</h3>
                        <p>Track your progress</p>
                    </div>
                </div>
                <div className="dashboard-card" onClick={() => (window.location.href = '/myAllPost')}>
                    <div className="card-icon posts"></div>
                    <div className="card-content">
                        <h3>My Posts</h3>
                        <p>View your content</p>
                    </div>
                </div>
                <div className="dashboard-card" onClick={() => (window.location.href = '/myAchievements')}>
                    <div className="card-icon achievements"></div>
                    <div className="card-content">
                        <h3>Achievements</h3>
                        <p>Your milestones</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;
