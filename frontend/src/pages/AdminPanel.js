import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, FileText, DollarSign, Shield, Ban, Trash2, Search, LogOut, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Email masking function
const maskEmail = (email) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedUsername = username.length > 2 
    ? username.substring(0, 2) + '***'
    : username;
  const [domainName, extension] = domain.split('.');
  const maskedDomain = domainName.length > 2
    ? domainName.substring(0, 2) + '***'
    : domainName;
  
  return `${maskedUsername}@${maskedDomain}.${extension}`;
};

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
  const [earningsPage, setEarningsPage] = useState(1);
  const [earningsTotal, setEarningsTotal] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [walletSettings, setWalletSettings] = useState({
    btc_wallet: '',
    eth_wallet: '',
    usdt_wallet: '',
    min_withdrawal_amount: 10
  });

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
      const [statsRes, usersRes, postsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`),
        axios.get(`${API}/admin/users`),
        axios.get(`${API}/posts`)
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEarnings = async (page = 1) => {
    try {
      const res = await axios.get(`${API}/admin/earnings?page=${page}&limit=50`);
      if (res.data.earnings) {
        setEarnings(res.data.earnings);
        setEarningsTotal(res.data.total);
        setEarningsPage(page);
      } else {
        // Backward compatibility if API doesn't return paginated response
        setEarnings(res.data);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'earnings' && adminUser) {
      loadEarnings(earningsPage);
    }
    if (activeTab === 'withdrawals' && adminUser) {
      loadWithdrawals();
    }
    if (activeTab === 'settings' && adminUser) {
      loadWalletSettings();
    }
  }, [activeTab, adminUser]);

  const loadWithdrawals = async () => {
    try {
      const res = await axios.get(`${API}/admin/withdrawals?status=pending`);
      setWithdrawals(res.data);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    }
  };

  const loadWalletSettings = async () => {
    try {
      const res = await axios.get(`${API}/admin/earnings-config`);
      setWalletSettings({
        btc_wallet: res.data.btc_wallet || '',
        eth_wallet: res.data.eth_wallet || '',
        usdt_wallet: res.data.usdt_wallet || '',
        min_withdrawal_amount: res.data.min_withdrawal_amount || 10
      });
    } catch (error) {
      console.error('Error loading wallet settings:', error);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId) => {
    if (!window.confirm('Bu para çekme talebini onaylıyor musunuz?')) return;
    
    try {
      await axios.put(`${API}/admin/withdrawals/${withdrawalId}`, {
        status: 'approved',
        admin_note: 'Onaylandı'
      });
      showToast('Para çekme talebi onaylandı!');
      loadWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      showToast('Hata oluştu!', true);
    }
  };

  const handleRejectWithdrawal = async (withdrawalId) => {
    const reason = prompt('Reddetme sebebi:');
    if (!reason) return;
    
    try {
      await axios.put(`${API}/admin/withdrawals/${withdrawalId}`, {
        status: 'rejected',
        admin_note: reason
      });
      showToast('Para çekme talebi reddedildi!');
      loadWithdrawals();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      showToast('Hata oluştu!', true);
    }
  };

  const handleSaveWalletSettings = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`${API}/admin/earnings-config`, walletSettings);
      showToast('Cüzdan ayarları kaydedildi!');
    } catch (error) {
      console.error('Error saving wallet settings:', error);
      showToast('Hata oluştu!', true);
    }
  };

  const handleBanUser = async (userId, username) => {
    if (!window.confirm(`${username} kullanıcısını banlamak istediğinize emin misiniz?`)) return;

    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      
      // Toast notification instead of alert
      showToast('Kullanıcı başarıyla banlandı!', 'success');
    } catch (error) {
      console.error('Error banning user:', error);
      showToast('Hata oluştu!', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bu gönderiyi silmek istediğinize emin misiniz?')) return;

    try {
      await axios.delete(`${API}/admin/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
      showToast('Gönderi başarıyla silindi!', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Hata oluştu!', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white z-50 animate-fade-in ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
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
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden md:inline">Ana Siteye Dön</span>
              </a>

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
              { id: 'withdrawals', label: 'Para Çekme', icon: DollarSign },
              { id: 'settings', label: 'Ödeme Ayarları', icon: Shield },
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
            <div className="grid md:grid-cols-5 gap-6">
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

              <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-orange-500" />
                  <span className="text-xs text-green-500 px-2 py-1 bg-green-500/10 rounded">Bugün</span>
                </div>
                <p className="text-4xl font-bold">{stats.active_users_today || 0}</p>
                <p className="text-sm text-gray-400 mt-2">Aktif Kullanıcı</p>
              </div>
            </div>

            {/* Top Earners */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">En Çok Kazananlar (Bu Ay)</h3>
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">#</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Kullanıcı</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Kazanç</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Gönderi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {users
                      .sort((a, b) => b.total_earnings - a.total_earnings)
                      .slice(0, 5)
                      .map((user, index) => (
                        <tr key={user.id} className="hover:bg-zinc-800/50">
                          <td className="p-4">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0 ? 'bg-yellow-500 text-black' :
                              index === 1 ? 'bg-gray-400 text-black' :
                              index === 2 ? 'bg-orange-600 text-white' :
                              'bg-zinc-800 text-gray-400'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
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
                          <td className="p-4">
                            <span className="text-green-500 font-bold text-lg">
                              ${user.total_earnings.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300">
                            {posts.filter(p => p.user_id === user.id).length} gönderi
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Son İşlemler (24 Saat)</h3>
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <div className="space-y-4">
                  {earnings.slice(0, 10).map((earning) => {
                    const user = users.find(u => u.id === earning.user_id);
                    return (
                      <div key={earning.id} className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={user?.profile_picture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                            alt={user?.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="text-sm font-medium">@{user?.username || 'unknown'}</p>
                            <p className="text-xs text-gray-400">
                              {earning.type} kazancı • {new Date(earning.created_at).toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                        <span className="text-green-500 font-semibold">+${earning.amount.toFixed(3)}</span>
                      </div>
                    );
                  })}
                </div>
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
                    <th className="text-left p-4 text-sm font-medium text-gray-400">ID</th>
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
                        <code className="text-xs text-gray-500 bg-zinc-800 px-2 py-1 rounded">
                          {user.id.substring(0, 8)}...
                        </code>
                      </td>
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
                      <td className="p-4 text-gray-300 font-mono text-sm">{maskEmail(user.email)}</td>
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
                  {earnings.map((earning) => (
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

            {/* Pagination */}
            {earningsTotal > 50 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-400">
                  Toplam {earningsTotal} kayıt
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadEarnings(earningsPage - 1)}
                    disabled={earningsPage === 1}
                    className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  <span className="text-sm text-gray-400">
                    Sayfa {earningsPage} / {Math.ceil(earningsTotal / 50)}
                  </span>
                  <button
                    onClick={() => loadEarnings(earningsPage + 1)}
                    disabled={earningsPage >= Math.ceil(earningsTotal / 50)}
                    className="px-4 py-2 bg-zinc-800 text-gray-300 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Para Çekme Talepleri</h2>
              <span className="px-4 py-2 bg-orange-500/20 text-orange-500 rounded-lg font-semibold">
                {withdrawals.length} Bekleyen
              </span>
            </div>

            {withdrawals.length === 0 ? (
              <div className="bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-800">
                <DollarSign className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Bekleyen para çekme talebi yok</p>
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Kullanıcı</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">E-posta</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Tutar</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Yöntem</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Cüzdan</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">Tarih</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-400">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-zinc-800/50">
                        <td className="p-4 font-medium">@{withdrawal.username}</td>
                        <td className="p-4 text-gray-400 text-sm">{withdrawal.email}</td>
                        <td className="p-4">
                          <span className="text-green-500 font-bold text-lg">
                            ${withdrawal.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-semibold uppercase">
                            {withdrawal.method}
                          </span>
                        </td>
                        <td className="p-4">
                          <code className="text-xs text-gray-500 bg-zinc-800 px-2 py-1 rounded">
                            {withdrawal.wallet_address?.substring(0, 20)}...
                          </code>
                        </td>
                        <td className="p-4 text-sm text-gray-400">
                          {new Date(withdrawal.created_at).toLocaleString('tr-TR')}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApproveWithdrawal(withdrawal.id)}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => handleRejectWithdrawal(withdrawal.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                            >
                              Reddet
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab - Wallet Settings */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Ödeme Ayarları</h2>
            
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
              <form onSubmit={handleSaveWalletSettings} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                    Kripto Cüzdan Adresleri
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Kullanıcılar para çekerken bu cüzdan adreslerine transfer yapılacak
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bitcoin (BTC) Cüzdan Adresi
                      </label>
                      <input
                        type="text"
                        value={walletSettings.btc_wallet}
                        onChange={(e) => setWalletSettings({ ...walletSettings, btc_wallet: e.target.value })}
                        placeholder="bc1q..."
                        className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ethereum (ETH) Cüzdan Adresi
                      </label>
                      <input
                        type="text"
                        value={walletSettings.eth_wallet}
                        onChange={(e) => setWalletSettings({ ...walletSettings, eth_wallet: e.target.value })}
                        placeholder="0x..."
                        className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        USDT (Tether) Cüzdan Adresi
                      </label>
                      <input
                        type="text"
                        value={walletSettings.usdt_wallet}
                        onChange={(e) => setWalletSettings({ ...walletSettings, usdt_wallet: e.target.value })}
                        placeholder="0x..."
                        className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Minimum Çekim Tutarı ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={walletSettings.min_withdrawal_amount}
                        onChange={(e) => setWalletSettings({ ...walletSettings, min_withdrawal_amount: parseFloat(e.target.value) })}
                        className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:scale-105 transition-transform"
                  >
                    Ayarları Kaydet
                  </button>
                </div>
              </form>

              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">ℹ️ Bilgi</h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Kullanıcılar para çekme talebinde bulunduğunda buradaki cüzdan adresleri gösterilir</li>
                  <li>• Manuel olarak bu adreslere transfer yapmanız gerekmektedir</li>
                  <li>• Transfer yaptıktan sonra "Para Çekme Talepleri" sekmesinden onaylayın</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminPanel;
