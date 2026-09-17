import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Download,
  Shuffle,
  Monitor,
  Smartphone,
  Check,
  Type,
  Palette,
  Sliders,
  Clock,
  Layers,
  Save,
  Maximize
} from 'lucide-react';
import { StudioState, StudioFormat, BackgroundStyle, StudioFontFamily, Wallpaper } from '../types';
import { PRESET_STUDIO_PALETTES } from '../data/wallpapers';

interface WallpaperStudioProps {
  onSaveToGallery: (wallpaper: Wallpaper) => void;
  accentColor: string;
}

const DEFAULT_STATE: StudioState = {
  format: 'desktop',
  bgStyle: 'linear',
  color1: '#09090b',
  color2: '#05d9e8',
  color3: '#ff2a6d',
  angle: 135,
  text: 'STAY CURIOUS',
  subtitle: 'WLLPR STUDIO EDITION',
  textColor: '#ffffff',
  fontFamily: 'Space Grotesk',
  fontSize: 64,
  textShadow: true,
  letterSpacing: 8,
  showWidget: false,
  badge: 'star',
  noiseIntensity: 18,
  geometricShape: 'sun',
  shapeOpacity: 0.4,
};

const FORMAT_CONFIG: Record<StudioFormat, { label: string; width: number; height: number; aspect: string }> = {
  desktop: { label: 'Desktop 16:9 (4K)', width: 3840, height: 2160, aspect: '16/9' },
  mobile: { label: 'Mobile 9:16 (4K)', width: 2160, height: 3840, aspect: '9/16' },
  ultrawide: { label: 'Ultrawide 21:9', width: 3440, height: 1440, aspect: '21/9' },
  square: { label: 'Square 1:1', width: 2048, height: 2048, aspect: '1/1' },
};

