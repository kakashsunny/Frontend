import React, { useRef, useEffect, useState } from 'react';
import { DNANode, DNAFilterLayer, FinancialDataset, Transaction } from '../types';

interface FinancialDNACanvasProps {
  dataset: FinancialDataset | null;
  activeLayer: DNAFilterLayer;
  selectedTransaction: Transaction | null;
  onSelectTransaction: (tx: Transaction | null) => void;
  isSequencing?: boolean;
  highlightedTxIds?: string[];
  highlightColor?: string;
  isInvestigating?: boolean;
  investigationStepText?: string;
}

interface Particle3D {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  angle: number;
  speed: number;
  height: number;
  color: string;
  size: number;
  layer: 'spending' | 'income' | 'risk' | 'habit' | 'pattern';
  alpha: number;
  txRef?: Transaction;
  pulsePhase: number;
}

export const FinancialDNACanvas: React.FC<FinancialDNACanvasProps> = ({
  dataset,
  activeLayer,
  selectedTransaction,
  onSelectTransaction,
  isSequencing = false,
  highlightedTxIds = [],
  highlightColor = '#22D3EE',
  isInvestigating = false,
  investigationStepText
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredTx, setHoveredTx] = useState<Transaction | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const sym = dataset?.currencySymbol || '₹';
  const hasHighlights = highlightedTxIds && highlightedTxIds.length > 0;

  // Mouse & drag rotation interaction
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetRotX: 0.15,
    targetRotY: 0,
    currentRotX: 0.15,
    currentRotY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate 3D Particle system from dataset or latent ambient spiral
    const particles: Particle3D[] = [];
    const numAmbient = 140;

    // 1. Ambient Double-Helix particles
    for (let i = 0; i < numAmbient; i++) {
      const strand = i % 2 === 0 ? 1 : -1;
      const t = (i / numAmbient) * Math.PI * 4;
      const radius = 120 + Math.sin(t * 2) * 20;
      const strandAngle = t + (strand === 1 ? 0 : Math.PI);
      const h = (i / numAmbient - 0.5) * 440;

      particles.push({
        x: Math.cos(strandAngle) * radius,
        y: h,
        z: Math.sin(strandAngle) * radius,
        baseRadius: radius,
        angle: strandAngle,
        speed: 0.008 + (i % 5) * 0.001,
        height: h,
        color: strand === 1 ? '#10B981' : '#06B6D4',
        size: 1.6 + Math.random() * 1.4,
        layer: strand === 1 ? 'income' : 'spending',
        alpha: 0.45 + Math.random() * 0.35,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // 2. Transaction nodes from loaded dataset
    if (dataset && dataset.transactions.length > 0) {
      dataset.transactions.forEach((tx, idx) => {
        let layer: Particle3D['layer'] = 'spending';
        let color = '#38BDF8';
        let radius = 160 + (idx % 4) * 28;

        if (tx.type === 'income') {
          layer = 'income';
          color = '#34D399';
          radius = 90 + (idx % 3) * 20;
        } else if (tx.status === 'anomaly') {
          layer = 'risk';
          color = '#F43F5E';
          radius = 240 + (idx % 2) * 35;
        } else if (tx.isSubscription) {
          layer = 'habit';
          color = '#A855F7';
          radius = 180 + (idx % 3) * 25;
        } else if (tx.category.includes('Tech') || tx.category.includes('Cloud')) {
          layer = 'pattern';
          color = '#06B6D4';
          radius = 210;
        }

        const angle = (idx / dataset.transactions.length) * Math.PI * 2 * 1.5;
        const h = ((idx / dataset.transactions.length) - 0.5) * 360;

        particles.push({
          x: Math.cos(angle) * radius,
          y: h,
          z: Math.sin(angle) * radius,
          baseRadius: radius,
          angle: angle,
          speed: (tx.status === 'anomaly' ? 0.015 : 0.006) + (idx % 3) * 0.002,
          height: h,
          color: color,
          size: tx.status === 'anomaly' ? 4.8 : tx.amount > 1000 ? 4.2 : 3.0,
          layer: layer,
          alpha: 0.9,
          txRef: tx,
          pulsePhase: Math.random() * Math.PI * 2
        });
      });
    }

    let time = 0;
    let scanLineY = 0;

    const render = () => {
      time += 0.016;

      // Spin faster when AI investigation is actively scanning
      const spinSpeed = isInvestigating ? 0.45 : 0.15;

      // Smooth interpolation for mouse rotation
      mouseRef.current.currentRotX += (mouseRef.current.targetRotX - mouseRef.current.currentRotX) * 0.06;
      mouseRef.current.currentRotY += (mouseRef.current.targetRotY - mouseRef.current.currentRotY) * 0.06;

      const rotX = mouseRef.current.currentRotX;
      const rotY = mouseRef.current.currentRotY + time * spinSpeed;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 480;

      // 1. Draw subtle orbital guide rings in background
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      [100, 170, 230, 290].forEach((r) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw concentric axis crosshairs
      ctx.strokeStyle = isInvestigating ? 'rgba(34, 211, 238, 0.15)' : 'rgba(6, 182, 212, 0.08)';
      ctx.beginPath();
      ctx.moveTo(cx - 300, cy);
      ctx.lineTo(cx + 300, cy);
      ctx.moveTo(cx, cy - 200);
      ctx.lineTo(cx, cy + 200);
      ctx.stroke();
      ctx.restore();

      // 2. Active AI Laser Scan-Plane when investigating
      if (isInvestigating) {
        scanLineY = cy + Math.sin(time * 3) * 180;
        ctx.save();
        const scanGrad = ctx.createLinearGradient(0, scanLineY - 25, 0, scanLineY + 25);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.2)');
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanLineY - 25, width, 50);

        ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(0, scanLineY);
        ctx.lineTo(width, scanLineY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 3. Transform & Sort particles by Z-depth
      const projected = particles.map((p) => {
        // Animate angle & orbital drift
        const currentAngle = p.angle + time * (isInvestigating ? p.speed * 2.5 : p.speed);
        const currentRadius = p.baseRadius + Math.sin(time * 2 + p.pulsePhase) * 6;
        const currentHeight = p.height + Math.cos(time * 1.5 + p.pulsePhase) * 8;

        const px = Math.cos(currentAngle) * currentRadius;
        const py = currentHeight;
        const pz = Math.sin(currentAngle) * currentRadius;

        // 3D rotation Y
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;

        // 3D rotation X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        // Perspective projection
        const scale = fov / (fov + z2 + 200);
        const screenX = cx + x1 * scale;
        const screenY = cy + y2 * scale;

        const isHighlighted = p.txRef && highlightedTxIds.includes(p.txRef.id);

        return {
          particle: p,
          screenX,
          screenY,
          scale,
          z: z2,
          isHighlighted: !!isHighlighted
        };
      });

      // Sort back-to-front
      projected.sort((a, b) => b.z - a.z);

      // 4. Draw Connective Lattice Threads
      ctx.save();
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i += 3) {
        for (let j = i + 1; j < Math.min(projected.length, i + 6); j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          // If Copilot has highlighted items, connect highlighted nodes with laser lines
          if (hasHighlights) {
            if (p1.isHighlighted && p2.isHighlighted) {
              const dx = p1.screenX - p2.screenX;
              const dy = p1.screenY - p2.screenY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 180) {
                ctx.strokeStyle = highlightColor;
                ctx.globalAlpha = (1 - dist / 180) * 0.6 * Math.min(p1.scale, p2.scale);
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(p1.screenX, p1.screenY);
                ctx.lineTo(p2.screenX, p2.screenY);
                ctx.stroke();
              }
              continue;
            } else {
              continue;
            }
          }

          // Normal layer match
          if (activeLayer !== 'all') {
            if (p1.particle.layer !== activeLayer && p2.particle.layer !== activeLayer) continue;
          }

          const dx = p1.screenX - p2.screenX;
          const dy = p1.screenY - p2.screenY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            const alpha = (1 - dist / 85) * 0.18 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = p1.particle.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(p1.screenX, p1.screenY);
            ctx.lineTo(p2.screenX, p2.screenY);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // 5. Render Particles
      let closestTxUnderMouse: Transaction | null = null;
      let minMouseDist = 26;

      projected.forEach((item) => {
        const { particle, screenX, screenY, scale, isHighlighted } = item;

        // Layer filtering & highlight dimming check
        let isLayerDimmed = false;
        if (hasHighlights) {
          if (!isHighlighted) {
            isLayerDimmed = true;
          }
        } else if (activeLayer !== 'all') {
          if (particle.layer !== activeLayer) {
            isLayerDimmed = true;
          }
        }

        const effectiveAlpha = isLayerDimmed ? particle.alpha * 0.08 : particle.alpha;
        const baseSize = (particle.size * scale) * (isLayerDimmed ? 0.6 : 1.0);
        const effectiveSize = isHighlighted ? baseSize * 1.8 : baseSize;
        const renderColor = isHighlighted ? highlightColor : particle.color;

        // Check cursor hover
        const mdx = mousePos.x - screenX;
        const mdy = mousePos.y - screenY;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (particle.txRef && mdist < minMouseDist) {
          closestTxUnderMouse = particle.txRef;
          minMouseDist = mdist;
        }

        const isSelected = selectedTransaction && particle.txRef?.id === selectedTransaction.id;
        const isHovered = hoveredTx && particle.txRef?.id === hoveredTx.id;

        ctx.save();

        // Glowing outer halo for highlighted or hovered nodes
        if (particle.txRef || isSelected || isHovered || isHighlighted) {
          const glowRadius = effectiveSize * (isHighlighted ? 4.5 : isSelected || isHovered ? 4.0 : 2.5);
          const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, glowRadius);
          gradient.addColorStop(0, renderColor);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.globalAlpha = effectiveAlpha * (isHighlighted ? 0.85 : isSelected || isHovered ? 0.9 : 0.4);
          ctx.beginPath();
          ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw node core
        ctx.fillStyle = isSelected || isHovered ? '#FFFFFF' : renderColor;
        ctx.globalAlpha = effectiveAlpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(1, effectiveSize * (isSelected || isHovered ? 1.4 : 1.0)), 0, Math.PI * 2);
        ctx.fill();

        // Pulsing radar reticle for anomalies & Copilot highlighted nodes
        if ((isHighlighted || particle.layer === 'risk') && !isLayerDimmed) {
          const pulseR = effectiveSize * (2.4 + Math.sin(time * 5 + particle.pulsePhase) * 0.8);
          ctx.strokeStyle = renderColor;
          ctx.lineWidth = isHighlighted ? 1.4 : 1.0;
          ctx.globalAlpha = 0.7 + Math.sin(time * 4) * 0.3;
          ctx.beginPath();
          ctx.arc(screenX, screenY, pulseR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Selected / Hovered Reticle HUD
        if (isSelected || isHovered) {
          ctx.strokeStyle = '#22D3EE';
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.95;

          // Diamond targeting brackets
          const bracketSize = 16;
          ctx.strokeRect(screenX - bracketSize / 2, screenY - bracketSize / 2, bracketSize, bracketSize);

          // Label tooltip
          if (particle.txRef) {
            ctx.font = '600 10px "JetBrains Mono", monospace';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`${particle.txRef.merchant} (${sym}${particle.txRef.amount.toFixed(0)})`, screenX + 14, screenY - 8);
          }
        }

        ctx.restore();
      });

      if (closestTxUnderMouse !== hoveredTx) {
        setHoveredTx(closestTxUnderMouse);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [dataset, activeLayer, selectedTransaction, hoveredTx, mousePos, highlightedTxIds, highlightColor, isInvestigating]);

  // Pointer event handlers for interactive 3D rotation & hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (mouseRef.current.isDragging) {
      const deltaX = x - mouseRef.current.lastX;
      const deltaY = y - mouseRef.current.lastY;
      mouseRef.current.targetRotY += deltaX * 0.008;
      mouseRef.current.targetRotX = Math.max(-0.6, Math.min(0.6, mouseRef.current.targetRotX + deltaY * 0.006));
      mouseRef.current.lastX = x;
      mouseRef.current.lastY = y;
    } else {
      const normX = (x / rect.width - 0.5) * 2;
      const normY = (y / rect.height - 0.5) * 2;
      mouseRef.current.targetRotY = normX * 0.4;
      mouseRef.current.targetRotX = 0.15 + normY * 0.25;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current.isDragging = true;
    mouseRef.current.lastX = e.clientX - rect.left;
    mouseRef.current.lastY = e.clientY - rect.top;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDragging = false;
  };

  const handleClick = () => {
    if (hoveredTx) {
      onSelectTransaction(hoveredTx);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      className="relative w-full h-[480px] sm:h-[560px] lg:h-[640px] select-none cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-[#080B11]/90 via-[#05070B]/95 to-[#040508]"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Tactical Layer Indicators */}
      <div className="absolute top-5 left-6 pointer-events-none flex flex-col space-y-1 z-10">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isInvestigating ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
          <span className="text-[11px] font-mono-num font-bold tracking-widest text-slate-300 uppercase">
            3D Financial DNA Helix
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono-num">
          {dataset
            ? hasHighlights
              ? `${highlightedTxIds.length} Target Nodes Isolated • Copilot Focus Active`
              : `${dataset.transactions.length} Vectorized Nodes • ${activeLayer.toUpperCase()} Stream Active`
            : 'Latent Biometric Matrix • Connect Statement to Sequence'}
        </p>
      </div>

      {/* Investigation Live Progress Overlay */}
      {isInvestigating && (
        <div className="absolute top-5 right-6 pointer-events-none z-10 flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono-num font-bold text-cyan-300">
            {investigationStepText || 'Investigating Ledger Topology...'}
          </span>
        </div>
      )}

      {/* Dynamic Hover Inspector Tag */}
      {hoveredTx && (
        <div className="absolute bottom-5 right-6 pointer-events-none z-10 glass-panel p-3.5 rounded-2xl border border-cyan-500/30 max-w-xs shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-400 pb-1 border-b border-white/10">
            <span className="text-cyan-400 font-bold uppercase">{hoveredTx.category}</span>
            <span>{hoveredTx.date}</span>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-white truncate pr-2">{hoveredTx.merchant}</span>
            <span
              className={`text-sm font-mono-num font-extrabold ${
                hoveredTx.type === 'income'
                  ? 'text-emerald-400'
                  : hoveredTx.status === 'anomaly'
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {hoveredTx.type === 'income' ? '+' : '-'}{sym}{hoveredTx.amount.toLocaleString('en-IN')}
            </span>
          </div>
          {hoveredTx.status === 'anomaly' && (
            <p className="text-[10px] text-rose-300 font-medium pt-1.5 leading-snug">
              🚨 {hoveredTx.anomalyReason}
            </p>
          )}
          <div className="mt-2 text-[9px] font-mono-num text-slate-500 text-right">
            Click to inspect telemetry →
          </div>
        </div>
      )}

      {/* Orbit Interaction Helper */}
      <div className="absolute bottom-4 left-6 pointer-events-none text-[10px] font-mono-num text-slate-600 hidden sm:block z-10">
        [ Drag to rotate perspective • Hover nodes to inspect vectors ]
      </div>
    </div>
  );
};
