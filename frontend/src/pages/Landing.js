import { Link } from 'react-router-dom';
import { Sparkles, Video, TrendingUp, MessageCircle } from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold gradient-text">luointr</h1>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/login" 
            className="px-6 py-2 rounded-full border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-50"
            data-testid="landing-login-btn"
          >
            Giriş Yap
          </Link>
          <Link 
            to="/register" 
            className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg"
            data-testid="landing-register-btn"
          >
            Kayıt Ol
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-6xl font-bold mb-6">
            <span className="gradient-text">Topluluğa Katıl</span>
          </h2>
          <p className="text-2xl text-gray-700 mb-8">
            Gönderi paylaş, para kazan ve canlı yayın aç!
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold hover:shadow-2xl transform hover:scale-105"
            >
              Hemen Başla
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-4 gap-8 mt-20">
          <div className="text-center p-6 rounded-2xl glass hover:shadow-xl">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Gönderi Paylaş</h3>
            <p className="text-gray-600">Düşüncelerini paylaş, etkileşim al</p>
          </div>

          <div className="text-center p-6 rounded-2xl glass hover:shadow-xl">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Canlı Yayın</h3>
            <p className="text-gray-600">İzleyicilerinle canlı bağlan</p>
          </div>

          <div className="text-center p-6 rounded-2xl glass hover:shadow-xl">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Para Kazan</h3>
            <p className="text-gray-600">Her etkileşimden gelir elde et</p>
          </div>

          <div className="text-center p-6 rounded-2xl glass hover:shadow-xl">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Hikaye Paylaş</h3>
            <p className="text-gray-600">24 saat süren içerikler</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold gradient-text">10K+</h3>
            <p className="text-gray-600 mt-2">Aktif Kullanıcı</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold gradient-text">1M+</h3>
            <p className="text-gray-600 mt-2">Paylaşılan Gönderi</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold gradient-text">$500K+</h3>
            <p className="text-gray-600 mt-2">Kazanılan Para</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p className="text-gray-600">© 2025 luointr. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <Link to="/about" className="text-gray-600 hover:text-purple-600">Hakkımızda</Link>
            <Link to="/terms" className="text-gray-600 hover:text-purple-600">Kullanım Şartları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
