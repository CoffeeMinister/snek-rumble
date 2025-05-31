import { View } from "@multisynq/client";

export class SnakeView extends View {
    static register(name) {
        if (!window.Multisynq._views) {
            window.Multisynq._views = {};
        }
        window.Multisynq._views[name] = this;
    }

    constructor(model) {
      super(model);
      this.model = model;
      this.ctx = document.getElementById("canvas").getContext("2d");
  
      document.onkeydown = (e) => {
        const keyToDir = {
          ArrowUp: { x: 0, y: -1 },
          ArrowDown: { x: 0, y: 1 },
          ArrowLeft: { x: -1, y: 0 },
          ArrowRight: { x: 1, y: 0 },
        };
        const dir = keyToDir[e.key];
        if (dir) {
          this.publish(this.viewId, "set-direction", dir);
        }
      };
    }
  
    update() {
      this.ctx.clearRect(0, 0, 1000, 1000);
      for (const snake of this.model.snakes.values()) {
        this.ctx.fillStyle = 'lime';
        for (const segment of snake.body) {
          this.ctx.fillRect(segment.x, segment.y, 10, 10);
        }
      }
    }
}

SnakeView.register("SnakeView");

export { SnakeView };
  