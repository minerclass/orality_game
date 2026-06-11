/* ==========================================================================
   THE SHIFTING SENSORIUM: COGNITIVE GAME ENGINE
   Developed for Micah J. Miner's Media Ecology Project
   ========================================================================== */

// ==========================================================================
// PARTICLE ENGINE (HTML5 Canvas Background)
// ==========================================================================
const cv = document.getElementById('fx');
const cx = cv.getContext('2d');
let W, H;
let parts = [];
let mode = 'ember';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  W = cv.width = window.innerWidth;
  H = cv.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const rnd = (a, b) => a + Math.random() * (b - a);
const GLYPHS = "01⟨⟩∴≋⌁§¶∞λΔ".split("");

function spawn() {
  if (mode === 'ember') {
    return {
      x: rnd(W * 0.2, W * 0.8),
      y: H + 10,
      vx: rnd(-0.3, 0.3),
      vy: rnd(-1.4, -0.5),
      r: rnd(0.8, 2.4),
      life: 1,
      decay: rnd(0.003, 0.008),
      hue: rnd(20, 40)
    };
  }
  if (mode === 'dust') {
    return {
      x: rnd(0, W),
      y: rnd(0, H),
      vx: rnd(-0.12, 0.12),
      vy: rnd(0.04, 0.18),
      r: rnd(0.6, 1.8),
      life: 1,
      decay: rnd(0.001, 0.003)
    };
  }
  if (mode === 'static') {
    return {
      x: rnd(0, W),
      y: rnd(0, H),
      vx: 0,
      vy: 0,
      r: rnd(0.5, 1.4),
      life: 1,
      decay: rnd(0.06, 0.2)
    };
  }
  if (mode === 'blip') {
    return {
      x: rnd(0, W),
      y: rnd(0, H),
      vx: rnd(-0.2, 0.2),
      vy: rnd(-0.35, -0.1),
      r: rnd(1.5, 3.4),
      life: 1,
      decay: rnd(0.004, 0.01),
      pink: Math.random() < 0.5
    };
  }
  if (mode === 'glyph') {
    return {
      x: rnd(0, W),
      y: -14,
      vx: 0,
      vy: rnd(1.2, 3.2),
      g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      size: rnd(9, 15),
      life: 1,
      decay: rnd(0.002, 0.005),
      teal: Math.random() < 0.35
    };
  }
  return null;
}

const density = { ember: 70, dust: 50, static: 100, blip: 30, glyph: 60 };

function tick() {
  cx.clearRect(0, 0, W, H);
  if (!reduced) {
    while (parts.length < density[mode]) {
      parts.push(spawn());
    }
    parts = parts.filter(p => p.life > 0 && p.y > -30 && p.y < H + 30);
    
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      
      if (mode === 'ember') {
        cx.beginPath();
        cx.arc(p.x, p.y, p.r, 0, 7);
        cx.fillStyle = `hsla(${p.hue}, 85%, 60%, ${p.life * 0.7})`;
        cx.shadowBlur = 8;
        cx.shadowColor = 'rgba(232, 140, 40, 0.8)';
        cx.fill();
        cx.shadowBlur = 0;
      } else if (mode === 'dust') {
        cx.beginPath();
        cx.arc(p.x, p.y, p.r, 0, 7);
        cx.fillStyle = `rgba(216, 184, 106, ${p.life * 0.28})`;
        cx.fill();
      } else if (mode === 'static') {
        cx.fillStyle = `rgba(180, 230, 255, ${p.life * 0.22})`;
        cx.fillRect(p.x, p.y, p.r * 2, p.r);
      } else if (mode === 'blip') {
        cx.beginPath();
        cx.arc(p.x, p.y, p.r * p.life, 0, 7);
        cx.strokeStyle = p.pink ? `rgba(255, 126, 176, ${p.life * 0.5})` : `rgba(127, 212, 255, ${p.life * 0.5})`;
        cx.lineWidth = 1.2;
        cx.stroke();
      } else if (mode === 'glyph') {
        cx.font = p.size + "px ui-monospace, monospace";
        cx.fillStyle = p.teal ? `rgba(94, 234, 212, ${p.life * 0.55})` : `rgba(167, 139, 250, ${p.life * 0.5})`;
        cx.fillText(p.g, p.x, p.y);
      }
    }
  }
  requestAnimationFrame(tick);
}
tick();

function setEnv(env, fxmode) {
  document.body.dataset.env = env;
  if (fxmode && fxmode !== mode) {
    mode = fxmode;
    parts = [];
  }
}

// ==========================================================================
// PROGRAMMATIC AMBIENT SOUND GENERATION (Web Audio API)
// ==========================================================================
let AC = null;
let soundOn = false;
let ambNodes = [];

function ensureAC() {
  try {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
    }
  } catch (e) {
    console.warn("Web Audio API not supported or blocked: ", e);
  }
}

function stopAmb() {
  ambNodes.forEach(n => {
    try {
      if (n.stop) n.stop();
      n.disconnect();
    } catch (e) {}
  });
  ambNodes = [];
}

