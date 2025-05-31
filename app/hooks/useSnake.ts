let x = 100;
let y = 100;
let dx = 2;
let dy = 0;

export function drawSnake(ctx: CanvasRenderingContext2D) {
  x += dx;
  y += dy;

  ctx.fillStyle = 'lime';
  ctx.fillRect(x, y, 10, 10);
}
