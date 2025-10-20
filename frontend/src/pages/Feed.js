import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Share2, Send, Plus, Bookmark, TrendingUp, Hash } from 'lucide-react';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Feed({ currentUser, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [trendingTopics, setTrendingTopics] = useState([
    { tag: 'keşfet', count: 1234 },
    { tag: 'trend', count: 856 },
    { tag: 'müzik', count: 645 },
    { tag: 'sanat', count: 432 }
  ]);

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
    if (!newPost.trim()) return;

    try {
      const response = await axios.post(`${API}/posts`, {
        user_id: currentUser.id,
        content: newPost
      });

      setPosts([response.data, ...posts]);
      setNewPost('');
      setShowCreatePost(false);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`${API}/posts/${postId}/like?user_id=${currentUser.id}`);
      
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, likes_count: response.data.likes_count }
          : p
      ));
      
      setLikedPosts(new Set([...likedPosts, postId]));
      
      // Like animation
      const likeBtn = document.getElementById(`like-${postId}`);
      if (likeBtn) {
        likeBtn.classList.add('like-animation');
        setTimeout(() => likeBtn.classList.remove('like-animation'), 300);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e, postId) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`${API}/comments`, {
        post_id: postId,
        user_id: currentUser.id,
        content: newComment
      });

      setComments([...comments, response.data]);
      setPosts(posts.map(p =>
        p.id === postId
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const loadComments = async (postId) => {
    try {
      const response = await axios.get(`${API}/comments/${postId}`);
      setComments(response.data);
      setSelectedPost(postId);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  if (loading) {
    return (
      <Layout currentUser={currentUser} onLogout={onLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: '#F56040', borderTopColor: 'transparent' }}></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentUser={currentUser} onLogout={onLogout}>
      <div className="max-w-2xl mx-auto px-4 pb-20">
        {/* Stories Section */}
        {stories.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full p-0.5 gradient-primary">
                    <img
                      src={story.user_avatar}
                      alt={story.username}
                      className="w-full h-full rounded-full border-2 border-black object-cover"
                    />
                  </div>
                  <p className="text-xs text-center mt-1 text-gray-300 truncate w-16">
                    {story.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trending Topics */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-white">Trend Konular</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map((topic) => (
              <button
                key={topic.tag}
                className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-orange-500/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-white">{topic.tag}</span>
                  <span className="text-xs text-gray-500">{topic.count}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Create Post Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="w-full glass-card p-4 text-left hover:bg-zinc-900 transition-all"
          >
            <div className="flex items-center gap-3">
              <img
                src={currentUser.profile_picture}
                alt={currentUser.username}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-gray-400">Ne düşünüyorsun?</span>
              <Plus className="w-5 h-5 text-orange-500 ml-auto" />
            </div>
          </button>
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <div className="glass-card p-4 mb-6">
            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Paylaş..."
                className="w-full bg-transparent text-white border-none outline-none resize-none"
                rows="3"
              />
              <div className="flex justify-between items-center mt-3">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2"
                  disabled={!newPost.trim()}
                >
                  Paylaş
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="glass-card overflow-hidden">
              {/* Post Header */}
              <div className="p-4 flex items-center gap-3">
                <img
                  src={post.user_avatar}
                  alt={post.username}
                  className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 ring-orange-500 transition-all"
                  onClick={() => window.location.href = `/profile/${post.user_id}`}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-white hover:text-orange-500 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/profile/${post.user_id}`}>
                    @{post.username}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-white text-[15px] leading-relaxed">{post.content}</p>
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
              <div className="px-4 py-3 flex items-center justify-between border-t border-zinc-800">
                <div className="flex items-center gap-6">
                  {/* Like Button */}
                  <button
                    id={`like-${post.id}`}
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 hover:text-orange-500 transition-colors group"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        likedPosts.has(post.id)
                          ? 'fill-orange-500 text-orange-500'
                          : 'text-gray-400 group-hover:text-orange-500'
                      }`}
                    />
                    <span className="text-sm text-gray-400 group-hover:text-orange-500">
                      {post.likes_count}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => loadComments(post.id)}
                    className="flex items-center gap-2 hover:text-orange-500 transition-colors group"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                    <span className="text-sm text-gray-400 group-hover:text-orange-500">
                      {post.comments_count}
                    </span>
                  </button>

                  {/* Share Button */}
                  <button className="flex items-center gap-2 hover:text-orange-500 transition-colors group">
                    <Share2 className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                    <span className="text-sm text-gray-400 group-hover:text-orange-500">
                      {post.shares_count}
                    </span>
                  </button>
                </div>

                {/* Bookmark Button */}
                <button className="text-gray-400 hover:text-orange-500 transition-colors">
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>

              {/* Comments Section */}
              {selectedPost === post.id && (
                <div className="border-t border-zinc-800 p-4 bg-black/50">
                  <div className="space-y-3 mb-3 max-h-64 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <img
                          src={comment.user_avatar}
                          alt={comment.username}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-semibold text-white">@{comment.username}</span>{' '}
                            <span className="text-gray-300">{comment.content}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <form onSubmit={(e) => handleComment(e, post.id)} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Yorum yap..."
                      className="flex-1 bg-zinc-900 text-white px-4 py-2 rounded-full outline-none focus:ring-2 ring-orange-500"
                    />
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center hover:scale-105 transition-transform"
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Feed;