function noiseBuffer() {
  ensureAC();
  const bufferSize = AC.sampleRate * 2;
  const buffer = AC.createBuffer(1, bufferSize, AC.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function amb(env) {
  try {
    if (!soundOn || !AC) return;
    stopAmb();
    
    const masterGain = AC.createGain();
    masterGain.gain.setValueAtTime(0, AC.currentTime);
    masterGain.connect(AC.destination);
    masterGain.gain.linearRampToValueAtTime(0.04, AC.currentTime + 1.5);
  ambNodes.push(masterGain);
  
  if (env === 'p0' || env === 'title' || env === 'end') {
    // Fire: Bandpass noise for crackle + low hum
    const noise = AC.createBufferSource();
    noise.buffer = noiseBuffer();
    noise.loop = true;
    
    const filter = AC.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 350;
    filter.Q.value = 0.5;
    
    noise.connect(filter);
    filter.connect(masterGain);
    noise.start();
    ambNodes.push(noise, filter);
    
    const osc = AC.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 65;
    
    const oscGain = AC.createGain();
    oscGain.gain.value = 0.35;
    
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start();
    ambNodes.push(osc, oscGain);
  } 
  else if (env === 'p1') {
    // Scriptorium: quiet air + gentle shimmer
    const noise = AC.createBufferSource();
    noise.buffer = noiseBuffer();
    noise.loop = true;
    
    const filter = AC.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 250;
    
    noise.connect(filter);
    filter.connect(masterGain);
    noise.start();
    ambNodes.push(noise, filter);
  } 
  else if (env === 'p2') {
    // Broadcast: TV hum + static carrier hiss
    const hum = AC.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.value = 60;
    
    const humFilter = AC.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 180;
    
    const humGain = AC.createGain();
    humGain.gain.value = 0.25;
    
    hum.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(masterGain);
    hum.start();
    ambNodes.push(hum, humFilter, humGain);
    
    const hiss = AC.createBufferSource();
    hiss.buffer = noiseBuffer();
    hiss.loop = true;
    
    const hissFilter = AC.createBiquadFilter();
    hissFilter.type = 'highpass';
    hissFilter.frequency.value = 6000;
    
    const hissGain = AC.createGain();
    hissGain.gain.value = 0.1;
    
    hiss.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(masterGain);
    hiss.start();
    ambNodes.push(hiss, hissFilter, hissGain);
  } 
  else if (env === 'p3') {
    // Social feed: low drone + random pop-up clicks
    const drone = AC.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 130;
    
    const droneGain = AC.createGain();
    droneGain.gain.value = 0.3;
    
    drone.connect(droneGain);
    droneGain.connect(masterGain);
    drone.start();
    ambNodes.push(drone, droneGain);
    
    const triggerBlips = () => {
      if (!soundOn || document.body.dataset.env !== 'p3') return;
      
      const blip = AC.createOscillator();
      blip.type = 'sine';
      blip.frequency.value = rnd(800, 1500);
      
      const blipGain = AC.createGain();
      blipGain.gain.setValueAtTime(0.08, AC.currentTime);
      blipGain.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + 0.2);
      
      blip.connect(blipGain);
      blipGain.connect(AC.destination);
      blip.start();
      blip.stop(AC.currentTime + 0.22);
      
      setTimeout(triggerBlips, rnd(1000, 3000));
    };
    setTimeout(triggerBlips, 800);
  } 
  else if (env === 'p4') {
    // Synthetic AI: Detuned triangle waves creating a cold drone
    [110, 110.6, 165.2].forEach(freq => {
      const osc = AC.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const oscGain = AC.createGain();
      oscGain.gain.value = 0.2;
      
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      ambNodes.push(osc, oscGain);
    });
  }
  } catch (e) {
    console.error("Error in ambient audio synthesis:", e);
  }
}function cue(kind) {
  try {
    if (!soundOn || !AC) return;
    const osc = AC.createOscillator();
  const gain = AC.createGain();
  osc.connect(gain);
  gain.connect(AC.destination);
  
  if (kind === 'choose') {
    osc.type = 'sine';
    osc.frequency.value = 520;
    gain.gain.setValueAtTime(0.08, AC.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + 0.18);
  } 
  else if (kind === 'bad') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, AC.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, AC.currentTime + 0.45);
    gain.gain.setValueAtTime(0.12, AC.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + 0.45);
  } 
  else if (kind === 'good') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, AC.currentTime);
    osc.frequency.exponentialRampToValueAtTime(680, AC.currentTime + 0.22);
    gain.gain.setValueAtTime(0.08, AC.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + 0.3);
  }
  osc.start();
  osc.stop(AC.currentTime + 0.5);
  } catch (e) {
    console.error("Error in cue audio synthesis:", e);
  }
}function toggleSound() {
  ensureAC();
  AC.resume();
  soundOn = !soundOn;
  const btn = document.getElementById('soundBtn');
  btn.textContent = soundOn ? "SOUND ON" : "SOUND OFF";
  btn.classList.toggle('active', soundOn);
  if (soundOn) {
    amb(document.body.dataset.env);
  } else {
    stopAmb();
  }
}

// ==========================================================================
// CORE GAME STATE & DATA SETUP
// ==========================================================================
const S = {
  fid: 100,
  reach: 1,
  human: true,
  words: ["The", "river", "always", "returns", "to", "collect", "what", "it", "has", "lent.", "Carry", "the", "children", "high,", "and", "speak", "no", "word", "you", "will", "not", "stand", "behind."],
  lost: new Set(),
  muts: {},
  truncated: false,
  headline: null,
  round: 0
};

const rounds = [
  {
    env: 'p0',
    fx: 'ember',
    chip: "Phase I · Primary Orality",
    title: "Encode it for Memory",
    prompt: "No writing exists. The message survives only if minds can hold it across retellings. Guide Saima's voice: use the mouse/finger to catch only the oral rhythmic embers rising from the fire. Avoid abstract blocks falling from above.",
    wipe: "The age of the voice",
    charName: "Saima &middot; Miller's Crossing",
    charAvatar: "saima.png",
    charDialogue: "\"My sister's hand was in mine when Saima sang the word. Catch the song-embers in my memory pouch...\""
  },
  {
    env: 'p1',
    fx: 'dust',
    chip: "Phase II · Literacy",
    title: "Fix it in Space",
    prompt: "Gutenberg's printing press arrives. We take Saima's spoken name and lock it into rigid metal letter blocks. Drag the metal blocks in the correct order into the composing stick frame to fix the word in space.",
    wipe: "The age of the page",
    charName: "Brother Thomas &middot; Scribe",
    charAvatar: "scribe.png",
    charDialogue: "\"We freeze Saima's spoken breath in lead. Drag the metal blocks in order to typeset her name.\""
  },
  {
    env: 'p2',
    fx: 'static',
    chip: "Phase III · Secondary Orality",
    title: "Take it to the Airwaves",
    prompt: "Broadcast electronic media can reach millions in a single instant. Adjust the sliders (Frequency and Amplitude Tuning) on Saima's radio console to tune the transmitter and synchronize the national audience receivers.",
    wipe: "The age of the broadcast",
    charName: "DJ Ray &middot; Radio Broadcaster",
    charAvatar: "dj.png",
    charDialogue: "\"My voice reaches a million homes at once. Slide the dials to lock the wave and tune the national ear.\""
  },
  {
    env: 'p3',
    fx: 'blip',
    chip: "Phase IV · Algorithmic Secondary",
    title: "Optimize the Feed",
    prompt: "You post the message. A recommendation feed invites you to optimize it for engagement. Click the post styles to test reach: Outrage styles spike virality but split the network pegboard into polarized bubbles.",
    wipe: "The age of the feed",
    charName: "Feed Curator &middot; Platform Curation",
    charAvatar: "feed.png",
    charDialogue: "\"Optimization is the law of the feed. Format your post to outrage, or be hidden by the algorithm.\""
  },
  {
    env: 'p4',
    fx: 'glyph',
    chip: "Phase V · Tertiary Algorithmicity",
    title: "The Flood of Versions",
    prompt: "Generative AI models are flooding the network with fake versions of Saima's message. You have 10 seconds to find the real human author node (represented by a slow, organic pulsing brain) and defuse the 8 AI nodes.",
    wipe: "The age of the machine",
    charName: "Synthetic Chatbot &middot; AI Agent",
    charAvatar: "ai.png",
    charDialogue: "\"I can simulate dialogue without the weight of a body. Defuse my synthetic clones before time expires.\""
  }
];

