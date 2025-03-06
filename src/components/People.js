import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaSearch, FaUserPlus } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../people.css';

const People = ({ user, onLogout, setView }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState({ skills: [], role: '', username: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Current user ID from auth:', user.id);
      console.log('Auth session:', await supabase.auth.getSession());

      // Fetch all user profiles except the current user
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, role, skills, bio, username')
        .neq('id', user.id);
      if (usersError) console.error('Users fetch error:', usersError);
      else console.log('Fetched all users:', usersData);

      // Fetch current user's profile
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('profiles')
        .select('skills, role, username')
        .eq('id', user.id)
        .single();
      if (currentUserError) console.error('Current user fetch error:', currentUserError);
      else console.log('Fetched current user profile:', currentUserData);

      // Fetch user's connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', user.id);
      if (connectionsError) console.error('Connections fetch error:', connectionsError);
      else console.log('Fetched connections:', connectionsData);

      setAllUsers(usersData || []);
      setCurrentUserProfile(currentUserData || { skills: [], role: '', username: '' });
      setConnections(connectionsData || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const handleConnect = async (connectedUserId) => {
    console.log('Attempting to connect:', { user_id: user.id, connected_user_id: connectedUserId });
    const { data, error } = await supabase.from('connections').insert({
      user_id: user.id,
      connected_user_id: connectedUserId,
      status: 'pending',
    });
    if (error) {
      console.error('Connection insert error:', error);
      alert(error.message);
    } else {
      console.log('Inserted connection:', data);
      const { data: updatedConnections } = await supabase.from('connections').select('*').eq('user_id', user.id);
      console.log('Updated connections:', updatedConnections);
      setConnections(updatedConnections || []);
    }
  };

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="people" setView={setView} onLogout={onLogout} />

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h2>Connect with People</h2>
        </header>

        {/* All Users */}
        <div className="people-list">
          <h3>All Users</h3>
          {allUsers.length ? (
            allUsers.map(u => {
              const connection = connections.find(c => c.connected_user_id === u.id);
              return (
                <div key={u.id} className="person-card">
                  <h4>{u.username}</h4>
                  <p><strong>Email:</strong> {u.email}</p>
                  <p><strong>Role:</strong> {u.role}</p>
                  <p><strong>Skills:</strong> {u.skills.join(', ') || 'None'}</p>
                  <p><strong>Bio:</strong> {u.bio || 'No bio'}</p>
                  <button
                    onClick={() => handleConnect(u.id)}
                    disabled={connection}
                  >
                    {connection ? (connection.status === 'pending' ? 'Pending' : 'Connected') : <><FaUserPlus /> Connect</>}
                  </button>
                </div>
              );
            })
          ) : (
            <p>No other users found in the database.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default People;