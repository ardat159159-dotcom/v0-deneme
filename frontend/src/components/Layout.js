import { Home, User, MessageSquare, Video, TrendingUp, DollarSign, LogOut, Bell, Settings, HelpCircle, Shield, Moon, Sun } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

function Layout({ children, currentUser, onLogout }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { icon: Home, label: 'Ana Sayfa', path: '/feed' },
    { icon: Video, label: 'Canlı Yayın', path: '/live' },
    { icon: MessageSquare, label: 'Mesajlar', path: '/messages' },
    { icon: DollarSign, label: 'Kazanç', path: '/earnings' },
    { icon: User, label: 'Profil', path: '/profile' },
  ];

  // Admin panel item
  if (currentUser?.is_admin) {
    navItems.push({ icon: Shield, label: 'Admin Panel', path: '/admin/dashboard' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/feed" className="flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold gradient-text">lupintr</h1>
          </Link>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              data-testid="theme-toggle-btn"
              title={isDark ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>

            <button className="relative p-2 hover:bg-muted rounded-full" data-testid="notifications-btn">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-destructive hover:bg-destructive/10 rounded-full"
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 p-4 sticky top-[73px] h-[calc(100vh-73px)]">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                  data-testid={`nav-${item.path.slice(1)}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Card */}
          <div className="mt-8 p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={currentUser.profile_picture}
                alt={currentUser.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{currentUser.username}</p>
                <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Ayarlar</span>
              </Link>
              <Link
                to="/help"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm">Yardım</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {children}
        </main>

        {/* Right Sidebar - Trending/Suggestions */}
        <aside className="hidden lg:block w-80 p-4 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h3 className="font-bold text-lg mb-4">Trend Konular</h3>
            <div className="space-y-4">
              {['#YeniProje', '#Antrenman', '#Kahve', '#Yemek', '#Seyahat'].map((tag, i) => (
                <div key={i} className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                  <p className="font-semibold text-purple-600">{tag}</p>
                  <p className="text-sm text-gray-500">{Math.floor(Math.random() * 10000)} gönderi</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Önerilen Kullanıcılar</h3>
            <div className="space-y-4">
              {[
                { name: 'Ahmet Yıldız', username: 'ahmet_y' },
                { name: 'Zeynep Koç', username: 'zeynep_k' },
                { name: 'Can Demir', username: 'can_d' },
              ].map((user, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                  <button className="px-4 py-1 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700">
                    Takip Et
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 ${
                  isActive ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default Layout;
