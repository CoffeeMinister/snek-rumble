import { Session } from "@multisynq/client";
import { SnakeGame } from './SnakeGame.js';
import { Snake } from './Snake.js';
import { SnakeView } from './SnakeView.js';

// Export all classes
export { SnakeGame, Snake, SnakeView };

// Register safely to avoid hot reload crashes
if (typeof window !== 'undefined' && window.Multisynq) {
  if (!window.Multisynq._models?.SnakeGame) SnakeGame.register("SnakeGame");
  if (!window.Multisynq._models?.Snake) Snake.register("Snake");
  if (!window.Multisynq._views?.SnakeView) SnakeView.register("SnakeView");
}

console.log("Joining Multisynq session...");

Session.join({
  apiKey: '2sUwdjpchMjfGov5Elo0jNewJPQ5Gij6PEtvzNcR4I',
  appId: 'io.rugjumble.game',
  model: SnakeGame,
  view: SnakeView,
});
