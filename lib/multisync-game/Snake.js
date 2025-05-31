import { Model } from "@multisynq/client";

class Snake extends Model {
    init({ viewId }) {
      this.viewId = viewId;
      this.body = [{ x: 100 + Math.random() * 500, y: 100 + Math.random() * 500 }];
      this.direction = { x: 1, y: 0 };
      this.size = 5;
      this.subscribe(viewId, "set-direction", this.setDirection);
    }
  
    setDirection(dir) {
      this.direction = dir;
    }
  
    move() {
      const head = {
        x: this.body[0].x + this.direction.x * 5,
        y: this.body[0].y + this.direction.y * 5,
      };
      this.body.unshift(head);
      while (this.body.length > this.size) this.body.pop();
    }
  }
  Snake.register("Snake");
  
export { Snake };