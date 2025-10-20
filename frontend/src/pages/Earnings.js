import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Wallet, Calendar, Download } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Earnings({ currentUser, onLogout }) {
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    this_month: 0,
    withdrawable: 0
  });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('btc');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const response = await axios.get(`${API}/earnings/${currentUser.id}`);
      setEarnings(response.data);
      
      const total = response.data.reduce((sum, e) => sum + e.amount, 0);
      const thisMonth = response.data
        .filter(e => new Date(e.created_at).getMonth() === new Date().getMonth())
        .reduce((sum, e) => sum + e.amount, 0);
      
      setStats({
        total,
        this_month: thisMonth,
        withdrawable: currentUser.total_earnings || 0
      });
    } catch (error) {
      console.error('Error loading earnings:', error);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (parseFloat(withdrawAmount) < 10) {
      alert('Minimum çekim tutarı $10.00');
      return;
    }

    try {
      const response = await axios.post(`${API}/withdrawals/request`, {
        user_id: currentUser.id,
        amount: parseFloat(withdrawAmount),
        method: withdrawMethod,
        wallet_address: walletAddress
      });
      
      alert(`Doğrulama kodu: ${response.data.verification_code}\n\nNot: Üretim ortamında e-postaya gönderilir.`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWalletAddress('');
    } catch (error) {
      console.error('Error requesting withdrawal:', error);
      alert(error.response?.data?.detail || 'Hata oluştu');
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'like': return 'bg-pink-500/20 text-pink-500';
      case 'comment': return 'bg-blue-500/20 text-blue-500';
      case 'share': return 'bg-green-500/20 text-green-500';
      case 'view': return 'bg-purple-500/20 text-purple-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto px-4 pb-20">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-8 h-8 text-orange-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">${stats.total.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Toplam Kazanç</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 text-orange-500" />
              <span className="text-xs text-green-500 bg-green-500/20 px-2 py-1 rounded-full">+15%</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">${stats.this_month.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Bu Ay</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-3">
              <Wallet className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-500 mb-1">${stats.withdrawable.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Çekilebilir</p>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
            disabled={stats.withdrawable < 10}
          >
            <Download className="w-5 h-5" />
            Para Çek (Min: $10.00)
          </button>
          {stats.withdrawable < 10 && (
            <p className="text-sm text-gray-400 mt-2 text-center">
              Para çekmek için en az $10.00 kazanmanız gerekiyor
            </p>
          )}
        </div>

        {/* Earnings History */}
        <div className="glass-card">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white">Kazanç Geçmişi</h2>
          </div>
          
          <div className="divide-y divide-zinc-800">
            {earnings.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Henüz kazanç yok</p>
                <p className="text-sm text-gray-500 mt-2">Gönderileri beğen, yorum yap ve kazan!</p>
              </div>
            ) : (
              earnings.map((earning) => (
                <div key={earning.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(earning.type)}`}>
                      {earning.type}
                    </div>
                    <div>
                      <p className="text-white font-medium">+${earning.amount.toFixed(3)}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(earning.created_at).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <DollarSign className="w-5 h-5 text-orange-500" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Para Çek</h2>
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tutar ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="10.00"
                  className="w-full bg-zinc-900 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Yöntem</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full bg-zinc-900 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500"
                >
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="bank">Banka Hesabı</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {withdrawMethod === 'btc' ? 'Wallet Adresi' : 'IBAN'}
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={withdrawMethod === 'btc' ? 'bc1q...' : 'TR00 0000 0000 0000 0000 0000 00'}
                  className="w-full bg-zinc-900 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 ring-orange-500"
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Talep Et
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