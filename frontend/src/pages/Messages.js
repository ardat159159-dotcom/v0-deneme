import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Search } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Messages({ currentUser, onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock conversation data
  const mockUsers = [
    {
      id: '1',
      username: 'ayse_yilmaz',
      full_name: 'Ayşe Yılmaz',
      profile_picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse',
      last_message: 'Merhaba! Nasılsın?',
      last_message_time: '5dk',
      unread: 2
    },
    {
      id: '2',
      username: 'ali_ozturk',
      full_name: 'Ali Öztürk',
      profile_picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ali',
      last_message: 'Yarın görüşürüz',
      last_message_time: '1s',
      unread: 0
    },
    {
      id: '3',
      username: 'mehmet_kaya',
      full_name: 'Mehmet Kaya',
      profile_picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
      last_message: 'Teşekkürler!',
      last_message_time: '3s',
      unread: 0
    },
  ];

  useEffect(() => {
    setConversations(mockUsers);
  }, []);

  const loadMessages = async (userId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/messages/${currentUser.id}?with_user_id=${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Mock messages for demo
      setMessages([
        {
          id: '1',
          sender_id: userId,
          receiver_id: currentUser.id,
          content: 'Merhaba! Nasılsın?',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          sender_id: currentUser.id,
          receiver_id: userId,
          content: 'İyiyim, sen nasılsın?',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (userId) => {
    // Mark conversation as read
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === userId ? { ...conv, unread: 0 } : conv
      )
    );
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    loadMessages(user.id);
    // Mark as read when user opens conversation
    markAsRead(user.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await axios.post(`${API}/messages`, {
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content: newMessage
      });

      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Add message locally for demo
      const newMsg = {
        id: Date.now().toString(),
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content: newMessage,
        created_at: new Date().toISOString()
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-6xl mx-auto h-[calc(100vh-150px)]">
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden flex h-full">
          {/* Conversations List */}
          <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:outline-none"
                  data-testid="search-messages-input"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    selectedUser?.id === user.id ? 'bg-purple-50' : ''
                  }`}
                  data-testid="conversation-item"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.profile_picture}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {user.unread > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center" data-testid="unread-badge">
                          {user.unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-semibold truncate">{user.full_name}</p>
                        <span className="text-xs text-gray-500">{user.last_message_time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{user.last_message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="hidden md:flex md:w-2/3 flex-col">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <img
                    src={selectedUser.profile_picture}
                    alt={selectedUser.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{selectedUser.full_name}</p>
                    <p className="text-sm text-gray-500">@{selectedUser.username}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isSent = message.sender_id === currentUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            isSent
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Mesaj yaz..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:outline-none"
                      data-testid="message-input"
                    />
                    <button
                      type="submit"
                      className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg"
                      data-testid="send-message-btn"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Sohbet başlatmak için bir kişi seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Messages;
