const canvas = document.querySelector("#goldCanvas");
const ctx = canvas.getContext("2d");
const revealItems = document.querySelectorAll(".reveal");
const loveButton = document.querySelector(".love-button");
const musicToggle = document.querySelector(".music-toggle");

let particles = [];
let audioContext;
let masterGain;
let musicTimer;
let isMusicPlaying = false;

const notes = [261.63, 329.63, 392.0, 493.88, 523.25, 392.0, 329.63, 293.66];

function sizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * pixelRatio);
  canvas.height = Math.floor(window.innerHeight * pixelRatio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const count = window.innerWidth < 700 ? 56 : 96;
  particles = Array.from({ length: count }, createParticle);
}

function createParticle() {
  return {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 2.6 + 0.4,
    speed: Math.random() * 0.35 + 0.08,
    drift: Math.random() * 0.25 - 0.125,
    alpha: Math.random() * 0.55 + 0.15,
  };
}

function drawParticles() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  particles.forEach((particle) => {
    particle.y -= particle.speed;
    particle.x += particle.drift;

    if (particle.y < -10) {
      particle.y = window.innerHeight + 10;
      particle.x = Math.random() * window.innerWidth;
    }

    if (particle.x < -10) {
      particle.x = window.innerWidth + 10;
    }

    if (particle.x > window.innerWidth + 10) {
      particle.x = -10;
    }

    const glow = ctx.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.radius * 8
    );
    glow.addColorStop(0, `rgba(246, 215, 122, ${particle.alpha})`);
    glow.addColorStop(0.42, `rgba(216, 173, 71, ${particle.alpha * 0.34})`);
    glow.addColorStop(1, "rgba(216, 173, 71, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * 8, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

function launchHeart(x, y) {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = "❤️";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  document.body.appendChild(heart);
  window.setTimeout(() => heart.remove(), 1850);
}

function createAudio() {
  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.08;
  masterGain.connect(audioContext.destination);
}

function playTone(frequency, delay, duration) {
  const now = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, now);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(900, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.05);
}

function playPhrase() {
  notes.forEach((note, index) => {
    playTone(note, index * 0.58, 1.45);
    playTone(note / 2, index * 0.58, 1.8);
  });
}

function startMusic() {
  if (!audioContext) {
    createAudio();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  isMusicPlaying = true;
  musicToggle.textContent = "Pause Music";
  musicToggle.setAttribute("aria-pressed", "true");
  playPhrase();
  musicTimer = window.setInterval(playPhrase, 4700);
}

function stopMusic() {
  isMusicPlaying = false;
  musicToggle.textContent = "Play Music";
  musicToggle.setAttribute("aria-pressed", "false");
  window.clearInterval(musicTimer);

  if (masterGain) {
    masterGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.08);
    window.setTimeout(() => {
      if (masterGain && !isMusicPlaying) {
        masterGain.gain.value = 0.08;
      }
    }, 220);
  }
}

musicToggle.addEventListener("click", () => {
  if (isMusicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
});

loveButton.addEventListener("click", (event) => {
  const buttonBox = event.currentTarget.getBoundingClientRect();
  const centerX = buttonBox.left + buttonBox.width / 2;
  const centerY = buttonBox.top + buttonBox.height / 2;

  for (let index = 0; index < 18; index += 1) {
    window.setTimeout(() => {
      const x = centerX + Math.random() * 120 - 60;
      const y = centerY + Math.random() * 30 - 15;
      launchHeart(x, y);
    }, index * 45);
  }

  if (!isMusicPlaying) {
    startMusic();
  }
});

window.addEventListener("resize", sizeCanvas);

sizeCanvas();
drawParticles();
