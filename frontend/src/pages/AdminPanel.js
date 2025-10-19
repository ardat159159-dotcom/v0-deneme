import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, DollarSign, Shield, Ban, Trash2, Search, LogOut, AlertTriangle, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function AdminPanel() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const admin = localStorage.getItem('adminUser');
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    
    const user = JSON.parse(admin);
    if (!user.is_admin) {
      navigate('/');
      return;
    }
    
    setAdminUser(user);
    loadAdminData();
  }, [navigate]);

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

  const handleBanUser = async (userId, username) => {
    if (!window.confirm(`${username} kullanıcısını banlamak istediğinize emin misiniz?`)) return;

    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      alert('Kullanıcı banlandı!');
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Hata oluştu!');
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
      alert('Hata oluştu!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-purple-500" />
                <div>
                  <h1 className="text-xl font-bold">lupintr Admin</h1>
                  <p className="text-xs text-gray-400">Yönetim Paneli</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-white font-bold">{adminUser?.username[0].toUpperCase()}</span>
                </div>
                <span className="text-sm">{adminUser?.username}</span>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Shield },
              { id: 'users', label: 'Kullanıcılar', icon: Users },
              { id: 'posts', label: 'Gönderiler', icon: FileText },
              { id: 'earnings', label: 'Kazançlar', icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-500 border-b-2 border-purple-500'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Platform İstatistikleri</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-blue-500" />
                  <span className="text-xs text-gray-400 px-2 py-1 bg-blue-500/10 rounded">+12%</span>
                </div>
                <p className="text-4xl font-bold">{stats.total_users}</p>
                <p className="text-sm text-gray-400 mt-2">Toplam Kullanıcı</p>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-green-500" />
                  <span className="text-xs text-gray-400 px-2 py-1 bg-green-500/10 rounded">+8%</span>
                </div>
                <p className="text-4xl font-bold">{stats.total_posts}</p>
                <p className="text-sm text-gray-400 mt-2">Toplam Gönderi</p>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-purple-500" />
                  <span className="text-xs text-gray-400 px-2 py-1 bg-purple-500/10 rounded">+25%</span>
                </div>
                <p className="text-4xl font-bold">${stats.total_earnings_paid.toFixed(2)}</p>
                <p className="text-sm text-gray-400 mt-2">Ödenen Kazanç</p>
              </div>

              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-yellow-500" />
                  <span className="text-xs text-gray-400 px-2 py-1 bg-yellow-500/10 rounded">Aktif</span>
                </div>
                <p className="text-4xl font-bold">{stats.total_streams}</p>
                <p className="text-sm text-gray-400 mt-2">Canlı Yayın</p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Kullanıcı Yönetimi</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kullanıcı ara..."
                  className="pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Kullanıcı</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">E-posta</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Takipçi</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Kazanç</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profile_picture}
                            alt={user.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium">@{user.username}</p>
                            <p className="text-sm text-gray-400">{user.full_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{user.email}</td>
                      <td className="p-4 text-gray-300">{user.followers_count}</td>
                      <td className="p-4 text-green-500 font-medium">${user.total_earnings.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.username !== 'admin' && (
                            <button
                              onClick={() => handleBanUser(user.id, user.username)}
                              className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 flex items-center gap-2"
                            >
                              <Ban className="w-4 h-4" />
                              Banla
                            </button>
                          )}
                        </div>
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
          <div>
            <h2 className="text-2xl font-bold mb-6">Gönderi Yönetimi</h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <img
                        src={post.user_avatar}
                        alt={post.username}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium">@{post.username}</p>
                          <span className="text-sm text-gray-400">
                            {new Date(post.created_at).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-2">{post.content}</p>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>{post.likes_count} beğeni</span>
                          <span>{post.comments_count} yorum</span>
                          <span>{post.shares_count} paylaşım</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Kazanç Geçmişi</h2>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Kullanıcı ID</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Tip</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Miktar</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {earnings.slice(0, 50).map((earning) => (
                    <tr key={earning.id} className="hover:bg-zinc-800/50">
                      <td className="p-4 text-gray-300 font-mono text-sm">
                        {earning.user_id.substring(0, 8)}...
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          earning.type === 'like' ? 'bg-pink-500/10 text-pink-500' :
                          earning.type === 'comment' ? 'bg-blue-500/10 text-blue-500' :
                          earning.type === 'share' ? 'bg-green-500/10 text-green-500' :
                          'bg-purple-500/10 text-purple-500'
                        }`}>
                          {earning.type}
                        </span>
                      </td>
                      <td className="p-4 text-green-500 font-medium">
                        ${earning.amount.toFixed(3)}
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {new Date(earning.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
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
