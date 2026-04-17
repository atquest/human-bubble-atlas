import { DIMENSIONS, CLUSTERS } from './dimensions';
import type { Cluster } from '../../../shared/schema';

export interface ProfileAnalysis {
  position: { x: number; y: number }; // 0-100 on each axis
  distanceFromMedian: number; // 0-100
  clusterOverlaps: ClusterOverlap[];
  dimensionDeltas: DimensionDelta[];
  narrativeSummary: string;
  outlierDimensions: string[];
}

export interface ClusterOverlap {
  cluster: Cluster;
  overlap: number; // 0-1
  distance: number; // normalized 0-1
}

export interface DimensionDelta {
  dimensionId: string;
  label: string;
  userValue: number;
  medianValue: number;
  delta: number; // positive = above median
  percentile: number; // estimated percentile
}

const MEDIAN_PROFILE: Record<string, number> = {
  openheid: 50,
  consciëntieusheid: 55,
  introversie: 52,
  normgerichtheid: 60,
  routinebehoefte: 55,
  prikkelgevoeligheid: 45,
  aandachtsregulatie: 60,
  systeemdenken: 50,
};

// Map dimensions to the 2D visualization axes
// X-axis: Conformerend <-> Autonoom (normgerichtheid inverted + openheid)
// Y-axis: Routinegericht <-> Exploratie (routinebehoefte inverted + openheid)
export function computePosition(values: Record<string, number>): { x: number; y: number } {
  const norm = values['normgerichtheid'] ?? 60;
  const open = values['openheid'] ?? 50;
  const routine = values['routinebehoefte'] ?? 55;
  const intro = values['introversie'] ?? 52;

  // X: autonomy axis (100 = fully autonomous, 0 = fully conforming)
  const x = (100 - norm) * 0.55 + open * 0.35 + (100 - intro) * 0.10;
  // Y: exploration axis (100 = high exploration, 0 = high routine)
  const y = open * 0.50 + (100 - routine) * 0.40 + (values['systeemdenken'] ?? 50) * 0.10;

  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y)),
  };
}

// Compute normalized distance between two profiles (0=identical, 1=maximally different)
function profileDistance(a: Record<string, number>, b: Record<string, number>): number {
  const dims = DIMENSIONS.map(d => d.id);
  const squaredSum = dims.reduce((sum, id) => {
    const diff = ((a[id] ?? 50) - (b[id] ?? 50)) / 100;
    return sum + diff * diff;
  }, 0);
  return Math.sqrt(squaredSum / dims.length);
}

// Estimate percentile from value on 0-100 scale using a rough normal distribution
function estimatePercentile(value: number, median: number): number {
  // Assume std dev ~ 20 on 0-100 scale
  const stdDev = 20;
  const z = (value - median) / stdDev;
  // Approximation of normal CDF
  const phi = (x: number) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x >= 0 ? 1 - p : p;
  };
  return Math.round(phi(z) * 100);
}

export function analyzeProfile(values: Record<string, number>): ProfileAnalysis {
  const position = computePosition(values);

  // Distance from median
  const distRaw = profileDistance(values, MEDIAN_PROFILE);
  const distanceFromMedian = Math.round(distRaw * 120); // scale to 0-100+

  // Cluster overlaps
  const clusterOverlaps: ClusterOverlap[] = CLUSTERS.map(cluster => {
    const dist = profileDistance(values, cluster.center);
    // Overlap = 1 when distance = 0, decays with cluster radius
    const overlap = Math.max(0, 1 - dist / (cluster.radius * 1.8));
    return { cluster, overlap, distance: dist };
  }).sort((a, b) => b.overlap - a.overlap);

  // Per-dimension deltas
  const dimensionDeltas: DimensionDelta[] = DIMENSIONS.map(dim => {
    const userVal = values[dim.id] ?? dim.defaultValue;
    const medianVal = MEDIAN_PROFILE[dim.id] ?? 50;
    return {
      dimensionId: dim.id,
      label: dim.label,
      userValue: userVal,
      medianValue: medianVal,
      delta: userVal - medianVal,
      percentile: estimatePercentile(userVal, medianVal),
    };
  });

  // Outlier dimensions (|delta| > 20)
  const outlierDimensions = dimensionDeltas
    .filter(d => Math.abs(d.delta) > 20)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .map(d => d.dimensionId);

  // Narrative
  const narrativeSummary = buildNarrative(dimensionDeltas, clusterOverlaps, distanceFromMedian);

  return { position, distanceFromMedian, clusterOverlaps, dimensionDeltas, narrativeSummary, outlierDimensions };
}

function buildNarrative(
  deltas: DimensionDelta[],
  overlaps: ClusterOverlap[],
  distance: number
): string {
  const lines: string[] = [];

  if (distance < 15) {
    lines.push('Jouw profiel ligt dicht bij de statistische mediaan van de mensheid.');
  } else if (distance < 35) {
    lines.push('Jouw profiel wijkt op een aantal dimensies merkbaar af van de mediaan.');
  } else {
    lines.push('Jouw profiel bevindt zich relatief ver van het statistische middelpunt.');
  }

  const topOutliers = deltas
    .filter(d => Math.abs(d.delta) > 15)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3);

  if (topOutliers.length > 0) {
    const parts = topOutliers.map(d => {
      const direction = d.delta > 0 ? 'duidelijk boven' : 'duidelijk onder';
      return `${direction} de mediaan in ${d.label.toLowerCase()}`;
    });
    lines.push(`Je ligt ${parts.join(', en ')}.`);
  }

  const topClusters = overlaps.filter(o => o.overlap > 0.15).slice(0, 3);
  if (topClusters.length > 0) {
    const names = topClusters.map(o => `"${o.cluster.name}"`).join(', ');
    lines.push(`Jouw profiel overlapt het meest met de cluster${topClusters.length > 1 ? 's' : ''} ${names}.`);
  }

  return lines.join(' ');
}