export const WallpaperStudio: React.FC<WallpaperStudioProps> = ({
  onSaveToGallery,
  accentColor,
}) => {
  const [studio, setStudio] = useState<StudioState>(DEFAULT_STATE);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'clean' | 'frame'>('clean');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = FORMAT_CONFIG[studio.format];
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    if (studio.bgStyle === 'linear') {
      const rad = (studio.angle * Math.PI) / 180;
      const x1 = width / 2 - (Math.cos(rad) * width) / 2;
      const y1 = height / 2 - (Math.sin(rad) * height) / 2;
      const x2 = width / 2 + (Math.cos(rad) * width) / 2;
      const y2 = height / 2 + (Math.sin(rad) * height) / 2;

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, studio.color1);
      grad.addColorStop(0.5, studio.color2);
      grad.addColorStop(1, studio.color3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (studio.bgStyle === 'radial') {
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.05,
        width / 2,
        height / 2,
        width * 0.75
      );
      grad.addColorStop(0, studio.color2);
      grad.addColorStop(0.5, studio.color1);
      grad.addColorStop(1, studio.color3);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (studio.bgStyle === 'mesh') {
      // Deep dark base
      ctx.fillStyle = studio.color1;
      ctx.fillRect(0, 0, width, height);

      // Orb 1
      const g1 = ctx.createRadialGradient(width * 0.25, height * 0.3, 0, width * 0.25, height * 0.3, width * 0.5);
      g1.addColorStop(0, studio.color2);
      g1.addColorStop(1, 'transparent');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, width, height);

      // Orb 2
      const g2 = ctx.createRadialGradient(width * 0.75, height * 0.7, 0, width * 0.75, height * 0.7, width * 0.5);
      g2.addColorStop(0, studio.color3);
      g2.addColorStop(1, 'transparent');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, width, height);
    } else if (studio.bgStyle === 'amoled') {
      // Pure 000000 AMOLED with subtle neon edge glow
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      const grad = ctx.createRadialGradient(
        width / 2,
        height * 0.85,
        0,
        width / 2,
        height * 0.85,
        width * 0.7
      );
      grad.addColorStop(0, studio.color2);
      grad.addColorStop(0.4, `${studio.color3}33`);
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Geometric Shape Overlays
    ctx.save();
    ctx.globalAlpha = studio.shapeOpacity;
    if (studio.geometricShape === 'sun') {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.28, 0, Math.PI * 2);
      const sunGrad = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.7);
      sunGrad.addColorStop(0, studio.color2);
      sunGrad.addColorStop(1, studio.color3);
      ctx.fillStyle = sunGrad;
      ctx.fill();
    } else if (studio.geometricShape === 'rings') {
      ctx.strokeStyle = studio.color2;
      ctx.lineWidth = Math.min(width, height) * 0.006;
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.12 * r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (studio.geometricShape === 'waves') {
      ctx.strokeStyle = studio.color2;
      ctx.lineWidth = 4;
      const step = height / 18;
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 30) {
          const waveY = y + Math.sin(x * 0.005 + y * 0.02) * (step * 0.4);
          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }
    } else if (studio.geometricShape === 'grid') {
      ctx.strokeStyle = `${studio.color2}60`;
      ctx.lineWidth = 2;
      const gridSize = Math.min(width, height) * 0.08;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
    ctx.restore();

    // 3. Film Grain / Noise Simulation
    if (studio.noiseIntensity > 0) {
      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = 256;
      noiseCanvas.height = 256;
      const nctx = noiseCanvas.getContext('2d');
      if (nctx) {
        const imgData = nctx.createImageData(256, 256);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * 255;
          data[i] = noise > 0 ? 255 : 0;
          data[i + 1] = noise > 0 ? 255 : 0;
          data[i + 2] = noise > 0 ? 255 : 0;
          data[i + 3] = Math.abs(noise) * (studio.noiseIntensity / 100) * 0.35;
        }
        nctx.putImageData(imgData, 0, 0);

        ctx.save();
        ctx.fillStyle = ctx.createPattern(noiseCanvas, 'repeat') || '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    // 4. Lock Screen Widget (Clock & Date)
    if (studio.showWidget) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `600 ${Math.floor(width * 0.08)}px "Plus Jakarta Sans", sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 20;

      const widgetY = studio.format === 'mobile' ? height * 0.22 : height * 0.25;
      ctx.fillText('09:41', width / 2, widgetY);

      ctx.font = `400 ${Math.floor(width * 0.02)}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('Thursday, September 17', width / 2, widgetY + width * 0.05);
      ctx.restore();
    }

    // 5. Typography Engine
    if (studio.text.trim()) {
      ctx.save();
      ctx.fillStyle = studio.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (studio.textShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;
      }

      // Responsive font sizing based on 4K baseline
      const scaleFactor = width / 1920;
      const calcFontSize = Math.floor(studio.fontSize * scaleFactor);

      ctx.font = `bold ${calcFontSize}px "${studio.fontFamily}", sans-serif`;

      // Apply letter spacing if supported
      if ('letterSpacing' in ctx) {
        (ctx as unknown as { letterSpacing: string }).letterSpacing = `${studio.letterSpacing}px`;
      }

      const centerY = studio.showWidget
        ? height * 0.65
        : height / 2;

      ctx.fillText(studio.text.toUpperCase(), width / 2, centerY);

      // Subtitle
      if (studio.subtitle.trim()) {
        ctx.font = `500 ${Math.floor(calcFontSize * 0.26)}px "${studio.fontFamily}", sans-serif`;
        ctx.fillStyle = `${studio.textColor}cc`;
        ctx.fillText(studio.subtitle.toUpperCase(), width / 2, centerY + calcFontSize * 0.85);
      }

      ctx.restore();
    }

  }, [studio]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Randomize / Shuffle Preset
  const handleShuffle = () => {
    const randomPalette = PRESET_STUDIO_PALETTES[Math.floor(Math.random() * PRESET_STUDIO_PALETTES.length)];
    const bgStyles: BackgroundStyle[] = ['linear', 'radial', 'mesh', 'amoled'];
    const shapes: StudioState['geometricShape'][] = ['none', 'sun', 'rings', 'waves', 'grid'];
    const fonts: StudioFontFamily[] = ['Space Grotesk', 'Plus Jakarta Sans', 'Cinzel', 'Instrument Serif', 'JetBrains Mono'];

    const phrases = [
      'STAY CURIOUS',
      'OBSIDIAN DREAMS',
      'NEO TOKYO',
      'QUIET DISCIPLINE',
      'HORIZON 2099',
      'PURE VOID',
      'BREATHE DEEP',
      'NEURAL ARCHITECTURE',
    ];

    setStudio((prev) => ({
      ...prev,
      color1: randomPalette.colors[0],
      color2: randomPalette.colors[1],
      color3: randomPalette.colors[2],
      angle: Math.floor(Math.random() * 360),
      bgStyle: bgStyles[Math.floor(Math.random() * bgStyles.length)],
      geometricShape: shapes[Math.floor(Math.random() * shapes.length)],
      fontFamily: fonts[Math.floor(Math.random() * fonts.length)],
      text: phrases[Math.floor(Math.random() * phrases.length)],
      noiseIntensity: Math.floor(Math.random() * 30),
    }));
  };

  // One-Click High-Res Download
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `wllpr-studio-${studio.format}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  // Save to Gallery
  const handleSaveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png', 0.92);
    const { width, height } = FORMAT_CONFIG[studio.format];

    const newWallpaper: Wallpaper = {
      id: `studio-${Date.now()}`,
      title: studio.text || 'Custom Studio Creation',
      author: 'You (wllpr Studio)',
      authorHandle: '@studio',
      resolution: width >= 7680 ? '8K' : width >= 3840 ? '4K' : 'HD',
      dimensions: `${width} x ${height}`,
      width,
      height,
      type: studio.format === 'mobile' ? 'Mobile' : 'Desktop',
      tags: ['Abstract', 'Minimalist', studio.bgStyle === 'amoled' ? 'AMOLED' : 'Custom'],
      url: dataUrl,
      thumb: dataUrl,
      palette: [studio.color1, studio.color2, studio.color3],
      downloads: 1,
      likes: 1,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    onSaveToGallery(newWallpaper);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5"
              style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Wallpaper Generator & Canvas
            </span>
            <span className="text-xs text-zinc-500 font-mono">4K Ultra HD Output</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            wllpr Studio
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Design custom minimalist gradients, typography, and AMOLED wallpapers in true native resolution.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            id="studio-shuffle-btn"
            onClick={handleShuffle}
            className="px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-200 hover:text-white hover:bg-[#27272a] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Randomize</span>
          </button>

          <button
            id="studio-save-gallery-btn"
            onClick={handleSaveToGallery}
            className="px-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-200 hover:text-white hover:bg-[#27272a] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Added to Gallery!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" style={{ color: accentColor }} />
                <span>Save to Gallery</span>
              </>
            )}
          </button>

          <button
            id="studio-download-btn"
            onClick={handleDownload}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-black flex items-center gap-2 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              backgroundColor: downloadSuccess ? '#34d399' : accentColor,
              boxShadow: `0 0 20px ${accentColor}40`,
            }}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Export 4K Wallpaper</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Canvas Stage + Controls Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Canvas Stage (8 Cols) */}
        <div className="lg:col-span-8 bg-[#121215] border border-[#27272a] rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[520px] relative overflow-hidden shadow-2xl">
          
          {/* Format Selector Pills Bar */}
          <div className="w-full flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#27272a]">
            <div className="flex items-center gap-1.5 bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
              {(['desktop', 'mobile', 'ultrawide', 'square'] as StudioFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setStudio({ ...studio, format: fmt })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    studio.format === fmt
                      ? 'bg-[#27272a] text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {fmt === 'mobile' ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                  <span className="capitalize">{fmt}</span>
                </button>
              ))}
            </div>

            <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
              {FORMAT_CONFIG[studio.format].width} × {FORMAT_CONFIG[studio.format].height} px
            </span>
          </div>

          {/* Interactive Canvas Canvas Container */}
          <div
            className={`relative transition-all duration-300 flex items-center justify-center max-w-full ${
              previewDevice === 'frame'
                ? studio.format === 'mobile'
                  ? 'border-8 border-[#27272a] rounded-[42px] overflow-hidden shadow-2xl max-h-[580px]'
                  : 'border-8 border-[#27272a] rounded-2xl overflow-hidden shadow-2xl max-h-[480px]'
                : ''
            }`}
          >
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[55vh] object-contain rounded-xl shadow-2xl transition-all"
              style={{
                aspectRatio: FORMAT_CONFIG[studio.format].aspect,
              }}
            />
          </div>

          {/* Canvas Bottom Bar */}
          <div className="mt-6 flex items-center justify-between w-full text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
              Live HTML5 Canvas Engine
            </span>

            <button
              onClick={() => setPreviewDevice(previewDevice === 'clean' ? 'frame' : 'clean')}
              className="text-zinc-400 hover:text-white flex items-center gap-1.5 underline underline-offset-2"
            >
              <Maximize className="w-3.5 h-3.5" />
              Toggle Mockup Frame
            </button>
          </div>

        </div>

        {/* Right: Controls Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Preset Palettes */}
          <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" style={{ color: accentColor }} />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Preset Color Schemes
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_STUDIO_PALETTES.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    setStudio({
                      ...studio,
                      color1: preset.colors[0],
                      color2: preset.colors[1],
                      color3: preset.colors[2],
                    })
                  }
                  className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-zinc-500 transition-all text-left group cursor-pointer"
                >
                  <div className="flex h-4 rounded-md overflow-hidden mb-1.5">
                    {preset.colors.map((c, idx) => (
                      <div key={idx} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-300 font-medium group-hover:text-white block truncate">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Color Stops */}
            <div className="pt-2 border-t border-[#27272a] grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">Color 1 (Deep)</span>
                <div className="flex items-center gap-2 bg-[#18181b] p-1.5 rounded-xl border border-[#27272a]">
                  <input
                    type="color"
                    value={studio.color1}
                    onChange={(e) => setStudio({ ...studio, color1: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-300 uppercase truncate">
                    {studio.color1}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">Color 2 (Accent)</span>
                <div className="flex items-center gap-2 bg-[#18181b] p-1.5 rounded-xl border border-[#27272a]">
                  <input
                    type="color"
                    value={studio.color2}
                    onChange={(e) => setStudio({ ...studio, color2: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-300 uppercase truncate">
                    {studio.color2}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">Color 3 (Vibrant)</span>
                <div className="flex items-center gap-2 bg-[#18181b] p-1.5 rounded-xl border border-[#27272a]">
                  <input
                    type="color"
                    value={studio.color3}
                    onChange={(e) => setStudio({ ...studio, color3: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-zinc-300 uppercase truncate">
                    {studio.color3}
                  </span>
                </div>
              </div>
            </div>

            {/* Style Mode & Angle */}
            <div className="pt-2 border-t border-[#27272a] space-y-3">
              <span className="text-[11px] font-semibold text-zinc-400 block">
                Background Shader
              </span>
              <div className="grid grid-cols-4 gap-1.5 bg-[#18181b] p-1 rounded-xl border border-[#27272a] text-xs">
                {(['linear', 'radial', 'mesh', 'amoled'] as BackgroundStyle[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStudio({ ...studio, bgStyle: st })}
                    className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                      studio.bgStyle === st ? 'bg-[#27272a] text-white shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {studio.bgStyle === 'linear' && (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-400">Angle: {studio.angle}°</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={studio.angle}
                    onChange={(e) => setStudio({ ...studio, angle: Number(e.target.value) })}
                    className="flex-1 accent-cyan-400"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Geometric Accents & Noise Grain */}
          <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" style={{ color: accentColor }} />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Texture & Shapes
              </h2>
            </div>

            <div>
              <span className="text-[11px] text-zinc-400 block mb-1.5">Geometric Accent</span>
              <div className="grid grid-cols-3 gap-1.5 bg-[#18181b] p-1 rounded-xl border border-[#27272a] text-xs">
                {(['none', 'sun', 'rings', 'waves', 'grid'] as StudioState['geometricShape'][]).map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setStudio({ ...studio, geometricShape: shape })}
                    className={`py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                      studio.geometricShape === shape ? 'bg-[#27272a] text-white shadow' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Noise Slider */}
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Analog Film Grain</span>
                <span className="font-mono">{studio.noiseIntensity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                value={studio.noiseIntensity}
                onChange={(e) => setStudio({ ...studio, noiseIntensity: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          {/* Typography Engine */}
          <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" style={{ color: accentColor }} />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Typography & Overlay
              </h2>
            </div>

            <div>
              <span className="text-[11px] text-zinc-400 block mb-1">Center Text</span>
              <input
                type="text"
                value={studio.text}
                onChange={(e) => setStudio({ ...studio, text: e.target.value })}
                placeholder="Custom motto or quote..."
                maxLength={40}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <span className="text-[11px] text-zinc-400 block mb-1">Subtitle</span>
              <input
                type="text"
                value={studio.subtitle}
                onChange={(e) => setStudio({ ...studio, subtitle: e.target.value })}
                placeholder="Optional secondary text..."
                maxLength={50}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Font</span>
                <select
                  value={studio.fontFamily}
                  onChange={(e) => setStudio({ ...studio, fontFamily: e.target.value as StudioFontFamily })}
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="Space Grotesk">Space Grotesk</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Instrument Serif">Instrument Serif</option>
                  <option value="Cinzel">Cinzel</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Font Size: {studio.fontSize}px</span>
                <input
                  type="range"
                  min="24"
                  max="110"
                  value={studio.fontSize}
                  onChange={(e) => setStudio({ ...studio, fontSize: Number(e.target.value) })}
                  className="w-full accent-cyan-400 mt-2"
                />
              </div>
            </div>

            {/* Lockscreen Widget Toggle */}
            <div className="pt-2 border-t border-[#27272a]">
              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  Show Lock-Screen Digital Clock
                </span>
                <input
                  type="checkbox"
                  checked={studio.showWidget}
                  onChange={(e) => setStudio({ ...studio, showWidget: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded"
                />
              </label>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
