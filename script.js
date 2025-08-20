/* ====== CONFIG ====== */
const START_DATE = new Date('2024-12-13T00:00:00Z');   // Your origin date (UTC)
const CORRECT_PIN = '130206';                          // your PIN
const INTRO_MS = 2800;                                  // heartbeat time before fade
const SHOW_MUSIC_BUTTON = false;                        // left here in case you re-add later
/* ==================== */

const qs  = (s, r=document) => r.querySelector(s);
const qsa = (s, r=document) => [...r.querySelectorAll(s)];

document.addEventListener('DOMContentLoaded', () => {
  initPinGate();
  qs('#year').textContent = new Date().getFullYear();
});

/* ---------- PIN GATE ---------- */
function initPinGate(){
  const inputs = qsa('#pinRow input');
  const row = qs('#pinRow');
  const err = qs('#gateError');

  // focus first
  inputs[0].focus();

  // auto-move on type
  inputs.forEach((inp, idx) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(0,1);
      if(inp.value && idx < inputs.length-1) inputs[idx+1].focus();
      if(getPinValue().length === 6) verifyPin();
    });

    // backspace to previous
    inp.addEventListener('keydown', (e) => {
      if((e.key === 'Backspace' || e.key === 'Delete') && !inp.value && idx>0){
        inputs[idx-1].focus();
      }
      if(e.key === 'Enter' && getPinValue().length === 6) verifyPin();
    });
  });

  // paste handler
  row.addEventListener('paste', (e) => {
    const txt = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
    if(!txt) return;
    e.preventDefault();
    inputs.forEach((inp,i)=> inp.value = txt[i] || '');
    if(getPinValue().length === 6) verifyPin();
  });

  function getPinValue(){ return inputs.map(i=>i.value).join(''); }

  function verifyPin(){
    const val = getPinValue();
    if(val === CORRECT_PIN){
      err.textContent = '';
      // open intro → main
      startIntro();
    }else{
      err.textContent = 'That PIN didn’t match. Try again 💗';
      qs('.gate-card').classList.remove('shake');
      // retrigger shake
      void qs('.gate-card').offsetWidth;
      qs('.gate-card').classList.add('shake');
      inputs.forEach(i=>i.value='');
      inputs[0].focus();
    }
  }
}

/* ---------- INTRO then MAIN ---------- */
function startIntro(){
  const intro = qs('#intro');
  intro.classList.add('show');
  setTimeout(()=>{
    intro.classList.remove('show');
    qs('#gate').style.display = 'none';
    qs('#app').classList.remove('hidden');
    initApp();
  }, INTRO_MS);
}

/* ---------- MAIN APP ---------- */
function initApp(){
  // countdown
  tick(); setInterval(tick, 1000);

  // daily poem & quote
  loadDaily();
}

function tick(){
  const now = new Date();
  let diff = Math.max(0, now - START_DATE);
  const d = Math.floor(diff/(1000*60*60*24)); diff -= d*24*60*60*1000;
  const h = Math.floor(diff/(1000*60*60));     diff -= h*60*60*1000;
  const m = Math.floor(diff/(1000*60));        diff -= m*60*1000;
  const s = Math.floor(diff/1000);

  qs('#days').textContent  = pad(d);
  qs('#hours').textContent = pad(h);
  qs('#mins').textContent  = pad(m);
  qs('#secs').textContent  = pad(s);

  function pad(n){ return String(n).padStart(2,'0'); }
}

/* Load poems/quotes and display one per day (deterministic, no repeats until cycle) */
async function loadDaily(){
  try{
    const [poems, quotes] = await Promise.all([
      fetch('poems.json').then(r=>r.json()),
      fetch('quotes.json').then(r=>r.json())
    ]);

    const todayKey = formatDateKey(new Date()); // e.g., 2025-08-20
    // make deterministic indices
    const pIdx = stableIndex(todayKey + '-poem', poems.length);
    const qIdx = stableIndex(todayKey + '-quote', quotes.length);

    const p = poems[pIdx];
    const qt = quotes[qIdx];

    // meta
    qs('#poemMeta').textContent = p.author ? `${niceDate()} • ${p.author}` : niceDate();

    // animate poem line-by-line
    renderPoem(p.text);

    // quote
    qs('#quote').textContent = qt;

  }catch(e){
    console.error(e);
    qs('#poem').textContent = 'Poem could not load right now.';
  }
}

