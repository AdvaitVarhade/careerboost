import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaBell,aa } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../dashboard.css';
import '../people.css';

const Dashboard = ({ user, onLogout, setView }) => {
  const [stats, setStats] = useState({
    jobApplications: 0,
    courseCompletions: 0,
    taskProgress: 0,
    contestScore: 0,
    connectionsCount: 0,
    goalProgress: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('id')
          .eq('user_id', user.id);
        if (jobsError) throw jobsError;

        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('id')
          .eq('user_id', user.id)
          .eq('completed', true);
        if (coursesError) throw coursesError;

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('status')
          .eq('user_id', user.id);
        if (tasksError) throw tasksError;
        const totalTasks = tasksData?.length || 0;
        const completedTasks = tasksData?.filter(t => t.status === 'completed').length || 0;
        const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('score')
          .eq('user_id', user.id);
        if (submissionsError) throw submissionsError;
        const contestScore = submissionsData?.reduce((sum, sub) => sum + (sub.score || 0), 0) || 0;

        const { data: connectionsData, error: connectionsError } = await supabase
          .from('connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'accepted');
        if (connectionsError) throw connectionsError;

        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('id')
          .eq('user_id', user.id);
        if (goalsError) throw goalsError;
        const totalGoals = goalsData?.length || 0;
        const completedGoals = await Promise.all(goalsData?.map(async goal => {
          const { data: goalTasks } = await supabase
            .from('tasks')
            .select('status')
            .eq('goal_id', goal.id);
          const total = goalTasks?.length || 0;
          const completed = goalTasks?.filter(t => t.status === 'completed').length || 0;
          return total > 0 && completed === total;
        }) || []);
        const goalProgress = totalGoals > 0 ? Math.round((completedGoals.filter(Boolean).length / totalGoals) * 100) : 0;

        const { data: notificationsData, error: notificationsError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (notificationsError) throw notificationsError;

        setStats({
          jobApplications: jobsData?.length || 0,
          courseCompletions: coursesData?.length || 0,
          taskProgress,
          contestScore,
          connectionsCount: connectionsData?.length || 0,
          goalProgress,
        });
        setNotifications(notificationsData || []);
      } catch (error) {
        console.error('Error fetching stats:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    const notificationsSubscription = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(notificationsSubscription);
  }, [user]);

  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (!error) {
      setNotifications(notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
    }
  };

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="dashboard" setView={setView} onLogout={onLogout} />

      <div className="main-content">
        <header className="header">
          <h2>CareerBoost</h2>
        </header>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <h3>Your Stats</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Job Applications</h4>
                <p>{stats.jobApplications}</p>
              </div>
              <div className="stat-card">
                <h4>Course Completions</h4>
                <p>{stats.courseCompletions}</p>
              </div>
              <div className="stat-card">
                <h4>Task Progress</h4>
                <p>{stats.taskProgress}%</p>
              </div>
              <div className="stat-card">
                <h4>Contest Score</h4>
                <p>{stats.contestScore}</p>
              </div>
              <div className="stat-card">
                <h4>Connections</h4>
                <p>{stats.connectionsCount}</p>
              </div>
              <div className="stat-card">
                <h4>Goal Progress</h4>
                <p>{stats.goalProgress}%</p>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h3>Notifications ({notifications.filter(n => !n.is_read).length})</h3>
            {notifications.length ? (
              notifications.slice(0, 5).map(n => (
                <div key={n.id} className={`notification-card ${n.is_read ? 'read' : ''}`}>
                  <p>{n.content}</p>
                  {!n.is_read && (
                    <button onClick={() => markAsRead(n.id)}>Mark as Read</button>
                  )}
                </div>
              ))
            ) : (
              <p>No notifications yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;