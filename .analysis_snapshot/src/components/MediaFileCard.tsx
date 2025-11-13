"use client";

import { useState, useRef } from "react";

interface MediaFileCardProps {
  url: string;
  index: number;
  onAnimate?: (url: string) => Promise<void>;
  isAnimating?: boolean;
}

export default function MediaFileCard({ url, index, onAnimate, isAnimating }: MediaFileCardProps) {
  const [isVideo, setIsVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className="relative group">
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div 
          className="w-full h-20 bg-gray-200 rounded mb-2 overflow-hidden"
          onMouseEnter={() => {
            if (videoRef.current) {
              videoRef.current.play();
            }
          }}
          onMouseLeave={() => {
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          }}
        >
          <img 
            src={url} 
            alt={`file ${index}`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const video = document.createElement('video');
              video.src = url;
              video.className = 'w-full h-full object-cover';
              video.muted = true;
              video.loop = true;
              videoRef.current = video;
              target.parentElement?.appendChild(video);
              setIsVideo(true);
            }}
          />
        </div>
        <p className="text-xs font-medium text-gray-900">file {index}</p>
        <p className="text-xs text-gray-600">{isVideo ? '🎬 video' : '🖼️ image'}</p>
      </div>
      {!isVideo && onAnimate && (
        <button
          onClick={async () => {
            setLoading(true);
            try {
              await onAnimate(url);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || isAnimating}
          className="absolute inset-0 bg-purple-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-medium disabled:opacity-50"
        >
          {loading || isAnimating ? 'animating...' : 'animate'}
        </button>
      )}
    </div>
  );
}
