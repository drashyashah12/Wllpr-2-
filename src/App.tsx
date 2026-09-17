import React, { useState, useEffect, useMemo } from 'react';
import {
  Header,
  ACCENT_COLORS
} from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { WallpaperCard } from './components/WallpaperCard';
import { WallpaperModal } from './components/WallpaperModal';
import { WallpaperStudio } from './components/WallpaperStudio';
import { UploadModal } from './components/UploadModal';
import { ModerationQueue } from './components/ModerationQueue';
import { EmptyState } from './components/EmptyState';
import {
  Wallpaper,
  Category,
  DeviceType,
  ViewMode,
  SortOption
} from './types';
import { INITIAL_WALLPAPERS, CATEGORIES } from './data/wallpapers';
import { Check, Info, Heart, Download } from 'lucide-react';

const STORAGE_KEY_WALLPAPERS = 'wllpr_wallpapers_v2';
const STORAGE_KEY_FAVORITES = 'wllpr_favorites_v2';
const STORAGE_KEY_ACCENT = 'wllpr_accent_v2';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info';
}

export default function App() {
  // Load Wallpapers from localStorage or defaults
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WALLPAPERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load wallpapers from storage', e);
    }
    return INITIAL_WALLPAPERS;
  });

  // Load Favorites
  const [favorites, setFavorites] = useState<(string | number)[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
    return [1, 4, 7]; // Initial nice favorites
  });

  // Accent Color
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACCENT) || ACCENT_COLORS[0].hex;
  });

  // View & Filter States
  const [currentView, setCurrentView] = useState<ViewMode>('explore');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [deviceType, setDeviceType] = useState<DeviceType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Modal States
  const [activeWallpaper, setActiveWallpaper] = useState<Wallpaper | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Toast System
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  // Sync Wallpapers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WALLPAPERS, JSON.stringify(wallpapers));
    } catch (e) {
      console.error('Error persisting wallpapers', e);
    }
  }, [wallpapers]);

  // Sync Favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error persisting favorites', e);
    }
  }, [favorites]);

  // Sync Accent to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACCENT, accentColor);
  }, [accentColor]);

  // Pending Moderation Count
  const pendingModerationCount = useMemo(() => {
    return wallpapers.filter((w) => w.moderationStatus === 'pending').length;
  }, [wallpapers]);

  // Toggle Favorite
  const toggleFavorite = (id: string | number) => {
    setFavorites((prev) => {
      const isFav = prev.includes(id);
      if (isFav) {
        showToast('Removed from Favorites', 'info');
        return prev.filter((favId) => favId !== id);
      } else {
        showToast('Added to Favorites!', 'success');
        return [...prev, id];
      }
    });
  };

  // Download Handler
  const handleDownload = async (wallpaper: Wallpaper, _format?: 'original' | 'desktop' | 'mobile') => {
    showToast(`Downloading ${wallpaper.title}...`, 'info');
    try {
      // Create an anchor and trigger download
      const link = document.createElement('a');
      link.href = wallpaper.url;
      link.download = `wllpr-${wallpaper.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${wallpaper.resolution}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Increment download counter in state
      setWallpapers((prev) =>
        prev.map((w) =>
          w.id === wallpaper.id ? { ...w, downloads: (w.downloads || 0) + 1 } : w
        )
      );

      showToast(`${wallpaper.title} download started!`, 'success');
    } catch {
      window.open(wallpaper.url, '_blank');
    }
  };

  // Upload Complete Callback
  const handleUploadComplete = (newWallpaper: Wallpaper) => {
    setWallpapers((prev) => [newWallpaper, ...prev]);

    if (newWallpaper.moderationStatus === 'pending') {
      showToast('Uploaded! Wallpaper is in Moderation Queue for review.', 'info');
      // Optionally switch to moderation queue to inspect
      setCurrentView('moderation');
    } else {
      showToast('Wallpaper published directly to public gallery!', 'success');
      setCurrentView('explore');
    }
  };

  // Moderation Handlers
  const handleApprove = (id: string | number) => {
    setWallpapers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, moderationStatus: 'approved' } : w))
    );
    showToast('Wallpaper approved! Now visible in Explore gallery.', 'success');
  };

  const handleReject = (id: string | number, reason: string) => {
    setWallpapers((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, moderationStatus: 'rejected', moderationNotes: reason } : w
      )
    );
    showToast('Wallpaper rejected.', 'info');
  };

  const handleDelete = (id: string | number) => {
    setWallpapers((prev) => prev.filter((w) => w.id !== id));
    showToast('Wallpaper deleted.', 'info');
  };

  const handleApproveAll = () => {
    setWallpapers((prev) =>
      prev.map((w) => (w.moderationStatus === 'pending' ? { ...w, moderationStatus: 'approved' } : w))
    );
    showToast('All pending submissions approved!', 'success');
  };

  // Studio Save Callback
  const handleStudioSave = (newCustomWallpaper: Wallpaper) => {
    setWallpapers((prev) => [newCustomWallpaper, ...prev]);
    showToast('Custom wallpaper saved to your gallery!', 'success');
  };

  // Modal Navigation
  const publicWallpapers = useMemo(() => {
    return wallpapers.filter((w) => !w.moderationStatus || w.moderationStatus === 'approved');
  }, [wallpapers]);

  const activeIndex = useMemo(() => {
    if (!activeWallpaper) return -1;
    return publicWallpapers.findIndex((w) => w.id === activeWallpaper.id);
  }, [activeWallpaper, publicWallpapers]);

  const hasNext = activeIndex >= 0 && activeIndex < publicWallpapers.length - 1;
  const hasPrev = activeIndex > 0;

  const handleNext = () => {
    if (hasNext) setActiveWallpaper(publicWallpapers[activeIndex + 1]);
  };

  const handlePrev = () => {
    if (hasPrev) setActiveWallpaper(publicWallpapers[activeIndex - 1]);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('All');
    setDeviceType('All');
    setSearchQuery('');
    setSortBy('popular');
  };

  // Category counts based on active approved/public wallpapers
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      All: publicWallpapers.length,
      Minimalist: 0,
      Cyberpunk: 0,
      Nature: 0,
      Abstract: 0,
      Architecture: 0,
      Anime: 0,
      Space: 0,
      Cars: 0,
      Animals: 0,
      Gaming: 0,
      AMOLED: 0,
    };

    publicWallpapers.forEach((w) => {
      w.tags.forEach((tag) => {
        if (tag in counts) {
          counts[tag as Category] += 1;
        }
      });
    });

    return counts;
  }, [publicWallpapers]);

  // Filtered Wallpapers for Explore / Favorites
  const filteredWallpapers = useMemo(() => {
    let list = publicWallpapers;

    if (currentView === 'favorites') {
      list = list.filter((w) => favorites.includes(w.id));
    }

    // Category Filter
    if (selectedCategory !== 'All') {
      list = list.filter((w) => w.tags.includes(selectedCategory));
    }

    // Device Type Filter
    if (deviceType !== 'All') {
      if (deviceType === 'AMOLED') {
        list = list.filter((w) => w.tags.includes('AMOLED'));
      } else {
        list = list.filter((w) => w.type === deviceType);
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.author.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.downloads || 0) - (a.downloads || 0);
      }
      if (sortBy === 'resolution') {
        const resScore = (res: string) => (res === '8K' ? 4 : res === '5K' ? 3 : res === '4K' ? 2 : 1);
        return resScore(b.resolution) - resScore(a.resolution);
      }
      if (sortBy === 'newest') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [publicWallpapers, currentView, favorites, selectedCategory, deviceType, searchQuery, sortBy]);

  // Related wallpapers for active modal
  const relatedWallpapers = useMemo(() => {
    if (!activeWallpaper) return [];
    return publicWallpapers
      .filter((w) => w.id !== activeWallpaper.id && w.tags.some((t) => activeWallpaper.tags.includes(t)))
      .slice(0, 4);
  }, [activeWallpaper, publicWallpapers]);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col selection:bg-cyan-400 selection:text-black">
      
      {/* Sticky Top Header */}
      <Header
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        deviceType={deviceType}
        onDeviceChange={setDeviceType}
        favoritesCount={favorites.length}
        pendingModerationCount={pendingModerationCount}
        onOpenUpload={() => setIsUploadOpen(true)}
        onResetFilters={handleResetFilters}
        accentColor={accentColor}
        onAccentChange={setAccentColor}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: Explore & Favorites */}
        {(currentView === 'explore' || currentView === 'favorites') && (
          <div>
            {/* Category Filter Chips & Sort Bar */}
            <CategoryBar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categoryCounts={categoryCounts}
              sortBy={sortBy}
              onSortChange={setSortBy}
              accentColor={accentColor}
            />

            {/* View Sub-Header for Favorites */}
            {currentView === 'favorites' && (
              <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <h1 className="text-xl font-bold text-white">Your Saved Favorites</h1>
                  <span className="text-xs bg-[#18181b] border border-[#27272a] text-zinc-400 px-2.5 py-0.5 rounded-full font-mono">
                    {filteredWallpapers.length} wallpapers
                  </span>
                </div>
              </div>
            )}

            {/* Masonry / Responsive Wallpaper Grid */}
            <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {filteredWallpapers.length === 0 ? (
                <EmptyState
                  currentView={currentView}
                  searchQuery={searchQuery}
                  onReset={handleResetFilters}
                  onOpenUpload={() => setIsUploadOpen(true)}
                  accentColor={accentColor}
                />
              ) : (
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 2xl:columns-5 gap-5">
                  {filteredWallpapers.map((wallpaper) => (
                    <WallpaperCard
                      key={wallpaper.id}
                      wallpaper={wallpaper}
                      isFavorite={favorites.includes(wallpaper.id)}
                      onToggleFavorite={toggleFavorite}
                      onOpenModal={setActiveWallpaper}
                      onQuickDownload={handleDownload}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Wallpaper Studio ("Make Your Own Wallpaper") */}
        {currentView === 'studio' && (
          <WallpaperStudio
            onSaveToGallery={handleStudioSave}
            accentColor={accentColor}
          />
        )}

        {/* VIEW 3: Content Moderation Queue */}
        {currentView === 'moderation' && (
          <ModerationQueue
            wallpapers={wallpapers}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
            onApproveAll={handleApproveAll}
            onPreview={setActiveWallpaper}
            accentColor={accentColor}
          />
        )}

      </main>

      {/* Fullscreen Wallpaper Lightbox Modal */}
      {activeWallpaper && (
        <WallpaperModal
          wallpaper={activeWallpaper}
          onClose={() => setActiveWallpaper(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={hasNext}
          hasPrev={hasPrev}
          isFavorite={favorites.includes(activeWallpaper.id)}
          onToggleFavorite={toggleFavorite}
          onDownload={handleDownload}
          onRemixInStudio={() => {
            setCurrentView('studio');
          }}
          relatedWallpapers={relatedWallpapers}
          onSelectWallpaper={setActiveWallpaper}
          accentColor={accentColor}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
        accentColor={accentColor}
      />

      {/* Floating Toast Alerts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[#18181b]/95 backdrop-blur-md border border-[#27272a] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200 pointer-events-auto"
          >
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            ) : (
              <Info className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b] py-6 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">wllpr.</span>
            <span>Ultra-clean 4K & 8K wallpaper curation & studio</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Keyboard: Press <kbd className="font-mono bg-[#18181b] px-1.5 py-0.5 rounded border border-[#27272a] text-zinc-300">/</kbd> to search</span>
            <span>•</span>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-zinc-300 hover:text-white underline underline-offset-2"
            >
              Upload Wallpaper
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentView('moderation')}
              className="text-zinc-300 hover:text-white underline underline-offset-2"
            >
              Moderation ({pendingModerationCount})
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
