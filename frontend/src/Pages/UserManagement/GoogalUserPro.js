import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaTools, FaEdit } from 'react-icons/fa';
import './UserProfile.css'
import Pro from './img/img.png';
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
function GoogalUserPro() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const userId = localStorage.getItem('userID');
    const [googleProfileImage, setGoogleProfileImage] = useState(null);
    const [userType, setUserType] = useState(null);
    const [userProfileImage, setUserProfileImage] = useState(null);
    useEffect(() => {
        const userId = localStorage.getItem('userID');
        if (userId) {
            fetchUserDetails(userId).then((data) => setUserData(data));
        }
    }, []);
    useEffect(() => {
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);
        if (storedUserType === 'google') {
            const googleImage = localStorage.getItem('googleProfileImage');
            setGoogleProfileImage(googleImage);
        } else if (userId) {
            fetchUserDetails(userId).then((data) => {
                if (data && data.profilePicturePath) {
                    setUserProfileImage(`http://localhost:8086/uploads/profile/${data.profilePicturePath}`);
                }
            });
        }
    }, [userId]);
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

    const navigateToUpdate = () => {
        navigate(`/updateProfile/${userId}`);
    };

    return (
        <div>
            <div className='continer'>
                <NavBar />
                <div className='post-content-wrapper'>
                    {userData && userData.id === localStorage.getItem('userID') && (
                        <div className="profile-card">
                            <div className="profile-header">
                                <img
                                    src={
                                        googleProfileImage
                                            ? googleProfileImage
                                            : userProfileImage
                                                ? userProfileImage
                                                : Pro
                                    }
                                    alt="Profile"
                                    className="profile-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = Pro;
                                    }}
                                />
                                <div className='profile-info'>
                                    <h2 className='username-title'>{userData.fullname}</h2>
                                    <p className='user-bio'>{userData.bio || "No bio added yet"}</p>
                                    <div className='contact-info'>
                                        <p><FaEnvelope /> {userData.email}</p>
                                        {userData.phone && <p><FaPhone /> {userData.phone}</p>}
                                    </div>
                                    {userData.skills && userData.skills.length > 0 && (
                                        <div className='skills-section'>
                                            <h3><FaTools /> Skills</h3>
                                            <div className='skills-tags'>
                                                {userData.skills.map((skill, index) => (
                                                    <span key={index} className='skill-tag'>{skill}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="profile-actions">
                                        <button onClick={navigateToUpdate} className="edit-button">
                                            <FaEdit /> Edit Profile
                                        </button>
                                        <button onClick={handleDelete} className="delete-button">
                                            Delete Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='my_post_link'>
                        <div className='my_post_link_card' onClick={() => (window.location.href = '/myLearningPlan')}>
                            <div className='my_post_name_img1'></div>
                            <p className='my_post_link_card_name'>My Learning Plan</p>
                        </div>
                        <div className='my_post_link_card' onClick={() => (window.location.href = '/myAllPost')}>
                            <div className='my_post_name_img2'></div>
                            <p className='my_post_link_card_name'>My SkillPost</p>
                        </div>
                        <div className='my_post_link_card' onClick={() => (window.location.href = '/myAchievements')}>
                            <div className='my_post_name_img3'></div>
                            <p className='my_post_link_card_name'>My Achievements</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GoogalUserPro
