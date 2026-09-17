import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Heart,
  Monitor,
  Smartphone,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Wallpaper } from '../types';

interface WallpaperModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string | number) => void;
  onDownload: (wallpaper: Wallpaper, format?: 'original' | 'desktop' | 'mobile') => void;
  onRemixInStudio: (wallpaper: Wallpaper) => void;
  relatedWallpapers: Wallpaper[];
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
  accentColor: string;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  wallpaper,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isFavorite,
  onToggleFavorite,
  onDownload,
  onRemixInStudio,
  relatedWallpapers,
  onSelectWallpaper,
  accentColor,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'fit' | 'fill' | 'mockup'>('fit');
  const [downloadFormat, setDownloadFormat] = useState<'original' | 'desktop' | 'mobile'>('original');

  // Handle ESC and Arrow Keys
  useEffect(() => {
    if (!wallpaper) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && hasNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [wallpaper, hasNext, hasPrev, onNext, onPrev, onClose]);

  // Reset image loaded on wallpaper switch
  useEffect(() => {
    setImageLoaded(false);
  }, [wallpaper?.id]);

  if (!wallpaper) return null;

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div
      id="wallpaper-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        id="modal-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-[#09090b]/90 backdrop-blur-xl transition-opacity"
      />

      {/* Top Floating Close Button */}
      <button
        id="modal-close-btn"
        onClick={onClose}
        aria-label="Close modal"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:bg-[#27272a] transition-all shadow-xl cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev / Next Navigation Controls */}
      {hasPrev && (
        <button
          onClick={onPrev}
          aria-label="Previous wallpaper"
          className="hidden md:flex absolute left-4 z-40 p-3 rounded-full bg-[#18181b]/80 border border-[#27272a] text-zinc-300 hover:text-white hover:bg-[#27272a] transition-all shadow-xl cursor-pointer backdrop-blur"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          aria-label="Next wallpaper"
          className="hidden md:flex absolute right-4 z-40 p-3 rounded-full bg-[#18181b]/80 border border-[#27272a] text-zinc-300 hover:text-white hover:bg-[#27272a] transition-all shadow-xl cursor-pointer backdrop-blur"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Modal Card Layout */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-20 w-full max-w-6xl max-h-[92vh] bg-[#121215] border border-[#27272a] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden"
      >
        
        {/* Left: Wallpaper Stage Preview */}
        <div className="relative flex-1 bg-[#09090b] flex items-center justify-center p-4 sm:p-8 min-h-[300px] lg:min-h-[580px] overflow-hidden">
          
          {/* Subtle Stage Background Ambient Glow */}
          <div
            className="absolute inset-0 opacity-20 blur-3xl pointer-events-none transition-all duration-700"
            style={{
              background: `radial-gradient(circle at center, ${wallpaper.palette[0] || accentColor} 0%, transparent 70%)`,
            }}
          />

          {/* Loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-400">
              <div
                className="w-10 h-10 border-3 rounded-full border-t-transparent animate-spin"
                style={{ borderColor: `${accentColor} transparent ${accentColor} ${accentColor}` }}
              />
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Loading Full 4K View...</span>
            </div>
          )}

          {/* Device Mockup Toggle or Stage View */}
          <div
            className={`relative transition-all duration-300 flex items-center justify-center max-w-full max-h-full ${
              previewMode === 'mockup'
                ? wallpaper.type === 'Mobile'
                  ? 'border-8 border-[#27272a] rounded-[36px] overflow-hidden shadow-2xl max-h-[540px] aspect-[9/19]'
                  : 'border-8 border-[#27272a] rounded-2xl overflow-hidden shadow-2xl max-h-[460px] aspect-[16/10]'
                : ''
            }`}
          >
            <img
              src={wallpaper.url}
              alt={wallpaper.title}
              onLoad={() => setImageLoaded(true)}
              className={`max-w-full max-h-[50vh] lg:max-h-[75vh] object-contain rounded-lg transition-all duration-500 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
              } ${previewMode === 'fill' ? 'object-cover w-full h-full' : ''}`}
            />
          </div>

          {/* Stage Bottom Floating Controls (Fit / Fill / Mockup View) */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#18181b]/90 backdrop-blur-md border border-[#27272a] rounded-full p-1 flex items-center gap-1 shadow-xl">
            <button
              onClick={() => setPreviewMode('fit')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                previewMode === 'fit' ? 'bg-[#27272a] text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Fit
            </button>
            <button
              onClick={() => setPreviewMode('fill')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                previewMode === 'fill' ? 'bg-[#27272a] text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Zoom
            </button>
            <button
              onClick={() => setPreviewMode('mockup')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                previewMode === 'mockup' ? 'bg-[#27272a] text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Device Frame
            </button>
          </div>
        </div>

        {/* Right: Metadata & Action Sidebar */}
        <div className="w-full lg:w-[380px] bg-[#121215] border-t lg:border-t-0 lg:border-l border-[#27272a] p-6 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
          
          <div className="space-y-5">
            {/* Title & Creator */}
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded border border-white/10 uppercase tracking-wider"
                  style={{
                    backgroundColor: `${accentColor}20`,
                    color: accentColor,
                  }}
                >
                  {wallpaper.resolution} Ultra HD
                </span>
                <span className="text-[11px] text-zinc-400 bg-[#18181b] px-2 py-0.5 rounded border border-[#27272a]">
                  {wallpaper.type}
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                {wallpaper.title}
              </h2>

              <p className="text-zinc-400 text-sm mt-1 flex items-center justify-between">
                <span>By {wallpaper.author}</span>
                {wallpaper.authorUrl && (
                  <a
                    href={wallpaper.authorUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 underline underline-offset-2"
                  >
                    Unsplash <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 bg-[#18181b] border border-[#27272a] rounded-xl p-3.5 text-xs">
              <div>
                <span className="text-zinc-500 block">Resolution</span>
                <span className="font-semibold text-zinc-200 font-mono mt-0.5 block">
                  {wallpaper.dimensions}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Aspect Ratio</span>
                <span className="font-semibold text-zinc-200 font-mono mt-0.5 block">
                  {wallpaper.type === 'Desktop' ? '16:9 Standard' : '9:16 Portrait'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Color Mode</span>
                <span className="font-semibold text-zinc-200 mt-0.5 block">
                  {wallpaper.tags.includes('AMOLED') ? 'OLED True Black' : 'sRGB 24-bit'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Downloads</span>
                <span className="font-semibold text-zinc-200 font-mono mt-0.5 block">
                  {((wallpaper.downloads || 15000) / 1000).toFixed(1)}k+
                </span>
              </div>
            </div>

            {/* Tags */}
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                Categorized Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {wallpaper.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-[#18181b] text-zinc-300 border border-[#27272a] px-2.5 py-1 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Extracted Color Palette with Click-to-Copy */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Color Palette
                </span>
                <span className="text-[11px] text-zinc-500">Click to copy HEX</span>
              </div>

              <div className="flex gap-2">
                {wallpaper.palette.map((color) => {
                  const isCopied = copiedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => copyHex(color)}
                      title={`Copy ${color}`}
                      className="group relative flex-1 h-10 rounded-xl border border-white/10 shadow-inner flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      style={{ backgroundColor: color }}
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                      ) : (
                        <span className="text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-opacity">
                          {color.slice(1, 4)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {copiedColor && (
                <p className="text-center text-xs text-emerald-400 mt-1.5 flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Copied {copiedColor} to clipboard
                </p>
              )}
            </div>

            {/* Related Wallpapers Teaser */}
            {relatedWallpapers.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                  Similar Wallpapers
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {relatedWallpapers.slice(0, 4).map((rel) => (
                    <button
                      key={rel.id}
                      onClick={() => onSelectWallpaper(rel)}
                      className="aspect-video rounded-lg overflow-hidden border border-[#27272a] hover:border-zinc-500 transition-all cursor-pointer group"
                    >
                      <img
                        src={rel.thumb}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-[#27272a] space-y-2.5">
            
            {/* Format Option Pills before Download */}
            <div className="flex bg-[#18181b] p-1 rounded-xl border border-[#27272a] text-xs">
              <button
                onClick={() => setDownloadFormat('original')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  downloadFormat === 'original' ? 'bg-[#27272a] text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Original ({wallpaper.resolution})
              </button>
              <button
                onClick={() => setDownloadFormat('desktop')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  downloadFormat === 'desktop' ? 'bg-[#27272a] text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Desktop
              </button>
              <button
                onClick={() => setDownloadFormat('mobile')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                  downloadFormat === 'mobile' ? 'bg-[#27272a] text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Mobile
              </button>
            </div>

            {/* Direct Download Button */}
            <button
              id="modal-download-action-btn"
              onClick={() => onDownload(wallpaper, downloadFormat)}
              className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-black transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 24px ${accentColor}35`,
              }}
            >
              <Download className="w-4 h-4 text-black stroke-[2.5]" />
              <span>Download {downloadFormat === 'original' ? `${wallpaper.resolution} Wallpaper` : `${downloadFormat} Crop`}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Add to Favorites */}
              <button
                id="modal-fav-action-btn"
                onClick={() => onToggleFavorite(wallpaper.id)}
                className={`py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  isFavorite
                    ? 'bg-rose-500/20 border-rose-500/60 text-rose-400'
                    : 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:bg-[#27272a] hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>

              {/* Remix in Studio */}
              <button
                id="modal-remix-studio-btn"
                onClick={() => {
                  onRemixInStudio(wallpaper);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 bg-[#18181b] border border-[#27272a] text-zinc-200 hover:bg-[#27272a] hover:text-white transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
                <span>Remix in Studio</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
