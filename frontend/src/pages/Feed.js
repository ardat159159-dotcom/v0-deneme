import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Send, Image as ImageIcon, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import StoryViewer from '../components/StoryViewer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Feed({ currentUser, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState({ content: '', image_url: '' });
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      const [postsRes, storiesRes] = await Promise.all([
        axios.get(`${API}/posts`),
        axios.get(`${API}/stories`)
      ]);
      setPosts(postsRes.data);
      setStories(storiesRes.data);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    try {
      await axios.post(`${API}/posts`, {
        user_id: currentUser.id,
        content: newPost.content,
        image_url: newPost.image_url || null
      });

      setNewPost({ content: '', image_url: '' });
      setShowPostModal(false);
      loadFeed();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      await axios.post(`${API}/posts/${postId}/like?user_id=${currentUser.id}`);
      loadFeed();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const loadComments = async (postId) => {
    try {
      const response = await axios.get(`${API}/comments/${postId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      await axios.post(`${API}/comments`, {
        post_id: postId,
        user_id: currentUser.id,
        content: newComment
      });

      setNewComment('');
      loadComments(postId);
      loadFeed();
    } catch (error) {
      console.error('Error posting comment:', error);
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
      <div className="max-w-2xl mx-auto">
        {/* Stories */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {/* Add Story Button */}
            <div className="flex-shrink-0 text-center cursor-pointer" onClick={() => navigate('/profile')}>
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs mt-1">Hikaye Ekle</p>
            </div>

            {/* Stories */}
            {stories.slice(0, 10).map((story) => (
              <div key={story.id} className="flex-shrink-0 text-center cursor-pointer">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-purple-600 to-pink-600">
                  <img
                    src={story.user_avatar}
                    alt={story.username}
                    className="w-full h-full rounded-full border-2 border-white object-cover"
                  />
                </div>
                <p className="text-xs mt-1 truncate w-16">{story.username}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <div className="flex gap-3">
            <img
              src={currentUser.profile_picture}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <button
              onClick={() => setShowPostModal(true)}
              className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              data-testid="create-post-btn"
            >
              Ne düşünüyorsun?
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden" data-testid="post-card">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <img
                  src={post.user_avatar}
                  alt={post.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">{post.username}</h3>
                  <p className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-2">
                <p className="text-gray-800">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full max-h-96 object-cover"
                />
              )}

              {/* Post Actions */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-gray-500 mb-3">
                  <span className="text-sm">{post.likes_count.toLocaleString()} beğeni</span>
                  <span className="text-sm">{post.comments_count} yorum</span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-pink-600"
                    data-testid="like-btn"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">Beğen</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      loadComments(post.id);
                    }}
                    className="flex items-center gap-2 text-gray-600 hover:text-purple-600"
                    data-testid="comment-btn"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Yorum Yap</span>
                  </button>

                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Paylaş</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Gönderi Oluştur</h2>
            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                rows="4"
                placeholder="Ne düşünüyorsun?"
                required
                data-testid="post-content-input"
              />

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resim URL (isteğe bağlı)
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={newPost.image_url}
                    onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                    data-testid="post-image-input"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg"
                  data-testid="post-submit-btn"
                >
                  Paylaş
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Yorumlar</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-4 mb-4">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Henüz yorum yok</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.user_avatar}
                      alt={comment.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 bg-gray-100 rounded-2xl p-3">
                      <p className="font-semibold text-sm">{comment.username}</p>
                      <p className="text-gray-800">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="flex gap-2 pt-4 border-t">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-full focus:border-purple-500 focus:outline-none"
                placeholder="Yorum yaz..."
                data-testid="comment-input"
              />
              <button
                onClick={() => handleComment(selectedPost.id)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg"
                data-testid="comment-submit-btn"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Feed;
