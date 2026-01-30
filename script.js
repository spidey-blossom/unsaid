// -----------------------------
// State machine (4 steps)
// -----------------------------
const steps = Array.from(document.querySelectorAll(".step"));
const progressText = document.getElementById("progressText");

const nextButtons = document.querySelectorAll("[data-next]");
const backButtons = document.querySelectorAll("[data-back]");
const exitButtons = document.querySelectorAll("[data-exit]");

let currentStep = 0;

// -----------------------------
// Soft typing effect (State 0)
// -----------------------------
const typeEl = document.getElementById("typeText");

const TYPE_LINES = [
  "I didn’t know how to say this in a message…",
  "so I made something small."
];

const TYPE_SPEED = 26;
const LINE_PAUSE = 420;

let typingStarted = false;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function typeLine(el, line) {
  for (let i = 0; i < line.length; i++) {
    el.textContent += line[i];
    await sleep(TYPE_SPEED);
  }
}

async function runTyping() {
  if (!typeEl) return;
  typeEl.textContent = "";
  for (let i = 0; i < TYPE_LINES.length; i++) {
    await typeLine(typeEl, TYPE_LINES[i]);
    if (i !== TYPE_LINES.length - 1) {
      await sleep(LINE_PAUSE);
      typeEl.textContent += "\n";
    }
  }
}

// -----------------------------
// Photo slider (FAST, no auto-detect)
// Files: images/1.jpeg ... images/4.jpeg
// -----------------------------
const slider = document.getElementById("photoSlider");
const sliderImg = document.getElementById("sliderImg");
const sliderCount = document.getElementById("sliderCount");
const sliderHint = document.getElementById("sliderHint");
const prevImgBtn = document.getElementById("prevImg");
const nextImgBtn = document.getElementById("nextImg");

const PHOTO_COUNT = 4;              // ✅ you said 4 photos
const PHOTO_EXT = "jpeg";           // change to "jpg" if needed

let photos = [];
let photoIndex = 0;

function initPhotos() {
  photos = Array.from({ length: PHOTO_COUNT }, (_, i) => `images/${i + 1}.${PHOTO_EXT}`);

  if (!slider) return;

  if (PHOTO_COUNT <= 0) {
    sliderHint.textContent = "Add photos in /images named 1.jpeg, 2.jpeg, 3.jpeg...";
    prevImgBtn.disabled = true;
    nextImgBtn.disabled = true;
    sliderImg.removeAttribute("src");
    sliderCount.textContent = "";
    return;
  }

  sliderHint.textContent = "";
  prevImgBtn.disabled = false;
  nextImgBtn.disabled = false;
  showPhoto(0);
}

function showPhoto(i) {
  if (!photos.length) return;

  photoIndex = (i + photos.length) % photos.length;

  // smooth fade-in
  sliderImg.classList.remove("loaded");
  sliderImg.onload = () => sliderImg.classList.add("loaded");

  sliderImg.src = photos[photoIndex];
  sliderCount.textContent = `${photoIndex + 1} / ${photos.length}`;
}

prevImgBtn?.addEventListener("click", () => showPhoto(photoIndex - 1));
nextImgBtn?.addEventListener("click", () => showPhoto(photoIndex + 1));

// -----------------------------
// Offer choices + WhatsApp
// -----------------------------
const choiceYes = document.getElementById("choiceYes");
const choiceNo = document.getElementById("choiceNo");
const endingWrap = document.getElementById("ending");
const endingTitle = document.getElementById("endingTitle");
const endingText = document.getElementById("endingText");
const whatsappBtn = document.getElementById("whatsappBtn");

let choice = null; // "yes" | "no"

