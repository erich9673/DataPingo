/* Home page only: the hero's aurora canvas. */
// Hero canvas — Aurora flowing curves
(function() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf, t = 0;

  const curves = [
    { color:[5,206,240],   alpha:0.22, phase:0,   speed:0.55, amp:0.13, freq:1.2, yBase:0.35, width:1.5 },
    { color:[124,77,204],  alpha:0.17, phase:1.5, speed:0.38, amp:0.10, freq:0.9, yBase:0.52, width:1.0 },
    { color:[5,206,240],   alpha:0.11, phase:3.0, speed:0.65, amp:0.08, freq:1.5, yBase:0.68, width:0.8 },
    { color:[129,140,248], alpha:0.15, phase:0.8, speed:0.46, amp:0.12, freq:0.7, yBase:0.44, width:1.2 },
    { color:[5,206,240],   alpha:0.07, phase:2.2, speed:0.72, amp:0.06, freq:2.0, yBase:0.25, width:0.6 },
  ];

  function resize() { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    t += 0.01;
    curves.forEach(c => {
      ctx.beginPath();
      const yC = canvas.height * c.yBase;
      const amp = canvas.height * c.amp;
      const freq = (Math.PI * 2 * c.freq) / canvas.width;
      for (let x = 0; x <= canvas.width; x += 2) {
        const y = yC + amp * Math.sin(freq * x + t * c.speed + c.phase);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      const [r,g,b] = c.color;
      ctx.strokeStyle = `rgba(${r},${g},${b},${c.alpha})`;
      ctx.lineWidth = c.width;
      ctx.stroke();
    });
    raf = requestAnimationFrame(draw);
  }

  new ResizeObserver(resize).observe(canvas.parentElement);
  resize();
  if (!reduced) {
    let onScreen = true;
    const start = () => { cancelAnimationFrame(raf); if (onScreen && !document.hidden) draw(); };
    draw();
    document.addEventListener('visibilitychange', start);
    // Stop the loop once the hero scrolls away — otherwise it keeps repainting
    // the whole time someone reads the rest of the page.
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; start(); },
                             { threshold: 0 }).observe(canvas);
  }
})();
