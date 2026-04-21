'use client';

import { useEffect, useRef } from 'react';

/**
 * useHeroMotion
 *
 * Orquestra três animações do hero:
 *  1. Reveal stagger (entrada das tiles)
 *  2. Tilt 3D (mouse-follow)
 *  3. Float contínuo + parallax de scroll (seno-based)
 *
 * Respeita `prefers-reduced-motion`.
 * Faz cleanup completo: listeners + rAF + setTimeouts.
 */
export function useHeroMotion() {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const copyRefs = useRef<HTMLElement[]>([]);

  const registerCopy = (el: HTMLElement | null) => {
    if (el && !copyRefs.current.includes(el)) {
      copyRefs.current.push(el);
    }
  };

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tiles = Array.from(grid.querySelectorAll<HTMLElement>('.img-tile'));

    // --- 1. Reveal stagger ---
    const revealTimeout = window.setTimeout(() => grid.classList.add('revealed'), prefersReduced ? 0 : 100);
    const floatingTimeout = window.setTimeout(() => grid.classList.add('floating'), prefersReduced ? 0 : 1200);

    const copyTimeouts = copyRefs.current.map((el) =>
      window.setTimeout(() => el.classList.add('visible'), 40),
    );

    // --- 2. Tilt 3D (mouse-follow) ---
    let targetRx = 0;
    let targetRy = 0;
    let curRx = 0;
    let curRy = 0;
    let tiltRaf: number | null = null;
    const MAX_TILT = 8;

    const heroSection = grid.closest('section') ?? grid;

    function onMove(e: Event) {
      const mouseEvent = e as MouseEvent;
      const rect = grid!.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (mouseEvent.clientX - cx) / (rect.width / 2);
      const dy = (mouseEvent.clientY - cy) / (rect.height / 2);
      targetRy = Math.max(-1, Math.min(1, dx)) * MAX_TILT;
      targetRx = Math.max(-1, Math.min(1, -dy)) * MAX_TILT;
      if (!tiltRaf) tiltRaf = requestAnimationFrame(tick);
    }
    function onLeave() {
      targetRx = 0;
      targetRy = 0;
      if (!tiltRaf) tiltRaf = requestAnimationFrame(tick);
    }
    function tick() {
      curRx += (targetRx - curRx) * 0.08;
      curRy += (targetRy - curRy) * 0.08;
      grid!.style.transform = `rotateX(${curRx.toFixed(2)}deg) rotateY(${curRy.toFixed(2)}deg)`;
      if (Math.abs(targetRx - curRx) > 0.05 || Math.abs(targetRy - curRy) > 0.05) {
        tiltRaf = requestAnimationFrame(tick);
      } else {
        tiltRaf = null;
      }
    }

    if (!prefersReduced) {
      heroSection.addEventListener('mousemove', onMove);
      heroSection.addEventListener('mouseleave', onLeave);
    }

    // --- 3. Float + parallax ---
    let scrollY = window.scrollY;
    const onScroll = () => {
      scrollY = window.scrollY;
    };

    let floatRaf: number | null = null;
    const tileState = tiles.map((_, i) => ({
      phase: (i * Math.PI) / 3,
      speed: 0.6 + (i % 3) * 0.15,
      amp: 8 + (i % 3) * 3,
      pfactor: parseFloat(getComputedStyle(tiles[i]).getPropertyValue('--pfactor')) || 0.2,
    }));

    const start = performance.now();
    function step() {
      const t = (performance.now() - start) / 1000;
      tiles.forEach((tile, i) => {
        const s = tileState[i];
        const fy = Math.sin(t * s.speed + s.phase) * s.amp;
        const py = -scrollY * s.pfactor;
        tile.style.setProperty('--float-y', fy.toFixed(2) + 'px');
        tile.style.setProperty('--py', py.toFixed(1) + 'px');
      });
    }
    function loop() {
      step();
      floatRaf = requestAnimationFrame(loop);
    }

    if (tiles.length && !prefersReduced) {
      window.addEventListener('scroll', onScroll, { passive: true });
      floatRaf = requestAnimationFrame(loop);
      step(); // Primeira pintura imediata
    }

    // --- Cleanup ---
    return () => {
      window.clearTimeout(revealTimeout);
      window.clearTimeout(floatingTimeout);
      copyTimeouts.forEach((id) => window.clearTimeout(id));
      heroSection.removeEventListener('mousemove', onMove);
      heroSection.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      if (tiltRaf !== null) cancelAnimationFrame(tiltRaf);
      if (floatRaf !== null) cancelAnimationFrame(floatRaf);
    };
  }, []);

  return { gridRef, registerCopy };
}
