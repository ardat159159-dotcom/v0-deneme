import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Search, MessageCircle } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Messages({ currentUser, onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await axios.get(`${API}/messages/${currentUser.id}/conversations`);
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await axios.get(`${API}/messages/${currentUser.id}/${userId}`);
      setMessages(response.data);
      setSelectedUser(userId);
      
      // Mark as read
      await axios.put(`${API}/messages/${currentUser.id}/${userId}/read`);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await axios.post(`${API}/messages`, {
        sender_id: currentUser.id,
        receiver_id: selectedUser,
        content: newMessage
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List */}
            <div className="col-span-12 md:col-span-4 border-r border-zinc-800 flex flex-col">
              <div className="p-4 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white mb-3">Mesajlar</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ara..."
                    className="w-full pl-10 pr-4 py-2 bg-zinc-900 text-white rounded-full outline-none focus:ring-2 ring-orange-500"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Henüz mesaj yok</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.user_id}
                      onClick={() => loadMessages(conv.user_id)}
                      className={`p-4 border-b border-zinc-800 cursor-pointer transition-colors ${
                        selectedUser === conv.user_id
                          ? 'bg-zinc-900'
                          : 'hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={conv.avatar}
                          alt={conv.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">@{conv.username}</h3>
                          <p className="text-sm text-gray-400 truncate">{conv.last_message}</p>
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center text-xs text-white">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="col-span-12 md:col-span-8 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            msg.sender_id === currentUser.id
                              ? 'gradient-primary text-white'
                              : 'bg-zinc-800 text-white'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Send Message Form */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesaj yaz..."
                        className="flex-1 bg-zinc-900 text-white px-4 py-3 rounded-full outline-none focus:ring-2 ring-orange-500"
                      />
                      <button
                        type="submit"
                        className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Bir sohbet seç</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Messages;