function renderPoem(text){
  const box = qs('#poem');
  box.innerHTML = '';
  const lines = text.split(/\r?\n/).filter(Boolean);
  lines.forEach((ln, i) => {
    const span = document.createElement('div');
    span.className = 'poem-line';
    span.style.animationDelay = `${0.45 + i*0.35}s`; // staggered fade/slide
    // Cormorant + subtle calligraphy feel for emphasis words
    span.style.fontFamily = i % 3 === 0 ? '"Cormorant Garamond", serif' : 'Inter, sans-serif';
    span.textContent = ln;
    box.appendChild(span);
  });
}

function formatDateKey(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function niceDate(){
  return new Date().toLocaleString(undefined,{ weekday:'short', day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function stableIndex(key, mod){
  // very small, stable hash → 0…mod-1
  let h=2166136261; // FNV-ish
  for(let i=0;i<key.length;i++){ h^=key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h) % Math.max(1, mod);
}
          boxes[idx].value = d;
        });
        boxes[5].focus();
        checkIfComplete();
      }
    });
  });

  function checkIfComplete(){
    const pin = boxes.map(b=>b.value).join("");
    if(pin.length === 6){
      if(pin === CORRECT_PIN){
        error.textContent = "";
        openIntro();
      }else{
        error.textContent = "That PIN doesn’t look right.";
        boxes.forEach(b=>b.value="");
        boxes[0].focus();
      }
    }
  }
}

/* ====== TRANSITIONS ====== */
function openIntro(){
  // hide gate
  const gate = $("#gate");
  gate.style.animation = "fadeOut .5s ease forwards";

  // show intro
  const intro = $("#intro");
  intro.classList.remove("hidden");
  intro.setAttribute("aria-hidden","false");

  // after ~3.2s move to app
  setTimeout(()=>{
    intro.style.animation = "fadeOut .6s ease forwards";
    setTimeout(()=>{
      intro.classList.add("hidden");
      showApp();
    }, 600);
  }, 2600);
}

function showApp(){
  const app = $("#app");
  app.classList.remove("hidden");
  startTimer();
  renderPoem();
  renderQuote();
  $("#year").textContent = new Date().getFullYear();
  $("#when").textContent = new Date().toLocaleString([], { weekday:"short", day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

/* ====== TIMER ====== */
function startTimer(){
  const days=$('#days'), hours=$('#hours'), mins=$('#mins'), secs=$('#secs');
  const tick = () => {
    const now = new Date();
    const diff = Math.max(0, now - SINCE);
    const d = Math.floor(diff/86400000);
    const h = Math.floor((diff%86400000)/3600000);
    const m = Math.floor((diff%3600000)/60000);
    const s = Math.floor((diff%60000)/1000);
    days.textContent = String(d).padStart(2,"0");
    hours.textContent = String(h).padStart(2,"0");
    mins.textContent = String(m).padStart(2,"0");
    secs.textContent = String(s).padStart(2,"0");
  };
  tick();
  setInterval(tick, 1000);
}

/* ====== POEM (line-by-line fade) ====== */
const POEMS = [
  {
    lines: [
      "Tonight the sky leans close,",
      "the minutes crowd like petals.",
      "I count them one by one",
      "until they spell you."
    ],
    note: "“Your eyes are the dawn my heart returns to.” — inspired by Ghalib",
    by: "Noor"
  },
  {
    lines: [
      "In a hush of red and gold,",
      "time learned our names.",
      "Every second since that day—",
      "a quiet spark turning into home."
    ],
    note: "For us, always.",
    by: "Eesa"
  }
];

function renderPoem(){
  const pick = POEMS[Math.floor(Math.random()*POEMS.length)];
  $("#by").textContent = pick.by || "—";
  $("#note").textContent = pick.note || "";
  const holder = $("#poem");
  holder.innerHTML = "";
  pick.lines.forEach((ln, i)=>{
    const div = document.createElement("div");
    div.className = "line";
    div.style.setProperty("--i", i);  // used by CSS delay
    div.textContent = ln;
    holder.appendChild(div);
  });
}

/* ====== QUOTES ====== */
const QUOTES = [
  "Every ordinary day with you is my favorite kind of miracle.",
  "I loved you then, I love you still, I always have, I always will.",
  "You are my today and all of my tomorrows.",
  "If I had a flower for every time I thought of you, I could walk in my garden forever."
];

function renderQuote(){
  const q = QUOTES[Math.floor(Math.random()*QUOTES.length)];
  $("#quote").textContent = q;
}

/* ====== BOOT ====== */
document.addEventListener("DOMContentLoaded", () => {
  setupPinGate();
});
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
