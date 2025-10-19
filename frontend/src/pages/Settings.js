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
      <div className="max-w-4xl mx-auto app-container">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Ayarlar</h1>
          </div>
          <p className="text-muted-foreground">Hesap ve uygulama ayarlarınızı yönetin</p>
        </div>

        {/* Notifications Settings */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-card-foreground">Bildirimler</h2>
          </div>

          <div className="space-y-3">
            {[
              { key: 'likes', label: 'Beğeni bildirimleri' },
              { key: 'comments', label: 'Yorum bildirimleri' },
              { key: 'follows', label: 'Takipçi bildirimleri' },
              { key: 'messages', label: 'Mesaj bildirimleri' },
              { key: 'earnings', label: 'Kazanç bildirimleri' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                <span className="font-medium text-foreground">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key]}
                    onChange={() => handleToggle('notifications', item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-muted peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-card-foreground">Gizlilik</h2>
          </div>

          <div className="space-y-3">
            {[
              { key: 'profileVisible', label: 'Profilim herkese açık olsun' },
              { key: 'showEmail', label: 'E-posta adresimi göster' },
              { key: 'showEarnings', label: 'Kazançlarımı göster' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                <span className="font-medium text-foreground">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.privacy[item.key]}
                    onChange={() => handleToggle('privacy', item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer dark:bg-muted peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Language & Theme */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">Dil</h2>
            </div>
            <select 
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-4 py-3 bg-background text-foreground border-2 border-border rounded-xl focus:border-primary focus:outline-none"
            >
              <option value="tr">Türkçe</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">Tema</h2>
            </div>
            <button
              onClick={toggleTheme}
              className="w-full px-4 py-3 bg-background text-foreground border-2 border-border rounded-xl hover:border-primary focus:outline-none flex items-center justify-between group touch-feedback"
            >
              <span className="flex items-center gap-3">
                {isDark ? (
                  <>
                    <Moon className="w-5 h-5 text-primary" />
                    <span className="font-medium">Karanlık Mod</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-5 h-5 text-primary" />
                    <span className="font-medium">Aydınlık Mod</span>
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
        <div className="bg-destructive/10 border-2 border-destructive/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-destructive mb-4">Tehlikeli Bölge</h2>
          <div className="space-y-3">
            <button className="w-full px-6 py-3 bg-card border-2 border-destructive/30 text-destructive rounded-xl font-semibold hover:bg-destructive/10 touch-feedback">
              Hesabımı Dondur
            </button>
            <button className="w-full px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-semibold hover:bg-destructive/90 touch-feedback">
              Hesabımı Sil
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
