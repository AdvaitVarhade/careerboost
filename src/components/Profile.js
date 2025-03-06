import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaCog, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaEdit, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaLink, FaGithub, FaLinkedin, FaGlobe, FaGraduationCap, FaAward, FaUserCircle } from 'react-icons/fa';
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
    try {
      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Profile fetch error:', fetchError);
        alert('Failed to check profile: ' + fetchError.message);
        return;
      }

      const profileData = {
        id: user.id,
        skills: profile.skills,
        education: profile.education,
        work_experience: profile.work_experience,
        achievements: profile.achievements,
        bio: profile.bio,
        social_links: profile.social_links,
        portfolio_url: profile.portfolio_url,
        username: profile.username,
      };

      let error;
      if (!existingProfile) {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([profileData]);
        error = insertError;
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);
        error = updateError;
      }

      if (error) {
        console.error('Profile update error:', error);
        alert('Failed to update profile: ' + error.message);
      } else {
        alert('Profile updated successfully!');
        setEditing(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      alert('An unexpected error occurred while updating your profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar currentView="profile" setView={setView} onLogout={onLogout} />

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2>Profile</h2>
          <div className="header-actions">
            <button 
              className="edit-profile-btn"
              onClick={() => setEditing(!editing)}
              style={{
                background: '#ffffff',
                color: '#000000',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                border: 'none',
                outline: 'none',
                position: 'relative',
                zIndex: 1
              }}
            >
              <FaEdit /> {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </header>

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-title">
              <FaUserCircle className="profile-icon" />
              <h3>Your Profile</h3>
            </div>
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
              <div className="form-section">
                <h4>Basic Information</h4>
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
              </div>

              <div className="form-section">
                <h4>Skills & Expertise</h4>
                <div>
                  <label>Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={profile.skills.join(', ')}
                    onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(', ').filter(Boolean) })}
                    placeholder="e.g., JavaScript, Python"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Education</h4>
                <div>
                  <label>Degree & School</label>
                  <input
                    type="text"
                    value={profile.education.degree || ''}
                    onChange={(e) => setProfile({ ...profile, education: { ...profile.education, degree: e.target.value } })}
                    placeholder="e.g., B.Sc, XYZ University"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Work Experience</h4>
                <div>
                  <label>Role & Company</label>
                  <input
                    type="text"
                    value={profile.work_experience.role || ''}
                    onChange={(e) => setProfile({ ...profile, work_experience: { ...profile.work_experience, role: e.target.value } })}
                    placeholder="e.g., Developer, ABC Corp"
                  />
                </div>
              </div>

              <div className="form-section full-width">
                <h4>Achievements</h4>
                <div>
                  <label>Your Achievements</label>
                  <textarea
                    value={profile.achievements}
                    onChange={(e) => setProfile({ ...profile, achievements: e.target.value })}
                    placeholder="e.g., Won coding contest, Completed advanced courses..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-section full-width">
                <h4>About Me</h4>
                <div>
                  <label>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Social Links</h4>
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
              </div>

              <div className="form-section">
                <h4>Portfolio</h4>
                <div>
                  <label>Portfolio URL</label>
                  <input
                    type="text"
                    value={profile.portfolio_url || ''}
                    onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <button type="submit" className="save-profile-btn">
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          ) : (
            <div className="profile-display">
              <div className="profile-section">
                <div className="section-header">
                  <FaUserCircle className="section-icon" />
                  <h4>Basic Information</h4>
                </div>
                <p><strong>Username</strong> {profile.username}</p>
                <p><strong>Role</strong> <span className="role-tag">{profile.role}</span></p>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <FaBriefcase className="section-icon" />
                  <h4>Skills & Expertise</h4>
                </div>
                <p><strong>Skills</strong> {profile.skills.length ? profile.skills.map(skill => (
                  <span key={skill} className="skill-tag">{skill}</span>
                )) : 'None yet'}</p>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <FaGraduationCap className="section-icon" />
                  <h4>Education</h4>
                </div>
                <p><strong>Education</strong> {profile.education.degree || 'Not provided'}</p>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <FaBriefcase className="section-icon" />
                  <h4>Work Experience</h4>
                </div>
                <p><strong>Work Experience</strong> {profile.work_experience.role || 'Not provided'}</p>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <FaAward className="section-icon" />
                  <h4>Achievements</h4>
                </div>
                <p><strong>Achievements</strong> <span className="achievements">{profile.achievements || 'None yet'}</span></p>
              </div>

              <div className="profile-section full-width">
                <div className="section-header">
                  <FaUser className="section-icon" />
                  <h4>About Me</h4>
                </div>
                <p><strong>Bio</strong> <span className="bio">{profile.bio || 'No bio yet'}</span></p>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <FaLink className="section-icon" />
                  <h4>Social Links</h4>
                </div>
                <p><strong>Social Links</strong> 
                  <div className="social-links">
                    {profile.social_links.linkedin && (
                      <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                        <FaLinkedin /> LinkedIn
                      </a>
                    )}
                    {profile.social_links.github && (
                      <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer">
                        <FaGithub /> GitHub
                      </a>
                    )}
                  </div>
                </p>
              </div>

              <div className="profile-section">
                <div className="section-header">
                  <FaGlobe className="section-icon" />
                  <h4>Portfolio</h4>
                </div>
                <p><strong>Portfolio</strong> 
                  {profile.portfolio_url ? (
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                      <FaGlobe /> {profile.portfolio_url}
                    </a>
                  ) : 'Not provided'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;