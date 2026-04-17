// No backend needed — pure client-side app
// Schema defines types only, no DB tables

export type ScaleType = 'continuous' | 'percentage' | 'zscore';

export interface Dimension {
  id: string;
  label: string;
  description: string;
  scaleType: ScaleType;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  defaultValue: number; // median = 0 on z-score scale, 50 on percentage scale
  confidenceLevel: 'high' | 'medium' | 'low';
  source: string;
  cultureSensitive: boolean;
  axisGroup: 'cognitive' | 'personality' | 'neurotype' | 'social';
}

export interface Cluster {
  id: string;
  name: string;
  description: string;
  center: Record<string, number>; // dimension id -> value (0-100 scale)
  radius: number; // 0-1, relative prevalence
  prevalence: number; // 0-1
  color: string;
  family: 'mainstream' | 'analytical' | 'creative' | 'neurodivergent' | 'autonomous' | 'social';
  warning: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  values: Record<string, number>; // dimension id -> 0-100
  note: string;
}

export interface UserProfile {
  values: Record<string, number>;
}
