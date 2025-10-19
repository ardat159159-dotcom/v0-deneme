import { HelpCircle, MessageCircle, Mail, Phone, Book } from 'lucide-react';
import Layout from '../components/Layout';

function Help({ currentUser, onLogout }) {
  const faqItems = [
    {
      question: 'Nasıl para kazanabilirim?',
      answer: 'Her etkileşimden para kazanırsınız: Beğeni başına $0.01, yorum başına $0.02, paylaşım başına $0.05, hikaye görüntüleme başına $0.001'
    },
    {
      question: 'Minimum çekim tutarı nedir?',
      answer: 'Minimum para çekme tutarı $10.00\'dır.'
    },
    {
      question: 'Ödemeler ne kadar sürede yapılır?',
      answer: 'Para çekme talepleri 5-7 iş günü içinde işleme alınır.'
    },
    {
      question: 'Hesabımı nasıl silebilirim?',
      answer: 'Ayarlar sayfasından "Hesabımı Sil" butonuna tıklayarak hesabınızı kalıcı olarak silebilirsiniz.'
    },
    {
      question: 'Profil fotoğrafımı nasıl değiştirebilirim?',
      answer: 'Profil sayfanızdan "Profili Düzenle" butonuna tıklayarak profil fotoğrafınızı değiştirebilirsiniz.'
    },
    {
      question: 'Canlı yayın nasıl başlatırım?',
      answer: 'Canlı Yayın sayfasından "Yayın Başlat" butonuna tıklayarak yayınınızı başlatabilirsiniz.'
    },
    {
      question: 'Mesajlarım güvenli mi?',
      answer: 'Evet, tüm mesajlarınız şifrelenmiş olarak saklanır ve tamamen özeldir.'
    },
    {
      question: 'Hikaye ne kadar süre kalır?',
      answer: 'Hikayeleriniz paylaşıldıktan 24 saat sonra otomatik olarak silinir.'
    }
  ];

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Yardım Merkezi</h1>
          </div>
          <p className="text-gray-600">Sık sorulan sorular ve destek</p>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <h2 className="text-2xl font-bold mb-6">Sık Sorulan Sorular</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <details key={index} className="group">
                <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
                  <span className="font-semibold">{item.question}</span>
                  <span className="text-purple-600 text-xl">+</span>
                </summary>
                <div className="p-4 text-gray-600 border-l-4 border-purple-500 ml-4 mt-2">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Bize Ulaşın</h2>
          <p className="text-gray-700 mb-6">
            Sorunuz cevap bulamadı mı? Destek ekibimiz size yardımcı olmak için burada!
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl text-center">
              <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">E-posta</h3>
              <p className="text-sm text-gray-600">destek@luointr.com</p>
            </div>

            <div className="bg-white p-4 rounded-xl text-center">
              <Phone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Telefon</h3>
              <p className="text-sm text-gray-600">+90 (212) 555-0000</p>
            </div>

            <div className="bg-white p-4 rounded-xl text-center">
              <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Canlı Destek</h3>
              <p className="text-sm text-gray-600">7/24 Aktif</p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Book className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold">Kaynaklar</h2>
          </div>
          <div className="space-y-3">
            <a href="/about" className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
              <h3 className="font-semibold mb-1">Hakkımızda</h3>
              <p className="text-sm text-gray-600">Platform hakkında detaylı bilgi</p>
            </a>
            <a href="/terms" className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
              <h3 className="font-semibold mb-1">Kullanım Şartları</h3>
              <p className="text-sm text-gray-600">Kullanım şartları ve kurallar</p>
            </a>
            <a href="/earnings" className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100">
              <h3 className="font-semibold mb-1">Kazanç Rehberi</h3>
              <p className="text-sm text-gray-600">Nasıl para kazanabilirsiniz?</p>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Help;
