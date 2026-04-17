import { CLUSTERS } from '../../lib/dimensions';
import type { ProfileAnalysis } from '../../lib/engine';
import { Info, AlertTriangle } from 'lucide-react';

interface InterpretationPanelProps {
  analysis: ProfileAnalysis;
}

function ClusterOverlapBar({ name, overlap, color }: { name: string; overlap: number; color: string }) {
  return (
    <div className="flex flex-col gap-1" data-testid={`overlap-${name}`}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs text-foreground" style={{ wordBreak: 'break-word', lineHeight: 1.3 }}>{name}</span>
        <span className="text-xs font-mono tabular-nums shrink-0" style={{ color }}>{Math.round(overlap * 100)}%</span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${overlap * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function InterpretationPanel({ analysis }: InterpretationPanelProps) {
  const { distanceFromMedian, clusterOverlaps, dimensionDeltas, narrativeSummary } = analysis;

  const topOverlaps = clusterOverlaps.filter(o => o.overlap > 0.05).slice(0, 4);
  const topOutliers = dimensionDeltas
    .filter(d => Math.abs(d.delta) > 10)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4);

  const distanceLabel =
    distanceFromMedian < 15 ? { text: 'Dicht bij de mediaan', color: 'text-[hsl(var(--primary))]' }
    : distanceFromMedian < 35 ? { text: 'Merkbaar afwijkend', color: 'text-[hsl(var(--accent))]' }
    : { text: 'Ver van de mediaan', color: 'text-[hsl(var(--destructive))]' };

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto overscroll-contain h-full" data-testid="interpretation-panel">

      {/* Distance from median */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Afstand tot mediaan</h3>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="14" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeDasharray={`${Math.min(distanceFromMedian, 100) * 0.88} 88`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums">
              {Math.min(distanceFromMedian, 99)}
            </span>
          </div>
          <div>
            <p className={`text-sm font-semibold ${distanceLabel.color}`}>{distanceLabel.text}</p>
            <p className="text-xs text-muted-foreground leading-snug mt-0.5">
              Score 0 = identiek aan mediaan; 100 = maximaal afwijkend
            </p>
          </div>
        </div>
      </section>

      {/* Narrative summary */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Interpretatie</h3>
        <p className="text-sm text-foreground leading-relaxed">{narrativeSummary}</p>
      </section>

      {/* Cluster overlaps */}
      {topOverlaps.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Clusteroverlap</h3>
          <div className="flex flex-col gap-2.5">
            {topOverlaps.map(o => (
              <ClusterOverlapBar
                key={o.cluster.id}
                name={o.cluster.name}
                overlap={o.overlap}
                color={o.cluster.color}
              />
            ))}
          </div>
        </section>
      )}

      {/* Top outlier dimensions */}
      {topOutliers.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Grootste afwijkingen</h3>
          <div className="flex flex-col gap-1.5">
            {topOutliers.map(d => {
              const above = d.delta > 0;
              return (
                <div key={d.dimensionId} className="flex items-center gap-2">
                  <div
                    className="w-1 h-4 rounded-full shrink-0"
                    style={{ background: above ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}
                  />
                  <span className="text-xs text-foreground flex-1">{d.label}</span>
                  <span className="text-xs font-mono tabular-nums text-muted-foreground">
                    {above ? '+' : ''}{d.delta.toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="flex gap-2 p-3 bg-white/[0.03] border border-border rounded-lg mt-auto">
        <AlertTriangle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Dit is <strong className="text-foreground">geen diagnose</strong> en geen absolute waarheid.
          Clusters zijn vereenvoudigde patronen. Zelfinschatting is ruisgevoelig.
          Gebruik dit als exploratief hulpmiddel, niet als klinische beoordeling.
        </p>
      </section>
    </div>
  );
}
