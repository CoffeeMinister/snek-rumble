import { useEffect, useRef } from 'react';
import { drawSnake } from './useSnake';
import { drawFood } from './useFood';

export function useGameLoop(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawSnake(ctx);
      drawFood(ctx);

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(requestRef.current!);
  }, []);
}
