import { useEffect, useRef } from 'react';

export default function RainEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Raindrop parameters
    const maxDrops = 110; // Slightly more drops for visibility
    const drops: Array<{
      x: number;
      y: number;
      velY: number;
      velX: number;
      length: number;
      opacity: number;
    }> = [];

    // Initialize drops
    for (let i = 0; i < maxDrops; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        velY: 4 + Math.random() * 5, // speed
        velX: -1 - Math.random() * 1.5, // wind angle
        length: 15 + Math.random() * 15,
        opacity: 0.12 + Math.random() * 0.22, // Increased opacity for better visibility
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      drops.forEach((drop) => {
        ctx.strokeStyle = `rgba(212, 175, 55, ${drop.opacity})`; // Hint of gold/amber in rain
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.velX * 1.5, drop.y + drop.length);
        ctx.stroke();

        // Update positions
        drop.y += drop.velY;
        drop.x += drop.velX;

        // Reset if offscreen
        if (drop.y > height) {
          drop.y = -drop.length;
          drop.x = Math.random() * width;
        }
        if (drop.x < 0) {
          drop.x = width;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1] opacity-75"
    />
  );
}
