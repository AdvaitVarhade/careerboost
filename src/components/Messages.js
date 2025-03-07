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


  const handleOnClick = (userId) => {
    setView({ view: 'singleMessage', otherUserId: userId });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      // const { data, error } = await supabase
      //   .from('messages')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .order('created_at', { ascending: false });
      const { data: messages, error: fetchingMessagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.user.id},receiver_id.eq.${user.user.id}`) // Filter messages where the user is either sender or receiver
        .order('created_at', { ascending: false })
        .limit(100);
      
      const userSet = new Set();
      const finalMessages = [];
      for (let i = 0; i < messages.length; i++){
        const message = messages[i];
        if (userSet.has(message.sender_id == user.user.id? message.receiver_id: message.sender_id)){
          continue;
        }
        const { data: senderReceiverData, error: fetchingProfilesError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', message.sender_id == user.user.id? message.receiver_id: message.sender_id);
        
        userSet.add(message.sender_id == user.user.id? message.receiver_id: message.sender_id);
        
        message.senderReceiverData = senderReceiverData;

        finalMessages.push(message);
        
        if (fetchingProfilesError){
          console.error('Error received while fetching sender receiver data', fetchingProfilesError);
        }
      }
      

      if (fetchingMessagesError) console.error('Error fetching messages:', fetchingMessagesError);
      else setMessages(finalMessages || []);
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
              <div key={message.id} className="message-card" onClick={() => handleOnClick(message.senderReceiverData[0].id)}>
                <div className="message-header">
                  <FaEnvelope className="message-icon" />
                  <span className="message-sender">{message.senderReceiverData[0].email}</span>
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

          {/* <form className="message-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit">
              <FaPaperPlane /> Send
            </button>
          </form> */}
        </div>
      </div>
    </div>
  );
};

export default Messages;