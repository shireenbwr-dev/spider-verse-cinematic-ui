let started = false;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// --------------------
// SETUP
// --------------------
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// --------------------
// IMAGE
// --------------------
const background = new Image();
background.src = "background.jpg";

// --------------------
// SOUND SYSTEM
// --------------------
const sounds = {
  click: new Audio("click.mp3"),
  web: new Audio("web.mp3"),
  portal: new Audio("portal.mp3"),
  ambient: new Audio("ambient.mp3")
};
sounds.ambient.loop = true;
sounds.ambient.volume = 0.2;

// Browser requires first user interaction
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  audioUnlocked = true;

  Object.values(sounds).forEach(sound => {
    sound.play()
      .then(() => {
        sound.pause();
        sound.currentTime = 0;
      })
      .catch(() => {});
  });
}

function playSound(sound) {
  if (!audioUnlocked) return;

  sound.currentTime = 0;
  sound.play().catch(() => {});
}

// --------------------
// CURSOR
// --------------------
const cursor = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  tx: canvas.width / 2,
  ty: canvas.height / 2
};

// --------------------
// SYSTEMS
// --------------------
let particles = [];
let portals = [];

// --------------------
// PARALLAX
// --------------------
let parallaxX = canvas.width / 2;
let parallaxY = canvas.height / 2;

// --------------------
// MOUSE
// --------------------
canvas.addEventListener("mousemove", (e) => {
  cursor.tx = e.clientX;
  cursor.ty = e.clientY;

  parallaxX = e.clientX;
  parallaxY = e.clientY;
});

// --------------------
// CLICK EXPLOSION
// --------------------
canvas.addEventListener("click", (e) => {

  unlockAudio();

  playSound(sounds.web);

  explode(e.clientX, e.clientY);
});

function explode(x, y) {
  for (let i = 0; i < 30; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      life: 80
    });
  }
}

// --------------------
// DOUBLE CLICK PORTAL
// --------------------
canvas.addEventListener("dblclick", (e) => {

  unlockAudio();

  playSound(sounds.portal);

  portals.push({
    x: e.clientX,
    y: e.clientY,
    radius: 10,
    life: 60
  });

});

// --------------------
// BACKGROUND (PARALLAX)
// --------------------
function drawBackground() {
  const offsetX = (parallaxX - canvas.width / 2) * 0.02;
  const offsetY = (parallaxY - canvas.height / 2) * 0.02;

  ctx.drawImage(
    background,
    offsetX,
    offsetY,
    canvas.width + 60,
    canvas.height + 60
  );
}

// --------------------
// 🌑 LIGHT FIELD (CINEMATIC REPLACEMENT FOR MASKING)
// --------------------
function drawLightField() {

  const gradient = ctx.createRadialGradient(
    cursor.x,
    cursor.y,
    0,
    cursor.x,
    cursor.y,
    300
  );

  gradient.addColorStop(0, "rgba(0,191,255,0.18)");
  gradient.addColorStop(0.4, "rgba(0,0,0,0.6)");
  gradient.addColorStop(1, "rgba(0,0,0,0.96)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// --------------------
// WEB SYSTEM
// --------------------
function drawWeb() {

  for (let i = 0; i < particles.length; i++) {

    for (let j = i + 1; j < particles.length; j++) {

      const p1 = particles[i];
      const p2 = particles[j];

      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {

        const alpha = 1 - dist / 120;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        ctx.strokeStyle = `rgba(0,191,255,${alpha})`;
        ctx.lineWidth = 1;

        ctx.stroke();
      }
    }
  }
}

// --------------------
// PARTICLES
// --------------------
function drawParticles() {

  for (let i = 0; i < particles.length; i++) {

    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;

    p.vx *= 0.98;
    p.vy *= 0.98;

    p.life--;

    ctx.fillStyle = "#00bfff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  particles = particles.filter(p => p.life > 0);
}

// --------------------
// PORTALS
// --------------------
function drawPortals() {

  for (let i = 0; i < portals.length; i++) {

    const p = portals[i];

    ctx.save();

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

    ctx.strokeStyle = "rgba(0,191,255,0.9)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00bfff";
    ctx.shadowBlur = 35;

    ctx.stroke();

    ctx.restore();

    p.radius += 4;
    p.life--;
  }

  portals = portals.filter(p => p.life > 0);
}

// --------------------
// CURSOR
// --------------------
function updateCursor() {
  cursor.x += (cursor.tx - cursor.x) * 0.15;
  cursor.y += (cursor.ty - cursor.y) * 0.15;
}

function drawCursor() {

  const scale = 1 + Math.sin(Date.now() * 0.01) * 0.2;

  ctx.save();
  ctx.shadowColor = "#00bfff";
  ctx.shadowBlur = 25;

  ctx.strokeStyle = "rgba(0,191,255,0.8)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(cursor.x, cursor.y, 12 * scale, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#00bfff";
  ctx.beginPath();
  ctx.arc(cursor.x, cursor.y, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// --------------------
// MAIN LOOP
// --------------------
function draw() {

  if(!started){
    return;
}

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawLightField();   // 🌑 CINEMATIC SYSTEM

  drawWeb();
  drawParticles();
  drawPortals();

  updateCursor();
  drawCursor();

  requestAnimationFrame(draw);
}




// --------------------
// START
// --------------------
background.onload = () => {};

const intro = document.getElementById("intro");
const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {

    unlockAudio();

    playSound(sounds.click);

    intro.style.transition = "opacity 1s ease";
    intro.style.opacity = "0";

    setTimeout(() => {

        intro.style.display = "none";

        started = true;

        draw();

    },1000);

});