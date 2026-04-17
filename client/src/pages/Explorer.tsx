import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'wouter';
import { Moon, Sun, Share2, BookOpen, RefreshCw, Globe, BarChart2, Activity, Layers } from 'lucide-react';
import BubbleUniverse from '../components/viz/BubbleUniverse';
import DistributionStrips from '../components/viz/DistributionStrips';
import TraitRadar from '../components/viz/TraitRadar';
import SliderPanel from '../components/controls/SliderPanel';
import InterpretationPanel from '../components/layout/InterpretationPanel';
import { analyzeProfile } from '../lib/engine';
import { DIMENSIONS, PRESETS } from '../lib/dimensions';
import type { Preset } from '../../../shared/schema';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'bubble' | 'radar' | 'distributions';

const DEFAULT_VALUES = Object.fromEntries(DIMENSIONS.map(d => [d.id, d.defaultValue]));

function getDefaultsFromSearch(): Record<string, number> {
  try {
    const params = new URLSearchParams(window.location.search);
    const vals = { ...DEFAULT_VALUES };
    DIMENSIONS.forEach(d => {
      const v = params.get(d.id);
      if (v !== null) vals[d.id] = Math.max(0, Math.min(100, Number(v)));
    });
    return vals;
  } catch {
    return DEFAULT_VALUES;
  }
}

