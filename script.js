const canvas = document.querySelector("#goldCanvas");
const ctx = canvas.getContext("2d");
const body = document.body;
const curtain = document.querySelector(".intro-curtain");
const openSurpriseButton = document.querySelector(".open-surprise");
const progressBar = document.querySelector(".scroll-progress");
const revealItems = document.querySelectorAll(".reveal");
const loveButton = document.querySelector(".love-button");
const musicToggle = document.querySelector(".music-toggle");
const visualizer = document.querySelector(".visualizer");
const confettiButton = document.querySelector(".confetti-button");
const shareButton = document.querySelector(".share-button");
const memoryCards = document.querySelectorAll(".memory-card");
const lightbox = document.querySelector(".memory-lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxTitle = lightbox.querySelector("h3");
const lightboxText = lightbox.querySelector("p");
const lightboxClose = document.querySelector(".lightbox-close");
const counters = document.querySelectorAll("[data-count]");
const typewriter = document.querySelector(".typewriter");
const wishForm = document.querySelector(".wish-form");
const wishInput = document.querySelector("#wishInput");
const savedWishes = document.querySelector(".saved-wishes");

let particles = [];
let audioContext;
let masterGain;
let musicTimer;
let isMusicPlaying = false;
let countersStarted = false;
let typewriterStarted = false;

const notes = [261.63, 329.63, 392.0, 493.88, 523.25, 392.0, 329.63, 293.66];
const starterWishes = [
  "May this year bring peace to your heart and pride to your smile.",
  "May your kindness return to you in beautiful ways.",
  "May every day remind you how deeply you are loved.",
];

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
        if (entry.target.querySelector("[data-count]") && !countersStarted) {
          countersStarted = true;
          animateCounters();
        }
        if (entry.target.querySelector(".typewriter") && !typewriterStarted) {
          typewriterStarted = true;
          runTypewriter();
        }
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
}

function animateCounters() {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.count);
    const duration = 1300;
    const startedAt = performance.now();

    function tick(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.round(target * eased);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  });
}

function runTypewriter() {
  const text = typewriter.dataset.typewriter;
  typewriter.textContent = "";

  [...text].forEach((letter, index) => {
    window.setTimeout(() => {
      typewriter.textContent += letter;
    }, index * 42);
  });
}

function launchHeart(x, y) {
  const heart = document.createElement("span");
  heart.className = "floating-heart";
  heart.textContent = "❤️";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  document.body.appendChild(heart);
  window.setTimeout(() => heart.remove(), 1850);
}

function launchConfetti() {
  const colors = ["#f6d77a", "#d8ad47", "#fff7e8", "#e66d86", "#89c6a0"];

  for (let index = 0; index < 90; index += 1) {
    window.setTimeout(() => {
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${Math.random() * 1.8 + 2.1}s`;
      piece.style.transform = `rotate(${Math.random() * 180}deg)`;
      document.body.appendChild(piece);
      window.setTimeout(() => piece.remove(), 4200);
    }, index * 16);
  }
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
  visualizer.classList.add("playing");
  musicToggle.textContent = "Pause Music";
  musicToggle.setAttribute("aria-pressed", "true");
  playPhrase();
  musicTimer = window.setInterval(playPhrase, 4700);
}

function stopMusic() {
  isMusicPlaying = false;
  visualizer.classList.remove("playing");
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

function renderWishes() {
  const wishes = JSON.parse(localStorage.getItem("mavayyaWishes") || "null") || starterWishes;
  savedWishes.innerHTML = "";

  wishes.slice(-6).forEach((wish, index) => {
    const card = document.createElement("article");
    const number = document.createElement("span");
    const text = document.createElement("p");

    number.textContent = `Blessing ${index + 1}`;
    text.textContent = wish;
    card.append(number, text);
    savedWishes.appendChild(card);
  });
}

function saveWish(wish) {
  const wishes = JSON.parse(localStorage.getItem("mavayyaWishes") || "null") || starterWishes;
  wishes.push(wish);
  localStorage.setItem("mavayyaWishes", JSON.stringify(wishes.slice(-6)));
  renderWishes();
}

function openMemory(card) {
  const image = card.querySelector("img");
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = card.dataset.title;
  lightboxText.textContent = card.dataset.note;
  lightbox.showModal();
}

openSurpriseButton.addEventListener("click", () => {
  curtain.classList.add("hidden");
  body.classList.add("surprise-opened");
  startMusic();
});

musicToggle.addEventListener("click", () => {
  if (isMusicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
});

memoryCards.forEach((card) => {
  card.addEventListener("click", () => openMemory(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMemory(card);
    }
  });
});

lightboxClose.addEventListener("click", () => lightbox.close());

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
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

wishForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const wish = wishInput.value.trim();

  if (!wish) {
    wishInput.focus();
    return;
  }

  saveWish(wish);
  wishInput.value = "";
  launchConfetti();
});

confettiButton.addEventListener("click", () => {
  launchConfetti();

  for (let index = 0; index < 12; index += 1) {
    window.setTimeout(() => {
      launchHeart(window.innerWidth / 2 + Math.random() * 180 - 90, window.innerHeight * 0.58);
    }, index * 60);
  }

  if (!isMusicPlaying) {
    startMusic();
  }
});

shareButton.addEventListener("click", async () => {
  const shareData = {
    title: "Happy Birthday Mavayya",
    text: "A special birthday surprise made with love.",
    url: window.location.href,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      shareButton.textContent = "Link Copied";
      window.setTimeout(() => {
        shareButton.textContent = "Share Love";
      }, 1800);
    }
  } catch (error) {
    shareButton.textContent = "Share Ready";
    window.setTimeout(() => {
      shareButton.textContent = "Share Love";
    }, 1800);
  }
});

window.addEventListener("resize", sizeCanvas);
window.addEventListener("scroll", updateProgress, { passive: true });

renderWishes();
updateProgress();
sizeCanvas();
drawParticles();
