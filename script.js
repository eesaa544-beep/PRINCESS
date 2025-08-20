/* ====== SETTINGS ====== */
const CORRECT_PIN = "130206";
const START_DATE = new Date("2024-12-13T00:00:00");
const SHOW_MUSIC_BUTTON = false; // set to true if you want it visible
const MUSIC_PATH = "Saiyaara.mp3"; // you'll upload this yourself if you enable the button
const NICKNAMES = ["Habibti", "Princess", "Noor", "My star", "My moon", "Beloved"];
/* ====================== */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const app = $("#app");
const intro = $("#intro");
const yearSpan = $("#year");
yearSpan.textContent = new Date().getFullYear();

/* ---------- PIN handling ---------- */
const pinInputs = $$("#pinRow .pin");
const gate = $("#gate");
const gateError = $("#gateError");

pinInputs.forEach((input, idx) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0,1);
    if (input.value && idx < pinInputs.length - 1) pinInputs[idx + 1].focus();
    checkPin();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !input.value && idx > 0) {
      pinInputs[idx - 1].focus();
    }
  });
});

function getEnteredPIN(){
  return pinInputs.map(i => i.value).join("");
}
function checkPin(){
  const pin = getEnteredPIN();
  if (pin.length === 6){
    if (pin === CORRECT_PIN){
      gateError.textContent = "";
      openIntroThenMain();
    } else {
      gateError.textContent = "That PIN isn’t right.";
      pinInputs.forEach(i => i.value = "");
      pinInputs[0].focus();
    }
  }
}

/* ---------- Intro -> Main (0.8s dissolve) ---------- */
function openIntroThenMain(){
  gate.classList.add("hidden");
  intro.classList.remove("hidden");
  // show heartbeat for 2.2s, then fade to main
  setTimeout(() => {
    // fade out intro
    intro.style.transition = "opacity .8s ease";
    intro.style.opacity = "0";
    setTimeout(() => {
      intro.classList.add("hidden");
      startApp();
    }, 820);
  }, 2200);
}

/* ---------- Timer ---------- */
function updateTimer(){
  const now = new Date();
  let diff = Math.max(0, now - START_DATE);

  const sec = Math.floor(diff / 1000);
  const days = Math.floor(sec / (3600*24));
  const hours = Math.floor((sec % (3600*24)) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  $("#days").textContent = String(days).padStart(2,"0");
  $("#hours").textContent = String(hours).padStart(2,"0");
  $("#minutes").textContent = String(minutes).padStart(2,"0");
  $("#seconds").textContent = String(seconds).padStart(2,"0");
}

/* ---------- Daily stable pick via hash ---------- */
function hashInt(str, mod){
  let h = 2166136261;
  for (let i=0;i<str.length;i++){
    h ^= str.charCodeAt(i); h += (h<<1) + (h<<4) + (h<<7) + (h<<8) + (h<<24);
  }
  return Math.abs(h) % mod;
}
function todayKey(){
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`;
}

/* ---------- Load JSON, render poem and quote ---------- */
async function loadJSON(path){
  const res = await fetch(path, {cache:"no-store"});
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

function setMetaAndNickname(){
  const d = new Date();
  const opts = { weekday:"short", day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" };
  $("#todayMeta").textContent = d.toLocaleString(undefined, opts);

  const nick = NICKNAMES[ hashInt(todayKey()+"nick", NICKNAMES.length) ];
  $("#nickname").textContent = nick;
}

function renderWhisperLines(targetEl, text){
  targetEl.innerHTML = "";
  // Split by lines (keep punctuation nice)
  const lines = text.split(/\r?\n/).filter(Boolean);
  lines.forEach((ln, i) => {
    const span = document.createElement("div");
    span.className = "line";
    span.style.animationDelay = `${i * 0.22}s`;
    span.textContent = ln;
    targetEl.appendChild(span);
  });
}

async function renderDaily(){
  setMetaAndNickname();

  const [poems, quotes] = await Promise.all([
    loadJSON("poems.json"),
    loadJSON("quotes.json")
  ]);

  // Stable per day
  const pIdx = hashInt(todayKey()+"p", poems.length);
  const qIdx = hashInt(todayKey()+"q", quotes.length);

  const poem = poems[pIdx];
  const quote = quotes[qIdx];

  renderWhisperLines($("#poem"), poem);

  $("#quote").textContent = `“${quote}”`;
}

/* ---------- Music (optional) ---------- */
function setupMusic(){
  const btn = $("#musicBtn");
  if (!SHOW_MUSIC_BUTTON){
    btn.classList.add("hidden");
    return;
  }
  const audio = $("#bgm");
  audio.src = MUSIC_PATH;
  btn.addEventListener("click", async () => {
    try{
      if (audio.paused){ await audio.play(); btn.textContent="Pause Music"; }
      else{ audio.pause(); btn.textContent="Play Music"; }
    }catch(e){
      console.warn("Autoplay blocked, user interaction required.", e);
    }
  });
}

/* ---------- Start App ---------- */
function startApp(){
  app.classList.remove("hidden");
  setupMusic();
  updateTimer();
  setInterval(updateTimer, 1000);
  renderDaily().catch(err => {
    console.error(err);
    $("#poem").textContent = "Something went wrong loading today’s words.";
  });
}

/* If you want to bypass PIN in development, uncomment:
document.addEventListener("DOMContentLoaded", () => { openIntroThenMain(); });
*/
