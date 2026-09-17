import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Monitor,
  Smartphone,
  Tag,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { Category, Wallpaper } from '../types';
import { CATEGORIES } from '../data/wallpapers';
import {
  validateImageFile,
  formatBytes,
  extractImageMetadata,
  ExtractedImageInfo
} from '../utils/imageUtils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (newWallpaper: Wallpaper) => void;
  accentColor: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
  accentColor,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedImageInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [category, setCategory] = useState<Category>('Minimalist');
  const [tagsInput, setTagsInput] = useState('');
  const [submissionType, setSubmissionType] = useState<'pending' | 'approved'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setErrorMessage(null);

    // Validate
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    setSelectedFile(file);

    // Auto-generate title from filename if title is empty
    if (!title) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      setTitle(cleanName);
    }

    // Read and preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);

      // Extract metadata via offscreen Image
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const info = extractImageMetadata(img);
        setExtractedInfo(info);
      };
    };
    reader.readAsDataURL(file);
  };

  // Drag & Drop handlers
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !previewUrl || !extractedInfo) {
      setErrorMessage('Please choose or drop an image file first.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Please provide a title for your wallpaper.');
      return;
    }

    setIsProcessing(true);

    // Parse tags
    const customTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const allTags = Array.from(new Set([category, ...customTags]));

    const newWallpaper: Wallpaper = {
      id: `upload-${Date.now()}`,
      title: title.trim(),
      author: author.trim() || 'Community Creator',
      authorHandle: authorHandle.trim() ? (authorHandle.startsWith('@') ? authorHandle : `@${authorHandle}`) : undefined,
      resolution: extractedInfo.resolution,
      dimensions: extractedInfo.dimensions,
      width: extractedInfo.width,
      height: extractedInfo.height,
      type: extractedInfo.type,
      tags: allTags,
      url: previewUrl,
      thumb: previewUrl,
      palette: extractedInfo.palette,
      downloads: 0,
      likes: 1,
      isUpload: true,
      fileSize: formatBytes(selectedFile.size),
      moderationStatus: submissionType,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsProcessing(false);
      onUploadComplete(newWallpaper);
      onClose();
    }, 400);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedInfo(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      id="upload-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#09090b]/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-20 w-full max-w-3xl bg-[#121215] border border-[#27272a] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
            >
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Upload Wallpaper
              </h2>
              <p className="text-xs text-zinc-400">
                Share high-resolution 4K/8K wallpapers with the wllpr community
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close upload modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#27272a] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag & Drop or File Preview Zone */}
          {!previewUrl ? (
            <div
              id="upload-dropzone"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-cyan-400 bg-cyan-400/5 scale-[1.01]'
                  : 'border-[#27272a] bg-[#18181b]/50 hover:bg-[#18181b] hover:border-zinc-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/avif"
                onChange={handleInputChange}
                className="hidden"
                id="wallpaper-file-input"
              />

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform"
                style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
              >
                <ImageIcon className="w-7 h-7" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Drag and drop your image here, or{' '}
                  <span style={{ color: accentColor }} className="underline underline-offset-2">
                    browse files
                  </span>
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Supports PNG, JPG, WebP, AVIF up to 20 MB • Optimal resolution: 3840×2160 (4K) or higher
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Safe file scanning
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} /> Auto 4K/8K detection
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 flex flex-col sm:flex-row gap-5 items-center">
              {/* Image Preview Box */}
              <div className="relative w-full sm:w-48 h-36 bg-black rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-zinc-700/60 shadow-inner">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={resetUpload}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-zinc-300 hover:text-white hover:bg-rose-600 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Auto-extracted metadata */}
              <div className="flex-1 min-w-0 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Valid Image
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded border font-mono"
                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                  >
                    {extractedInfo?.resolution}
                  </span>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    {selectedFile && formatBytes(selectedFile.size)}
                  </span>
                </div>

                <p className="text-zinc-200 font-medium truncate">
                  {selectedFile?.name}
                </p>

                <div className="grid grid-cols-2 gap-2 text-zinc-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    {extractedInfo?.type === 'Desktop' ? (
                      <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>{extractedInfo?.dimensions}</span>
                  </div>
                  <div>
                    <span>Mode: {extractedInfo?.type}</span>
                  </div>
                </div>

                {/* Auto Extracted Color Palette */}
                {extractedInfo?.palette && (
                  <div className="pt-1">
                    <span className="text-[10px] text-zinc-500 block mb-1">
                      Auto-detected color palette:
                    </span>
                    <div className="flex gap-1.5">
                      {extractedInfo.palette.map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-md border border-white/10 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Wallpaper Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                id="upload-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cyberpunk Horizon 2099"
                maxLength={60}
                required
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Photographer / Creator Name
              </label>
              <input
                type="text"
                id="upload-author-input"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Alexander Vance"
                maxLength={40}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Primary Category
              </label>
              <select
                id="upload-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Additional Tags (comma separated)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="upload-tags-input"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. 4k, neon, dark, oled"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl pl-8 pr-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                />
                <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Submission Mode: Moderation Queue vs Immediate Approval */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3.5">
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Moderation & Publishing Workflow
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                  submissionType === 'pending'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                    : 'bg-[#121215] border-[#27272a] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <input
                  type="radio"
                  name="submissionType"
                  value="pending"
                  checked={submissionType === 'pending'}
                  onChange={() => setSubmissionType('pending')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold block flex items-center gap-1 text-white">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Send to Moderation Queue
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Submitted wallpapers appear in the Moderation Queue for review before public distribution.
                  </p>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                  submissionType === 'approved'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#121215] border-[#27272a] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <input
                  type="radio"
                  name="submissionType"
                  value="approved"
                  checked={submissionType === 'approved'}
                  onChange={() => setSubmissionType('approved')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold block flex items-center gap-1 text-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Direct Publish (Instant)
                  </span>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Fast-track submission directly into the public Explore catalog for immediate browsing.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-300 hover:bg-[#27272a] hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              id="upload-submit-btn"
              disabled={!selectedFile || isProcessing}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl text-black flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
                !selectedFile || isProcessing
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-[1.02] active:scale-[0.98]'
              }`}
              style={{
                backgroundColor: accentColor,
                boxShadow: selectedFile ? `0 0 20px ${accentColor}35` : undefined,
              }}
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>
                    {submissionType === 'pending' ? 'Submit for Review' : 'Publish Wallpaper'}
                  </span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
