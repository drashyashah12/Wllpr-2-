import React, { useRef, useEffect } from 'react';
import { Layers, Search, Sparkles, Heart, Compass, X, Upload, ShieldAlert } from 'lucide-react';
import { DeviceType, ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  deviceType: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  favoritesCount: number;
  pendingModerationCount: number;
  onOpenUpload: () => void;
  onResetFilters: () => void;
  accentColor: string;
  onAccentChange: (color: string) => void;
}

export const ACCENT_COLORS = [
  { name: 'Cyan', hex: '#22d3ee', twClass: 'bg-cyan-400' },
  { name: 'Emerald', hex: '#34d399', twClass: 'bg-emerald-400' },
  { name: 'Amber', hex: '#fbbf24', twClass: 'bg-amber-400' },
  { name: 'Violet', hex: '#a78bfa', twClass: 'bg-violet-400' },
  { name: 'Rose', hex: '#fb7185', twClass: 'bg-rose-400' },
];

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  searchQuery,
  onSearchChange,
  deviceType,
  onDeviceChange,
  favoritesCount,
  pendingModerationCount,
  onOpenUpload,
  onResetFilters,
  accentColor,
  onAccentChange
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        if (currentView !== 'explore') {
          onViewChange('explore');
        }
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, onViewChange]);

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/90 backdrop-blur-md border-b border-[#27272a] transition-all">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Logo & Primary Navigation */}
          <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto justify-between lg:justify-start">
            <button
              id="wllpr-brand-logo"
              onClick={() => {
                onViewChange('explore');
                onResetFilters();
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none flex-shrink-0"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md group-hover:scale-105"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 20px ${accentColor}33` }}
              >
                <Layers className="text-[#09090b] w-5 h-5 transition-transform group-hover:rotate-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center">
                wllpr
                <span className="text-xl ml-0.5" style={{ color: accentColor }}>.</span>
              </span>
            </button>

            {/* View Navigation Switcher */}
            <nav className="flex bg-[#18181b] p-1 rounded-xl border border-[#27272a] overflow-x-auto hide-scrollbar" aria-label="Main View">
              <button
                id="nav-explore-btn"
                onClick={() => onViewChange('explore')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  currentView === 'explore'
                    ? 'bg-[#27272a] text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Explore</span>
              </button>

              <button
                id="nav-studio-btn"
                onClick={() => onViewChange('studio')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  currentView === 'studio'
                    ? 'bg-[#27272a] text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" style={{ color: currentView === 'studio' ? accentColor : undefined }} />
                <span>Studio</span>
                <span
                  className="hidden sm:inline ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider"
                  style={{
                    backgroundColor: `${accentColor}25`,
                    color: accentColor,
                  }}
                >
                  Create
                </span>
              </button>

              <button
                id="nav-favorites-btn"
                onClick={() => onViewChange('favorites')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  currentView === 'favorites'
                    ? 'bg-[#27272a] text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-500 fill-rose-500' : ''}`}
                />
                <span className="hidden sm:inline">Favorites</span>
                {favoritesCount > 0 && (
                  <span className="bg-rose-500/20 text-rose-400 text-xs px-1.5 py-0.2 rounded-full font-mono font-medium">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <button
                id="nav-moderation-btn"
                onClick={() => onViewChange('moderation')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  currentView === 'moderation'
                    ? 'bg-[#27272a] text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Review user-uploaded community content"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Moderation</span>
                {pendingModerationCount > 0 && (
                  <span className="bg-amber-500/25 text-amber-300 text-xs px-1.5 py-0.2 rounded-full font-mono font-bold">
                    {pendingModerationCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Search, Device Switcher, Upload Button & Accent Selector */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            
            {/* Search Input (Active in Explore and Favorites) */}
            {currentView !== 'studio' && currentView !== 'moderation' && (
              <div className="relative w-full sm:w-60 lg:w-64 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-cyan-400 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={searchInputRef}
                  id="search-wallpaper-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search 4K, tags, authors..."
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-full py-1.5 pl-9 pr-12 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1">
                  {searchQuery ? (
                    <button
                      onClick={() => onSearchChange('')}
                      className="text-zinc-400 hover:text-white p-0.5 rounded-full"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="text-[10px] font-mono text-zinc-500 bg-[#27272a] px-1.5 py-0.5 rounded border border-zinc-700/80 pointer-events-none">
                      /
                    </kbd>
                  )}
                </div>
              </div>
            )}

            {/* Device Type Toggle (All, Desktop, Mobile, AMOLED) */}
            {currentView !== 'studio' && currentView !== 'moderation' && (
              <div className="hidden sm:flex items-center bg-[#18181b] rounded-full p-1 border border-[#27272a]" id="deviceTabs">
                {(['All', 'Desktop', 'Mobile', 'AMOLED'] as DeviceType[]).map((type) => (
                  <button
                    key={type}
                    id={`device-toggle-${type.toLowerCase()}`}
                    onClick={() => onDeviceChange(type)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      deviceType === type
                        ? 'bg-[#27272a] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            {/* Prominent Upload Button */}
            <button
              id="header-upload-btn"
              onClick={onOpenUpload}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-black flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 16px ${accentColor}30`,
              }}
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Upload</span>
            </button>

            {/* Accent Color Picker Dots */}
            <div className="flex items-center gap-1.5 bg-[#18181b] px-2.5 py-1.5 rounded-full border border-[#27272a]" title="Accent color theme">
              {ACCENT_COLORS.map((accent) => (
                <button
                  key={accent.name}
                  id={`accent-btn-${accent.name.toLowerCase()}`}
                  onClick={() => onAccentChange(accent.hex)}
                  className={`w-3.5 h-3.5 rounded-full transition-transform ${
                    accentColor === accent.hex
                      ? 'scale-125 ring-2 ring-white/80 ring-offset-1 ring-offset-[#18181b]'
                      : 'opacity-70 hover:opacity-100 hover:scale-110'
                  }`}
                  style={{ backgroundColor: accent.hex }}
                  aria-label={`Select ${accent.name} accent`}
                />
              ))}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

