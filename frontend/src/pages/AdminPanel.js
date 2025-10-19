import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, Video, DollarSign, Trash2, Shield } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminPanel({ currentUser, onLogout }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes, postsRes, earningsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/posts`),
        axios.get(`${API}/admin/earnings`)
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
      setEarnings(earningsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;

    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      alert('Kullanıcı silindi!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Kullanıcı silinirken hata oluştu!');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;

    try {
      await axios.delete(`${API}/admin/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
      alert('Gönderi silindi!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Gönderi silinirken hata oluştu!');
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Admin Paneli</h1>
          </div>
          <p className="text-gray-600">Platform yönetimi ve istatistikler</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'users', label: 'Kullanıcılar' },
            { id: 'posts', label: 'Gönderiler' },
            { id: 'earnings', label: 'Kazançlar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-8 h-8 text-blue-500" />
                <h3 className="font-semibold text-gray-700">Toplam Kullanıcı</h3>
              </div>
              <p className="text-4xl font-bold">{stats.total_users}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-green-500" />
                <h3 className="font-semibold text-gray-700">Toplam Gönderi</h3>
              </div>
              <p className="text-4xl font-bold">{stats.total_posts}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Video className="w-8 h-8 text-red-500" />
                <h3 className="font-semibold text-gray-700">Canlı Yayınlar</h3>
              </div>
              <p className="text-4xl font-bold">{stats.total_streams}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-8 h-8 text-purple-500" />
                <h3 className="font-semibold text-gray-700">Ödenen Kazanç</h3>
              </div>
              <p className="text-4xl font-bold">${stats.total_earnings_paid.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Tüm Kullanıcılar ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Avatar</th>
                    <th className="text-left p-3">Kullanıcı Adı</th>
                    <th className="text-left p-3">E-posta</th>
                    <th className="text-left p-3">Ad Soyad</th>
                    <th className="text-left p-3">Takipçi</th>
                    <th className="text-left p-3">Kazanç</th>
                    <th className="text-left p-3">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <img
                          src={user.profile_picture}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                      </td>
                      <td className="p-3">@{user.username}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.full_name}</td>
                      <td className="p-3">{user.followers_count}</td>
                      <td className="p-3">${user.total_earnings.toFixed(2)}</td>
                      <td className="p-3">
                        {user.username !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Tüm Gönderiler ({posts.length})</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border-b pb-4 flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={post.user_avatar}
                        alt={post.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="font-semibold">@{post.username}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{post.content}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>{post.likes_count} beğeni</span>
                      <span>{post.comments_count} yorum</span>
                      <span>{post.shares_count} paylaşım</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-4">Son Kazançlar</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Kullanıcı ID</th>
                    <th className="text-left p-3">Tip</th>
                    <th className="text-left p-3">Miktar</th>
                    <th className="text-left p-3">Kaynak ID</th>
                    <th className="text-left p-3">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning) => (
                    <tr key={earning.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{earning.user_id.substring(0, 8)}...</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {earning.type}
                        </span>
                      </td>
                      <td className="p-3 text-green-600 font-semibold">
                        ${earning.amount.toFixed(3)}
                      </td>
                      <td className="p-3">{earning.source_id.substring(0, 8)}...</td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(earning.created_at).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminPanel;
