import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { FaUser, FaSignOutAlt, FaTrophy, FaBook, FaBriefcase, FaFileAlt, FaTasks, FaComments, FaUsers, FaHome, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../messages.css';

const Messages = ({ user, onLogout, setView }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching messages:', error);
      else setMessages(data || []);
      setLoading(false);
    };
    fetchMessages();
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        content: newMessage,
        sender: user.email
      });

    if (error) console.error('Error sending message:', error);
    else {
      setNewMessage('');
      // Refresh messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setMessages(data || []);
    }
  };

  if (loading) return (
    <div className="spinner">
      <div></div>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar currentView="messages" setView={setView} onLogout={onLogout} />
      
      <div className="main-content">
        <header className="header">
          <h2>Messages</h2>
        </header>

        <div className="messages-container">
          <div className="messages-list">
            {messages.map(message => (
              <div key={message.id} className="message-card">
                <div className="message-header">
                  <FaEnvelope className="message-icon" />
                  <span className="message-sender">{message.sender}</span>
                  <span className="message-time">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit">
              <FaPaperPlane /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;