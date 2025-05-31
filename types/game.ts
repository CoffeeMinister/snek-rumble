export type Vec2 = { x: number; y: number };

export type Snake = {
  id: string;
  player: string;
  body: Vec2[];
  direction: Vec2;
  size: number;
  alive: boolean;
};

export type Food = {
  id: string;
  x: number;
  y: number;
  amount: number;
  fromPlayer?: string;
};

export type GameState = {
  snakes: Record<string, Snake>;
  food: Record<string, Food>;
  deaths: Record<string, { time: number }>;
};
