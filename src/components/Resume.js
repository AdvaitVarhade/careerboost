import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaDownload } from 'react-icons/fa';
import html2pdf from 'html2pdf.js';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../resume.css';

const Resume = ({ user, onLogout, setView }) => {
  const [profile, setProfile] = useState(null);
  const [template, setTemplate] = useState('modern'); // 'modern', 'classic'
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.email ? user.email.split('@')[0] : 'User';
  const userEmail = user?.email || 'Email not provided';

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) console.error(error);
      else {
        setProfile(data);
        generateSuggestions(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const generateSuggestions = (profile) => {
    const sugg = [];
    if (!profile.skills.length) sugg.push('Add technical skills relevant to your field.');
    if (!profile.education.degree) sugg.push('Include your education details.');
    if (!profile.work_experience.role) sugg.push('Add at least one work experience entry.');
    if (!profile.achievements) sugg.push('Highlight achievements to stand out.');
    setSuggestions(sugg);
  };

  const downloadPDF = () => {
    const element = document.getElementById('resume-preview');
    const fileName = user?.email ? `${user.email.split('@')[0]}_resume.pdf` : 'resume.pdf';
    html2pdf()
      .from(element)
      .set({ margin: 1, filename: fileName })
      .save();
  };

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="resume" setView={setView} onLogout={onLogout} />

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2>Resume Builder</h2>
          <div className="resume-controls">
            <select value={template} onChange={(e) => setTemplate(e.target.value)}>
              <option value="modern">Modern Template</option>
              <option value="classic">Classic Template</option>
            </select>
            <button onClick={downloadPDF}><FaDownload /> Download PDF</button>
          </div>
        </header>

        {/* Resume Preview */}
        <div className="resume-preview" id="resume-preview">
          {template === 'modern' ? (
            <div className="resume-modern">
              <h1>{userName}</h1>
              <p>{userEmail}</p>
              <hr />
              <h2>Skills</h2>
              <div className="skills-tags">
                {profile.skills.map(skill => (
                  <span key={skill} className="skill-tag">{skill}</span>
                ))}
              </div>
              <h2>Education</h2>
              <p>{profile.education.degree || 'Not provided'}</p>
              <h2>Work Experience</h2>
              <p>{profile.work_experience.role || 'Not provided'}</p>
              <h2>Achievements</h2>
              <p>{profile.achievements || 'None yet'}</p>
            </div>
          ) : (
            <div className="resume-classic">
              <h1>{userName}</h1>
              <p>{userEmail}</p>
              <div className="section">
                <h2>Skills</h2>
                <ul>
                  {profile.skills.map(skill => <li key={skill}>{skill}</li>)}
                </ul>
              </div>
              <div className="section">
                <h2>Education</h2>
                <p>{profile.education.degree || 'Not provided'}</p>
              </div>
              <div className="section">
                <h2>Work Experience</h2>
                <p>{profile.work_experience.role || 'Not provided'}</p>
              </div>
              <div className="section">
                <h2>Achievements</h2>
                <p>{profile.achievements || 'None yet'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="suggestions">
            <h3>Suggestions to Improve Your Resume</h3>
            <ul>
              {suggestions.map((sugg, index) => (
                <li key={index}>{sugg}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resume;