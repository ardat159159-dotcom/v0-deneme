import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Edit3, Save, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Profile({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(currentUser);
  const [posts, setPosts] = useState([]);
  const [editForm, setEditForm] = useState({
    username: currentUser.username,
    full_name: currentUser.full_name,
    bio: currentUser.bio || ''
  });

  useEffect(() => {
    loadUserPosts();
  }, []);

  const loadUserPosts = async () => {
    try {
      const response = await axios.get(`${API}/posts`);
      const myPosts = response.data.filter(p => p.user_id === currentUser.id);
      setPosts(myPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await axios.put(`${API}/users/${currentUser.id}`, editForm);
      setUser({ ...user, ...editForm });
      setIsEditing(false);
      alert('Profil güncellendi!');
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Profil güncellenirken hata oluştu');
    }
  };

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-2xl mx-auto px-4 pb-20">
        {/* Profile Header Card */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col items-center">
            {/* Profile Picture */}
            <div className="relative mb-4">
              <img
                src={user.profile_picture}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-500"
              />
              <button className="absolute bottom-0 right-0 w-8 h-8 gradient-primary rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Edit Mode */}
            {isEditing ? (
              <div className="w-full space-y-4">
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Kullanıcı adı"
                  className="w-full bg-zinc-900 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500"
                />
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Ad Soyad"
                  className="w-full bg-zinc-900 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Bio"
                  rows="3"
                  className="w-full bg-zinc-900 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Kaydet
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center w-full">
                <h1 className="text-2xl font-bold text-white mb-1">@{user.username}</h1>
                <p className="text-lg text-gray-300 mb-2">{user.full_name}</p>
                {user.bio && <p className="text-gray-400 mb-4">{user.bio}</p>}
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Edit3 className="w-4 h-4" />
                  Profili Düzenle
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{posts.length}</p>
              <p className="text-xs text-gray-400">Gönderi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{user.followers_count}</p>
              <p className="text-xs text-gray-400">Takipçi</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{user.following_count}</p>
              <p className="text-xs text-gray-400">Takip</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">${user.total_earnings?.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-gray-400">Kazanç</p>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Gönderilerim</h2>
          <div className="flex items-center gap-2 text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">{posts.length} gönderi</span>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400">Henüz gönderi paylaşmadın</p>
            <button
              onClick={() => navigate('/feed')}
              className="btn-primary mt-4 px-6 py-2"
            >
              İlk Gönderiyi Paylaş
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square glass-card overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              >
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center p-2">
                    <p className="text-white text-xs line-clamp-6">{post.content}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center gap-4 opacity-0 hover:opacity-100">
                  <span className="text-white flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes_count}
                  </span>
                  <span className="text-white flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Profile;