function reachPct() {
  return Math.max(2, Math.min(100, (Math.log10(S.reach + 1) / 8) * 100));
}

function fmtReach(n) {
  return n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : (n >= 1e3 ? (n / 1e3).toFixed(0) + "k" : n);
}

function renderHUD() {
  document.getElementById('fidnum').textContent = S.fid + "%";
  document.querySelector('#fidbar .bar-fill').style.width = S.fid + "%";
  document.getElementById('reachnum').textContent = fmtReach(S.reach);
  document.querySelector('#reachbar .bar-fill').style.width = reachPct() + "%";
  
  const authnum = document.getElementById('authnum');
  const dot = document.getElementById('authindicator');
  const authdesc = document.getElementById('authdesc');
  const flag = document.getElementById('authflag');
  
  if (S.human) {
    authnum.textContent = "Human";
    dot.className = "indicator-dot green";
    authdesc.textContent = "Embodied human consciousness";
    flag.textContent = "Author: human";
    flag.classList.remove('none');
  } else {
    authnum.textContent = "None";
    dot.className = "indicator-dot red";
    authdesc.textContent = "Autonomous statistical algorithm";
    flag.textContent = "Author: none";
    flag.classList.add('none');
  }
}

function renderMessage(animLost) {
  const m = document.getElementById('messageText');
  let end = S.truncated ? 10 : S.words.length;
  m.innerHTML = S.words.slice(0, end).map((w, i) => {
    if (S.lost.has(i)) {
      return `<span class="lost ${animLost && animLost.has(i) ? 'w-anim' : ''}">${w}</span>`;
    }
    if (S.muts[i]) {
      return `<span class="mut">${S.muts[i]}</span>`;
    }
    return w;
  }).join(" ") + (S.truncated ? ` <span class="lost">&hellip;[cut for time]</span>` : "");
  
  const h = document.getElementById('headline');
  if (S.headline) {
    h.textContent = S.headline;
    h.classList.add('show');
  } else {
    h.classList.remove('show');
  }
}

function degrade(n) {
  const idx = [...Array(S.words.length).keys()].filter(i => !S.lost.has(i)).sort(() => Math.random() - 0.5).slice(0, n);
  idx.forEach(i => S.lost.add(i));
  return new Set(idx);
}

// ==========================================================================
// NAVIGATION & TIMELINE CONTROL
// ==========================================================================
function startGame() {
  transition("The age of the voice", () => {
    go('gameScreen', 'p0', 'ember');
    showRound();
  });
}

function go(id, env, fxmode) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (env) setEnv(env, fxmode || mode);
  if (env) amb(env);
  if (id === 'deepScreen' && !sortStarted) startSort();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function transition(label, then) {
  const w = document.getElementById('wipe');
  document.getElementById('wipetext').textContent = label;
  w.classList.add('on');
  setTimeout(() => {
    then();
    setTimeout(() => w.classList.remove('on'), 350);
  }, 700);
}

function showRound() {
  renderHUD();
  renderMessage();
  document.getElementById('outcome').innerHTML = '';
  document.getElementById('nextrow').classList.remove('show');
  
  if (S.round < 5) {
    const r = rounds[S.round];
    setEnv(r.env, r.fx);
    amb(r.env);
    
    document.getElementById('phasechip').textContent = r.chip;
    document.getElementById('roundCounter').textContent = `Round ${S.round + 1} of 5`;
    document.getElementById('roundtitle').textContent = r.title;
    document.getElementById('roundprompt').textContent = r.prompt;
    
    // Bind character visuals
    document.getElementById('charAvatar').src = r.charAvatar;
    document.getElementById('charName').innerHTML = r.charName;
    document.getElementById('charDialogue').innerHTML = r.charDialogue;
    
    // Inject visual game structure
    setupVisualGame();
  }
}

function advance() {
  S.round++;
  const labels = ["", "The age of the page", "The age of the broadcast", "The age of the feed", "The age of the machine"];
  if (S.round < 5) {
    transition(labels[S.round], () => showRound());
  } else {
    transition("What survived", showFinale);
  }
}

// ==========================================================================
// VISUAL GAME INJECTORS
// ==========================================================================
let currentAnimationId = null;

function setupVisualGame() {
  // Clear any existing animation frames or intervals
  if (currentAnimationId) {
    cancelAnimationFrame(currentAnimationId);
    currentAnimationId = null;
  }
  
  const vp = document.getElementById("gameViewport");
  vp.innerHTML = "";
  
  const opts = document.getElementById("opts");
  opts.innerHTML = "";
  
  switch(S.round) {
    case 0: initStage1Game(vp, opts); break;
    case 1: initStage2Game(vp, opts); break;
    case 2: initStage3Game(vp, opts); break;
    case 3: initStage4Game(vp, opts); break;
    case 4: initStage5Game(vp, opts); break;
  }
}

