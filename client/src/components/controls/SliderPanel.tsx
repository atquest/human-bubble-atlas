import { useState } from 'react';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';
import { DIMENSIONS, PRESETS } from '../../lib/dimensions';
import type { Dimension, Preset } from '../../../../shared/schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SliderPanelProps {
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
  onPreset: (preset: Preset) => void;
  onReset: () => void;
}

function DimensionSlider({ dim, value, onChange }: { dim: Dimension; value: number; onChange: (v: number) => void }) {
  const medianValue = {
    openheid: 50, consciëntieusheid: 55, introversie: 52,
    normgerichtheid: 60, routinebehoefte: 55,
    prikkelgevoeligheid: 45, aandachtsregulatie: 60, systeemdenken: 50,
  }[dim.id] ?? 50;

  const delta = value - medianValue;
  const aboveMedian = delta > 5;
  const belowMedian = delta < -5;

  const confidenceColors = { high: 'bg-[hsl(var(--primary))]', medium: 'bg-[hsl(var(--accent))]', low: 'bg-muted-foreground' };

  return (
    <div className="group flex flex-col gap-1.5 px-4 py-2.5 hover:bg-white/[0.02] rounded-lg transition-colors" data-testid={`slider-${dim.id}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${confidenceColors[dim.confidenceLevel]}`} />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-52 text-xs">
                <p className="font-medium mb-1">Betrouwbaarheid: {dim.confidenceLevel === 'high' ? 'Hoog' : dim.confidenceLevel === 'medium' ? 'Middel' : 'Laag'}</p>
                <p>{dim.description}</p>
                <p className="mt-1 opacity-60 italic">Bron: {dim.source}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-xs font-medium text-foreground truncate">{dim.label}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {aboveMedian && <span className="text-[10px] text-[hsl(var(--primary))] font-medium">+{delta.toFixed(0)}</span>}
          {belowMedian && <span className="text-[10px] text-[hsl(var(--destructive))] font-medium">{delta.toFixed(0)}</span>}
          <span className="text-xs font-mono tabular-nums text-muted-foreground w-7 text-right">{value}</span>
        </div>
      </div>

      <div className="relative">
        {/* Median marker */}
        <div
          className="absolute top-0 bottom-0 flex items-center pointer-events-none"
          style={{ left: `${medianValue}%` }}
        >
          <div className="w-px h-2 bg-muted-foreground opacity-40" />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full"
          aria-label={dim.label}
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${value}%, hsl(var(--border)) ${value}%)`
          }}
          data-testid={`input-${dim.id}`}
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span className="max-w-[45%] leading-tight">{dim.minLabel}</span>
        <span className="max-w-[45%] text-right leading-tight">{dim.maxLabel}</span>
      </div>
    </div>
  );
}

const GROUP_LABELS = {
  cognitive: 'Cognitief',
  personality: 'Persoonlijkheid',
  neurotype: 'Neurotype',
  social: 'Sociaal-Cultureel',
};

export default function SliderPanel({ values, onChange, onPreset, onReset }: SliderPanelProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['personality', 'social']));
  const [showPresets, setShowPresets] = useState(false);

  const toggleGroup = (g: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  };

  const groups = ['personality', 'cognitive', 'neurotype', 'social'] as const;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Presets */}
      <div className="px-4 py-3 border-b border-border">
        <button
          onClick={() => setShowPresets(v => !v)}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors w-full"
          data-testid="button-presets-toggle"
        >
          {showPresets ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          Presets laden
        </button>
        {showPresets && (
          <div className="mt-2 flex flex-col gap-1">
            {PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => { onPreset(preset); setShowPresets(false); }}
                className="text-left px-3 py-1.5 rounded-md text-xs hover:bg-white/[0.05] text-foreground transition-colors"
                data-testid={`button-preset-${preset.id}`}
              >
                <span className="font-medium">{preset.name}</span>
                <span className="text-muted-foreground ml-1.5">{preset.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dimension sliders by group */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {groups.map(group => {
          const dims = DIMENSIONS.filter(d => d.axisGroup === group);
          const isOpen = openGroups.has(group);
          return (
            <div key={group} className="border-b border-border">
              <button
                onClick={() => toggleGroup(group)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors w-full"
                data-testid={`button-group-${group}`}
              >
                {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {GROUP_LABELS[group]}
              </button>
              {isOpen && (
                <div className="pb-2">
                  {dims.map(dim => (
                    <DimensionSlider
                      key={dim.id}
                      dim={dim}
                      value={values[dim.id] ?? dim.defaultValue}
                      onChange={v => onChange(dim.id, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer controls */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <button
          onClick={onReset}
          className="flex-1 text-xs px-3 py-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          data-testid="button-reset"
        >
          Terug naar mediaan
        </button>
      </div>
    </div>
  );
}
