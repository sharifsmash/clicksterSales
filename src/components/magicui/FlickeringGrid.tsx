import React, { useEffect, useRef } from 'react';

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  maxOpacity?: number;
  className?: string;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = 'rgb(0, 0, 0)',
  maxOpacity = 0.2,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const columns = Math.ceil(canvas.width / (squareSize + gridGap));
      const rows = Math.ceil(canvas.height / (squareSize + gridGap));

      for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
          if (Math.random() < flickerChance) {
            const opacity = Math.random() * maxOpacity;
            ctx.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
            ctx.fillRect(
              i * (squareSize + gridGap),
              j * (squareSize + gridGap),
              squareSize,
              squareSize
            );
          }
        }
      }
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawGrid();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const intervalId = setInterval(drawGrid, 50);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearInterval(intervalId);
    };
  }, [squareSize, gridGap, flickerChance, color, maxOpacity]);

  return <canvas ref={canvasRef} className={`fixed inset-0 -z-10 ${className}`} />;
};