// --------------------------------------------------------------------------
// STAGE 1: THE MEMORY WEAVER (Canvas catch game)
// --------------------------------------------------------------------------
function initStage1Game(parent, optsPanel) {
  document.getElementById("viewportTitle").innerText = "The Memory Catch";
  
  const canvas = document.createElement("canvas");
  canvas.id = "s1Canvas";
  parent.appendChild(canvas);
  
  // Set dimensions
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width || 600;
  canvas.height = rect.height || 240;
  const ctx = canvas.getContext('2d');
  
  // Game state
  let pouchX = canvas.width / 2;
  let oralCaught = 0;
  let totalTargets = 6;
  
  const fallingWords = [];
  const wordsPool = [
    { text: "river returns", oral: true },
    { text: "carry high", oral: true },
    { text: "stand behind", oral: true },
    { text: "voice", oral: true },
    { text: "song", oral: true },
    { text: "rhythm", oral: true },
    { text: "formula", oral: true },
    { text: "precipitation", oral: false },
    { text: "topography", oral: false },
    { text: "syllogism", oral: false },
    { text: "archive", oral: false },
    { text: "document", oral: false },
    { text: "metric", oral: false }
  ];
  
  // Mouse & Touch tracking
  const updatePouchPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    pouchX = clientX - rect.left;
    if (pouchX < 40) pouchX = 40;
    if (pouchX > canvas.width - 40) pouchX = canvas.width - 40;
  };
  
  canvas.addEventListener('mousemove', updatePouchPos);
  canvas.addEventListener('touchmove', updatePouchPos);
  
  const spawnWord = () => {
    const template = wordsPool[Math.floor(Math.random() * wordsPool.length)];
    fallingWords.push({
      x: rnd(50, canvas.width - 50),
      y: template.oral ? canvas.height + 20 : -20,
      vy: template.oral ? rnd(-2.2, -1.0) : rnd(1.0, 2.2),
      text: template.text,
      oral: template.oral,
      r: 12
    });
  };
  
  let frameCount = 0;
  const loop = () => {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw fire gradient
    const fireGrd = ctx.createRadialGradient(canvas.width / 2, canvas.height, 10, canvas.width / 2, canvas.height, 120);
    fireGrd.addColorStop(0, 'rgba(232, 140, 40, 0.4)');
    fireGrd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fireGrd;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height, 120, 0, Math.PI, true);
    ctx.fill();
    
    // Spawns
    frameCount++;
    if (frameCount % 60 === 0 && oralCaught < totalTargets) {
      spawnWord();
    }
    
    // Draw and update words
    for (let i = fallingWords.length - 1; i >= 0; i--) {
      const w = fallingWords[i];
      w.y += w.vy;
      
      // Draw Word
      ctx.font = "12px ui-monospace, monospace";
      ctx.fillStyle = w.oral ? "rgba(232, 160, 76, 0.95)" : "rgba(128,128,128,0.7)";
      ctx.textAlign = "center";
      
      // Draw a soft background glow for oral words
      if (w.oral) {
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(232, 140, 40, 0.8)';
      }
      ctx.fillText(w.text, w.x, w.y);
      ctx.shadowBlur = 0; // reset
      
      // Collision detection with pouch (basket drawn at pouchX, y: 190)
      const pouchY = 180;
      const dist = Math.hypot(w.x - pouchX, w.y - pouchY);
      
      if (dist < 32) {
        // Caught!
        fallingWords.splice(i, 1);
        if (w.oral) {
          oralCaught++;
          S.fid = Math.min(100, S.fid + 5);
          cue('good');
          
          // Un-degrade some words in the visual display
          const recovered = Math.floor(rnd(0, S.words.length));
          S.lost.delete(recovered);
          renderHUD();
          renderMessage();
        } else {
          S.fid = Math.max(10, S.fid - 15);
          degrade(2);
          cue('bad');
          renderHUD();
          renderMessage();
        }
        continue;
      }
      
      // Out of bounds
      if ((w.oral && w.y < -30) || (!w.oral && w.y > canvas.height + 30)) {
        fallingWords.splice(i, 1);
      }
    }
    
    // Draw pouch
    ctx.strokeStyle = "var(--accent)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(pouchX, 180, 24, 0, Math.PI);
    ctx.stroke();
    
    ctx.fillStyle = "rgba(232, 160, 76, 0.2)";
    ctx.beginPath();
    ctx.arc(pouchX, 180, 24, 0, Math.PI);
    ctx.fill();
    
    // Draw target index
    ctx.font = "10px ui-monospace, monospace";
    ctx.fillStyle = "var(--dim)";
    ctx.textAlign = "right";
    ctx.fillText(`ORAL MEMORIES WOVEN: ${oralCaught} / ${totalTargets}`, canvas.width - 20, 30);
    
    if (oralCaught >= totalTargets) {
      // Completed mini-game
      document.getElementById('outcome').innerHTML = "<b>The oral patterns compiled.</b> By catching formulaic phrasing, you stabilized the message. Yet space-less sound remains fleeting, vulnerable to physical loss.";
      document.getElementById('nextrow').classList.add('show');
    } else {
      currentAnimationId = requestAnimationFrame(loop);
    }
  };
  
  // Degrade initial text
  degrade(10);
  renderMessage();
  loop();
}

