import React, { useState } from 'react';
import {
  ShieldAlert,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Filter,
  CheckCheck,
  Sparkles,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Wallpaper, ModerationStatus } from '../types';

interface ModerationQueueProps {
  wallpapers: Wallpaper[];
  onApprove: (id: string | number) => void;
  onReject: (id: string | number, reason: string) => void;
  onDelete: (id: string | number) => void;
  onApproveAll: () => void;
  onPreview: (wallpaper: Wallpaper) => void;
  accentColor: string;
}

export const ModerationQueue: React.FC<ModerationQueueProps> = ({
  wallpapers,
  onApprove,
  onReject,
  onDelete,
  onApproveAll,
  onPreview,
  accentColor,
}) => {
  const [filterStatus, setFilterStatus] = useState<ModerationStatus | 'all'>('pending');
  const [rejectingId, setRejectingId] = useState<string | number | null>(null);
  const [rejectReason, setRejectReason] = useState('Low resolution or compression artifacts');

  // Filter only items that have a moderation status (or user uploads)
  const moderatedItems = wallpapers.filter((w) => w.isUpload || w.moderationStatus);

  const pendingItems = moderatedItems.filter((w) => w.moderationStatus === 'pending');
  const approvedItems = moderatedItems.filter((w) => w.moderationStatus === 'approved');
  const rejectedItems = moderatedItems.filter((w) => w.moderationStatus === 'rejected');

  const displayedItems = moderatedItems.filter((w) => {
    if (filterStatus === 'all') return true;
    return w.moderationStatus === filterStatus;
  });

  const handleConfirmReject = (id: string | number) => {
    onReject(id, rejectReason);
    setRejectingId(null);
  };

  return (
    <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Moderation Hub Header */}
      <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Community Content Moderation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Wallpaper Moderation Queue
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              Review user-uploaded wallpapers before they appear in the public catalog. Ensure resolution quality, safe content, and correct tagging.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <div className="bg-[#18181b] border border-[#27272a] px-4 py-3 rounded-2xl text-center min-w-[90px]">
              <span className="text-xl font-mono font-bold text-amber-400">
                {pendingItems.length}
              </span>
              <span className="block text-[11px] text-zinc-500 font-medium">Pending</span>
            </div>

            <div className="bg-[#18181b] border border-[#27272a] px-4 py-3 rounded-2xl text-center min-w-[90px]">
              <span className="text-xl font-mono font-bold text-emerald-400">
                {approvedItems.length}
              </span>
              <span className="block text-[11px] text-zinc-500 font-medium">Approved</span>
            </div>

            <div className="bg-[#18181b] border border-[#27272a] px-4 py-3 rounded-2xl text-center min-w-[90px]">
              <span className="text-xl font-mono font-bold text-rose-400">
                {rejectedItems.length}
              </span>
              <span className="block text-[11px] text-zinc-500 font-medium">Rejected</span>
            </div>
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-[#27272a]">
          
          {/* Status Tabs */}
          <div className="flex items-center bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filterStatus === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Review</span>
              <span className="bg-amber-500/30 text-amber-200 text-[10px] px-1.5 rounded-full font-mono">
                {pendingItems.length}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filterStatus === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approved</span>
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] px-1.5 rounded-full font-mono">
                {approvedItems.length}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('rejected')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                filterStatus === 'rejected'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
              <span className="bg-rose-500/30 text-rose-200 text-[10px] px-1.5 rounded-full font-mono">
                {rejectedItems.length}
              </span>
            </button>

            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#27272a] text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Submissions
            </button>
          </div>

          {/* Bulk Action */}
          {pendingItems.length > 0 && (
            <button
              id="approve-all-pending-btn"
              onClick={onApproveAll}
              className="px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              style={{ backgroundColor: accentColor }}
            >
              <CheckCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Approve All Pending ({pendingItems.length})</span>
            </button>
          )}

        </div>

      </div>

      {/* Moderation Items List */}
      {displayedItems.length === 0 ? (
        <div className="text-center py-16 bg-[#121215] rounded-3xl border border-[#27272a] p-8">
          <div className="w-14 h-14 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto mb-4 text-zinc-500">
            <CheckCircle className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Queue is all clear!</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            There are no {filterStatus !== 'all' ? filterStatus : ''} submissions waiting in this view. New uploads from users will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedItems.map((item) => {
            const isPending = item.moderationStatus === 'pending';
            const isApproved = item.moderationStatus === 'approved';
            const isRejected = item.moderationStatus === 'rejected';

            return (
              <div
                key={item.id}
                id={`moderation-row-${item.id}`}
                className="bg-[#121215] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all hover:border-zinc-700 shadow-md"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  
                  {/* Thumbnail */}
                  <div
                    onClick={() => onPreview(item)}
                    className="relative w-28 h-20 bg-black rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800 cursor-pointer group"
                    title="Click to inspect in full resolution"
                  >
                    <img
                      src={item.thumb}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-base truncate">
                        {item.title}
                      </h3>

                      {/* Status Tag */}
                      {isPending && (
                        <span className="bg-amber-500/20 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Approved & Public
                        </span>
                      )}
                      {isRejected && (
                        <span className="bg-rose-500/20 text-rose-300 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-rose-500/40 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}

                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded border font-mono"
                        style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                      >
                        {item.resolution}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400">
                      Submitted by <span className="text-zinc-200 font-medium">{item.author}</span>
                      {item.authorHandle && ` (${item.authorHandle})`} • {item.dimensions}
                      {item.fileSize && ` • ${item.fileSize}`}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-[#18181b] text-zinc-400 px-2 py-0.5 rounded border border-[#27272a]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Rejection Note if present */}
                    {item.moderationNotes && (
                      <p className="text-[11px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg mt-1 inline-block">
                        Reason: {item.moderationNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Moderation Actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#27272a]">
                  
                  {/* Inspect Button */}
                  <button
                    onClick={() => onPreview(item)}
                    className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-white hover:bg-[#27272a] transition-all cursor-pointer"
                    title="Preview full image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Reject Popover/Action */}
                  {rejectingId === item.id ? (
                    <div className="flex items-center gap-2 bg-[#18181b] p-1.5 rounded-xl border border-rose-500/40">
                      <select
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="bg-[#121215] text-xs text-zinc-200 border border-[#27272a] rounded-lg px-2 py-1"
                      >
                        <option value="Low resolution or compression artifacts">Low resolution</option>
                        <option value="Visible watermarks or branding">Visible watermark</option>
                        <option value="Inappropriate or copyrighted content">Inappropriate content</option>
                        <option value="Duplicate submission">Duplicate</option>
                      </select>
                      <button
                        onClick={() => handleConfirmReject(item.id)}
                        className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-2 py-1 text-zinc-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Reject button */}
                      {!isRejected && (
                        <button
                          onClick={() => setRejectingId(item.id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#18181b] border border-[#27272a] text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      {/* Approve button */}
                      {!isApproved && (
                        <button
                          onClick={() => onApprove(item.id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 transition-all shadow-md hover:scale-105 cursor-pointer"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Approve</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Delete from system */}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
