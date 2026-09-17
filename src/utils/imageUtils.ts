export interface ExtractedImageInfo {
  width: number;
  height: number;
  dimensions: string;
  resolution: '4K' | '5K' | '8K' | 'HD';
  type: 'Desktop' | 'Mobile';
  palette: string[];
}

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type || 'unknown'}). Please upload a PNG, JPG, WebP, or AVIF image.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 20 MB.`,
    };
  }

  return { valid: true };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function determineResolution(width: number, height: number): '4K' | '5K' | '8K' | 'HD' {
  const maxDim = Math.max(width, height);
  if (maxDim >= 7680) return '8K';
  if (maxDim >= 5120) return '5K';
  if (maxDim >= 3840) return '4K';
  return 'HD';
}

export function extractImageMetadata(img: HTMLImageElement): ExtractedImageInfo {
  const width = img.naturalWidth || img.width || 1920;
  const height = img.naturalHeight || img.height || 1080;
  const type = width >= height ? 'Desktop' : 'Mobile';
  const resolution = determineResolution(width, height);
  const dimensions = `${width} x ${height}`;

  // Extract color palette via small canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const palette: string[] = [];

  if (ctx) {
    // Resize to small 32x32 thumbnail for fast dominant color sampling
    canvas.width = 32;
    canvas.height = 32;
    ctx.drawImage(img, 0, 0, 32, 32);

    try {
      const imageData = ctx.getImageData(0, 0, 32, 32).data;
      const colorBins: { [hex: string]: number } = {};

      for (let i = 0; i < imageData.length; i += 16) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];

        if (a > 128) {
          // Quantize to avoid subtle variations
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
          colorBins[hex] = (colorBins[hex] || 0) + 1;
        }
      }

      // Sort by frequency
      const sorted = Object.keys(colorBins).sort((a, b) => colorBins[b] - colorBins[a]);
      palette.push(...sorted.slice(0, 5));
    } catch {
      // Fallback palette if tainted
      palette.push('#18181b', '#27272a', '#22d3ee', '#f43f5e', '#ffffff');
    }
  }

  // If palette is short, pad with nice defaults
  while (palette.length < 4) {
    palette.push('#18181b');
  }

  return {
    width,
    height,
    dimensions,
    resolution,
    type,
    palette,
  };
}
