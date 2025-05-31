'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

// Client-side only wrapper
function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  return children;
}

// Main game component
function GameCanvasInner() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const { address } = useAccount();


  useEffect(() => {
    let mounted = true;

    if(!address) return;

    const initMultisynq = async () => {
      try {
      // Load Multisynq client script
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@multisynq/client@1.0.2/bundled/multisynq-client.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject('Failed to load Multisynq');
        document.body.appendChild(script);
      });

        if (!mounted) return;

      const { Model, View, Session, App } = window.Multisynq;

        // Game constants
        const WORLD_SIZE = 2000;
        const FOOD_COUNT = 100;
        const PLAYER_SPEED = 0.005;
        const BOOST_MULTIPLIER = 1.5;
        const INITIAL_LENGTH = 10;
        const FOOD_VALUE = 1;
        const GROWTH_PER_FOOD = 2;
        const SEGMENT_DISTANCE = 8;
        const CAMERA_SMOOTHING = 0.05;
        const UPDATE_RATE = 1000 / 20;

      // Shared game model
        class SlitherGame extends Model {
          init() {
            this.worldSize = WORLD_SIZE;
            this.players = new Map();  // Map of viewId -> player
            this.food = Array.from({ length: FOOD_COUNT }, () => ({
              x: Math.random() * this.worldSize,
              y: Math.random() * this.worldSize,
              radius: 3
            }));
            this.leaderboard = [];

            console.log('Game model initialized with session ID:', this.id);

            // Subscribe to view events
            this.subscribe(this.sessionId, "view-join", this.handleViewJoin);
            this.subscribe(this.sessionId, "view-exit", this.handleViewExit);
            
            // Subscribe to player events
            this.subscribe("game", "move", this.handleMove);
            this.subscribe("game", "boost", this.handleBoost);
            this.subscribe("game", "collect_food", this.handleFoodCollection);

            this.future(16).update();
          }

          handleViewJoin(viewId) {
            console.log('View joined:', viewId);
            // Create a new player for this view
            const player = this.createPlayer(viewId);
            this.players.set(viewId, player);
            
            // Notify all sessions about the new player
            this.publish("game", "player-joined", { 
              viewId,
              player
            });
          }

          handleViewExit(viewId) {
            console.log('View exited:', viewId);
            const player = this.players.get(viewId);
            if (player) {
              // Notify all sessions that this player is leaving
              this.publish("game", "player-left", { viewId });
              this.players.delete(viewId);
            }
          }

          createPlayer(viewId) {
            const x = Math.random() * this.worldSize;
            const y = Math.random() * this.worldSize;
            const angle = Math.random() * Math.PI * 2;

            return {
              id: viewId,  // Use viewId as player id for simplicity
              viewId,
              x,
              y,
              angle,
              segments: Array(INITIAL_LENGTH).fill({ x, y }),
              speed: PLAYER_SPEED,
              isBoosting: false,
              radius: 12,
              score: 0,
              lastSegmentDistance: 0,
              sessionId: this.id,
            };
          }

          handleMove(viewId, data) {
            const player = this.players.get(viewId);
            if (player) {
              // Update angle and boost state
              player.angle = data.angle;
              player.isBoosting = data.isBoosting;

              // Update position with fixed speed
              const speed = player.isBoosting ? PLAYER_SPEED * BOOST_MULTIPLIER : PLAYER_SPEED;
              const newX = player.x + Math.cos(player.angle) * speed;
              const newY = player.y + Math.sin(player.angle) * speed;

              // Handle world wrapping
              player.x = (newX + this.worldSize) % this.worldSize;
              player.y = (newY + this.worldSize) % this.worldSize;

              // Update segments
              player.lastSegmentDistance += speed;
              if (player.lastSegmentDistance >= SEGMENT_DISTANCE) {
                player.segments.unshift({ x: player.x, y: player.y });
                if (!player.isBoosting && player.segments.length > INITIAL_LENGTH) {
                  player.segments.pop();
                }
                player.lastSegmentDistance = 0;
              }

              // Update all segment positions to follow the head
              for (let i = 1; i < player.segments.length; i++) {
                const prev = player.segments[i - 1];
                const curr = player.segments[i];
                const dx = prev.x - curr.x;
                const dy = prev.y - curr.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > SEGMENT_DISTANCE) {
                  const ratio = SEGMENT_DISTANCE / dist;
                  curr.x = prev.x - dx * ratio;
                  curr.y = prev.y - dy * ratio;
                }
              }

              // Broadcast player update to all sessions
              this.publish("game", "player-update", { 
                viewId,
                player: {
                  id: player.id,
                  viewId: player.viewId,
                  x: player.x,
                  y: player.y,
                  angle: player.angle,
                  segments: player.segments,
                  isBoosting: player.isBoosting,
                  score: player.score
                }
              });
            }
          }

          handleBoost(viewId, data) {
            const player = this.players.get(viewId);
            if (player) {
              player.isBoosting = data.isBoosting;
            }
          }

          handleFoodCollection(data) {
            const viewId = data.viewId;
            const player = this.players.get(viewId);
            if (player) {
              player.score += FOOD_VALUE;
              const lastSegment = player.segments[player.segments.length - 1];
              for (let i = 0; i < GROWTH_PER_FOOD; i++) {
                player.segments.push({ ...lastSegment });
              }
            }
          }

          update() {
            this.leaderboard = Array.from(this.players.values())
              .sort((a, b) => b.score - a.score)
              .slice(0, 10);

            setLeaderboard(this.leaderboard);

            this.future(16).update();
          }
        }

        SlitherGame.register('SlitherGame');

      // Visual game view
        class SlitherView extends View {
        constructor(model) {
          super(model);
          this.model = model;
            this.canvas = null;
            this.ctx = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.isBoosting = false;
            this.camera = {
              x: model.worldSize / 2,
              y: model.worldSize / 2,
              targetX: model.worldSize / 2,
              targetY: model.worldSize / 2,
              scale: 0.5,
              initialized: false
            };
            this.lastUpdateTime = 0;
            this.updateInterval = UPDATE_RATE;
            this.lastAngle = 0;
            this.lastBoostState = false;
            this.pendingUpdate = null;
            this.updateTimeout = null;
            this.localPlayerId = null;
            console.log('View created with model ID:', model.id);
          }

          init(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.mouseX = canvas.width / 2;
            this.mouseY = canvas.height / 2;
            this.setupEventListeners();

            for (const [id, player] of this.model.players) {
              // Use viewId to determine which player to control
              // First player (viewId 1) controls player 1, second player (viewId 2) controls player 2
              if (id === this.viewId) {
                this.localPlayerId = id;
                this.camera.x = player.x;
                this.camera.y = player.y;
                this.camera.targetX = player.x;
                this.camera.targetY = player.y;
                this.camera.initialized = true;
                console.log('Assigned local player ID:', this.localPlayerId);
                break;
              }
            }
          }

          setupEventListeners() {
            if (!this.canvas) return;

            this.canvas.addEventListener('mousemove', (e) => {
              const rect = this.canvas.getBoundingClientRect();
              this.mouseX = e.clientX - rect.left;
              this.mouseY = e.clientY - rect.top;
            });

            this.canvas.addEventListener('mousedown', () => {
              this.isBoosting = true;
              this.publish("game", "boost", { isBoosting: true });
            });

            this.canvas.addEventListener('mouseup', () => {
              this.isBoosting = false;
              this.publish("game", "boost", { isBoosting: false });
            });
          }

          worldToScreen(x, y) {
            return {
              x: (x - this.camera.x) * this.camera.scale + this.canvas.width / 2,
              y: (y - this.camera.y) * this.camera.scale + this.canvas.height / 2
            };
          }

          screenToWorld(screenX, screenY) {
            return {
              x: (screenX - this.canvas.width / 2) / this.camera.scale + this.camera.x,
              y: (screenY - this.canvas.height / 2) / this.camera.scale + this.camera.y
            };
          }

          drawGrid() {
            if (!this.ctx) return;
            
            this.ctx.strokeStyle = '#eee';
            this.ctx.lineWidth = 1;
            const gridSize = 100;
            
            const startX = Math.floor((this.camera.x - this.canvas.width / (2 * this.camera.scale)) / gridSize) * gridSize;
            const startY = Math.floor((this.camera.y - this.canvas.height / (2 * this.camera.scale)) / gridSize) * gridSize;
            const endX = Math.ceil((this.camera.x + this.canvas.width / (2 * this.camera.scale)) / gridSize) * gridSize;
            const endY = Math.ceil((this.camera.y + this.canvas.height / (2 * this.camera.scale)) / gridSize) * gridSize;

            for (let x = startX; x <= endX; x += gridSize) {
              const screenX = this.worldToScreen(x, 0).x;
              this.ctx.beginPath();
              this.ctx.moveTo(screenX, 0);
              this.ctx.lineTo(screenX, this.canvas.height);
              this.ctx.stroke();
            }

            for (let y = startY; y <= endY; y += gridSize) {
              const screenY = this.worldToScreen(0, y).y;
              this.ctx.beginPath();
              this.ctx.moveTo(0, screenY);
              this.ctx.lineTo(this.canvas.width, screenY);
              this.ctx.stroke();
            }
          }

          drawFood() {
            if (!this.ctx) return;
            
            this.ctx.fillStyle = '#ff0000';
            this.model.food.forEach(foodItem => {
              const screenPos = this.worldToScreen(foodItem.x, foodItem.y);
              this.ctx.beginPath();
              this.ctx.arc(screenPos.x, screenPos.y, foodItem.radius * this.camera.scale, 0, Math.PI * 2);
              this.ctx.fill();
            });
          }

          drawPlayer(player) {
            const isCurrentPlayer = player.id === this.localPlayerId;
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            gradient.addColorStop(0, isCurrentPlayer ? '#00ff00' : '#0000ff');
            gradient.addColorStop(1, isCurrentPlayer ? '#008800' : '#000088');

            // Draw segments with proper world wrapping
            for (let i = 0; i < player.segments.length; i++) {
              const segment = player.segments[i];
              const screenPos = this.worldToScreen(segment.x, segment.y);
              const segmentWidth = Math.max(4, (player.segments.length - i) / player.segments.length * 6 + 4);
              
              this.ctx.strokeStyle = gradient;
              this.ctx.lineWidth = segmentWidth * this.camera.scale;
              
              if (i === 0) {
                // Draw head
                this.ctx.fillStyle = isCurrentPlayer ? '#00ff00' : '#0000ff';
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, player.radius * this.camera.scale, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw eyes
                const eyeOffset = player.radius * 0.6;
                const eyeAngle = player.angle + Math.PI / 2;
                const leftEyeX = screenPos.x + Math.cos(eyeAngle) * eyeOffset;
                const leftEyeY = screenPos.y + Math.sin(eyeAngle) * eyeOffset;
                const rightEyeX = screenPos.x - Math.cos(eyeAngle) * eyeOffset;
                const rightEyeY = screenPos.y - Math.sin(eyeAngle) * eyeOffset;
                
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(leftEyeX, leftEyeY, 2 * this.camera.scale, 0, Math.PI * 2);
                this.ctx.arc(rightEyeX, rightEyeY, 2 * this.camera.scale, 0, Math.PI * 2);
                this.ctx.fill();
              } else {
                // Draw segment
                const prevSegment = player.segments[i - 1];
                const prevScreenPos = this.worldToScreen(prevSegment.x, prevSegment.y);
                
                // Only draw if segments are close enough in screen space
                const dx = screenPos.x - prevScreenPos.x;
                const dy = screenPos.y - prevScreenPos.y;
                const screenDist = Math.sqrt(dx * dx + dy * dy);
                
                if (screenDist < this.canvas.width) {
                  this.ctx.beginPath();
                  this.ctx.moveTo(prevScreenPos.x, prevScreenPos.y);
                  this.ctx.lineTo(screenPos.x, screenPos.y);
                  this.ctx.stroke();
                }
              }
            }

            if (isCurrentPlayer) {
              this.ctx.fillStyle = '#000';
              this.ctx.font = 'bold 24px Arial';
              this.ctx.fillText(`Score: ${player.score}`, 10, 30);
            }
          }

          scheduleUpdate(angle, isBoosting) {
            this.pendingUpdate = { angle, isBoosting };
            
            if (this.updateTimeout) {
              clearTimeout(this.updateTimeout);
            }

            this.updateTimeout = setTimeout(() => {
              if (this.pendingUpdate) {
                const now = Date.now();
                if (now - this.lastUpdateTime >= this.updateInterval) {
                  this.publish("game", "move", this.pendingUpdate);
                  this.lastUpdateTime = now;
                  this.lastAngle = this.pendingUpdate.angle;
                  this.lastBoostState = this.pendingUpdate.isBoosting;
                  this.pendingUpdate = null;
                }
              }
            }, this.updateInterval);
        }
    
        update() {
            if (!this.ctx || !this.canvas) return;

            const player = this.localPlayerId ? this.model.players.get(this.localPlayerId) : null;
            if (player) {
              if (this.camera.initialized) {
                this.camera.targetX = player.x;
                this.camera.targetY = player.y;

                this.camera.x += (this.camera.targetX - this.camera.x) * CAMERA_SMOOTHING;
                this.camera.y += (this.camera.targetY - this.camera.y) * CAMERA_SMOOTHING;
              }

              const mouseWorld = this.screenToWorld(this.mouseX, this.mouseY);
              const dx = mouseWorld.x - player.x;
              const dy = mouseWorld.y - player.y;
              const angle = Math.atan2(dy, dx);
              
              const angleChanged = Math.abs(angle - this.lastAngle) > 0.05;
              const boostChanged = this.isBoosting !== this.lastBoostState;
              
              if (angleChanged || boostChanged) {
                this.scheduleUpdate(angle, this.isBoosting);
              }

              player.angle = angle;
              player.isBoosting = this.isBoosting;
              
              const speed = (player.isBoosting ? PLAYER_SPEED * BOOST_MULTIPLIER : PLAYER_SPEED);
              player.x += Math.cos(player.angle) * speed;
              player.y += Math.sin(player.angle) * speed;

              player.x = (player.x + this.model.worldSize) % this.model.worldSize;
              player.y = (player.y + this.model.worldSize) % this.model.worldSize;

              player.lastSegmentDistance += speed;
              if (player.lastSegmentDistance >= SEGMENT_DISTANCE) {
                player.segments.unshift({ x: player.x, y: player.y });
                if (!player.isBoosting && player.segments.length > INITIAL_LENGTH) {
                  player.segments.pop();
                }
                player.lastSegmentDistance = 0;
              }
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.drawGrid();
            this.drawFood();
            const players = Array.from(this.model.players.values());
            players.forEach(player => this.drawPlayer(player));

            requestAnimationFrame(() => this.update());
          }

          cleanup() {
            if (this.updateTimeout) {
              clearTimeout(this.updateTimeout);
            }
            // Notify other sessions that this player is leaving
            if (this.localPlayerId) {
              const player = this.model.players.get(this.localPlayerId);
              if (player) {
                this.publish("game", "sync_players", { 
                  player: { ...player, isLeaving: true }
                });
              }
            }
          }
        }

      Session.join({
        apiKey: '2sUwdjpchMjfGov5Elo0jNewJPQ5Gij6PEtvzNcR4I',
        appId: 'hackathon.slither.app',
        name: 'slither-game-session',
        password: 'slither-game-password',
        model: SlitherGame,
        view: SlitherView,
        reconnect: true,
        maxReconnectAttempts: 5,
        reconnectInterval: 1000,
        debug: true
      }).then(session => {
        console.log('Session joined:', session);

        const view = session.view;
        if (canvasRef.current) {
          view.init(canvasRef.current);
          console.log('View initialized with canvas');
          
          // Log session state periodically
          const intervalId = setInterval(() => {
            const model = session.model;
            console.log('Session state:', {
              sessionId: session.id,
              modelId: model.id,
              appId: session.appId,
              name: session.name,
              isHost: session.isHost,
              players: Array.from(model.players.entries()).map(([id, p]) => ({
                id,
                sessionId: p.sessionId,
                modelId: model.id
              }))
            });
          }, 5000);
          
          return () => {
            clearInterval(intervalId);
            view.cleanup();
          };
        } else {
          console.error('Canvas ref not available');
        }
      }).catch(error => {
        console.error('Session join error:', error);
      });
      } catch (error) {
        console.error('Failed to initialize game:', error);
      }
    };

    initMultisynq();

    return () => {
      mounted = false;
    };
  }, [address]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 bg-white"
      />
      <div className="mt-4 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
        <div className="space-y-1">
          {leaderboard.map((player, index) => (
            <div key={player.id} className="flex justify-between">
              <span>{index + 1}. Player {player.id.slice(0, 4)}</span>
              <span>{player.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Export the wrapped component
export default function GameCanvas() {
  return (
    <ClientOnly>
      <GameCanvasInner />
    </ClientOnly>
  );
}
