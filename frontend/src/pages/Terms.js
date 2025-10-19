import { Link } from 'react-router-dom';
import { Sparkles, Shield, FileText, AlertTriangle } from 'lucide-react';

function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold gradient-text">luointr</h1>
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
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">Kullanım Şartları</h1>
          </div>

          <div className="space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">
              Son güncelleme: 1 Ocak 2025
            </p>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <p className="text-sm">
                  Bu platformç kullant kullanarak bu şartları kabul etmiş sayılırsınız.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-purple-600" />
                1. Genel Kurallar
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Platformu yalnızca yasal amaçlar için kullanmalısınız.</li>
                <li>18 yaşının altındaki kullanıcılar ebeveyn izni almalıdır.</li>
                <li>Her kullanıcı yalnızca bir hesap oluşturabilir.</li>
                <li>Hesap bilgilerinizi güvende tutmak sizin sorumluluğunuzdadır.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. İçerik Kuralları</h2>
              <p className="mb-3">Aşağıdaki içerikler kesinlikle yasaktır:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nefret söylemi veya ayrımcılık içeren içerikler</li>
                <li>Yanlış bilgi veya sahte haber</li>
                <li>Telif hakkı ihlali içeren içerikler</li>
                <li>Spam veya yanlış yönlendirme</li>
                <li>Şiddet veya taciz içeren gönderiler</li>
                <li>Uygunsuz veya müstehcen içerik</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Kazanç Sistemi</h2>
              <h3 className="text-lg font-semibold mb-2">Kazanç Oranları:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Beğeni başına: $0.01</li>
                <li>Yorum başına: $0.02</li>
                <li>Paylaşım başına: $0.05</li>
                <li>Hikaye görüntüleme başına: $0.001</li>
              </ul>
              <h3 className="text-lg font-semibold mb-2">Ödeme Koşulları:</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Minimum çekim tutarı: $10.00</li>
                <li>Ödemeler 5-7 iş günü içinde işleme alınır</li>
                <li>Sahte etkileşimler tespit edilirse hesap askıya alınabilir</li>
                <li>Bot veya otomatik etkileşim kullanımı yasaktır</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Gizlilik ve Güvenlik</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kişisel bilgileriniz şifrelenerek saklanır</li>
                <li>Bilgileriniz üçüncü şahıslarla paylaşılmaz</li>
                <li>Mesajlarınız tamamen özeldir</li>
                <li>Hesabınızı istediğiniz zaman silebilirsiniz</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Telif Hakkı</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Paylaştığınız içeriğin telif hakları size aittir</li>
                <li>Başkalarının içeriklerini izinsiz kullanamazsınız</li>
                <li>Telif ihlali bildirimleri ciddi şekilde değerlendirilir</li>
                <li>Tekrarlayan ihlaller hesap kapatılmasına yol açar</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Hesap Askıya Alma ve Kapatma</h2>
              <p className="mb-3">Aşağıdaki durumlarda hesabınız askıya alınabilir veya kapatılabilir:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Kullanım şartlarını ihlal etmek</li>
                <li>Sahte etkileşim kullanmak</li>
                <li>Başka kullanıcıları taciz etmek</li>
                <li>Birden fazla hesap oluşturmak</li>
                <li>Platformu kötüye kullanmak</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Değişiklikler</h2>
              <p>
                Bu şartları istediğimiz zaman değiştirebiliriz. Önemli değişiklikler e-posta ile bildirilecektir. Platformu kullanmaya devam ederek yeni şartları kabul etmiş sayılırsınız.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Sorumluluk Reddi</h2>
              <p>
                Platform "olduğu gibi" sunulmaktadır. Hizmet kesintileri veya veri kayıplarından sorumlu tutulamayız. Kullanıcılar arasındaki etkileşimlerden doğan sorunlardan platform sorumlu değildir.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. İletişim</h2>
              <p>
                Sorularınız veya şikayetleriniz için bize ulaşabilirsiniz:
              </p>
              <div className="mt-4 p-4 bg-gray-100 rounded-xl">
                <p><strong>E-posta:</strong> destek@socialearn.com</p>
                <p><strong>Telefon:</strong> +90 (212) 555-0000</p>
                <p><strong>Adres:</strong> İstanbul, Türkiye</p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-purple-50 rounded-2xl border-2 border-purple-200">
              <p className="text-center font-semibold">
                Bu şartları okuyup anladığınızı kabul ederek platformumuzu kullanabilirsiniz.
              </p>
              <div className="flex justify-center mt-4">
                <Link
                  to="/register"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg"
                >
                  Kabul Ediyorum & Kaydol
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
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

export default Terms;
