import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Users, DollarSign, Edit2, Image as ImageIcon } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Profile({ currentUser, onLogout }) {
  const [user, setUser] = useState(currentUser);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: currentUser.full_name,
    bio: currentUser.bio || ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [userRes, postsRes] = await Promise.all([
        axios.get(`${API}/users/${currentUser.id}`),
        axios.get(`${API}/posts`)
      ]);

      setUser(userRes.data);
      const userPosts = postsRes.data.filter(p => p.user_id === currentUser.id);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    // In a real app, this would call an update API
    setShowEditModal(false);
  };

  if (loading) {
    return (
      <Layout currentUser={currentUser} onLogout={onLogout}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <img
              src={user.profile_picture}
              alt={user.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
              data-testid="profile-avatar"
            />

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold" data-testid="profile-username">@{user.username}</h1>
                  <p className="text-xl text-gray-600">{user.full_name}</p>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-50"
                  data-testid="edit-profile-btn"
                >
                  <Edit2 className="w-4 h-4" />
                  Profili Düzenle
                </button>
              </div>

              <p className="text-gray-700 mb-4">{user.bio || 'Henüz biografi yok'}</p>

              {/* Stats */}
              <div className="flex gap-6 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-bold">{posts.length}</p>
                  <p className="text-gray-600 text-sm">Gönderi</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{user.followers_count.toLocaleString()}</p>
                  <p className="text-gray-600 text-sm">Takipçi</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{user.following_count.toLocaleString()}</p>
                  <p className="text-gray-600 text-sm">Takip</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold gradient-text">${user.total_earnings.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm">Kazanç</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts Grid */}
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="text-2xl font-bold mb-6">Gönderilerim</h2>
          
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Henüz gönderi yok</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80"
                >
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <p className="text-sm text-gray-600 line-clamp-3">{post.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Profili Düzenle</h2>
            <form onSubmit={handleEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografi
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                    rows="3"
                    placeholder="Kendinizden bahsedin..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Profile;
