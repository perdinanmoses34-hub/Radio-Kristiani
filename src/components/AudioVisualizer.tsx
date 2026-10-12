import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 28,
  height = 42,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4;
        if (isPlaying) {
          // Dynamic organic spectrum pattern
          const freqFactor = Math.sin((i / barCount) * Math.PI);
          const wave1 = Math.sin(phase + i * 0.45);
          const wave2 = Math.cos(phase * 1.5 + i * 0.2);
          const intensity = Math.max(0.15, (wave1 + wave2 + 2) / 4);
          barHeight = Math.max(4, freqFactor * intensity * (height - 6));
        }

        const x = i * (barWidth + 2);
        const y = canvas.height - barHeight;

        // Gradient from warm amber to orange-coral
        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        if (isPlaying) {
          gradient.addColorStop(0, '#f59e0b'); // amber-500
          gradient.addColorStop(1, '#d97706'); // amber-600
        } else {
          gradient.addColorStop(0, '#52525b');
          gradient.addColorStop(1, '#3f3f46');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }

      phase += 0.08;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, barCount, height]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={height}
      className="w-full max-w-[240px] h-[36px] object-contain opacity-90"
      aria-hidden="true"
    />
  );
};
