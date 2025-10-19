import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Heart, MessageCircle, Share2, Eye, CreditCard } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Earnings({ currentUser, onLogout }) {
  const [earnings, setEarnings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const response = await axios.get(`${API}/earnings/${currentUser.id}`);
      setEarnings(response.data.earnings);
      setTotalEarnings(response.data.total);
    } catch (error) {
      console.error('Error loading earnings:', error);
      // Mock data for demo
      const mockEarnings = [
        { id: '1', type: 'like', amount: 0.01, source_id: 'post1', created_at: new Date().toISOString() },
        { id: '2', type: 'comment', amount: 0.02, source_id: 'post2', created_at: new Date().toISOString() },
        { id: '3', type: 'share', amount: 0.05, source_id: 'post3', created_at: new Date().toISOString() },
        { id: '4', type: 'view', amount: 0.001, source_id: 'story1', created_at: new Date().toISOString() },
      ];
      setEarnings(mockEarnings);
      setTotalEarnings(mockEarnings.reduce((sum, e) => sum + e.amount, 0));
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    alert(`Para çekme talebiniz alındı: $${withdrawAmount}\n\nNot: Bu bir demo sistemdir. Gerçek ödeme entegrasyonu için Stripe, PayPal gibi servisler gereklidir.`);
    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

  const getEarningIcon = (type) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-pink-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'share': return <Share2 className="w-5 h-5 text-green-500" />;
      case 'view': return <Eye className="w-5 h-5 text-purple-500" />;
      default: return <DollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEarningLabel = (type) => {
    switch (type) {
      case 'like': return 'Beğeni';
      case 'comment': return 'Yorum';
      case 'share': return 'Paylaşım';
      case 'view': return 'Görüntüleme';
      default: return 'Diğer';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    return `${Math.floor(seconds / 86400)} gün önce`;
  };

  if (loading) {
    return (
      <Layout currentUser={currentUser} onLogout={onLogout}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto">
        {/* Earnings Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8" />
              <h3 className="text-lg font-medium">Toplam Kazanç</h3>
            </div>
            <p className="text-4xl font-bold" data-testid="total-earnings">${totalEarnings.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <h3 className="text-lg font-medium text-gray-700">Bu Ay</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">${(totalEarnings * 0.3).toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-8 h-8 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-700">Çekilebilir</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">Kazançlarını Çek</h3>
              <p className="text-gray-600">Minimum çekim tutarı: $10.00</p>
            </div>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={totalEarnings < 10}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="withdraw-btn"
            >
              Para Çek
            </button>
          </div>
        </div>

        {/* Earning Rates */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <h3 className="text-xl font-bold mb-4">Kazanç Oranları</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-pink-500" />
                <span className="font-medium">Beğeni</span>
              </div>
              <span className="text-lg font-bold text-pink-600">$0.01</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-blue-500" />
                <span className="font-medium">Yorum</span>
              </div>
              <span className="text-lg font-bold text-blue-600">$0.02</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Share2 className="w-6 h-6 text-green-500" />
                <span className="font-medium">Paylaşım</span>
              </div>
              <span className="text-lg font-bold text-green-600">$0.05</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-purple-500" />
                <span className="font-medium">Hikaye Görüntüleme</span>
              </div>
              <span className="text-lg font-bold text-purple-600">$0.001</span>
            </div>
          </div>
        </div>

        {/* Earnings History */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="text-xl font-bold mb-4">Son Kazançlar</h3>
          
          {earnings.length === 0 ? (
            <div className="text-center py-10">
              <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Henüz kazanç yok</p>
              <p className="text-gray-400 text-sm mt-2">İçerik paylaşmaya başlayın!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {earnings.slice(0, 20).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {getEarningIcon(earning.type)}
                    <div>
                      <p className="font-medium">{getEarningLabel(earning.type)}</p>
                      <p className="text-sm text-gray-500">{formatTimeAgo(earning.created_at)}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">+${earning.amount.toFixed(3)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Para Çek</h2>
            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Mevcut bakiye: <span className="font-bold text-green-600">${totalEarnings.toFixed(2)}</span>
                </p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Çekilecek Miktar
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    max={totalEarnings}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="10.00"
                    required
                    data-testid="withdraw-amount-input"
                  />
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Not:</strong> Bu demo bir mock ödeme sistemidir. Gerçek ödeme entegrasyonu için Stripe, PayPal veya benzeri servisler gereklidir.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg"
                  data-testid="withdraw-submit-btn"
                >
                  Talebi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Earnings;