export default function Explorer() {
  const [values, setValues] = useState<Record<string, number>>(getDefaultsFromSearch);
  const [dark, setDark] = useState(true);
  const [view, setView] = useState<ViewMode>('bubble');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'interpret' | 'dist'>('interpret');
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const analysis = useMemo(() => analyzeProfile(values), [values]);

  const handleChange = useCallback((id: string, value: number) => {
    setValues(prev => ({ ...prev, [id]: value }));
  }, []);

  const handlePreset = useCallback((preset: Preset) => {
    setValues({ ...DEFAULT_VALUES, ...preset.values });
    toast({ title: `Preset: ${preset.name}`, description: preset.note, duration: 3000 });
  }, [toast]);

  const handleReset = useCallback(() => {
    setValues(DEFAULT_VALUES);
  }, []);

  // Toggle dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.classList.toggle('light', !dark);
  }, [dark]);

  // Update URL search state (survives hash routing)
  useEffect(() => {
    const params = new URLSearchParams();
    DIMENSIONS.forEach(d => params.set(d.id, String(Math.round(values[d.id]))));
    window.history.replaceState(null, '', `?${params.toString()}${window.location.hash || '#/'}`);
  }, [values]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({ title: 'Link gekopieerd', description: 'Deel je profiel via de URL in het klembord.', duration: 3000 });
    });
  }, [toast]);

  const viewButtons: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    { id: 'bubble', icon: <Globe size={14} />, label: 'Bubble Map' },
    { id: 'radar', icon: <Activity size={14} />, label: 'Radarplot' },
    { id: 'distributions', icon: <BarChart2 size={14} />, label: 'Distributies' },
  ];

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen overflow-hidden bg-background text-foreground"
      style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
    >
      {/* ─── Topbar ─── */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card/60 backdrop-blur-sm shrink-0 z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mr-3">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Human Bubble Atlas logo">
            <circle cx="14" cy="14" r="12" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="14" cy="14" r="6" fill="hsl(var(--primary))" fillOpacity="0.2" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <circle cx="14" cy="14" r="2.5" fill="hsl(var(--primary))" />
            <circle cx="8" cy="9" r="1.5" fill="hsl(var(--accent))" fillOpacity="0.7" />
            <circle cx="20" cy="10" r="2" fill="hsl(var(--accent))" fillOpacity="0.4" />
            <circle cx="19" cy="20" r="1" fill="hsl(var(--primary))" fillOpacity="0.5" />
          </svg>
          <div>
            <div className="text-sm font-bold leading-none" style={{ fontFamily: "'Cabinet Grotesk', 'Satoshi', sans-serif" }}>
              Human Bubble Atlas
            </div>
            <div className="text-[10px] text-muted-foreground leading-none mt-0.5">Verken de mensheid</div>
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1 border border-border">
          {viewButtons.map(b => (
            <button
              key={b.id}
              onClick={() => setView(b.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === b.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid={`button-view-${b.id}`}
            >
              {b.icon}
              <span className="hidden sm:inline">{b.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Right controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors border border-border"
            data-testid="button-share"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Deel</span>
          </button>
          <Link href="/method">
            <a className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors border border-border" data-testid="link-method">
              <BookOpen size={13} />
              <span className="hidden sm:inline">Methode</span>
            </a>
          </Link>
          <button
            onClick={() => setDark(v => !v)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
            aria-label="Schakel dark/light mode"
            data-testid="button-darkmode"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* ─── Disclaimer banner ─── */}
      {showDisclaimer && (
        <div className="shrink-0 bg-[hsl(var(--muted))] border-b border-border px-4 py-2 flex items-center justify-between gap-4 text-xs text-muted-foreground animate-float-in">
          <span>
            <strong className="text-foreground">Geen diagnose-tool.</strong>{' '}
            Dit is een exploratieve kaart van menselijke variatie — clusters zijn vereenvoudigde patronen, geen biologische soorten.
          </span>
          <button onClick={() => setShowDisclaimer(false)} className="text-muted-foreground hover:text-foreground shrink-0 text-base leading-none" aria-label="Sluit banner">×</button>
        </div>
      )}

      {/* ─── Main layout: sidebar | canvas | panel ─── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left sidebar — sliders */}
        <aside
          className="w-64 shrink-0 border-r border-border overflow-hidden flex flex-col bg-card/40"
          style={{ minWidth: 220, maxWidth: 280 }}
          aria-label="Profiel sliders"
          data-testid="sidebar-sliders"
        >
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Jouw profiel</p>
          </div>
          <SliderPanel values={values} onChange={handleChange} onPreset={handlePreset} onReset={handleReset} />
        </aside>

        {/* Main canvas */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0 bg-background" aria-label="Visualisatie">
          <div className="flex-1 overflow-hidden relative p-4">
            {view === 'bubble' && (
              <BubbleUniverse values={values} analysis={analysis} width={640} height={460} />
            )}
            {view === 'radar' && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full max-w-lg h-80">
                  <TraitRadar values={values} medianValues={{}} />
                </div>
              </div>
            )}
            {view === 'distributions' && (
              <div className="overflow-y-auto h-full overscroll-contain">
                <DistributionStrips deltas={analysis.dimensionDeltas} />
              </div>
            )}
          </div>

          {/* Canvas bottom bar */}
          <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground bg-card/30 shrink-0">
            <span>
              Positie:{' '}
              <span className="text-foreground font-mono">
                x={analysis.position.x.toFixed(0)}, y={analysis.position.y.toFixed(0)}
              </span>
            </span>
            <span>
              Afstand mediaan:{' '}
              <span className="text-foreground font-mono">{Math.min(analysis.distanceFromMedian, 99)}</span>
            </span>
            <span>
              Beste overlap:{' '}
              <span className="text-foreground font-mono">
                {analysis.clusterOverlaps[0]?.cluster.name} ({Math.round(analysis.clusterOverlaps[0]?.overlap * 100)}%)
              </span>
            </span>
            <div className="flex-1" />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] inline-block opacity-70" />
              Betrouwbaar
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] inline-block opacity-70" />
              Schatting
            </span>
          </div>
        </main>

        {/* Right panel — interpretation */}
        <aside
          className="w-60 shrink-0 border-l border-border overflow-hidden flex flex-col bg-card/40"
          style={{ minWidth: 200, maxWidth: 280 }}
          aria-label="Interpretatiepaneel"
          data-testid="panel-interpretation"
        >
          {/* Tab bar */}
          <div className="flex border-b border-border shrink-0">
            {[
              { id: 'interpret' as const, label: 'Uitleg' },
              { id: 'dist' as const, label: 'Verdeling' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightPanelTab(tab.id)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  rightPanelTab === tab.id ? 'text-foreground border-b-2 border-[hsl(var(--primary))]' : 'text-muted-foreground hover:text-foreground'
                }`}
                data-testid={`button-rightpanel-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {rightPanelTab === 'interpret' ? (
              <InterpretationPanel analysis={analysis} />
            ) : (
              <div className="overflow-y-auto h-full overscroll-contain p-3">
                <DistributionStrips deltas={analysis.dimensionDeltas} />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
