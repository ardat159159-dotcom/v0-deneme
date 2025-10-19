import { Settings as SettingsIcon, Bell, Lock, Globe, Palette, Shield, Moon, Sun } from 'lucide-react';
import Layout from '../components/Layout';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function Settings({ currentUser, onLogout }) {
  const { isDark, toggleTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    notifications: {
      likes: true,
      comments: true,
      follows: true,
      messages: true,
      earnings: true
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showEarnings: true
    },
    language: 'tr'
  });

  const handleToggle = (category, key) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: !settings[category][key]
      }
    });
  };

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Ayarlar</h1>
          </div>
          <p className="text-gray-600">Hesap ve uygulama ayarlarınızı yönetin</p>
        </div>

        {/* Notifications Settings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">Bildirimler</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'likes', label: 'Beğeni bildirimleri' },
              { key: 'comments', label: 'Yorum bildirimleri' },
              { key: 'follows', label: 'Takipçi bildirimleri' },
              { key: 'messages', label: 'Mesaj bildirimleri' },
              { key: 'earnings', label: 'Kazanç bildirimleri' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key]}
                    onChange={() => handleToggle('notifications', item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">Gizlilik</h2>
          </div>

          <div className="space-y-4">
            {[
              { key: 'profileVisible', label: 'Profilim herkese açık olsun' },
              { key: 'showEmail', label: 'E-posta adresimi göster' },
              { key: 'showEarnings', label: 'Kazançlarımı göster' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-medium">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy[item.key]}
                    onChange={() => handleToggle('privacy', item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Language & Theme */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Dil</h2>
            </div>
            <select 
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl focus:border-primary focus:outline-none"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Tema</h2>
            </div>
            <button
              onClick={toggleTheme}
              className="w-full px-4 py-3 bg-background border-2 border-border rounded-xl hover:border-primary focus:outline-none flex items-center justify-between group"
            >
              <span className="flex items-center gap-3">
                {isDark ? (
                  <>
                    <Moon className="w-5 h-5 text-primary" />
                    <span>Karanlık Mod</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5 text-primary" />
                    <span>Aydınlık Mod</span>
                  </>
                )}
              </span>
              <span className="text-sm text-muted-foreground group-hover:text-primary">
                Değiştir →
              </span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 mt-6">
          <h2 className="text-xl font-bold text-red-700 mb-4">Tehlikeli Bölge</h2>
          <div className="space-y-3">
            <button className="w-full px-6 py-3 bg-white border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50">
              Hesabımı Dondur
            </button>
            <button className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">
              Hesabımı Sil
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
