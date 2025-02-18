import React, { useRef, useEffect, useState } from 'react';

const DynamicBackground = () => {
  const canvasRef = useRef(null);
  const [tradableItems, setTradableItems] = useState([]);

  useEffect(() => {
    // Fetch tradable items from the API
    fetch('https://prices.runescape.wiki/api/v1/osrs/mapping')
      .then(response => response.json())
      .then(data => {
        const items = data.map(item => item.name).filter(name => name);
        setTradableItems(items);
      })
      .catch(error => console.error('Error fetching tradable items:', error));
  }, []);

  useEffect(() => {
    if (tradableItems.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastFlashTime = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    const rows = Math.ceil(canvas.height / fontSize);
    const flashingItems = [];

    // Initialize flashing items
    for (let i = 0; i < columns; i++) {
      flashingItems[i] = [];
      for (let j = 0; j < rows; j++) {
        flashingItems[i][j] = { item: null, trend: null, color: null, opacity: 0 };
      }
    }

    const addNewFlash = () => {
      const i = Math.floor(Math.random() * columns);
      const j = Math.floor(Math.random() * rows);
      if (flashingItems[i][j].item === null) {
        const trend = Math.random() < 0.5 ? '↑' : '↓';
        const color = trend === '↑' ? 'lime' : 'red';
        flashingItems[i][j] = {
          item: tradableItems[Math.floor(Math.random() * tradableItems.length)],
          trend: trend,
          color: color,
          opacity: 1,
          fadeStartTime: Date.now() + 5000 // Start fading after 5 seconds
        };
      }
    };

    const draw = (timestamp) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add a new flash approximately once per second
      if (timestamp - lastFlashTime > 1000) {
        addNewFlash();
        lastFlashTime = timestamp;
      }

      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * fontSize;
          const y = (j + 1) * fontSize;

          // Draw and update flashing items
          if (flashingItems[i][j].item !== null) {
            const currentTime = Date.now();
            if (currentTime >= flashingItems[i][j].fadeStartTime) {
              flashingItems[i][j].opacity -= 0.02; // Slower fade
            }
            
            ctx.fillStyle = `rgba(${flashingItems[i][j].color === 'lime' ? '0,255,0' : '255,0,0'},${flashingItems[i][j].opacity})`;
            ctx.fillText(`${flashingItems[i][j].item} ${flashingItems[i][j].trend}`, x, y);

            if (flashingItems[i][j].opacity <= 0) {
              flashingItems[i][j].item = null;
            }
          }
        }
      }

      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw(0);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [tradableItems]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 1 }} />;
};

export default DynamicBackground;