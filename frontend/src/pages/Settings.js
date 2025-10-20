import { useState, useEffect } from 'react';
import { Moon, Sun, Bell, Lock, User, Shield, HelpCircle, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import { useTheme } from '../contexts/ThemeContext';

function Settings({ currentUser, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <h1 className="text-3xl font-bold text-white mb-6">Ayarlar</h1>

        {/* Account Section */}
        <div className="glass-card mb-6">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Hesap
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Kullanıcı Adı</p>
                <p className="text-sm text-gray-400">@{currentUser.username}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">E-posta</p>
                <p className="text-sm text-gray-400">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="glass-card mb-6">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-orange-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
              Görünüm
            </h2>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Karanlık Mod</p>
                <p className="text-sm text-gray-400">Gece mod aktif</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  theme === 'dark' ? 'bg-orange-500' : 'bg-zinc-700'
                }`}
              >
                <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="glass-card mb-6">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              Bildirimler
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Bildirimler</p>
                <p className="text-sm text-gray-400">Tüm bildirimleri al</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  notifications ? 'bg-orange-500' : 'bg-zinc-700'
                }`}
              >
                <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                  notifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="glass-card mb-6">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              Gizlilik
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Gizli Hesap</p>
                <p className="text-sm text-gray-400">Sadece takipçiler görebilir</p>
              </div>
              <button
                onClick={() => setPrivateAccount(!privateAccount)}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  privateAccount ? 'bg-orange-500' : 'bg-zinc-700'
                }`}
              >
                <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                  privateAccount ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Other Actions */}
        <div className="space-y-3">
          <button className="w-full glass-card p-4 flex items-center justify-between hover:bg-zinc-900 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="text-white">Güvenlik</span>
            </div>
          </button>

          <button className="w-full glass-card p-4 flex items-center justify-between hover:bg-zinc-900 transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              <span className="text-white">Yardım & Destek</span>
            </div>
          </button>

          <button
            onClick={onLogout}
            className="w-full glass-card p-4 flex items-center justify-between hover:bg-red-500/20 transition-colors border border-red-500/50"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="text-red-500 font-semibold">Çıkış Yap</span>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">lupintr v1.0</p>
          <p className="text-xs text-gray-600 mt-1">Made with Emergent</p>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;