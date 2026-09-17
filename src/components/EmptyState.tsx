import React from 'react';
import { SearchX, HeartOff, RefreshCcw, Upload } from 'lucide-react';
import { ViewMode } from '../types';

interface EmptyStateProps {
  currentView: ViewMode;
  searchQuery: string;
  onReset: () => void;
  onOpenUpload?: () => void;
  accentColor: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  currentView,
  searchQuery,
  onReset,
  onOpenUpload,
  accentColor,
}) => {
  const isFavorites = currentView === 'favorites';

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-4 shadow-xl">
        {isFavorites ? (
          <HeartOff className="w-8 h-8 text-zinc-500" />
        ) : (
          <SearchX className="w-8 h-8 text-zinc-500" />
        )}
      </div>

      <h3 className="text-xl font-bold text-white mb-1.5">
        {isFavorites
          ? 'No favorite wallpapers yet'
          : searchQuery
          ? `No wallpapers matching "${searchQuery}"`
          : 'No wallpapers found in this category'}
      </h3>

      <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
        {isFavorites
          ? 'Browse the explore collection and click the heart icon on any card to curate your personal wallpaper collection.'
          : 'Try searching with different keywords, switching device type (Desktop / Mobile / AMOLED), or upload your own 4K wallpaper.'}
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-200 hover:text-white hover:bg-[#27272a] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>

        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-black flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Upload Wallpaper</span>
          </button>
        )}
      </div>
    </div>
  );
};