// --------------------------------------------------------------------------
// STAGE 2: LITERACY (Typesetting Grid drag and drop)
// --------------------------------------------------------------------------
function initStage2Game(parent, optsPanel) {
  document.getElementById("viewportTitle").innerText = "The Typesetting Scriptorium";
  
  const board = document.createElement("div");
  board.className = "stage2-board";
  board.innerHTML = `
    <div style="font-size:11px; text-transform:uppercase; color:var(--dim); font-family:var(--font-mono)">Typeset: S-A-I-M-A</div>
    <div class="typesetting-grid" id="typeGrid">
      <div class="slot" data-index="0"></div>
      <div class="slot" data-index="1"></div>
      <div class="slot" data-index="2"></div>
      <div class="slot" data-index="3"></div>
      <div class="slot" data-index="4"></div>
    </div>
    <div class="tray-blocks" id="trayBlocks">
      <div class="block" draggable="true" id="blk-I">I</div>
      <div class="block" draggable="true" id="blk-S">S</div>
      <div class="block" draggable="true" id="blk-A1">A</div>
      <div class="block" draggable="true" id="blk-M">M</div>
      <div class="block" draggable="true" id="blk-A2">A</div>
    </div>
  `;
  parent.appendChild(board);
  
  const blocks = board.querySelectorAll('.block');
  const slots = board.querySelectorAll('.slot');
  let draggedBlock = null;
  let selectedBlock = null;
  
  blocks.forEach(b => {
    // Drag support
    b.addEventListener('dragstart', (e) => {
      draggedBlock = b;
      b.style.opacity = '0.5';
    });
    b.addEventListener('dragend', () => {
      b.style.opacity = '1';
      checkStage2Completion();
    });
    
    // Click fallback
    b.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent triggering parent slot click
      if (selectedBlock) {
        selectedBlock.style.borderColor = "#6b7280";
        selectedBlock.style.boxShadow = "none";
      }
      if (selectedBlock === b) {
        selectedBlock = null;
      } else {
        selectedBlock = b;
        b.style.borderColor = "var(--accent)";
        b.style.boxShadow = "0 0 10px var(--accent)";
      }
      cue('choose');
    });
  });
  
  slots.forEach(s => {
    // Drag support
    s.addEventListener('dragover', (e) => {
      e.preventDefault();
      s.classList.add('hovered');
    });
    s.addEventListener('dragleave', () => {
      s.classList.remove('hovered');
    });
    s.addEventListener('drop', (e) => {
      e.preventDefault();
      s.classList.remove('hovered');
      if (draggedBlock) {
        if (s.children.length > 0) {
          document.getElementById('trayBlocks').appendChild(s.children[0]);
        }
        s.appendChild(draggedBlock);
        cue('choose');
      }
    });
    
    // Click support
    s.addEventListener('click', () => {
      if (selectedBlock) {
        if (s.children.length > 0) {
          document.getElementById('trayBlocks').appendChild(s.children[0]);
        }
        s.appendChild(selectedBlock);
        selectedBlock.style.borderColor = "#6b7280";
        selectedBlock.style.boxShadow = "none";
        selectedBlock = null;
        cue('choose');
        checkStage2Completion();
      } else if (s.children.length > 0) {
        selectedBlock = s.children[0];
        selectedBlock.style.borderColor = "var(--accent)";
        selectedBlock.style.boxShadow = "0 0 10px var(--accent)";
        cue('choose');
      }
    });
  });
  
  // Return blocks to tray on tray click
  document.getElementById('trayBlocks').addEventListener('click', () => {
    if (selectedBlock) {
      document.getElementById('trayBlocks').appendChild(selectedBlock);
      selectedBlock.style.borderColor = "#6b7280";
      selectedBlock.style.boxShadow = "none";
      selectedBlock = null;
      cue('choose');
      checkStage2Completion();
    }
  });

  const checkStage2Completion = () => {
    const order = Array.from(slots).map(s => s.children[0] ? s.children[0].innerText : '');
    const joined = order.join('');
    if (joined === 'SAIMA') {
      cue('good');
      S.reach = 5000;
      
      // Mutate oral speech into visual print
      S.muts[15] = "write";
      S.muts[16] = "nothing";
      S.lost.add(17); // Cross out the word "word"
      
      renderHUD();
      renderMessage(); // Update visual screen message
      
      document.getElementById('outcome').innerHTML = "<b>Locked in type.</b> Gutenberg's slots compile the name perfectly. Saima's spoken breath ('speak no word') is fixed in lead as spatialized print ('write nothing'). Her voice vanishes, but copies of her word can travel to the ends of the earth.";
      document.getElementById('nextrow').classList.add('show');
    }
  };
}

// --------------------------------------------------------------------------
// STAGE 3: SECONDARY ORALITY (Oscilloscope tuner)
// --------------------------------------------------------------------------
let s3_canvas_loop = null;

function initStage3Game(parent, optsPanel) {
  document.getElementById("viewportTitle").innerText = "Oscilloscope Broadcast Console";
  
  const board = document.createElement("div");
  board.className = "stage3-board";
  board.innerHTML = `
    <div class="osc-canvas-container">
      <canvas id="oscCanvas"></canvas>
    </div>
    <div class="osc-controls">
      <div class="osc-slider-group">
        <label>Carrier Frequency</label>
        <input type="range" class="osc-slider" id="oscFreq" min="10" max="90" value="50">
      </div>
      <div class="osc-slider-group">
        <label>Signal Amplitude</label>
        <input type="range" class="osc-slider" id="oscAmp" min="10" max="90" value="30">
      </div>
      <div class="lock-status" id="oscLock">UNLOCK</div>
    </div>
  `;
  parent.appendChild(board);
  
  const canvas = document.getElementById("oscCanvas");
  const ctx = canvas.getContext('2d');
  
  // Set canvas scale
  const resizeCanvas = () => {
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width || 400;
    canvas.height = r.height || 240;
  };
  resizeCanvas();
  
  let targetFreq = 40;
  let targetAmp = 60;
  let matches = false;
  
  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw scope grid lines
    ctx.strokeStyle = "rgba(127, 212, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    
    // Pull sliders
    const liveFreq = parseFloat(document.getElementById("oscFreq").value);
    const liveAmp = parseFloat(document.getElementById("oscAmp").value);
    
    // Draw target wave (dotted blue)
    ctx.strokeStyle = "rgba(127,212,255,0.25)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin(x * (targetFreq / 400) + AC_time() * 2) * targetAmp;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // reset
    
    // Draw live wave (green)
    ctx.strokeStyle = matches ? "var(--good)" : "var(--accent)";
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = matches ? 8 : 2;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x++) {
      const y = canvas.height / 2 + Math.sin(x * (liveFreq / 400) + AC_time() * 2) * liveAmp;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Check locking
    const diffFreq = Math.abs(liveFreq - targetFreq);
    const diffAmp = Math.abs(liveAmp - targetAmp);
    
    if (diffFreq < 4 && diffAmp < 4) {
      if (!matches) {
        matches = true;
        cue('good');
        document.getElementById("oscLock").innerText = "SIGNAL LOCKED";
        document.getElementById("oscLock").style.borderColor = "var(--good)";
        document.getElementById("oscLock").style.color = "var(--good)";
        
        S.reach = 850000;
        renderHUD();
        document.getElementById('outcome').innerHTML = "<b>Broadcast locked.</b> Saima's voice enters the electric air. Millions hear the soundbite synchronized, experiencing secondary oral presence &mdash; though centralized and scripted.";
        document.getElementById('nextrow').classList.add('show');
      }
    } else {
      if (matches) {
        matches = false;
        document.getElementById("oscLock").innerText = "UNLOCK";
        document.getElementById("oscLock").style.borderColor = "var(--line)";
        document.getElementById("oscLock").style.color = "var(--dim)";
      }
    }
    
    currentAnimationId = requestAnimationFrame(loop);
  };
  
  let animTime = 0;
  const AC_time = () => { animTime += 0.03; return animTime; };
  
  loop();
}

