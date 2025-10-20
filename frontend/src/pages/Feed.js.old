import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Share2, Send, Plus, X } from 'lucide-react';
import Layout from '../components/Layout';

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
  const [likedPosts, setLikedPosts] = useState(new Set());

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
      // Optimistic UI update
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      await axios.post(`${API}/posts/${postId}/like?user_id=${currentUser.id}`);
      loadFeed();
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
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
    if (seconds < 3600) return `${Math.floor(seconds / 60)}dk`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}s`;
    return `${Math.floor(seconds / 86400)}g`;
  };

  if (loading) {
    return (
      <Layout currentUser={currentUser} onLogout={onLogout}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-2xl mx-auto app-container pb-20">
        {/* Stories */}
        <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {/* Add Story */}
            <div className="flex-shrink-0 text-center cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs mt-1 text-foreground">Hikaye</p>
            </div>

            {/* Stories */}
            {stories.slice(0, 10).map((story) => (
              <div key={story.id} className="flex-shrink-0 text-center cursor-pointer">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-purple-600 to-pink-600">
                  <img
                    src={story.user_avatar}
                    alt={story.username}
                    className="w-full h-full rounded-full border-2 border-card object-cover"
                  />
                </div>
                <p className="text-xs mt-1 truncate w-16 text-foreground">{story.username}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Create Post */}
        <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
          <div className="flex gap-3">
            <img
              src={currentUser.profile_picture}
              alt={currentUser.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <button
              onClick={() => setShowPostModal(true)}
              className="flex-1 text-left px-4 py-2 bg-muted rounded-full text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Ne düşünüyorsun?
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <img
                  src={post.user_avatar}
                  alt={post.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">@{post.username}</h3>
                  <p className="text-sm text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-2">
                <p className="text-foreground">{post.content}</p>
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
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between text-muted-foreground mb-3">
                  <span className="text-sm">{post.likes_count.toLocaleString()} beğeni</span>
                  <span className="text-sm">{post.comments_count} yorum</span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 hover:text-pink-500 transition-colors touch-feedback ${
                      likedPosts.has(post.id) ? 'text-pink-500' : 'text-muted-foreground'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${
                      likedPosts.has(post.id) ? 'fill-current heart-beat' : ''
                    }`} />
                    <span className="text-sm font-medium">Beğen</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPost(post);
                      loadComments(post.id);
                    }}
                    className="flex items-center gap-2 text-muted-foreground hover:text-purple-500 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Yorum</span>
                  </button>

                  <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Gönderi Oluştur</h2>
              <button onClick={() => setShowPostModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full p-4 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none resize-none"
                rows="4"
                placeholder="Ne düşünüyorsun?"
                required
              />

              <div className="mt-4">
                <input
                  type="url"
                  value={newPost.image_url}
                  onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Resim URL (isteğe bağlı)"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-3 border border-border rounded-xl font-semibold text-foreground hover:bg-muted"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">Yorumlar</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Comments List */}
            <div className="space-y-4 mb-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Henüz yorum yok</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.user_avatar}
                      alt={comment.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 bg-muted rounded-2xl p-3">
                      <p className="font-semibold text-sm text-foreground">@{comment.username}</p>
                      <p className="text-foreground">{comment.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(comment.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="flex gap-2 pt-4 border-t border-border">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-4 py-2 bg-muted border border-border rounded-full text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                placeholder="Yorum yaz..."
              />
              <button
                onClick={() => handleComment(selectedPost.id)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg"
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