function buildWhatsAppLink(message) {
  const phone = "27838582088"; // ✅ your number (no +)
  const base = phone ? `https://wa.me/${phone}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

function setEnding(which) {
  choice = which;

  if (which === "yes") {
    endingTitle.textContent = "Okay… then let’s do it properly.";
    endingText.textContent =
      "No rushing, no pressure. Just one real conversation and we see what’s there.";

    const msg = "Hey :) I saw the site. I’m open to a proper talk.";
    whatsappBtn.href = buildWhatsAppLink(msg);
  } else {
    endingTitle.textContent = "Thank you for being honest.";
    endingText.textContent =
      "No hard feelings Bloss. I meant it when I said I care about you, and I’m grateful for what we had.";

    const msg = "Hey, I saw it. Thank you for making it. I’m not ready to restart, but I appreciate you.";
    whatsappBtn.href = buildWhatsAppLink(msg);
  }

  endingWrap.hidden = false;
  endingWrap.scrollIntoView({ behavior: "smooth", block: "start" });
}

choiceYes?.addEventListener("click", () => setEnding("yes"));
choiceNo?.addEventListener("click", () => setEnding("no"));

// -----------------------------
// Navigation render
// -----------------------------
function render() {
  steps.forEach(s => s.hidden = true);
  const active = steps.find(s => Number(s.dataset.step) === currentStep);
  if (active) active.hidden = false;

  progressText.textContent = `${currentStep + 1} / 4`;

  if (currentStep === 3 && !choice) {
    endingWrap.hidden = true;
  }

  if (currentStep === 0 && !typingStarted) {
    typingStarted = true;
    runTyping();
  }
}

function goToStep(step) {
  currentStep = Math.max(0, Math.min(3, step));
  render();
}

// -----------------------------
// Background music (gentle)
// NOTE: requires these in index.html:
// <audio id="bgMusic" loop preload="auto"><source src="audio/background.mp3" type="audio/mpeg"></audio>
// <button id="musicToggle" class="music-toggle">🔈</button>
// -----------------------------
const bgMusic = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");

let musicStarted = false;
let musicMuted = false;

if (bgMusic) bgMusic.volume = 0.25;

function startMusicOnce() {
  if (!bgMusic || musicStarted) return;
  bgMusic.play().catch(() => {
    // browser blocked it — that's okay (will work after interaction usually)
  });
  musicStarted = true;
}

function toggleMusic() {
  if (!bgMusic || !musicToggle) return;

  if (musicMuted) {
    bgMusic.muted = false;
    musicToggle.textContent = "🔈";
  } else {
    bgMusic.muted = true;
    musicToggle.textContent = "🔇";
  }

  musicMuted = !musicMuted;
}

musicToggle?.addEventListener("click", toggleMusic);

// Hook navigation buttons
nextButtons.forEach(btn =>
  btn.addEventListener("click", () => {
    startMusicOnce(); // 🎵 starts after first click
    goToStep(currentStep + 1);
  })
);

backButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentStep === 3) {
      choice = null;
      endingWrap.hidden = true;
    }
    goToStep(currentStep - 1);
  });
});

exitButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".card").innerHTML = `
      <div style="padding:26px 22px;">
        <h2 style="margin:0 0 10px;">All good.</h2>
        <p style="margin:0; line-height:1.55; color:rgba(20,20,40,0.62);">
          You don’t have to do anything with this.
          If you ever want to talk, you know where to find me.
        </p>
      </div>
    `;
  });
});

// -----------------------------
// Floating emojis (bright + lively)
// -----------------------------
const floatLayer = document.getElementById("floatLayer");
const EMOJIS = ["💗", "💖", "✨", "🌸", "🫧", "💞", "🎀", "🌷", "🩷", "😊"];

function spawnEmoji() {
  if (!floatLayer) return;

  const el = document.createElement("div");
  el.className = "float-emoji";
  el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  const left = Math.random() * 100;
  const size = 16 + Math.random() * 16;     // 16-32px
  const duration = 9 + Math.random() * 10;  // 9-19s

  const drift = (Math.random() * 120 - 60).toFixed(0) + "px";
  const spin = (Math.random() * 120 - 60).toFixed(0) + "deg";

  el.style.left = left + "vw";
  el.style.fontSize = size + "px";
  el.style.animationDuration = duration + "s";
  el.style.setProperty("--drift", drift);
  el.style.setProperty("--spin", spin);

  floatLayer.appendChild(el);
  setTimeout(() => el.remove(), (duration + 1) * 1000);
}

function startEmojis() {
  for (let i = 0; i < 8; i++) setTimeout(spawnEmoji, i * 250);
  setInterval(spawnEmoji, 650);
}

// -----------------------------
// Init
// -----------------------------
render();
initPhotos();
startEmojis();