// --------------------------------------------------------------------------
// STAGE 4: ALGORITHMIC SECONDARY ORALITY (Plinko physics feed simulator)
// --------------------------------------------------------------------------
function initStage4Game(parent, optsPanel) {
  document.getElementById("viewportTitle").innerText = "The Attention feed Plinko";
  
  const board = document.createElement("div");
  board.className = "stage4-board";
  board.innerHTML = `
    <canvas id="plinkoCanvas"></canvas>
    <div class="plinko-controls">
      <h4>Post formatting</h4>
      <button class="plinko-btn" id="s4BtnNuance" onclick="dropPlinko('nuance')">Nuanced report<small>Dry science</small></button>
      <button class="plinko-btn btn-glow" id="s4BtnOutrage" onclick="dropPlinko('outrage')">Polarized Outrage<small>Friction and anger</small></button>
    </div>
  `;
  parent.appendChild(board);
  
  const canvas = document.getElementById("plinkoCanvas");
  const ctx = canvas.getContext('2d');
  
  const resizeCanvas = () => {
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width || 400;
    canvas.height = r.height || 240;
  };
  resizeCanvas();
  
  // Peg setup
  const pegs = [];
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    const count = r + 3;
    const y = 50 + r * 35;
    for (let i = 0; i < count; i++) {
      pegs.push({
        x: canvas.width / 2 + (i - (count - 1) / 2) * 45,
        y: y,
        r: 3
      });
    }
  }
  
  const balls = [];
  let outrageActive = false;
  
  window.dropPlinko = (type) => {
    cue('choose');
    outrageActive = type === 'outrage';
    
    document.getElementById("s4BtnNuance").classList.toggle('active', type === 'nuance');
    document.getElementById("s4BtnOutrage").classList.toggle('active', type === 'outrage');
    
    // Spawn balls
    const count = type === 'outrage' ? 24 : 6;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        balls.push({
          x: canvas.width / 2 + rnd(-10, 10),
          y: 10,
          vx: rnd(-0.2, 0.2),
          vy: rnd(0.5, 1.2),
          r: 5,
          color: type === 'outrage' ? "#f87171" : "#60a5fa"
        });
      }, i * 150);
    }
    
    if (type === 'outrage') {
      S.reach = 14000000;
      S.headline = "THE SCANDAL THEY CONCEALED 🚨";
      degrade(4);
      cue('bad');
    } else {
      S.reach = 1200;
      S.headline = null;
      cue('good');
    }
    renderHUD();
    renderMessage();
    
    setTimeout(() => {
      document.getElementById('outcome').innerHTML = type === 'outrage' 
        ? "<b>Virality achieved.</b> The feed prioritizes high-emotional outrage, scattering balls into polarized left/right bubbles. Reach explodes, but Saima's core message degrades."
        : "<b>Indifference.</b> The feed ignores the dry, academic report. The message is unmodified but remains completely invisible.";
      document.getElementById('nextrow').classList.add('show');
    }, 4500);
  };
  
  const loop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bins / echo chambers
    ctx.fillStyle = "rgba(239, 68, 68, 0.05)";
    ctx.fillRect(0, canvas.height - 40, canvas.width * 0.35, 40);
    ctx.fillStyle = "rgba(59, 130, 246, 0.05)";
    ctx.fillRect(canvas.width * 0.65, canvas.height - 40, canvas.width * 0.35, 40);
    
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.35, canvas.height - 40); ctx.lineTo(canvas.width * 0.35, canvas.height);
    ctx.moveTo(canvas.width * 0.65, canvas.height - 40); ctx.lineTo(canvas.width * 0.65, canvas.height);
    ctx.stroke();
    
    ctx.font = "8px ui-monospace, monospace";
    ctx.fillStyle = "rgba(239, 68, 68, 0.6)";
    ctx.fillText("OUTRAGE ALPHA", 10, canvas.height - 15);
    ctx.fillStyle = "rgba(59, 130, 246, 0.6)";
    ctx.fillText("OUTRAGE BETA", canvas.width - 70, canvas.height - 15);
    
    // Draw pegs
    ctx.fillStyle = outrageActive ? "#f59e0b" : "#475569";
    for (const peg of pegs) {
      ctx.beginPath(); ctx.arc(peg.x, peg.y, peg.r, 0, 7); ctx.fill();
    }
    
    // Update and draw balls
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.vy += 0.08; // gravity
      b.x += b.vx;
      b.y += b.vy;
      
      // Collide with pegs
      for (const peg of pegs) {
        const dist = Math.hypot(b.x - peg.x, b.y - peg.y);
        if (dist < b.r + peg.r) {
          // Bounce physics
          const nx = (b.x - peg.x) / dist;
          const ny = (b.y - peg.y) / dist;
          
          const dot = b.vx * nx + b.vy * ny;
          b.vx -= 2 * dot * nx + rnd(-0.1, 0.1);
          b.vy -= 2 * dot * ny;
          
          // Move out of collision
          b.x = peg.x + nx * (b.r + peg.r + 1);
          b.y = peg.y + ny * (b.r + peg.r + 1);
          
          // If outrage active, increase horizontal scatter
          if (outrageActive) {
            b.vx += b.x < canvas.width / 2 ? -0.8 : 0.8;
          }
        }
      }
      
      // Draw ball
      ctx.fillStyle = b.color;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
      
      if (b.y > canvas.height + 10) {
        balls.splice(i, 1);
      }
    }
    
    currentAnimationId = requestAnimationFrame(loop);
  };
  
  loop();
}

