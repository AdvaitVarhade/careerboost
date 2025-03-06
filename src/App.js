import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Profile from './components/Profile';
import Jobs from './components/Jobs';
import Courses from './components/Courses';
import Resume from './components/Resume';
import Tasks from './components/Tasks';
import Contests from './components/Contests';
import Interview from './components/Interview';
import Forum from './components/Forum';
import Dashboard from './components/Dashboard';
import People from './components/People';
import Messages from './components/Messages';
import FloatingActionButton from './components/FloatingActionButton';
import './global.css';

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    // Check theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no saved preference, check system preference
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }

    // Auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className={session ? "flex" : "auth-page"}>
      {session ? (
        <>
          {view === 'dashboard' ? (
            <Dashboard user={session} onLogout={handleLogout} setView={setView} />
          ) : view === 'profile' ? (
            <Profile user={session} onLogout={handleLogout} setView={setView} />
          ) : view === 'jobs' ? (
            <Jobs user={session} onLogout={handleLogout} setView={setView} />
          ) : view === 'courses' ? (
            <Courses user={session} onLogout={handleLogout} setView={setView} />
          ) : view === 'resume' ? (
            <Resume user={session} onLogout={handleLogout} setView={setView} />
          ) : view === 'tasks' ? (
            <Tasks user={session} onLogout={handleLogout} setView={setView} />
          ) : view === 'contests' ? (
            <Contests user={session} onLogout={handleLogout} setView={setView} />
          ) : view === 'interview' ? (
            <Interview user={session} onLogout={handleLogout} setView={setView} />
          ) : view === 'forum' ? (
            <Forum user={session} onLogout={handleLogout} setView={setView} />
          ) : view === 'people' ? (
            <People user={session} onLogout={handleLogout} setView={setView} />
          ) : (
            <Messages user={session} onLogout={handleLogout} setView={setView} />
          )}
          <FloatingActionButton />
        </>
      ) : (
        <Auth />
      )}
    </div>
  );
}

export default App;