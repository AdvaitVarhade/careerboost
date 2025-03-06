import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome } from 'react-icons/fa';
import '../sidebar.css';

const Sidebar = ({ currentView, setView, onLogout }) => {
  return (
    <div className="sidebar">
      <h1>CareerBoost</h1>
      <ul>
        <li className={currentView === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>
          <FaHome />
          <span>Dashboard</span>
        </li>
        <li className={currentView === 'profile' ? 'active' : ''} onClick={() => setView('profile')}>
          <FaUser />
          <span>Profile</span>
        </li>
        <li className={currentView === 'jobs' ? 'active' : ''} onClick={() => setView('jobs')}>
          <FaBriefcase />
          <span>Jobs</span>
        </li>
        <li className={currentView === 'courses' ? 'active' : ''} onClick={() => setView('courses')}>
          <FaBook />
          <span>Courses</span>
        </li>
        <li className={currentView === 'resume' ? 'active' : ''} onClick={() => setView('resume')}>
          <FaFileAlt />
          <span>Resume</span>
        </li>
        <li className={currentView === 'tasks' ? 'active' : ''} onClick={() => setView('tasks')}>
          <FaTasks />
          <span>Tasks</span>
        </li>
        <li className={currentView === 'contests' ? 'active' : ''} onClick={() => setView('contests')}>
          <FaTrophy />
          <span>Contests</span>
        </li>
        <li className={currentView === 'interview' ? 'active' : ''} onClick={() => setView('interview')}>
          <FaComments />
          <span>Interview</span>
        </li>
        <li className={currentView === 'forum' ? 'active' : ''} onClick={() => setView('forum')}>
          <FaUsers />
          <span>Forum</span>
        </li>
        <li className={currentView === 'people' ? 'active' : ''} onClick={() => setView('people')}>
          <FaUsers />
          <span>People</span>
        </li>
        <li className={currentView === 'messages' ? 'active' : ''} onClick={() => setView('messages')}>
          <FaComments />
          <span>Messages</span>
        </li>
        <li onClick={onLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 