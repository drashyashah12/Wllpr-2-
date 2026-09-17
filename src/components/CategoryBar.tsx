import React from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Category, SortOption } from '../types';
import { CATEGORIES } from '../data/wallpapers';

interface CategoryBarProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  categoryCounts: Record<Category, number>;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  accentColor: string;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  sortBy,
  onSortChange,
  accentColor,
}) => {
  return (
    <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-3 border-b border-[#27272a]/60">
      <div className="flex items-center justify-between gap-4">
        
        {/* Horizontal Scrollable Category Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto hide-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                id={`cat-chip-${cat.toLowerCase()}`}
                onClick={() => onSelectCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none ${
                  isSelected
                    ? 'text-black font-semibold shadow-lg'
                    : 'bg-[#18181b] border border-[#27272a] text-zinc-300 hover:bg-[#27272a] hover:text-white'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: accentColor,
                        boxShadow: `0 0 16px ${accentColor}40`,
                      }
                    : undefined
                }
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-black/20 text-black font-bold' : 'bg-[#27272a] text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0 text-xs">
          <span className="text-zinc-500 flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-[#18181b] border border-[#27272a] text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-zinc-500 text-xs font-medium cursor-pointer"
          >
            <option value="popular">Popularity</option>
            <option value="resolution">Highest Resolution (8K/5K)</option>
            <option value="newest">Recently Added</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>

      </div>
    </div>
  );
};
