"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
};

type Point = {
  x: number;
  y: number;
};

const FPS = 60;
const SPRING = 0.08;
const FRICTION = 0.84;
const REPULSE_RADIUS = 90;
const REPULSE_FORCE = 2.4;
const MAX_FRAME_DELTA = 0.05;
const MAX_STEP = 2.5;

const formatTime = (date: Date) =>
  date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

export function ParticleTime() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const renderRef = useRef({ step: 4, size: 1.6 });
  const timeRef = useRef<string>("");
  const colorRef = useRef<string>("#94a3b8");
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const [timeLabel, setTimeLabel] = useState("--:--:--");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const offscreen = document.createElement("canvas");
    const offscreenCtx = offscreen.getContext("2d");
    if (!offscreenCtx) return;

    let width = 0;
    let height = 0;
    let rafId = 0;
    let timeoutId = 0;
    let lastTime = performance.now();

    const syncColor = () => {
      colorRef.current = getComputedStyle(wrapper).color;
    };

    const rebuildTargets = () => {
      const text = timeRef.current;
      if (!text || width === 0 || height === 0) return;

      offscreenCtx.clearRect(0, 0, width, height);
      const fontSize = Math.max(
        28,
        Math.min(width * 0.28, height * 0.7, 96)
      );

      offscreenCtx.fillStyle = "#ffffff";
      offscreenCtx.textAlign = "center";
      offscreenCtx.textBaseline = "middle";
      offscreenCtx.font = `600 ${Math.floor(
        fontSize
      )}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;
      offscreenCtx.fillText(text, width / 2, height / 2);

      const { data } = offscreenCtx.getImageData(0, 0, width, height);
      const points: Point[] = [];
      const step = Math.max(2, Math.round(fontSize / 18));
      renderRef.current = {
        step,
        size: Math.max(1.2, step * 0.45)
      };

      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 140) {
            points.push({ x, y });
          }
        }
      }

      const particles = particlesRef.current;
      if (particles.length < points.length) {
        const needed = points.length - particles.length;
        for (let i = 0; i < needed; i += 1) {
          particles.push({
            x: width / 2 + (Math.random() - 0.5) * width * 0.35,
            y: height / 2 + (Math.random() - 0.5) * height * 0.35,
            vx: 0,
            vy: 0,
            tx: 0,
            ty: 0
          });
        }
      } else if (particles.length > points.length) {
        particles.length = points.length;
      }

      const sortByPosition = (a: Point, b: Point) => a.x - b.x || a.y - b.y;
      particles.sort(sortByPosition);
      points.sort(sortByPosition);

      for (let i = 0; i < points.length; i += 1) {
        particles[i].tx = points[i].x;
        particles[i].ty = points[i].y;
      }
    };

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      offscreen.width = width;
      offscreen.height = height;

      syncColor();
      rebuildTargets();
    };

    const updateTime = () => {
      const next = formatTime(new Date());
      if (next !== timeRef.current) {
        timeRef.current = next;
        setTimeLabel(next);
        rebuildTargets();
      }
    };

    const drawFrame = (delta: number) => {
      if (width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = colorRef.current;

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const { size } = renderRef.current;
      const step = Math.min(MAX_STEP, delta * FPS);
      const friction = Math.pow(FRICTION, step);

      for (const particle of particles) {
        const dx = particle.tx - particle.x;
        const dy = particle.ty - particle.y;
        particle.vx += dx * SPRING * step;
        particle.vy += dy * SPRING * step;

        if (mouse.active) {
          const mx = particle.x - mouse.x;
          const my = particle.y - mouse.y;
          const dist = Math.hypot(mx, my);
          if (dist > 0.001 && dist < REPULSE_RADIUS) {
            const force =
              ((REPULSE_RADIUS - dist) / REPULSE_RADIUS) * REPULSE_FORCE;
            particle.vx += (mx / dist) * force * step;
            particle.vy += (my / dist) * force * step;
          }
        }

        particle.vx *= friction;
        particle.vy *= friction;
        particle.x += particle.vx * step;
        particle.y += particle.vy * step;

        ctx.fillRect(particle.x, particle.y, size, size);
      }
    };

    const tick = (now: number) => {
      const delta = Math.min(MAX_FRAME_DELTA, (now - lastTime) / 1000);
      lastTime = now;
      drawFrame(delta);
      rafId = requestAnimationFrame(tick);
    };

    const initialTime = formatTime(new Date());
    timeRef.current = initialTime;
    setTimeLabel(initialTime);
    updateTime();

    const scheduleNextTick = () => {
      const now = new Date();
      const delay = 1000 - now.getMilliseconds();
      timeoutId = window.setTimeout(() => {
        updateTime();
        scheduleNextTick();
      }, delay);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    const themeObserver = new MutationObserver(syncColor);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    resize();
    scheduleNextTick();
    rafId = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true
    };
  };

  const handlePointerLeave = () => {
    mouseRef.current.active = false;
  };

  const handlePointerEnter = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      active: true
    };
  };

  return (
    <div
      ref={wrapperRef}
      className="relative h-24 w-full max-w-full overflow-hidden rounded-xl border border-edge bg-base/40 text-primary"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label={timeLabel}
      role="img"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none block h-full w-full"
      />
      <span className="sr-only">{timeLabel}</span>
    </div>
  );
}
