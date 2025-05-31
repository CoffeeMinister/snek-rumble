const foodPos = [{ x: 200, y: 200 }, { x: 400, y: 100 }];

export function drawFood(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = 'red';
  foodPos.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}
