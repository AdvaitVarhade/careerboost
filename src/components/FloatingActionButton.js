import { RiAddLine, RiMoonLine, RiSunLine, RiRobot2Line } from 'react-icons/ri';
import { useState, useEffect } from 'react';

const FloatingActionButton = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user previously set a theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  return (
    <div 
      className="fab-container"
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <button className="fab-main">
        <RiAddLine size={24} />
      </button>
      <div className={`fab-options ${showOptions ? 'show' : ''}`}>
        <button 
          className="fab-option dark-mode" 
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onClick={toggleDarkMode}
        >
          {isDarkMode ? <RiSunLine size={20} /> : <RiMoonLine size={20} />}
        </button>
        <button 
          className="fab-option chat-bot" 
          title="Open Chat Bot"
        >
          <RiRobot2Line size={20} />
        </button>
      </div>
    </div>
  );
};

export default FloatingActionButton; 