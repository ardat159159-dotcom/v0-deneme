import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, UserPlus, UserMinus, MapPin, Calendar, Heart, MessageCircle } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function UserProfile({ currentUser, onLogout }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  const loadUserProfile = async () => {
    try {
      const usersRes = await axios.get(`${API}/admin/users`);
      const foundUser = usersRes.data.find(u => u.username === username);
      
      if (!foundUser) {
        alert('Kullanıcı bulunamadı');
        navigate('/feed');
        return;
      }

      setUser(foundUser);

      const postsRes = await axios.get(`${API}/posts`);
      const userPosts = postsRes.data.filter(p => p.user_id === foundUser.id);
      setPosts(userPosts);

      if (currentUser.id !== foundUser.id) {
        const followRes = await axios.get(
          `${API}/users/${foundUser.id}/is-following?follower_id=${currentUser.id}`
        );
        setIsFollowing(followRes.data.is_following);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await axios.post(
        `${API}/users/${user.id}/follow?follower_id=${currentUser.id}`
      );
      setIsFollowing(res.data.is_following);
      
      // Update local user counts
      setUser({
        ...user,
        followers_count: res.data.is_following 
          ? user.followers_count + 1 
          : user.followers_count - 1
      });
    } catch (error) {
      console.error('Error following user:', error);
      alert('Takip işlemi başarısız oldu');
    }
  };

  if (loading) {
    return (
      <Layout currentUser={currentUser} onLogout={onLogout}>
        <div className="flex justify-center items-center h-screen">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: '#F56040', borderTopColor: 'transparent' }}></div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri
        </button>

        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="relative">
              <img
                src={user.profile_picture}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-500"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white mb-1">@{user.username}</h1>
              <p className="text-lg text-gray-300 mb-3">{user.full_name}</p>
              
              {user.bio && (
                <p className="text-gray-400 mb-4">{user.bio}</p>
              )}

              <div className="flex gap-6 mb-4 justify-center sm:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{posts.length}</p>
                  <p className="text-sm text-gray-400">Gönderi</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{user.followers_count}</p>
                  <p className="text-sm text-gray-400">Takipçi</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{user.following_count}</p>
                  <p className="text-sm text-gray-400">Takip</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-500">${user.total_earnings.toFixed(2)}</p>
                  <p className="text-sm text-gray-400">Kazanç</p>
                </div>
              </div>

              {currentUser.id !== user.id && (
                <button
                  onClick={handleFollow}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    isFollowing
                      ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                      : 'gradient-primary text-white hover:scale-105'
                  }`}
                >
                  {isFollowing ? (
                    <span className="flex items-center gap-2 justify-center">
                      <UserMinus className="w-4 h-4" />
                      Takipten Çık
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <UserPlus className="w-4 h-4" />
                      Takip Et
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">Gönderiler</h2>
        </div>

        {posts.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400">Henüz gönderi yok</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="glass-card overflow-hidden">
                <div className="p-4">
                  <p className="text-white mb-3">{post.content}</p>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="w-full rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments_count}
                    </span>
                    <span className="ml-auto">
                      {new Date(post.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default UserProfile;