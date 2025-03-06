import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaCog, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaEdit, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaLink } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../profile.css';
import '../global.css'; // For variables and spinner
import '../sidebar.css';
import '../main.css';

const Profile = ({ user, onLogout, setView }) => {
  const [profile, setProfile] = useState({
    role: 'student',
    skills: [],
    education: {},
    work_experience: {},
    achievements: '',
    bio: '',
    social_links: {},
    portfolio_url: '',
    username: '',
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) console.error('Profile fetch error:', error);
      else setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        skills: profile.skills,
        education: profile.education,
        work_experience: profile.work_experience,
        achievements: profile.achievements,
        bio: profile.bio,
        social_links: profile.social_links,
        portfolio_url: profile.portfolio_url,
        username: profile.username,
      })
      .eq('id', user.id);
    setLoading(false);
    if (error) alert(error.message);
    else {
      alert('Profile updated successfully!');
      setEditing(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar currentView="profile" setView={setView} onLogout={onLogout} />

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2>Profile</h2>
        </header>

        <div className="profile-card">
          <div className="profile-header">
            <h3><FaUser /> Your Profile</h3>
            <button 
              className="edit-profile-btn"
              onClick={() => setEditing(!editing)}
            >
              <FaEdit /> {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {loading ? (
            <div className="profile-skeleton">
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
            </div>
          ) : editing ? (
            <form className="profile-form" onSubmit={handleUpdate}>
              <div>
                <label>Username</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label>Skills (comma-separated)</label>
                <input
                  type="text"
                  value={profile.skills.join(', ')}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(', ').filter(Boolean) })}
                  placeholder="e.g., JavaScript, Python"
                />
              </div>
              <div>
                <label>Education (Degree, School)</label>
                <input
                  type="text"
                  value={profile.education.degree || ''}
                  onChange={(e) => setProfile({ ...profile, education: { ...profile.education, degree: e.target.value } })}
                  placeholder="e.g., B.Sc, XYZ University"
                />
              </div>
              <div>
                <label>Work Experience (Role, Company)</label>
                <input
                  type="text"
                  value={profile.work_experience.role || ''}
                  onChange={(e) => setProfile({ ...profile, work_experience: { ...profile.work_experience, role: e.target.value } })}
                  placeholder="e.g., Developer, ABC Corp"
                />
              </div>
              <div>
                <label>Achievements</label>
                <textarea
                  value={profile.achievements}
                  onChange={(e) => setProfile({ ...profile, achievements: e.target.value })}
                  placeholder="e.g., Won coding contest"
                  rows="4"
                />
              </div>
              <div>
                <label>Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows="3"
                />
              </div>
              <div>
                <label>LinkedIn URL</label>
                <input
                  type="text"
                  value={profile.social_links.linkedin || ''}
                  onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, linkedin: e.target.value } })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div>
                <label>GitHub URL</label>
                <input
                  type="text"
                  value={profile.social_links.github || ''}
                  onChange={(e) => setProfile({ ...profile, social_links: { ...profile.social_links, github: e.target.value } })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label>Portfolio URL</label>
                <input
                  type="text"
                  value={profile.portfolio_url || ''}
                  onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          ) : (
            <div className="profile-display">
              <p><strong>Username:</strong> {profile.username}</p>
              <p><strong>Role:</strong> <span className="role-tag">{profile.role}</span></p>
              <p><strong>Skills:</strong> {profile.skills.length ? profile.skills.map(skill => (
                <span key={skill} className="skill-tag">{skill}</span>
              )) : 'None yet'}</p>
              <p><strong>Education:</strong> {profile.education.degree || 'Not provided'}</p>
              <p><strong>Work Experience:</strong> {profile.work_experience.role || 'Not provided'}</p>
              <p><strong>Achievements:</strong> <span className="achievements">{profile.achievements || 'None yet'}</span></p>
              <p><strong>Bio:</strong> <span className="bio">{profile.bio || 'No bio yet'}</span></p>
              <p><strong>Social Links:</strong> 
                <div className="social-links">
                  {profile.social_links.linkedin && (
                    <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                      <FaLink /> LinkedIn
                    </a>
                  )}
                  {profile.social_links.github && (
                    <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer">
                      <FaLink /> GitHub
                    </a>
                  )}
                </div>
              </p>
              <p><strong>Portfolio:</strong> 
                {profile.portfolio_url ? (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                    <FaLink /> {profile.portfolio_url}
                  </a>
                ) : 'Not provided'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;