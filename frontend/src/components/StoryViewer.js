import { useState } from 'react';

function StoryViewer({ stories, currentStory, onClose, onNext }) {
  const [progress, setProgress] = useState(0);

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Story Content */}
      <div className="relative h-full flex items-center justify-center">
        <img
          src={currentStory.media_url}
          alt="Story"
          className="max-h-full max-w-full object-contain"
        />

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="absolute top-8 left-4 flex items-center gap-3">
          <img
            src={currentStory.user_avatar}
            alt={currentStory.username}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <span className="text-white font-semibold">{currentStory.username}</span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-4 text-white text-3xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default StoryViewer;
