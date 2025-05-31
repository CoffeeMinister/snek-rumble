'use client';

import { useEffect, useRef, useState } from 'react';

export default function GameCanvas() {
  const [count, setCount] = useState(0);
  const countDisplayRef = useRef(null);

  useEffect(() => {
    const initMultisynq = async () => {
      if (typeof window === 'undefined') return;

      // Load Multisynq client script
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@multisynq/client@1.0.2/bundled/multisynq-client.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject('Failed to load Multisynq');
        document.body.appendChild(script);
      });

      const { Model, View, Session } = window.Multisynq;

      // Shared game model
      class CounterGame extends Model {
        init() {
          this.count = 0;
          this.subscribe("counter", "reset", this.resetCounter);
          this.future(100).tick();
        }
    
        resetCounter() {
          this.count = 0;
        }
    
        tick() {
          this.count += 0.1;
          setCount(this.count); // Update React state
          this.future(100).tick();
        }
      }

      CounterGame.register('CounterGame');

      // Visual game view
      class CounterView extends View {
        constructor(model) {
          super(model);
          this.model = model;
        }
    
        counterReset() {
          this.publish("counter", "reset");
        }
    
        update() {
          // The update is now handled by React state
        }
      }

      // Start session
      Session.join({
        apiKey: '2sUwdjpchMjfGov5Elo0jNewJPQ5Gij6PEtvzNcR4I',
        appId: 'hackathon.counter.app',
        name: "public",
        password: "none",
        model: CounterGame,
        view: CounterView,
      });
    };

    initMultisynq().catch(console.error);
  }, []);

  const handleReset = () => {
    // The reset will be handled by the Multisynq model
    if (window.Multisynq) {
      const view = window.Multisynq.Session.currentView;
      if (view) {
        view.counterReset();
      }
    }
  };

  return (
    <div 
      ref={countDisplayRef}
      onClick={handleReset}
      className="w-full h-full flex items-center justify-center bg-white cursor-pointer select-none"
    >
      <div className="text-6xl font-bold text-gray-800">
        {count.toFixed(1)}
      </div>
    </div>
  );
}
