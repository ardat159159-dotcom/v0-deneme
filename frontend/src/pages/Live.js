import { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Users, Play, Radio } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Live({ currentUser, onLogout }) {
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [streamForm, setStreamForm] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    loadLiveStreams();
  }, []);

  const loadLiveStreams = async () => {
    try {
      const response = await axios.get(`${API}/streams`);
      setLiveStreams(response.data);
    } catch (error) {
      console.error('Error loading live streams:', error);
      // Mock data for demo
      setLiveStreams([
        {
          id: '1',
          user_id: '1',
          username: 'gamerpro',
          user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gamer',
          title: 'Oyun Yayını - VALORANT',
          description: 'Ranked maçları oynuyoruz!',
          viewers_count: 1234,
          is_live: true
        },
        {
          id: '2',
          user_id: '2',
          username: 'cookinglady',
          user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cook',
          title: 'Canlı Yemek Tarifi',
          description: 'Bugün pizza yapıyoruz!',
          viewers_count: 567,
          is_live: true
        },
        {
          id: '3',
          user_id: '3',
          username: 'tech_guru',
          user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',
          title: 'Yeni iPhone İncelemesi',
          description: 'Detaylı özellikler',
          viewers_count: 2345,
          is_live: true
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/streams`, {
        user_id: currentUser.id,
        title: streamForm.title,
        description: streamForm.description
      });

      setStreamForm({ title: '', description: '' });
      setShowCreateModal(false);
      loadLiveStreams();
    } catch (error) {
      console.error('Error creating stream:', error);
    }
  };

  const handleEndStream = async (streamId) => {
    if (!window.confirm('Yayını sonlandırmak istediğinize emin misiniz?')) return;

    try {
      await axios.put(`${API}/streams/${streamId}/end`);
      alert('Yayın sonlandırıldı!');
      loadLiveStreams();
    } catch (error) {
      console.error('Error ending stream:', error);
      alert('Yayın sonlandırılırken hata oluştu');
    }
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Canlı Yayınlar</h1>
            <p className="text-gray-600">{liveStreams.length} aktif yayın</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-lg"
            data-testid="start-live-btn"
          >
            <Radio className="w-5 h-5" />
            Yayın Başlat
          </button>
        </div>

        {/* Live Streams Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer"
              data-testid="live-stream-card"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <Play className="w-16 h-16 text-white opacity-80" />
                
                {/* Live Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  CANLI
                </div>

                {/* Viewer Count */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-black bg-opacity-50 text-white rounded-full text-sm">
                  <Users className="w-4 h-4" />
                  {stream.viewers_count.toLocaleString()}
                </div>
              </div>

              {/* Stream Info */}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={stream.user_avatar}
                    alt={stream.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate mb-1">{stream.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{stream.username}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{stream.description}</p>
                  </div>
                </div>
                
                {/* End Stream Button (only for stream owner) */}
                {currentUser && stream.user_id === currentUser.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEndStream(stream.id);
                    }}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Yayını Sonlandır
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {liveStreams.length === 0 && (
          <div className="text-center py-20">
            <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Henüz canlı yayın yok</p>
            <p className="text-gray-400 mt-2">İlk yayını sen başlat!</p>
          </div>
        )}
      </div>

      {/* Create Stream Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Yayın Başlat</h2>
            <form onSubmit={handleCreateStream}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yayın Başlığı
                  </label>
                  <input
                    type="text"
                    value={streamForm.title}
                    onChange={(e) => setStreamForm({ ...streamForm, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="örn: Oyun yayını"
                    required
                    data-testid="stream-title-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={streamForm.description}
                    onChange={(e) => setStreamForm({ ...streamForm, description: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                    rows="3"
                    placeholder="Yayınınız hakkında..."
                    data-testid="stream-description-input"
                  />
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    <strong>Not:</strong> Bu demo bir mock yayın sistemidir. Gerçek streaming entegrasyonu için Twilio, Agora veya benzeri servisler gereklidir.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg"
                  data-testid="stream-submit-btn"
                >
                  Yayını Başlat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Live;
