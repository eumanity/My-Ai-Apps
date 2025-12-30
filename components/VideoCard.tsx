
import React from 'react';
import { Video } from '../types';

interface VideoCardProps {
  video: Video;
  isSelected: boolean;
  onSelect: (video: Video) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, isSelected, onSelect }) => {
  const formatViews = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div 
      onClick={() => onSelect(video)}
      className={`relative group cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border-2 ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
      } bg-slate-900 shadow-xl`}
    >
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={video.thumbnail || `https://picsum.photos/seed/${video.id}/400/225`} 
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {video.isOutlier && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg flex items-center gap-1">
            <i className="fa-solid fa-bolt"></i> Outlier
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
          {formatViews(video.views)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{video.publishedAt || 'Unknown date'}</span>
          <span className={`font-mono ${video.zScore > 0 ? 'text-green-400' : 'text-slate-500'}`}>
            z: {video.zScore.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
