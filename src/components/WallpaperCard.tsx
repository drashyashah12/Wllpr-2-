import React, { useState } from 'react';
import { Download, Heart, Monitor, Smartphone, Sparkles, Check } from 'lucide-react';
import { Wallpaper } from '../types';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  isFavorite: boolean;
  onToggleFavorite: (id: string | number) => void;
  onOpenModal: (wallpaper: Wallpaper) => void;
  onQuickDownload: (wallpaper: Wallpaper) => void;
  accentColor: string;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  isFavorite,
  onToggleFavorite,
  onOpenModal,
  onQuickDownload,
  accentColor,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickDownload(wallpaper);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(wallpaper.id);
  };

  return (
    <div
      id={`wallpaper-card-${wallpaper.id}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpenModal(wallpaper)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenModal(wallpaper);
        }
      }}
      className="group relative rounded-2xl overflow-hidden bg-[#18181b] border border-[#27272a] cursor-pointer transform transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-zinc-700/80 mb-5 break-inside-avoid focus:outline-none focus:ring-2 focus:ring-cyan-400"
      style={{
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.5)',
      }}
    >
      {/* Skeleton Shimmer Loading Base */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#1f1f23] animate-pulse flex items-center justify-center min-h-[220px]">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
        </div>
      )}

      {/* Image with Blur-Up Transition */}
      <img
        src={wallpaper.thumb}
        alt={wallpaper.title}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-auto object-cover transition-all duration-500 ease-out ${
          isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'
        } group-hover:scale-105`}
      />

      {/* Subtle Always-Visible Top Resolution Pill (High Contrast) */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none transition-transform group-hover:translate-x-0.5">
        <span className="bg-[#09090b]/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.8 rounded-md border border-white/10 shadow-md flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }}></span>
          {wallpaper.resolution}
        </span>
      </div>

      {/* Custom Tag / Creator Badge */}
      {wallpaper.isCustom && (
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span className="bg-amber-500/90 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-lg flex items-center gap-1 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Studio
          </span>
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/95 via-[#09090b]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex flex-col justify-between p-4.5">
        
        {/* Top Hover Controls */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            {/* Format Icon */}
            <span className="bg-[#09090b]/80 backdrop-blur text-zinc-300 text-[11px] font-medium px-2 py-1 rounded-md border border-white/10 shadow flex items-center gap-1">
              {wallpaper.type === 'Desktop' ? (
                <Monitor className="w-3 h-3 text-zinc-400" />
              ) : (
                <Smartphone className="w-3 h-3 text-zinc-400" />
              )}
              {wallpaper.type}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            id={`fav-btn-${wallpaper.id}`}
            onClick={handleFavClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2 rounded-full backdrop-blur-md border transition-all duration-200 transform hover:scale-110 active:scale-90 ${
              isFavorite
                ? 'bg-rose-500/20 border-rose-500/60 text-rose-500 fill-rose-500'
                : 'bg-[#09090b]/70 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-rose-500 scale-110' : ''}`}
            />
          </button>
        </div>

        {/* Bottom Hover Details */}
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 flex justify-between items-end gap-2">
          <div className="min-w-0">
            <h3 className="text-white font-bold text-sm leading-tight truncate drop-shadow-md">
              {wallpaper.title}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <p className="text-zinc-400 text-xs truncate">
                {wallpaper.author}
              </p>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-500 text-[11px] font-mono">
                {wallpaper.dimensions}
              </span>
            </div>

            {/* Quick Mini Color Palette Dots */}
            <div className="flex items-center gap-1 mt-2">
              {wallpaper.palette.slice(0, 4).map((color, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-black/50 shadow-inner"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Quick Download Button */}
          <button
            id={`quick-dl-${wallpaper.id}`}
            onClick={handleDownloadClick}
            title="Quick Download"
            className="p-2.5 rounded-xl font-bold flex items-center justify-center transition-all duration-200 shadow-lg transform hover:scale-105 active:scale-95 text-black flex-shrink-0"
            style={{
              backgroundColor: downloadSuccess ? '#34d399' : accentColor,
              boxShadow: `0 0 16px ${accentColor}40`,
            }}
          >
            {downloadSuccess ? (
              <Check className="w-4 h-4 text-black" />
            ) : (
              <Download className="w-4 h-4 text-black" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
