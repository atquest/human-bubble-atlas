import { DIMENSIONS } from '../../lib/dimensions';
import type { DimensionDelta } from '../../lib/engine';

interface DistributionStripsProps {
  deltas: DimensionDelta[];
}

function gaussianPoint(x: number, mean: number = 50, std: number = 18): number {
  return Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

function DistributionBar({ delta }: { delta: DimensionDelta }) {
  const dim = DIMENSIONS.find(d => d.id === delta.dimensionId)!;
  const points = Array.from({ length: 50 }, (_, i) => {
    const x = (i / 49) * 100;
    const y = gaussianPoint(x, delta.medianValue, 20);
    return `${(i / 49) * 100}%,${(1 - y) * 100}%`;
  });

  const userPct = delta.userValue;
  const aboveMedian = delta.delta > 0;
  const significantDeviation = Math.abs(delta.delta) > 15;

  const colorClass = significantDeviation
    ? aboveMedian ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--destructive))]'
    : 'text-muted-foreground';

  return (
    <div className="flex flex-col gap-1.5 py-2 border-b border-border last:border-0" data-testid={`distribution-${delta.dimensionId}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground">{delta.label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono tabular-nums ${colorClass}`}>
            {delta.userValue.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground">
            ~{delta.percentile}e perc.
          </span>
        </div>
      </div>

      {/* Distribution bar */}
      <div className="relative h-8 w-full">
        {/* Background track */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-border rounded-full" />

        {/* Shaded area under curve — simple gradient approx */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`grad-${delta.dimensionId}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.2" />
              <stop offset={`${delta.medianValue}%`} stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Gaussian bell curve */}
          <polyline
            points={Array.from({ length: 50 }, (_, i) => {
              const x = (i / 49) * 100;
              const y = gaussianPoint(x, delta.medianValue, 20);
              return `${x},${100 - y * 85}`;
            }).join(' ')}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
          />
        </svg>

        {/* Median marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-muted-foreground opacity-40"
          style={{ left: `${delta.medianValue}%` }}
        />

        {/* User value marker */}
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${userPct}%`, transform: 'translateX(-50%)', top: 0, bottom: 0 }}
        >
          <div className="flex-1" />
          <div
            className="w-3 h-3 rounded-full border-2 border-background shadow"
            style={{ background: significantDeviation ? (aboveMedian ? 'hsl(var(--primary))' : 'hsl(var(--destructive))') : 'hsl(var(--foreground))' }}
          />
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between">
        <span className="text-[10px] text-muted-foreground leading-tight max-w-[40%]">{dim.minLabel}</span>
        <span className="text-[10px] text-muted-foreground leading-tight max-w-[40%] text-right">{dim.maxLabel}</span>
      </div>
    </div>
  );
}

export default function DistributionStrips({ deltas }: DistributionStripsProps) {
  return (
    <div className="flex flex-col" data-testid="distribution-strips">
      {deltas.map(delta => (
        <DistributionBar key={delta.dimensionId} delta={delta} />
      ))}
    </div>
  );
}
