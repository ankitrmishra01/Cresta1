import { useEffect, useRef } from 'react';

const BackgroundEffects = ({ isDark }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0, animId;
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const onMouseMove = (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const dataPoints = [
      '₹76,034','▲2.4%','SENSEX','₹23,639','NIFTY','▼0.95%',
      '24,261','78,205','▲1.18%','8,684','▼0.28%','NSE','BSE',
      '+312','−227','FTSE','NYSE','▲0.82%','₹1,408','HOLD',
      'BUY','SELL','56,950','▲1.66%','β=0.87','RSI','▼0.46%','42,840'
    ];

    class Float {
      constructor(w, h) { this.reset(w, h); this.alpha = Math.random() * 0.05; }
      reset(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.text = dataPoints[Math.floor(Math.random() * dataPoints.length)];
        this.maxAlpha = isDark ? 0.25 + Math.random() * 0.15 : 0.20 + Math.random() * 0.15;
        this.alpha = 0; this.fadeIn = true;
        this.speed = 0.002 + Math.random() * 0.003;
        this.size = 12 + Math.floor(Math.random() * 8); // Slightly larger text
        this.drift = (Math.random() - 0.5) * 0.15;
      }
      update(w, h, mouse) {
        if (this.fadeIn) {
          this.alpha += this.speed;
          if (this.alpha >= this.maxAlpha) { this.alpha = this.maxAlpha; this.fadeIn = false; }
        } else {
          this.alpha -= this.speed * 0.5;
          if (this.alpha <= 0) this.reset(w, h);
        }
        
        // Subtle parallax effect away from mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) {
            this.x -= dx * 0.005;
            this.y -= dy * 0.005;
        }

        this.x += this.drift;
        this.y -= 0.15; // Gentle upward drift
      }
      draw(ctx) {
        const pos = this.text.includes('▲') || this.text.includes('+') || this.text === 'BUY';
        const neg = this.text.includes('▼') || this.text.includes('−') || this.text === 'SELL';
        ctx.fillStyle = pos
          ? `rgba(16,185,129,${this.alpha})`
          : neg
          ? `rgba(239,68,68,${this.alpha})`
          : isDark
          ? `rgba(255,255,255,${this.alpha * 0.7})`
          : `rgba(0,0,0,${this.alpha * 0.7})`;
        ctx.font = `500 ${this.size}px "Inter", monospace`;
        ctx.fillText(this.text, this.x, this.y);
      }
    }

    const floats = Array.from({ length: 15 }, () => new Float(canvas.width, canvas.height));

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Draw Spotlight
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 600);
      gradient.addColorStop(0, isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      floats.forEach(f => { f.update(w, h, mouse); f.draw(ctx); });
      t += 0.010; 
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
};

export default BackgroundEffects;
