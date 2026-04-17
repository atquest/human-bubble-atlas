import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { CLUSTERS } from '../../lib/dimensions';
import { computePosition, analyzeProfile } from '../../lib/engine';
import type { ClusterOverlap } from '../../lib/engine';

interface BubbleUniverseProps {
  values: Record<string, number>;
  analysis: ReturnType<typeof analyzeProfile>;
  width?: number;
  height?: number;
}

interface BubbleNode {
  id: string;
  name: string;
  color: string;
  prevalence: number;
  radius: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  overlap: number;
  description: string;
}

export default function BubbleUniverse({ values, analysis, width = 640, height = 480 }: BubbleUniverseProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const userPos = analysis.position;

  // Map cluster centers to SVG coords
  const clusterBubbles = useMemo<BubbleNode[]>(() => {
    return CLUSTERS.map(cluster => {
      const pos = computePosition(cluster.center);
      const overlap = analysis.clusterOverlaps.find(o => o.cluster.id === cluster.id)?.overlap ?? 0;
      return {
        id: cluster.id,
        name: cluster.name,
        color: cluster.color,
        prevalence: cluster.prevalence,
        radius: Math.sqrt(cluster.prevalence) * Math.min(width, height) * 0.28,
        x: (pos.x / 100) * width,
        y: (1 - pos.y / 100) * height,
        targetX: (pos.x / 100) * width,
        targetY: (1 - pos.y / 100) * height,
        overlap,
        description: cluster.description,
      };
    });
  }, [width, height, analysis]);

  const svgUserX = (userPos.x / 100) * width;
  const svgUserY = (1 - userPos.y / 100) * height;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    // Grid background
    const gridGroup = svg.append('g').attr('class', 'grid');

    // Horizontal grid lines
    for (let i = 1; i < 5; i++) {
      gridGroup.append('line')
        .attr('x1', 0).attr('y1', (i / 5) * height)
        .attr('x2', width).attr('y2', (i / 5) * height)
        .attr('stroke', 'currentColor').attr('stroke-opacity', 0.07)
        .attr('stroke-width', 1).attr('stroke-dasharray', '4,4');
    }
    for (let i = 1; i < 5; i++) {
      gridGroup.append('line')
        .attr('x1', (i / 5) * width).attr('y1', 0)
        .attr('x2', (i / 5) * width).attr('y2', height)
        .attr('stroke', 'currentColor').attr('stroke-opacity', 0.07)
        .attr('stroke-width', 1).attr('stroke-dasharray', '4,4');
    }

    // Axis labels
    const axisLabelStyle = { fill: 'currentColor', opacity: 0.35, fontSize: 10, fontFamily: 'Satoshi, sans-serif' };
    svg.append('text').text('← Normconform').attr('x', 8).attr('y', height / 2 - 4)
      .attr('fill', axisLabelStyle.fill).attr('opacity', axisLabelStyle.opacity)
      .attr('font-size', axisLabelStyle.fontSize).attr('font-family', axisLabelStyle.fontFamily);
    svg.append('text').text('Autonoom →').attr('x', width - 72).attr('y', height / 2 - 4)
      .attr('fill', axisLabelStyle.fill).attr('opacity', axisLabelStyle.opacity)
      .attr('font-size', axisLabelStyle.fontSize).attr('font-family', axisLabelStyle.fontFamily);
    svg.append('text').text('← Routine').attr('x', 8).attr('y', height - 8)
      .attr('fill', axisLabelStyle.fill).attr('opacity', axisLabelStyle.opacity)
      .attr('font-size', axisLabelStyle.fontSize).attr('font-family', axisLabelStyle.fontFamily);
    svg.append('text').text('Exploratief →').attr('x', 8).attr('y', 14)
      .attr('fill', axisLabelStyle.fill).attr('opacity', axisLabelStyle.opacity)
      .attr('font-size', axisLabelStyle.fontSize).attr('font-family', axisLabelStyle.fontFamily);

    // Glow filter for user dot
    const filter = defs.append('filter').attr('id', 'user-glow');
    filter.append('feGaussianBlur').attr('stdDeviation', 6).attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw cluster bubbles
    const bubblesGroup = svg.append('g').attr('class', 'bubbles');

    clusterBubbles.forEach((b, i) => {
      const overlapOpacity = 0.12 + b.overlap * 0.28;
      const strokeOpacity = 0.25 + b.overlap * 0.45;

      const gradId = `grad-${b.id}`;
      const grad = defs.append('radialGradient').attr('id', gradId)
        .attr('cx', '40%').attr('cy', '35%').attr('r', '70%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', b.color).attr('stop-opacity', overlapOpacity + 0.1);
      grad.append('stop').attr('offset', '100%').attr('stop-color', b.color).attr('stop-opacity', overlapOpacity * 0.4);

      const g = bubblesGroup.append('g').attr('class', 'bubble-group').style('cursor', 'pointer');

      // Halo for overlapping clusters
      if (b.overlap > 0.15) {
        g.append('circle')
          .attr('cx', b.x).attr('cy', b.y)
          .attr('r', b.radius + 8)
          .attr('fill', 'none')
          .attr('stroke', b.color)
          .attr('stroke-opacity', b.overlap * 0.3)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '6,4');
      }

      // Main bubble
      g.append('circle')
        .attr('cx', b.x).attr('cy', b.y)
        .attr('r', b.radius)
        .attr('fill', `url(#${gradId})`)
        .attr('stroke', b.color)
        .attr('stroke-opacity', strokeOpacity)
        .attr('stroke-width', 1.5)
        .style('transition', 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)');

      // Cluster initial letter as subtle visual identifier (no overlap risk)
      if (b.radius > 40) {
        g.append('text')
          .text(b.name.charAt(0))
          .attr('x', b.x)
          .attr('y', b.y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', b.color)
          .attr('font-size', Math.min(b.radius * 0.45, 42))
          .attr('font-family', 'Cabinet Grotesk, Satoshi, sans-serif')
          .attr('font-weight', '800')
          .attr('opacity', 0.12)
          .attr('pointer-events', 'none');
      }

      // Tooltip interaction
      g.on('mouseenter', function(event) {
        d3.select(this).select('circle').transition().duration(200).attr('r', b.radius * 1.04);
        tooltip.style('opacity', 1)
          .html(`<strong style="color:${b.color}">${b.name}</strong><br/><span style="font-size:11px;opacity:0.8">${b.description}</span><br/><span style="font-size:10px;opacity:0.6">Overlap: ${Math.round(b.overlap * 100)}%</span>`);
      })
      .on('mousemove', function(event) {
        const rect = svgRef.current!.getBoundingClientRect();
        const relX = event.clientX - rect.left;
        const relY = event.clientY - rect.top;
        tooltip
          .style('left', `${relX + 12}px`)
          .style('top', `${relY - 8}px`);
      })
      .on('mouseleave', function() {
        d3.select(this).select('circle').transition().duration(200).attr('r', b.radius);
        tooltip.style('opacity', 0);
      });
    });

    // User position dot
    const userGroup = svg.append('g').attr('class', 'user-position');

    // Pulse ring
    userGroup.append('circle')
      .attr('cx', svgUserX).attr('cy', svgUserY)
      .attr('r', 14)
      .attr('fill', 'none')
      .attr('stroke', '#ffffff')
      .attr('stroke-opacity', 0.25)
      .attr('stroke-width', 1.5);

    // Crosshair lines
    userGroup.append('line')
      .attr('x1', svgUserX - 20).attr('y1', svgUserY)
      .attr('x2', svgUserX + 20).attr('y2', svgUserY)
      .attr('stroke', '#ffffff').attr('stroke-opacity', 0.3).attr('stroke-width', 1);
    userGroup.append('line')
      .attr('x1', svgUserX).attr('y1', svgUserY - 20)
      .attr('x2', svgUserX).attr('y2', svgUserY + 20)
      .attr('stroke', '#ffffff').attr('stroke-opacity', 0.3).attr('stroke-width', 1);

    // User dot
    userGroup.append('circle')
      .attr('cx', svgUserX).attr('cy', svgUserY)
      .attr('r', 8)
      .attr('fill', '#ffffff')
      .attr('filter', 'url(#user-glow)')
      .attr('stroke', 'none');

    userGroup.append('text')
      .text('jij')
      .attr('x', svgUserX + 12).attr('y', svgUserY - 10)
      .attr('fill', '#ffffff')
      .attr('font-size', 11)
      .attr('font-family', 'Cabinet Grotesk, Satoshi, sans-serif')
      .attr('font-weight', '700')
      .attr('opacity', 0.85);

  }, [clusterBubbles, svgUserX, svgUserY, width, height]);

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full text-foreground"
        aria-label="Bubble Universe: mensheidskaart met jouw positie"
        role="img"
      />
      <div
        ref={tooltipRef}
        className="bubble-tooltip absolute pointer-events-none bg-card border border-border rounded-lg p-3 text-sm max-w-56 shadow-xl opacity-0 transition-opacity duration-150"
        style={{ position: 'absolute' }}
      />
    </div>
  );
}
