import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaSearch, FaHeart, FaMapMarkerAlt, FaBuilding, FaClock, FaDollarSign, FaGraduationCap, FaBriefcaseMedical, FaChartLine, FaUsers, FaStar, FaIndustry, FaCode, FaDatabase, FaShieldAlt, FaCloud, FaLaptopCode } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../jobs.css';

const Jobs = ({ user, onLogout, setView }) => {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [newJob, setNewJob] = useState({ title: '', description: '', location: '', skills: '', type: 'full-time' });
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    averageSalary: 0,
    topSkills: []
  });

  const jobTypes = [
    { id: 'all', name: 'All Jobs', icon: <FaBriefcase /> },
    { id: 'full-time', name: 'Full Time', icon: <FaBriefcase /> },
    { id: 'internship', name: 'Internship', icon: <FaGraduationCap /> },
    { id: 'remote', name: 'Remote', icon: <FaBuilding /> },
    { id: 'contract', name: 'Contract', icon: <FaBriefcaseMedical /> }
  ];

  const industries = [
    { name: 'Technology', icon: <FaCode />, jobs: 1200 },
    { name: 'Finance', icon: <FaChartLine />, jobs: 800 },
    { name: 'Healthcare', icon: <FaBriefcaseMedical />, jobs: 600 },
    { name: 'Education', icon: <FaGraduationCap />, jobs: 400 },
    { name: 'Manufacturing', icon: <FaIndustry />, jobs: 300 }
  ];

  const topSkills = [
    { name: 'JavaScript', icon: <FaCode />, demand: 'High' },
    { name: 'Python', icon: <FaCode />, demand: 'High' },
    { name: 'Cloud Computing', icon: <FaCloud />, demand: 'Medium' },
    { name: 'Data Science', icon: <FaDatabase />, demand: 'High' },
    { name: 'Cybersecurity', icon: <FaShieldAlt />, demand: 'Medium' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      setProfile(profileData);
      const { data: jobsData } = await supabase.from('jobs').select('*');
      const { data: wishlistData } = await supabase.from('wishlist').select('job_id').eq('user_id', user.id);
      setJobs(jobsData || []);
      setWishlist(wishlistData?.map(item => item.job_id) || []);

      // Calculate stats
      const activeJobs = jobsData?.filter(job => job.status === 'active').length || 0;
      const avgSalary = jobsData?.reduce((acc, job) => {
        const salary = parseInt(job.salary_range?.split('-')[0]?.replace(/[^0-9]/g, '') || 0);
        return acc + salary;
      }, 0) / (jobsData?.length || 1);

      const skillCount = {};
      jobsData?.forEach(job => {
        job.skills?.forEach(skill => {
          skillCount[skill] = (skillCount[skill] || 0) + 1;
        });
      });

      const topSkills = Object.entries(skillCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([skill]) => skill);

      setStats({
        totalJobs: jobsData?.length || 0,
        activeJobs,
        averageSalary: Math.round(avgSalary),
        topSkills
      });

      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('jobs').insert({
      title: newJob.title,
      description: newJob.description,
      location: newJob.location,
      skills: newJob.skills.split(',').map(s => s.trim()),
      type: newJob.type,
      posted_by: user.id,
      salary_range: newJob.salary_range,
      experience_level: newJob.experience_level,
      posted_date: new Date().toISOString(),
      status: 'active'
    });
    if (error) alert(error.message);
    else {
      setNewJob({ title: '', description: '', location: '', skills: '', type: 'full-time', salary_range: '', experience_level: '' });
      const { data } = await supabase.from('jobs').select('*');
      setJobs(data || []);
    }
  };

  const toggleWishlist = async (jobId) => {
    if (wishlist.includes(jobId)) {
      await supabase.from('wishlist').delete().match({ user_id: user.id, job_id: jobId });
      setWishlist(wishlist.filter(id => id !== jobId));
    } else {
      await supabase.from('wishlist').insert({ user_id: user.id, job_id: jobId });
      setWishlist([...wishlist, jobId]);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(search.toLowerCase()) &&
    (!filter || job.type === filter)
  );

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="jobs" setView={setView} onLogout={onLogout} />
      <div className="main-content">
        <header className="header">
          <h2>Explore Jobs</h2>
          <div className="jobs-search">
            <div className="input-wrapper">
              <FaSearch />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs by title, skills, or company..."
              />
            </div>
            <div className="filter-buttons">
              {jobTypes.map(type => (
                <button
                  key={type.id}
                  className={`filter-btn ${filter === type.id ? 'active' : ''}`}
                  onClick={() => setFilter(type.id)}
                >
                  {type.icon} {type.name}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <FaBriefcase className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.totalJobs}</h3>
              <p>Total Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.activeJobs}</h3>
              <p>Active Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <FaDollarSign className="stat-icon" />
            <div className="stat-content">
              <h3>${stats.averageSalary.toLocaleString()}</h3>
              <p>Average Salary</p>
            </div>
          </div>
          <div className="stat-card">
            <FaStar className="stat-icon" />
            <div className="stat-content">
              <h3>{stats.topSkills.length}</h3>
              <p>Top Skills</p>
            </div>
          </div>
        </div>

        {/* Industries */}
        <div className="industries-section">
          <h3 className="section-title">
            <FaIndustry /> Popular Industries
          </h3>
          <div className="industries-grid">
            {industries.map(industry => (
              <div key={industry.name} className="industry-card">
                <div className="industry-icon">{industry.icon}</div>
                <h4>{industry.name}</h4>
                <p>{industry.jobs.toLocaleString()} jobs</p>
                <button className="explore-btn">Explore Jobs</button>
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills */}
        <div className="skills-section">
          <h3 className="section-title">
            <FaCode /> In-Demand Skills
          </h3>
          <div className="skills-grid">
            {topSkills.map(skill => (
              <div key={skill.name} className="skill-card">
                <div className="skill-icon">{skill.icon}</div>
                <h4>{skill.name}</h4>
                <span className={`demand-badge ${skill.demand.toLowerCase()}`}>
                  {skill.demand} Demand
                </span>
              </div>
            ))}
          </div>
        </div>

        {profile?.role === 'recruiter' && (
          <div className="job-posting">
            <h3>Post a Job</h3>
            <form className="job-form" onSubmit={handlePostJob}>
              <div className="form-row">
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="Job Title"
                  required
                />
                <input
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  placeholder="Location"
                />
              </div>
              <div className="form-row">
                <input
                  type="text"
                  value={newJob.skills}
                  onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  placeholder="Skills (comma-separated)"
                />
                <input
                  type="text"
                  value={newJob.salary_range}
                  onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                  placeholder="Salary Range (e.g., $50k-$100k)"
                />
              </div>
              <div className="form-row">
                <select value={newJob.type} onChange={(e) => setNewJob({ ...newJob, type: e.target.value })}>
                  <option value="full-time">Full-Time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                  <option value="contract">Contract</option>
                </select>
                <select value={newJob.experience_level} onChange={(e) => setNewJob({ ...newJob, experience_level: e.target.value })}>
                  <option value="">Experience Level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                placeholder="Job Description"
                rows="4"
                required
              />
              <button type="submit" className="post-job-btn">Post Job</button>
            </form>
          </div>
        )}

        <div className="job-grid">
          {filteredJobs.length ? (
            filteredJobs.map(job => (
              <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
                <div className="job-header">
                  <h4>{job.title}</h4>
                  <button 
                    className="wishlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(job.id);
                    }}
                    style={{ color: wishlist.includes(job.id) ? 'var(--red)' : 'inherit' }}
                  >
                    <FaHeart />
                  </button>
                </div>
                <div className="job-meta">
                  <span><FaMapMarkerAlt /> {job.location || 'Remote'}</span>
                  <span><FaClock /> {job.type}</span>
                  {job.salary_range && <span><FaDollarSign /> {job.salary_range}</span>}
                </div>
                <p className="job-description">{job.description.slice(0, 150)}...</p>
                <div className="skills-tags">
                  {job.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <div className="job-footer">
                  <span className="experience-level">{job.experience_level || 'Not specified'}</span>
                  <span className="posted-date">
                    {new Date(job.posted_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-jobs">
              <FaBriefcase className="no-jobs-icon" />
              <p>No jobs found matching your criteria.</p>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {selectedJob && (
          <div className="job-modal" onClick={() => setSelectedJob(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setSelectedJob(null)}>×</button>
              <h2>{selectedJob.title}</h2>
              <div className="job-meta">
                <span><FaMapMarkerAlt /> {selectedJob.location || 'Remote'}</span>
                <span><FaClock /> {selectedJob.type}</span>
                {selectedJob.salary_range && <span><FaDollarSign /> {selectedJob.salary_range}</span>}
              </div>
              <div className="job-details">
                <h3>Job Description</h3>
                <p>{selectedJob.description}</p>
                <h3>Required Skills</h3>
                <div className="skills-tags">
                  {selectedJob.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <h3>Experience Level</h3>
                <p>{selectedJob.experience_level || 'Not specified'}</p>
                <h3>Company Information</h3>
                <div className="company-info">
                  <img src={selectedJob.company_logo || 'https://via.placeholder.com/100'} alt="Company Logo" />
                  <div>
                    <h4>{selectedJob.company_name || 'Company Name'}</h4>
                    <p>{selectedJob.company_description || 'Company description not available.'}</p>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button className="apply-btn">Apply Now</button>
                <button 
                  className={`wishlist-btn ${wishlist.includes(selectedJob.id) ? 'active' : ''}`}
                  onClick={() => toggleWishlist(selectedJob.id)}
                >
                  <FaHeart /> {wishlist.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;