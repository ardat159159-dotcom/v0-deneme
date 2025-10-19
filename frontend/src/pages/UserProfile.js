import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, UserPlus, UserMinus } from 'lucide-react';
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
      // Find user by username
      const usersRes = await axios.get(`${API}/admin/users`);
      const foundUser = usersRes.data.find(u => u.username === username);
      
      if (!foundUser) {
        alert('Kullanıcı bulunamadı');
        navigate('/feed');
        return;
      }

      setUser(foundUser);

      // Get user posts
      const postsRes = await axios.get(`${API}/posts`);
      const userPosts = postsRes.data.filter(p => p.user_id === foundUser.id);
      setPosts(userPosts);

      // Check if following
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
      loadUserProfile(); // Refresh counts
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <Layout currentUser={currentUser} onLogout={onLogout}>
        <div className=\"flex justify-center items-center h-64\">
          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-primary\"></div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className=\"max-w-4xl mx-auto app-container\">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className=\"flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4\"
        >
          <ArrowLeft className=\"w-5 h-5\" />
          Geri
        </button>

        {/* Profile Header */}
        <div className=\"bg-card rounded-2xl p-8 mb-6 border border-border\">
          <div className=\"flex flex-col md:flex-row gap-6 items-center md:items-start\">
            <img
              src={user.profile_picture}
              alt={user.username}
              className=\"w-32 h-32 rounded-full object-cover\"
            />

            <div className=\"flex-1 text-center md:text-left\">
              <div className=\"flex flex-col md:flex-row gap-4 items-center justify-between mb-4\">
                <div>
                  <h1 className=\"text-3xl font-bold text-foreground\">@{user.username}</h1>
                  <p className=\"text-xl text-muted-foreground\">{user.full_name}</p>
                </div>
                
                {currentUser.id !== user.id && (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-colors ${
                      isFollowing
                        ? 'bg-muted text-foreground hover:bg-muted/80'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className=\"w-4 h-4\" />
                        Takipten Çık
                      </>
                    ) : (
                      <>
                        <UserPlus className=\"w-4 h-4\" />
                        Takip Et
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className=\"text-foreground mb-4\">{user.bio || 'Henüz biyografi yok'}</p>

              {/* Stats */}
              <div className=\"flex gap-6 justify-center md:justify-start\">
                <div className=\"text-center\">
                  <p className=\"text-2xl font-bold text-foreground\">{posts.length}</p>
                  <p className=\"text-muted-foreground text-sm\">Gönderi</p>
                </div>
                <div className=\"text-center\">
                  <p className=\"text-2xl font-bold text-foreground\">{user.followers_count.toLocaleString()}</p>
                  <p className=\"text-muted-foreground text-sm\">Takipçi</p>
                </div>
                <div className=\"text-center\">
                  <p className=\"text-2xl font-bold text-foreground\">{user.following_count.toLocaleString()}</p>
                  <p className=\"text-muted-foreground text-sm\">Takip</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Posts Grid */}
        <div className=\"bg-card rounded-2xl p-6 border border-border\">
          <h2 className=\"text-2xl font-bold text-foreground mb-6\">Gönderiler</h2>
          
          {posts.length === 0 ? (
            <div className=\"text-center py-20\">
              <p className=\"text-muted-foreground\">Henüz gönderi yok</p>
            </div>
          ) : (
            <div className=\"grid grid-cols-3 gap-2\">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className=\"aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80\"
                >
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt=\"Post\"
                      className=\"w-full h-full object-cover\"
                    />
                  ) : (
                    <div className=\"w-full h-full flex items-center justify-center p-4\">
                      <p className=\"text-sm text-muted-foreground line-clamp-3\">{post.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UserProfile;
