export type DeviceType = 'All' | 'Desktop' | 'Mobile' | 'AMOLED';

export type Category = 
  | 'All'
  | 'Minimalist'
  | 'Cyberpunk'
  | 'Nature'
  | 'Abstract'
  | 'Architecture'
  | 'Anime'
  | 'Space'
  | 'Cars'
  | 'Animals'
  | 'Gaming'
  | 'AMOLED';

export type ViewMode = 'explore' | 'studio' | 'favorites' | 'moderation';

export type ModerationStatus = 'approved' | 'pending' | 'rejected';

export type SortOption = 'popular' | 'newest' | 'resolution' | 'title';

export interface Wallpaper {
  id: string | number;
  title: string;
  author: string;
  authorHandle?: string;
  authorUrl?: string;
  resolution: '4K' | '5K' | '8K' | 'HD';
  dimensions: string;
  width: number;
  height: number;
  type: 'Desktop' | 'Mobile';
  tags: string[];
  url: string;
  thumb: string;
  palette: string[];
  downloads?: number;
  likes?: number;
  isCustom?: boolean;
  isUpload?: boolean;
  fileSize?: string;
  moderationStatus?: ModerationStatus;
  moderationNotes?: string;
  createdAt?: string;
}

export type StudioFormat = 'desktop' | 'mobile' | 'ultrawide' | 'square';

export type BackgroundStyle = 'linear' | 'radial' | 'mesh' | 'stripes' | 'amoled';

export type StudioFontFamily = 'Plus Jakarta Sans' | 'Space Grotesk' | 'Instrument Serif' | 'Cinzel' | 'JetBrains Mono';

export type StudioBadge = 'none' | 'star' | 'moon' | 'mountain' | 'compass' | 'code' | 'pulse';

export interface StudioState {
  format: StudioFormat;
  bgStyle: BackgroundStyle;
  color1: string;
  color2: string;
  color3: string;
  angle: number;
  text: string;
  subtitle: string;
  textColor: string;
  fontFamily: StudioFontFamily;
  fontSize: number;
  textShadow: boolean;
  letterSpacing: number;
  showWidget: boolean;
  badge: StudioBadge;
  noiseIntensity: number; // 0 to 100
  geometricShape: 'none' | 'sun' | 'rings' | 'grid' | 'waves' | 'particles';
  shapeOpacity: number;
}
