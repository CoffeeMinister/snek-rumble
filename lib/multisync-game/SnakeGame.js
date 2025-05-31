import { Model } from "@multisynq/client";
import { Snake } from './Snake.js';

export class SnakeGame extends Model {
  init() {
    this.snakes = new Map();
    this.subscribe(this.sessionId, "view-join", this.viewJoined);
    this.subscribe(this.sessionId, "view-exit", this.viewExited);
    this.mainLoop();
  }

  viewJoined(viewId) {
    const snake = Snake.create({ viewId });
    this.snakes.set(viewId, snake);
  }

  viewExited(viewId) {
    const snake = this.snakes.get(viewId);
    if (snake) {
      this.snakes.delete(viewId);
      snake.destroy();
    }
  }

  mainLoop() {
    for (const snake of this.snakes.values()) {
      snake.move();
    }
    this.future(100).mainLoop();
  }
}