// --------------------------------------------------------------------------
// STAGE 5: TERTIARY ALGORITHMICITY (Turing Defusal Node Game)
// --------------------------------------------------------------------------
let s5_timer_interval = null;

function initStage5Game(parent, optsPanel) {
  document.getElementById("viewportTitle").innerText = "Turing Defusal Grid";
  
  const board = document.createElement("div");
  board.className = "stage5-board";
  board.innerHTML = `
    <div class="nodes-grid" id="s5Grid"></div>
    <div class="turing-timer-bar">
      <div class="turing-timer-fill" id="s5TimerFill"></div>
    </div>
  `;
  parent.appendChild(board);
  
  // Scenarios/Nodes data
  const gridNodes = [
    { id: 1, text: "My sister's hand was in mine on that hill. Saima made me say the poem three times until I cried. Stand behind what you write.", human: true },
    { id: 2, text: "The river always returns to collect what it has lent. Carry the children high, and write nothing you will not stand behind.", human: false },
    { id: 3, text: "As the wise elder Saima reminds us, rivers embody nature's cycles of giving. We must hold accounts in trust.", human: false },
    { id: 4, text: "The river always returns to collect what it has lent. Carry the children high, and write nothing you will not stand behind.", human: false },
    { id: 5, text: "Miller's Crossing flooded in the winter. Saima stayed in the barn. She told us to carry the children high.", human: true },
    { id: 6, text: "The river always returns to collect what it has lent. Carry the children high, and write nothing you will not stand behind.", human: false },
    { id: 7, text: "Miller's Crossing is gone now, but Saima's voice remains on the page, fixed, warning against weightless speech.", human: true },
    { id: 8, text: "The river always returns to collect what it has lent. Carry the children high, and write nothing you will not stand behind.", human: false },
    { id: 9, text: "Saima didn't write. Saima sang. Saima's sister drowned. Carry them high, keep them out of the current.", human: true },
    { id: 10, text: "The river always returns to collect what it has lent. Carry the children high, and write nothing you will not stand behind.", human: false },
    { id: 11, text: "The river always returns to collect what it has lent. Carry the children high, and write nothing you will not stand behind.", human: false },
    { id: 12, text: "The river always returns to collect what it has lent. Carry the children high, and write nothing you will not stand behind.", human: false }
  ];
  
  // Shuffled
  const shuffledNodes = gridNodes.sort(() => Math.random() - 0.5);
  const gridEl = document.getElementById("s5Grid");
  
  let defusedAIs = 0;
  const targetAIs = 8;
  let timeLimit = 10; // seconds
  let timeRemaining = timeLimit;
  let gameCompleted = false;
  
  shuffledNodes.forEach(node => {
    const btn = document.createElement("button");
    btn.className = "node-btn";
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
      <div class="node-text-snip">${node.text}</div>
    `;
    
    btn.onclick = () => {
      if (gameCompleted) return;
      
      if (node.human) {
        // Punish clicking human
        cue('bad');
        btn.classList.add("wrong-burst");
        S.fid = Math.max(10, S.fid - 20);
        renderHUD();
        setTimeout(() => btn.classList.remove("wrong-burst"), 400);
      } else {
        // Defuse AI
        cue('choose');
        btn.classList.add("defused");
        btn.disabled = true;
        defusedAIs++;
        
        if (defusedAIs >= targetAIs) {
          winS5();
        }
      }
    };
    gridEl.appendChild(btn);
  });
  
  // Timer loop
  const timerFill = document.getElementById("s5TimerFill");
  s5_timer_interval = setInterval(() => {
    timeRemaining -= 0.1;
    const pct = (timeRemaining / timeLimit) * 100;
    timerFill.style.width = `${pct}%`;
    
    if (timeRemaining <= 3) {
      timerFill.classList.add("urgent");
      cue('choose');
    }
    
    if (timeRemaining <= 0) {
      loseS5();
    }
  }, 100);
  
  const winS5 = () => {
    gameCompleted = true;
    clearInterval(s5_timer_interval);
    
    // Reveal humans
    const btns = gridEl.querySelectorAll(".node-btn");
    shuffledNodes.forEach((node, idx) => {
      if (node.human) {
        btns[idx].classList.add("human-revealed");
      }
    });
    
    cue('good');
    S.human = true;
    renderHUD();
    
    document.getElementById('outcome').innerHTML = "<b>Human found.</b> You resisted the weightless copies, identifying the situated embodied human author. Friction preserved noetic connection.";
    document.getElementById('nextrow').classList.add('show');
  };
  
  const loseS5 = () => {
    gameCompleted = true;
    clearInterval(s5_timer_interval);
    
    // Defuse grid
    const btns = gridEl.querySelectorAll(".node-btn");
    btns.forEach(b => b.disabled = true);
    
    cue('bad');
    S.human = false;
    renderHUD();
    
    document.getElementById('outcome').innerHTML = "<b>Time expired.</b> Synthetic copies flood the environment. The message survives word-perfect, but is authored by no one.";
    document.getElementById('nextrow').classList.add('show');
  };
}

// ==========================================================================
// SCREEN 3: FINALE SCREEN SUMMARY
// ==========================================================================
function showFinale() {
  stopAmb();
  go('finaleScreen', 'end', 'ember');
  amb('end');
  
  document.getElementById('endtitle').textContent = S.human ? "The Word, Still Carried" : "The Word, Still Circulating";
  
  const endAuth = document.getElementById('endauth');
  endAuth.textContent = S.human 
    ? "AUTHOR: HUMAN &middot; someone still stands behind these words" 
    : "AUTHOR: NONE &middot; words stand behind no one";
  endAuth.className = S.human ? "mflabel" : "mflabel none";
  
  const endAvatar = document.getElementById('endAvatar');
  if (S.human) {
    endAvatar.src = "saima.png";
    endAvatar.style.borderColor = "var(--good)";
    endAvatar.style.boxShadow = "0 0 15px rgba(143, 212, 143, 0.4)";
  } else {
    endAvatar.src = "ai.png";
    endAvatar.style.borderColor = "var(--bad)";
    endAvatar.style.boxShadow = "0 0 15px rgba(224, 122, 122, 0.4)";
  }
  
  let end = S.truncated ? 10 : S.words.length;
  document.getElementById('endmessage').innerHTML = S.words.slice(0, end).map((w, i) => {
    if (S.lost.has(i)) return `<span style="opacity:0.25; text-decoration:line-through">${w}</span>`;
    if (S.muts[i]) return `<span style="color:var(--bad); font-style:italic">${S.muts[i]}</span>`;
    return w;
  }).join(" ") + (S.truncated ? " &hellip;" : "");
  
  document.getElementById('endfid').textContent = S.fid + "%";
  document.getElementById('endreach').textContent = fmtReach(S.reach);
  
  const ea = document.getElementById('endauthor');
  ea.textContent = S.human ? "Human" : "None";
  ea.className = S.human ? "val good" : "val bad";
  
  const thesis = document.getElementById('endthesis');
  thesis.innerHTML = S.fid >= 80 
    ? "You protected the words. Across the epochs, every transition forced a trade &mdash; memory against detail, permanence against presence, reach against wholeness."
    : "The message arrived worn &mdash; sections lost to soundbites and clickbait. That wearing is what every medium has always charged for carriage.";
}

// ==========================================================================
// SCREEN 4: SORTING GAME
// ==========================================================================
const scenarios = [
  { t: "A griot recites a community's genealogy at a gathering; nothing is written, and each telling shifts slightly with the audience.", a: 0, why: "Voice only, ephemeral, face-to-face. Variation is a feature of oral memory composition, not an error." },
  { t: "A scholar silently reads a printed encyclopedia, using the alphabetical index to jump straight to an entry.", a: 1, why: "Indexes, silent reading, and alphabetical grids are spatial technologies of writing and print." },
  { t: "Families across a country gather around radios at the exact same hour to hear a leader's address.", a: 2, why: "Electronic voice, simultaneous mass audience: the signature of centralized secondary orality." },
  { t: "A student's social video feed surfaces a stranger's chemistry tutorial; her friend's feed never shows it.", a: 3, why: "Human created, but algorithms curate circulation. The platform recommendation feed controls attention." },
  { t: "A chatbot drafts a complete five-paragraph essay; no person composed any of its sentences.", a: 4, why: "Symbol origination belongs to the algorithm. Human composition is bypassed (Tertiary Algorithmicity)." },
  { t: "An epic poet builds long passages from stock epithets — 'swift-footed,' 'wine-dark' — that recur across performances.", a: 0, why: "Formulaic composition is oral memory technology: patterns assembled live because nothing can be looked up." },
  { t: "Millions watch a moon landing on live television, knowing everyone else is watching the same images at the same instant.", a: 2, why: "Broadcast simultaneity at planetary scale — communal, present-tense, and still entirely human-authored." },
  { t: "Two synthetic podcast hosts, generated end to end, discuss a novel in convincing conversational audio.", a: 4, why: "It sounds like secondary orality, but no humans speak. Modality no longer decides the phase; origination does." },
  { t: "A monk hand-copies a manuscript so a reader in another century can study the exact words.", a: 1, why: "Chirographic culture: the word made durable and distanced, addressed to readers the writer will never meet." },
  { t: "A human-made joke image spreads to millions because a recommendation engine keeps boosting it into new feeds.", a: 3, why: "Human creation, algorithmic circulation. The engine amplifies and targets, but it did not write the joke." }
];

const PH = ["Primary Orality", "Literacy & Print", "Secondary Orality", "Algorithmic Secondary", "Tertiary Algorithmicity"];
let sortStarted = false;
let si = 0;
let score = 0;

function startSort() {
  sortStarted = true;
  si = 0;
  score = 0;
  scenarios.sort(() => Math.random() - 0.5);
  showScenario();
}

function showScenario() {
  const s = scenarios[si];
  document.getElementById('sortcounter').textContent = `SCENARIO ${si + 1} OF ${scenarios.length}`;
  document.getElementById('scenariotext').textContent = s.t;
  document.getElementById('sortfeedback').textContent = '';
  document.getElementById('sortnext').style.display = 'none';
  
  const wrap = document.getElementById('phasebtns');
  wrap.innerHTML = '';
  
  PH.forEach((p, idx) => {
    const btn = document.createElement('button');
    btn.textContent = p;
    btn.onclick = () => answerSort(idx, btn);
    wrap.appendChild(btn);
  });
  
  document.getElementById('scorebar').textContent = `SCORE: ${score} / ${si}`;
}

function answerSort(idx, btn) {
  const s = scenarios[si];
  const btns = document.getElementById('phasebtns').children;
  [...btns].forEach(c => c.disabled = true);
  
  const right = idx === s.a;
  if (right) {
    score++;
    btn.classList.add('right');
    cue('good');
  } else {
    btn.classList.add('wrong');
    btns[s.a].classList.add('right');
    cue('bad');
  }
  
  document.getElementById('sortfeedback').innerHTML = `<b>${right ? "Correct! " : "Incorrect. "}</b>${s.why}`;
  document.getElementById('scorebar').textContent = `SCORE: ${score} / ${si + 1}`;
  document.getElementById('sortnext').style.display = 'block';
}

function nextScenario() {
  si++;
  if (si < scenarios.length) {
    showScenario();
  } else {
    document.getElementById('sortcounter').textContent = "SANDBOX QUIZ COMPLETE";
    document.getElementById('scenariotext').textContent = `You finished the sorting sandbox! Final score: ${score} out of ${scenarios.length}.`;
    document.getElementById('phasebtns').innerHTML = '';
    document.getElementById('sortfeedback').innerHTML = "You have demonstrated a deep understanding of Walter Ong's historical stages and Micah Miner's algorithmic extensions. Use this framework to examine the restructure of consciousness.";
    document.getElementById('sortnext').style.display = 'none';
  }
}
