import { Link } from 'react-router-dom';
import { Sparkles, Heart, Users, TrendingUp } from 'lucide-react';

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold gradient-text">SocialEarn</h1>
        </Link>
        <Link 
          to="/" 
          className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-50"
        >
          Ana Sayfa
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-8">Hakkımızda</h1>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              <strong>SocialEarn</strong>, içerik üreticilerinin çabalarının karşılığını aldığı yeni nesil sosyal medya platformudur.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Vizyonumuz</h2>
            <p>
              Her etkileşimin değerli olduğuna inanıyoruz. Kullanıcılarımızın paylaştığı her içerik, aldıkları her beğeni ve yorum, onlar için gelir kaynağı olmalıdır.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Nasıl Çalışır?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-purple-50 rounded-2xl">
                <Heart className="w-10 h-10 text-purple-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">Beğeni = Para</h3>
                <p className="text-sm">Her beğeni için $0.01 kazan</p>
              </div>

              <div className="p-6 bg-pink-50 rounded-2xl">
                <Users className="w-10 h-10 text-pink-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">Yorum = Daha Fazla Para</h3>
                <p className="text-sm">Her yorum için $0.02 kazan</p>
              </div>

              <div className="p-6 bg-blue-50 rounded-2xl">
                <TrendingUp className="w-10 h-10 text-blue-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">Paylaşım = Premium</h3>
                <p className="text-sm">Her paylaşım için $0.05 kazan</p>
              </div>

              <div className="p-6 bg-indigo-50 rounded-2xl">
                <Sparkles className="w-10 h-10 text-indigo-600 mb-3" />
                <h3 className="font-bold text-lg mb-2">Hikaye Görüntüleme</h3>
                <p className="text-sm">Her görüntüleme için $0.001 kazan</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">Neden SocialEarn?</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Gerçek gelir fırsatları</li>
              <li>Şeffaf kazanç sistemi</li>
              <li>Hızlı ve güvenli ödemeler</li>
              <li>Canlı yayın yapma imkanı</li>
              <li>Aktif ve destekleyici topluluk</li>
              <li>Kullanıcı dostu arayüz</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Topluluk Değerlerimiz</h2>
            <p>
              Saygı, dürüstlük ve yaratıcılık bizim temel değerlerimizdir. Her kullanıcımızın özgün içerik üretmesini ve diğer kullanıcılara saygılı davranmasını bekliyoruz.
            </p>

            <div className="mt-12 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Bize Katılın!</h3>
              <p className="mb-4">
                SocialEarn ailesinin bir parçası olun ve içeriklerinizden para kazanmaya başlayın.
              </p>
              <Link
                to="/register"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg"
              >
                Hemen Kaydol
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600">© 2025 SocialEarn. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <Link to="/about" className="text-gray-600 hover:text-purple-600">Hakkımızda</Link>
            <Link to="/terms" className="text-gray-600 hover:text-purple-600">Kullanım Şartları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default About;
