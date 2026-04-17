import { useMemo } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { DIMENSIONS } from '../../lib/dimensions';
import type { DimensionDelta } from '../../lib/engine';

interface TraitRadarProps {
  values: Record<string, number>;
  medianValues: Record<string, number>;
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

export default function TraitRadar({ values }: TraitRadarProps) {
  const data = useMemo(() => {
    return DIMENSIONS.map(dim => ({
      subject: dim.label.split(' ')[0], // Short label
      fullLabel: dim.label,
      jij: values[dim.id] ?? dim.defaultValue,
      mediaan: MEDIAN_PROFILE[dim.id] ?? 50,
    }));
  }, [values]);

  return (
    <div className="w-full h-full" data-testid="trait-radar">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontFamily: 'Satoshi, sans-serif' }}
          />
          <Radar
            name="Mediaan"
            dataKey="mediaan"
            stroke="hsl(var(--muted-foreground))"
            fill="hsl(var(--muted-foreground))"
            fillOpacity={0.08}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
          <Radar
            name="Jij"
            dataKey="jij"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'Satoshi, sans-serif', color: 'hsl(var(--muted-foreground))' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
