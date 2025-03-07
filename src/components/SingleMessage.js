import { useEffect, useState, useRef } from "react";
import { supabase } from '../supabaseClient';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import Sidebar from './Sidebar';
import '../global.css';
import '../sidebar.css';
import '../main.css';
import '../singlemessage.css';

const SingleMessage = ({ user, onLogout, setView, otherUserId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [profile, setProfile] = useState([]);
    const intervalRef = useRef(null); // Ref to store the interval ID

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
    
        const { data: messageSent, error: insertMessageError } = await supabase
          .from('messages')
          .insert({
            sender_id: user.user.id,
            content: newMessage,
            receiver_id: otherUserId,
            created_at: new Date().toISOString(),
          });
            
        if (insertMessageError) console.error('Error sending message:', insertMessageError);
        else {
            setMessages([...messages, {sender_id: user.user.id, content: newMessage, receiver_id: otherUserId, created_at: new Date().toISOString()}]);
            setNewMessage('');
        }
      };

    useEffect(() => {
        const fetchMessages = async () => {
            console.log('fetching messages');
            const { data: messages, error: fetchingMessagesError } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.user.id})`)
                .order('created_at', { ascending: true })
                .limit(100);
            const { data: otherUserData, error: fetchingProfilesError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', otherUserId);

            if (fetchingProfilesError) {
                console.log('Error fetching profiles', fetchingProfilesError);
            } else {
                setProfile(otherUserData || []);
            }

            if (fetchingMessagesError) console.error('Error fetching messages:', fetchingMessagesError);
            else setMessages(messages || []);
        };
        fetchMessages();

        intervalRef.current = setInterval(fetchMessages, 10000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalRef.current);
    }, [user.user.id, otherUserId]); // Add dependencies

    return (
        <div className="flex">
            <Sidebar currentView="messages" setView={setView} onLogout={onLogout} />

            <div className="main-content">
                <header className="header">
                    <h2>Chatting With {profile[0]?.email}</h2>
                </header>

                <div className="messages-container">
                    <div className="messages-list">
                        {messages.map(message => (
                            <div
                                key={message.id}
                                className={`message-card-single ${message.sender_id === user.user.id ? 'sent' : 'received'}`}
                            >
                                <div className="message-header">
                                    <FaEnvelope className="message-icon" />
                                    {/* <span className="message-sender">{message.content}</span> */}
                                    <span className="message-sender-single">{message.content}</span>
                                    <span className="message-time">
                                        {new Date(message.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
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
    );
};

export default SingleMessage;