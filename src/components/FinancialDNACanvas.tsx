import React, { useEffect, useRef, useState } from 'react';
import {
  DNANode,
  DNAFilterLayer,
  FinancialDataset,
  Transaction,
} from '../types';

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

interface ProjectedParticle {
  particle: Particle3D;
  screenX: number;
  screenY: number;
  scale: number;
  z: number;
  isHighlighted: boolean;
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
  investigationStepText,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoveredTx, setHoveredTx] = useState<Transaction | null>(null);

  /*
   * IMPORTANT PERFORMANCE CHANGE:
   *
   * These values live in refs so mouse movement / hover / filters do not
   * continuously destroy and recreate the requestAnimationFrame loop.
   */
  const stateRef = useRef({
    activeLayer,
    selectedTransaction,
    highlightedTxIds,
    highlightColor,
    isInvestigating,
    investigationStepText,
  });

  const hoveredTxRef = useRef<Transaction | null>(null);
  const mousePosRef = useRef({ x: -1000, y: -1000 });

  const mouseRef = useRef({
    targetRotX: 0.15,
    targetRotY: 0,
    currentRotX: 0.15,
    currentRotY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  const selectedRef = useRef<Transaction | null>(selectedTransaction);

  const sym = dataset?.currencySymbol || '₹';

  /*
   * Keep interaction state current without forcing the canvas effect
   * to restart.
   */
  useEffect(() => {
    stateRef.current = {
      activeLayer,
      selectedTransaction,
      highlightedTxIds,
      highlightColor,
      isInvestigating,
      investigationStepText,
    };

    selectedRef.current = selectedTransaction;
  }, [
    activeLayer,
    selectedTransaction,
    highlightedTxIds,
    highlightColor,
    isInvestigating,
    investigationStepText,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;

    /*
     * Cap DPR.
     *
     * A 2x/3x retina canvas can multiply the number of pixels rendered
     * every frame. 1.5 keeps the visualization crisp without making
     * the animation unnecessarily expensive.
     */
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();

      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    /*
     * ---------------------------------------------------------
     * PARTICLE GENERATION
     * ---------------------------------------------------------
     */

    const particles: Particle3D[] = [];

    const numAmbient = 120;

    // Ambient double helix.
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
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    /*
     * Real transaction nodes.
     *
     * These are generated once when the dataset changes rather than
     * being recreated every animation frame.
     */
    if (dataset?.transactions?.length) {
      const total = dataset.transactions.length;

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
        } else if (
          tx.category.includes('Tech') ||
          tx.category.includes('Cloud')
        ) {
          layer = 'pattern';
          color = '#06B6D4';
          radius = 210;
        }

        const angle = (idx / total) * Math.PI * 2 * 1.5;
        const h = (idx / total - 0.5) * 360;

        particles.push({
          x: Math.cos(angle) * radius,
          y: h,
          z: Math.sin(angle) * radius,
          baseRadius: radius,
          angle,
          speed:
            (tx.status === 'anomaly' ? 0.015 : 0.006) +
            (idx % 3) * 0.002,
          height: h,
          color,
          size:
            tx.status === 'anomaly'
              ? 4.8
              : tx.amount > 1000
              ? 4.2
              : 3,
          layer,
          alpha: 0.9,
          txRef: tx,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      });
    }

    /*
     * Map transaction IDs once.
     *
     * The old implementation repeatedly called:
     *
     * highlightedTxIds.includes(...)
     *
     * for every particle on every frame.
     *
     * Set lookup is considerably cheaper.
     */
    let highlightSet = new Set<string>();

    let lastHighlightSignature = '';

    const getHighlightSet = () => {
      const ids = stateRef.current.highlightedTxIds || [];
      const signature = ids.join('|');

      if (signature !== lastHighlightSignature) {
        highlightSet = new Set(ids);
        lastHighlightSignature = signature;
      }

      return highlightSet;
    };

    /*
     * ---------------------------------------------------------
     * LAYER MATCHING
     * ---------------------------------------------------------
     */

    const matchesActiveLayer = (
      particle: Particle3D,
      layer: DNAFilterLayer
    ) => {
      if (layer === 'all') return true;

      if (layer === 'income') {
        return particle.layer === 'income';
      }

      if (layer === 'spending') {
        return particle.layer === 'spending';
      }

      if (layer === 'risk') {
        return particle.layer === 'risk';
      }

      if (layer === 'habits') {
        return particle.layer === 'habit';
      }

      return true;
    };

    /*
     * ---------------------------------------------------------
     * RENDER LOOP
     * ---------------------------------------------------------
     */

    let time = 0;
    let scanLineY = 0;

    const render = () => {
      time += 0.016;

      const currentState = stateRef.current;

      const currentActiveLayer = currentState.activeLayer;
      const currentSelected = currentState.selectedTransaction;
      const currentIsInvestigating = currentState.isInvestigating;
      const currentHighlightColor = currentState.highlightColor;

      const currentHighlightSet = getHighlightSet();
      const hasHighlights = currentHighlightSet.size > 0;

      const spinSpeed = currentIsInvestigating ? 0.45 : 0.15;

      /*
       * Smooth camera interpolation.
       */
      mouseRef.current.currentRotX +=
        (mouseRef.current.targetRotX -
          mouseRef.current.currentRotX) *
        0.06;

      mouseRef.current.currentRotY +=
        (mouseRef.current.targetRotY -
          mouseRef.current.currentRotY) *
        0.06;

      const rotX = mouseRef.current.currentRotX;
      const rotY =
        mouseRef.current.currentRotY + time * spinSpeed;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      const fov = 480;

      /*
       * -------------------------------------------------------
       * BACKGROUND ORBITAL GUIDES
       * -------------------------------------------------------
       */

      ctx.save();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      [100, 170, 230, 290].forEach((r) => {
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          r,
          r * 0.35,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      });

      ctx.strokeStyle = currentIsInvestigating
        ? 'rgba(34, 211, 238, 0.15)'
        : 'rgba(6, 182, 212, 0.08)';

      ctx.beginPath();
      ctx.moveTo(cx - 300, cy);
      ctx.lineTo(cx + 300, cy);

      ctx.moveTo(cx, cy - 200);
      ctx.lineTo(cx, cy + 200);

      ctx.stroke();

      ctx.restore();

      /*
       * -------------------------------------------------------
       * AI SCAN PLANE
       * -------------------------------------------------------
       */

      if (currentIsInvestigating) {
        scanLineY = cy + Math.sin(time * 3) * 180;

        ctx.save();

        const scanGrad = ctx.createLinearGradient(
          0,
          scanLineY - 25,
          0,
          scanLineY + 25
        );

        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(
          0.5,
          'rgba(34, 211, 238, 0.2)'
        );
        scanGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = scanGrad;
        ctx.fillRect(
          0,
          scanLineY - 25,
          width,
          50
        );

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

      /*
       * -------------------------------------------------------
       * PROJECT 3D PARTICLES
       * -------------------------------------------------------
       */

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const projected: ProjectedParticle[] = new Array(
        particles.length
      );

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const currentAngle =
          p.angle +
          time *
            (currentIsInvestigating
              ? p.speed * 2.5
              : p.speed);

        const currentRadius =
          p.baseRadius +
          Math.sin(
            time * 2 + p.pulsePhase
          ) *
            6;

        const currentHeight =
          p.height +
          Math.cos(
            time * 1.5 + p.pulsePhase
          ) *
            8;

        const px =
          Math.cos(currentAngle) *
          currentRadius;

        const py = currentHeight;

        const pz =
          Math.sin(currentAngle) *
          currentRadius;

        // Y rotation.
        const x1 =
          px * cosY -
          pz * sinY;

        const z1 =
          px * sinY +
          pz * cosY;

        // X rotation.
        const y2 =
          py * cosX -
          z1 * sinX;

        const z2 =
          py * sinX +
          z1 * cosX;

        const scale =
          fov /
          (fov + z2 + 200);

        const screenX =
          cx + x1 * scale;

        const screenY =
          cy + y2 * scale;

        const tx = p.txRef;

        projected[i] = {
          particle: p,
          screenX,
          screenY,
          scale,
          z: z2,
          isHighlighted:
            !!tx &&
            currentHighlightSet.has(tx.id),
        };
      }

      /*
       * Painter's algorithm.
       *
       * Back → front.
       */
      projected.sort((a, b) => b.z - a.z);

      /*
       * -------------------------------------------------------
       * CONNECTIVE LATTICE
       * -------------------------------------------------------
       */

      ctx.save();

      ctx.lineWidth = 0.6;

      for (
        let i = 0;
        i < projected.length;
        i += 3
      ) {
        const p1 = projected[i];

        for (
          let j = i + 1;
          j <
          Math.min(
            projected.length,
            i + 6
          );
          j++
        ) {
          const p2 = projected[j];

          if (
            hasHighlights &&
            !(p1.isHighlighted &&
              p2.isHighlighted)
          ) {
            continue;
          }

          if (
            !hasHighlights &&
            currentActiveLayer !== 'all'
          ) {
            if (
              !matchesActiveLayer(
                p1.particle,
                currentActiveLayer
              ) &&
              !matchesActiveLayer(
                p2.particle,
                currentActiveLayer
              )
            ) {
              continue;
            }
          }

          const dx =
            p1.screenX -
            p2.screenX;

          const dy =
            p1.screenY -
            p2.screenY;

          const dist = Math.sqrt(
            dx * dx + dy * dy
          );

          const connectionDistance =
            hasHighlights ? 180 : 85;

          if (dist >= connectionDistance) {
            continue;
          }

          const alpha =
            (1 - dist / connectionDistance) *
            (hasHighlights ? 0.6 : 0.18) *
            Math.min(
              p1.scale,
              p2.scale
            );

          ctx.strokeStyle = hasHighlights
            ? currentHighlightColor
            : p1.particle.color;

          ctx.globalAlpha = alpha;

          ctx.lineWidth =
            hasHighlights ? 1.2 : 0.6;

          ctx.beginPath();

          ctx.moveTo(
            p1.screenX,
            p1.screenY
          );

          ctx.lineTo(
            p2.screenX,
            p2.screenY
          );

          ctx.stroke();
        }
      }

      ctx.restore();

      /*
       * -------------------------------------------------------
       * FINANCIAL DNA PARTICLES
       * -------------------------------------------------------
       */

      let closestTxUnderMouse: Transaction | null =
        null;

      let minMouseDist = 26;

      const mouseX = mousePosRef.current.x;
      const mouseY = mousePosRef.current.y;

      for (let i = 0; i < projected.length; i++) {
        const item = projected[i];

        const {
          particle,
          screenX,
          screenY,
          scale,
          isHighlighted,
        } = item;

        let isLayerDimmed = false;

        if (hasHighlights) {
          if (!isHighlighted) {
            isLayerDimmed = true;
          }
        } else if (
          currentActiveLayer !== 'all' &&
          !matchesActiveLayer(
            particle,
            currentActiveLayer
          )
        ) {
          isLayerDimmed = true;
        }

        const effectiveAlpha =
          isLayerDimmed
            ? particle.alpha * 0.08
            : particle.alpha;

        const baseSize =
          particle.size *
          scale *
          (isLayerDimmed ? 0.6 : 1);

        const effectiveSize =
          isHighlighted
            ? baseSize * 1.8
            : baseSize;

        const renderColor =
          isHighlighted
            ? currentHighlightColor
            : particle.color;

        /*
         * Hover detection.
         *
         * No React state update occurs here unless the
         * actual transaction under the cursor changes.
         */
        if (particle.txRef) {
          const mdx =
            mouseX - screenX;

          const mdy =
            mouseY - screenY;

          const mdist = Math.sqrt(
            mdx * mdx +
              mdy * mdy
          );

          if (
            mdist < minMouseDist
          ) {
            closestTxUnderMouse =
              particle.txRef;

            minMouseDist = mdist;
          }
        }

        const isSelected =
          !!currentSelected &&
          particle.txRef?.id ===
            currentSelected.id;

        const isHovered =
          !!hoveredTxRef.current &&
          particle.txRef?.id ===
            hoveredTxRef.current.id;

        ctx.save();

        /*
         * Node halo.
         */
        if (
          particle.txRef ||
          isSelected ||
          isHovered ||
          isHighlighted
        ) {
          const glowRadius =
            effectiveSize *
            (isHighlighted
              ? 4.5
              : isSelected || isHovered
              ? 4
              : 2.5);

          const gradient =
            ctx.createRadialGradient(
              screenX,
              screenY,
              0,
              screenX,
              screenY,
              glowRadius
            );

          gradient.addColorStop(
            0,
            renderColor
          );

          gradient.addColorStop(
            1,
            'transparent'
          );

          ctx.fillStyle = gradient;

          ctx.globalAlpha =
            effectiveAlpha *
            (isHighlighted
              ? 0.85
              : isSelected || isHovered
              ? 0.9
              : 0.4);

          ctx.beginPath();

          ctx.arc(
            screenX,
            screenY,
            glowRadius,
            0,
            Math.PI * 2
          );

          ctx.fill();
        }

        /*
         * Node core.
         */
        ctx.fillStyle =
          isSelected || isHovered
            ? '#FFFFFF'
            : renderColor;

        ctx.globalAlpha =
          effectiveAlpha;

        ctx.beginPath();

        ctx.arc(
          screenX,
          screenY,
          Math.max(
            1,
            effectiveSize *
              (isSelected ||
              isHovered
                ? 1.4
                : 1)
          ),
          0,
          Math.PI * 2
        );

        ctx.fill();

        /*
         * Risk / highlighted radar.
         */
        if (
          (isHighlighted ||
            particle.layer === 'risk') &&
          !isLayerDimmed
        ) {
          const pulseR =
            effectiveSize *
            (2.4 +
              Math.sin(
                time * 5 +
                  particle.pulsePhase
              ) *
                0.8);

          ctx.strokeStyle =
            renderColor;

          ctx.lineWidth =
            isHighlighted
              ? 1.4
              : 1;

          ctx.globalAlpha =
            0.7 +
            Math.sin(time * 4) *
              0.3;

          ctx.beginPath();

          ctx.arc(
            screenX,
            screenY,
            pulseR,
            0,
            Math.PI * 2
          );

          ctx.stroke();
        }

        /*
         * Selected / hovered targeting HUD.
         */
        if (
          isSelected ||
          isHovered
        ) {
          ctx.strokeStyle =
            '#22D3EE';

          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.95;

          const bracketSize = 16;

          ctx.strokeRect(
            screenX -
              bracketSize / 2,
            screenY -
              bracketSize / 2,
            bracketSize,
            bracketSize
          );

          if (particle.txRef) {
            ctx.font =
              '600 10px "JetBrains Mono", monospace';

            ctx.fillStyle =
              '#FFFFFF';

            ctx.fillText(
              `${particle.txRef.merchant} (${sym}${particle.txRef.amount.toFixed(
                0
              )})`,
              screenX + 14,
              screenY - 8
            );
          }
        }

        ctx.restore();
      }

      /*
       * -------------------------------------------------------
       * NEW:
       * FINANCIAL DNA RELATIONSHIP PULSE
       *
       * Instead of treating the selected transaction as an
       * isolated dot, visually connect it to nearby transactions
       * that share its category/type.
       *
       * This turns the visualization into a behavioral network.
       * -------------------------------------------------------
       */

      if (currentSelected) {
        const selectedProjection =
          projected.find(
            (item) =>
              item.particle.txRef?.id ===
              currentSelected.id
          );

        if (selectedProjection) {
          const related = projected
            .filter((item) => {
              const tx =
                item.particle.txRef;

              if (!tx) return false;
              if (
                tx.id ===
                currentSelected.id
              ) {
                return false;
              }

              return (
                tx.category ===
                  currentSelected.category ||
                tx.type ===
                  currentSelected.type
              );
            })
            .sort((a, b) => {
              const da =
                Math.hypot(
                  a.screenX -
                    selectedProjection.screenX,
                  a.screenY -
                    selectedProjection.screenY
                );

              const db =
                Math.hypot(
                  b.screenX -
                    selectedProjection.screenX,
                  b.screenY -
                    selectedProjection.screenY
                );

              return da - db;
            })
            .slice(0, 8);

          if (related.length > 0) {
            ctx.save();

            related.forEach(
              (relatedNode, index) => {
                const dx =
                  relatedNode.screenX -
                  selectedProjection.screenX;

                const dy =
                  relatedNode.screenY -
                  selectedProjection.screenY;

                const distance = Math.sqrt(
                  dx * dx + dy * dy
                );

                if (distance > 260) {
                  return;
                }

                const strength =
                  Math.max(
                    0,
                    1 -
                      distance /
                        260
                  );

                /*
                 * Relationship line.
                 */
                ctx.strokeStyle =
                  '#22D3EE';

                ctx.globalAlpha =
                  0.08 +
                  strength * 0.22;

                ctx.lineWidth =
                  0.8 +
                  strength * 0.8;

                ctx.beginPath();

                ctx.moveTo(
                  selectedProjection.screenX,
                  selectedProjection.screenY
                );

                ctx.lineTo(
                  relatedNode.screenX,
                  relatedNode.screenY
                );

                ctx.stroke();

                /*
                 * Animated signal travelling along
                 * the relationship line.
                 */
                const pulse =
                  (time * 0.55 +
                    index * 0.13) %
                  1;

                const pulseX =
                  selectedProjection.screenX +
                  dx * pulse;

                const pulseY =
                  selectedProjection.screenY +
                  dy * pulse;

                ctx.fillStyle =
                  '#67E8F9';

                ctx.globalAlpha =
                  0.35 +
                  strength * 0.5;

                ctx.beginPath();

                ctx.arc(
                  pulseX,
                  pulseY,
                  1.5 +
                    strength * 2,
                  0,
                  Math.PI * 2
                );

                ctx.fill();
              }
            );

            /*
             * Selected node orbital ring.
             */
            const ringPulse =
              22 +
              Math.sin(time * 3) *
                4;

            ctx.strokeStyle =
              '#22D3EE';

            ctx.globalAlpha = 0.45;

            ctx.lineWidth = 1;

            ctx.beginPath();

            ctx.arc(
              selectedProjection.screenX,
              selectedProjection.screenY,
              ringPulse,
              0,
              Math.PI * 2
            );

            ctx.stroke();

            ctx.restore();
          }
        }
      }

      /*
       * Update hover state only when the actual transaction
       * changes.
       *
       * This is critical: mouse movement no longer causes the
       * canvas animation effect to restart.
       */
      if (
        closestTxUnderMouse !==
        hoveredTxRef.current
      ) {
        hoveredTxRef.current =
          closestTxUnderMouse;

        setHoveredTx(
          closestTxUnderMouse
        );
      }

      animationFrameId =
        requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(
        animationFrameId
      );

      resizeObserver.disconnect();
    };
  }, [dataset]);

  /*
   * ---------------------------------------------------------
   * POINTER INTERACTION
   * ---------------------------------------------------------
   */

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect =
      containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    const x =
      e.clientX - rect.left;

    const y =
      e.clientY - rect.top;

    mousePosRef.current = {
      x,
      y,
    };

    if (
      mouseRef.current.isDragging
    ) {
      const deltaX =
        x -
        mouseRef.current.lastX;

      const deltaY =
        y -
        mouseRef.current.lastY;

      mouseRef.current.targetRotY +=
        deltaX * 0.008;

      mouseRef.current.targetRotX =
        Math.max(
          -0.6,
          Math.min(
            0.6,
            mouseRef.current
              .targetRotX +
              deltaY * 0.006
          )
        );

      mouseRef.current.lastX = x;
      mouseRef.current.lastY = y;
    } else {
      const normX =
        (x / rect.width - 0.5) *
        2;

      const normY =
        (y / rect.height - 0.5) *
        2;

      mouseRef.current.targetRotY =
        normX * 0.4;

      mouseRef.current.targetRotX =
        0.15 + normY * 0.25;
    }
  };

  const handleMouseDown = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const rect =
      containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    mouseRef.current.isDragging =
      true;

    mouseRef.current.lastX =
      e.clientX - rect.left;

    mouseRef.current.lastY =
      e.clientY - rect.top;
  };

  const handleMouseUp = () => {
    mouseRef.current.isDragging =
      false;
  };

  const handleMouseLeave = () => {
    mouseRef.current.isDragging =
      false;

    mousePosRef.current = {
      x: -1000,
      y: -1000,
    };

    hoveredTxRef.current = null;
    setHoveredTx(null);
  };

  const handleClick = () => {
    if (hoveredTxRef.current) {
      onSelectTransaction(
        hoveredTxRef.current
      );
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative w-full h-[480px] sm:h-[560px] lg:h-[640px] select-none cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-[#080B11]/90 via-[#05070B]/95 to-[#040508]"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Tactical status */}
      <div className="absolute top-5 left-6 pointer-events-none flex flex-col space-y-1 z-10">
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isInvestigating
                ? 'bg-cyan-400 animate-ping'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />

          <span className="text-[11px] font-mono-num font-bold tracking-widest text-slate-300 uppercase">
            3D Financial DNA Helix
          </span>
        </div>

        <p className="text-[10px] text-slate-500 font-mono-num">
          {dataset
            ? highlightedTxIds.length > 0
              ? `${highlightedTxIds.length} Target Nodes Isolated • Copilot Focus Active`
              : `${dataset.transactions.length} Vectorized Nodes • ${activeLayer.toUpperCase()} Stream Active`
            : 'Latent Biometric Matrix • Connect Statement to Sequence'}
        </p>
      </div>

      {/* Investigation overlay */}
      {isInvestigating && (
        <div className="absolute top-5 right-6 pointer-events-none z-10 flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

          <span className="text-[11px] font-mono-num font-bold text-cyan-300">
            {investigationStepText ||
              'Investigating Ledger Topology...'}
          </span>
        </div>
      )}

      {/* Hover inspector */}
      {hoveredTx && (
        <div className="absolute bottom-5 right-6 pointer-events-none z-10 glass-panel p-3.5 rounded-2xl border border-cyan-500/30 max-w-xs shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-400 pb-1 border-b border-white/10">
            <span className="text-cyan-400 font-bold uppercase">
              {hoveredTx.category}
            </span>

            <span>
              {hoveredTx.date}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-white truncate pr-2">
              {hoveredTx.merchant}
            </span>

            <span
              className={`text-sm font-mono-num font-extrabold ${
                hoveredTx.type ===
                'income'
                  ? 'text-emerald-400'
                  : hoveredTx.status ===
                    'anomaly'
                  ? 'text-rose-400'
                  : 'text-white'
              }`}
            >
              {hoveredTx.type ===
              'income'
                ? '+'
                : '-'}
              {sym}
              {hoveredTx.amount.toLocaleString(
                'en-IN'
              )}
            </span>
          </div>

          {hoveredTx.status ===
            'anomaly' && (
            <p className="text-[10px] text-rose-300 font-medium pt-1.5 leading-snug">
              🚨{' '}
              {hoveredTx.anomalyReason}
            </p>
          )}

          <div className="mt-2 text-[9px] font-mono-num text-slate-500 text-right">
            Click to inspect telemetry →
          </div>
        </div>
      )}

      {/* Selected relationship hint */}
      {selectedTransaction && (
        <div className="absolute top-1/2 left-6 -translate-y-1/2 pointer-events-none z-10 hidden lg:block">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono-num uppercase tracking-[0.2em] text-cyan-400">
              Behavioral Link
            </span>

            <span className="text-[10px] font-mono-num text-slate-500 max-w-[130px] leading-relaxed">
              Related financial patterns are being traced through the DNA network.
            </span>
          </div>
        </div>
      )}

      {/* Interaction helper */}
      <div className="absolute bottom-4 left-6 pointer-events-none text-[10px] font-mono-num text-slate-600 hidden sm:block z-10">
        [ Drag to rotate perspective • Hover nodes to inspect vectors ]
      </div>
    </div>
  );
};
