const $ = (selector) => document.querySelector(selector);
const scenes = [...document.querySelectorAll('.scene')], NL = String.fromCharCode(10);
const cards = [
  {title:'আজ তোমার বিশেষ দিন! 😄',text:['আজকে তোমার জন্মদিন,','হাসিতে কাটুক সারাক্ষণ।','কেকের ভাগে কম দিও না,','আমাদের কথা ভুলো না!','','সাজবে আজ নতুন সাজে,','আনন্দ থাকুক তোমার মাঝে।','কেকটা কিন্তু একা খেও না,','আমাদের জন্য একটু রাখো না!'].join(NL)},
  {title:'আজকের দিনের রানি তুমি! 👑',text:['আজকে তুমি সবার সেরা,','আনন্দে কাটুক দিনটা ভরা।','হাসির আলো ছড়িয়ে দিও,','সবাইকে আপন করে নিও।','','মিষ্টি হাসি মুখে রেখো,','সুখের পথে এগিয়ে থেকো।','আজকে শুধু কেক আর খুশি,','জন্মদিনে থাকুক হাসি!'].join(NL)},
  {title:'তোমার জন্য হৃদয়ের কিছু কথা ❤️',text:['তোমার হাসি থাকুক অমলিন,','সুখে কাটুক প্রতিটি দিন।','স্বপ্নগুলো ডানা মেলে,','পৌঁছে যাক সাফল্যের তীরে।','','কষ্টগুলো হারিয়ে যাক,','সুখের আলো ছড়িয়ে থাক।','ভালোবাসা ঘিরে রাখুক,','জীবন তোমায় সুন্দর ডাকুক।'].join(NL)},
  {title:'জীবনের পথে এগিয়ে চলো! ✨',text:['জীবন মানেই নতুন আশা,','জীবন মানেই স্বপ্নের ভাষা।','কখনো রোদ, কখনো বৃষ্টি,','তবুও জীবন অনেক মিষ্টি।','', 'হোঁচট খেলে থেমো না তুমি,','সাহস নিয়ে এগিয়ে চলো।','নিজের স্বপ্ন পূরণ করে,','সাফল্যের আলোয় জীবন ভরো।','','প্রতিটি সকাল নতুন হোক,','প্রতিটি স্বপ্ন পূর্ণ হোক।','তোমার পথের প্রতিটি বাঁকে,','সুখের ঠিকানা খুঁজে থাকো।'].join(NL)},
  {title:'তোমার জন্য বিশেষ উপহার! 💖',text:['প্রিয় Ema,','','তোমার জীবনের প্রতিটি দিন','হোক ফুলের মতো সুন্দর।','','তোমার প্রতিটি সকাল','নিয়ে আসুক নতুন আনন্দ।','','তোমার চোখে থাকুক স্বপ্ন,','মনে থাকুক সাহস,','আর মুখে থাকুক সেই সুন্দর হাসি।','','জীবনের প্রতিটি পদক্ষেপে','পাও সাফল্য ও ভালোবাসা।','','তোমার সকল সুন্দর স্বপ্ন','একদিন সত্যি হয়ে উঠুক।','','অনেক অনেক ভালোবাসা','ও জন্মদিনের আন্তরিক শুভেচ্ছা!'].join(NL)}
];
let activeCard = 0, transitionLocked = false, audioContext = null, masterGain = null, musicEnabled = true, musicTimer = null, musicStep = 0, revealTimers = [], countdownTimer = null, cakeDone = false, finalDone = false;

function initAudio() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = musicEnabled ? 0.3 : 0;
    masterGain.connect(audioContext.destination);
    if (audioContext.state === 'suspended') audioContext.resume();
    if (musicEnabled) startMusic();
  } catch (e) { audioContext = null; }
}

function setGain(target, duration = 0.5) {
  if (!audioContext || !masterGain) return;
  const now = audioContext.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setTargetAtTime(target, now, duration);
}

function tone(freq, type = 'sine', vol = 0.1, duration = 0.2, delay = 0, slide = 0) {
  if (!audioContext || !musicEnabled) return;
  try {
    const start = audioContext.currentTime + delay;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain); gain.connect(masterGain);
    osc.start(start); osc.stop(start + duration + 0.1);
  } catch (e) {}
}

function playClick() { tone(700, 'sine', 0.1, 0.05, 0, -150); }
function playOpen() { [440, 554.37, 659.25, 880].forEach((n, i) => tone(n, 'sine', 0.1, 1.2, i * 0.1, 30)); }
function playSparkle() { tone(1400, 'sine', 0.05, 0.4); }
function playTransition() { tone(523.25, 'sine', 0.05, 0.3); tone(659.25, 'sine', 0.04, 0.4, 0.1); }
function playBlow() {
  if (!audioContext || !musicEnabled) return;
  try {
    const n = Math.floor(audioContext.sampleRate * 0.6);
    const buffer = audioContext.createBuffer(1, n, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
    const src = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    src.buffer = buffer; filter.type = 'lowpass'; filter.frequency.value = 500;
    gain.gain.value = 0.3; src.connect(filter); filter.connect(gain); gain.connect(masterGain); src.start();
  } catch (e) {}
}
function playFirework() { tone(350, 'sawtooth', 0.03, 0.5, 0, -200); }

const tune = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
function startMusic() {
  if (musicTimer || !audioContext) return;
  musicStep = 0;
  musicTimer = setInterval(() => {
    if (!musicEnabled) return;
    const note = tune[musicStep++ % tune.length];
    tone(note, 'sine', 0.02, 1.2);
    tone(note / 2, 'triangle', 0.015, 1.5, 0.05);
  }, 700);
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  const btn = $('#musicToggle');
  btn.classList.toggle('is-on', musicEnabled);
  btn.innerHTML = musicEnabled ? '<span class="music-icon">♫</span> <span>সাউন্ড চালু</span>' : '<span class="music-icon">♫</span> <span>সাউন্ড বন্ধ</span>';
  initAudio();
  if (musicEnabled) { setGain(0.3); startMusic(); } else { setGain(0); }
}
$('#musicToggle').addEventListener('click', toggleMusic);

function showScene(id) {
  scenes.forEach(s => s.classList.toggle('active', s.id === id));
  document.body.dataset.scene = id;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('pointerdown', () => initAudio(), { once: true, passive: true });
document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (b && b.id !== 'musicToggle') { initAudio(); playClick(); }
}, { capture: true });

function confettiBurst(count = 50) {
  const colors = ['#ffeaad', '#ff2a7a', '#9d2bd4', '#ffffff', '#ffb347'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.className = 'confetti';
    p.style.setProperty('--x', Math.random() * 100 + 'vw');
    p.style.setProperty('--drift', (Math.random() * 300 - 150) + 'px');
    p.style.background = colors[i % colors.length];
    p.style.width = (4 + Math.random() * 6) + 'px';
    p.style.height = (8 + Math.random() * 8) + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }
}

function floatingHearts(count = 10) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement('span');
    h.className = 'heart-particle';
    h.textContent = Math.random() > 0.5 ? '♥' : '♡';
    h.style.setProperty('--x', Math.random() * 100 + 'vw');
    h.style.animationDelay = (Math.random() * 0.8) + 's';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 3500);
  }
}

$('#openGift').addEventListener('click', () => {
  const wrap = $('#firstGift');
  if (wrap.classList.contains('gift-open')) return;
  wrap.classList.add('gift-open');
  playOpen(); confettiBurst(40); fireworkBurst(2); floatingHearts(8);
  $('#openGift').disabled = true;
  setTimeout(() => { showScene('nameReveal'); startNameReveal(); }, 1200);
});

function startNameReveal() {
  const first = $('#firstName'), last = $('#lastName'), full = $('#fullName');
  first.innerHTML = [...'EMA'].map((l, i) => `<span style="--delay:${i * 0.25}s">${l}</span>`).join('');
  last.innerHTML = ''; last.classList.remove('hidden'); full.classList.remove('visible');
  revealTimers.forEach(clearTimeout); revealTimers = [];
  
  revealTimers.push(setTimeout(() => {
    last.innerHTML = [...'SARKAR'].map((l, i) => `<span style="--delay:${i * 0.15}s">${l}</span>`).join('');
    playSparkle();
  }, 1500));
  
  revealTimers.push(setTimeout(() => {
    first.classList.add('hidden'); last.classList.add('hidden'); full.classList.add('visible');
    playOpen(); confettiBurst(40);
  }, 3200));
  
  revealTimers.push(setTimeout(() => { showScene('cardsScene'); renderCard(0); }, 9000));
}

function renderCard(index) {
  activeCard = index; const item = cards[index], card = $('#surpriseCard');
  card.style.opacity = '0'; card.style.transform = 'translate3d(0, 20px, 0) scale(0.95)';
  setTimeout(() => {
    $('#cardTitle').textContent = item.title;
    $('#cardText').innerHTML = item.text.split(NL).map((line, i) => line ? `<span class="poem-line" style="--line-delay:${0.1 + i * 0.1}s">${escapeHTML(line)}</span>` : '<span class="poem-break" aria-hidden="true"></span>').join('');
    $('#cardIndex').innerHTML = `0${index + 1} <span>—</span> 05`;
    $('#progressDots').innerHTML = cards.map((_, i) => `<i class="${i === index ? 'active' : ''}"></i>`).join('');
    card.style.opacity = '1'; card.style.transform = 'translate3d(0, 0, 0) scale(1)';
  }, 300);
}
function escapeHTML(s) { return s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

$('#nextCard').addEventListener('click', () => {
  if (transitionLocked) return;
  transitionLocked = true; $('#nextCard').disabled = true;
  const card = $('#surpriseCard');
  card.style.opacity = '0'; card.style.transform = 'translate3d(0, -20px, 0) scale(0.95)';
  playTransition();
  setTimeout(() => {
    if (activeCard < cards.length - 1) {
      renderCard(activeCard + 1);
      setTimeout(() => { transitionLocked = false; $('#nextCard').disabled = false; }, 500);
    } else {
      showScene('cakeScene'); transitionLocked = false; $('#nextCard').disabled = false; fireworkBurst(3);
    }
  }, 400);
});

$('#blowCandles').addEventListener('click', () => {
  if (cakeDone || countdownTimer) return;
  $('#blowCandles').disabled = true;
  let n = 3; const countdown = $('#countdown'); countdown.textContent = String(n);
  tone(800, 'sine', 0.1, 0.2);
  
  countdownTimer = setInterval(() => {
    n--;
    if (n > 0) {
      countdown.textContent = String(n); tone(800 - n * 50, 'sine', 0.1, 0.2);
    } else {
      clearInterval(countdownTimer); countdownTimer = null; countdown.textContent = '';
      setTimeout(() => {
        $('#candles').classList.add('blown'); playBlow();
        setTimeout(() => {
          confettiBurst(80); fireworkBurst(4); floatingHearts(15);
          $('.cake-scene').classList.add('wish-done'); $('#wishMessage').classList.add('visible');
          cakeDone = true;
          setTimeout(() => showScene('finaleScene'), 3500);
        }, 500);
      }, 300);
    }
  }, 1000);
});

$('#openFinal').addEventListener('click', () => {
  if (finalDone) return; finalDone = true;
  $('#finalGift').classList.add('open');
  playOpen(); confettiBurst(100); floatingHearts(20); fireworkBurst(5);
  setTimeout(() => {
    $('.finale-inner').classList.add('revealed'); playSparkle(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 1500);
});

$('#replay').addEventListener('click', () => {
  revealTimers.forEach(clearTimeout); clearInterval(countdownTimer); countdownTimer = null;
  activeCard = 0; transitionLocked = false; cakeDone = false; finalDone = false;
  $('#openGift').disabled = false; $('#firstGift').classList.remove('gift-open');
  $('#finalGift').classList.remove('open'); $('.finale-inner').classList.remove('revealed');
  $('#candles').classList.remove('blown'); $('#wishMessage').classList.remove('visible');
  $('.cake-scene').classList.remove('wish-done'); $('#countdown').textContent = ''; $('#blowCandles').disabled = false;
  showScene('opening'); window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Highly Optimized Canvas Physics
const canvas = $('#sky'), ctx = canvas.getContext('2d', { alpha: true });
let W = 0, H = 0, dpr = 1, particles = [], fireworks = [];
const pColors = ['#ffeaad', '#ff2a7a', '#9d2bd4', '#ffffff'];

function resize() {
  dpr = window.innerWidth < 768 ? 1 : Math.min(devicePixelRatio || 1, 1.5);
  W = innerWidth; H = innerHeight;
  canvas.width = Math.floor(W * dpr); canvas.height = Math.floor(H * dpr);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  
  const amount = window.innerWidth < 768 ? 20 : 40;
  particles = Array.from({ length: amount }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    r: 1 + Math.random() * 1.5, a: 0.2 + Math.random() * 0.5,
    s: 0.2 + Math.random() * 0.5, phase: Math.random() * 10,
    kind: Math.random(), drift: Math.random() * 1 - 0.5
  }));
}
addEventListener('resize', resize); resize();

function fireworkBurst(amount = 2) {
  playFirework();
  for (let k = 0; k < amount; k++) {
    const x = W * (0.2 + Math.random() * 0.6), y = H * (0.1 + Math.random() * 0.4);
    for (let i = 0; i < 25; i++) { 
      const a = (Math.PI * 2 * i) / 25 + (Math.random() * 0.2);
      const v = 2 + Math.random() * 3;
      fireworks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 50 + Math.random() * 30, max: 80, sz: 1.5 + Math.random() * 1.5 });
    }
  }
}

let frame = 0;
function draw() {
  requestAnimationFrame(draw); frame++;
  ctx.clearRect(0, 0, W, H);
  const t = frame * 0.02;
  
  for (const p of particles) {
    p.y -= p.s * (p.kind > 0.9 ? 2 : 0.8);
    p.x += Math.sin(t + p.phase) * 0.4 + p.drift * 0.2;
    if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
    if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
    
    ctx.globalAlpha = p.a * (0.5 + 0.5 * Math.sin(t * 2 + p.phase) ** 2);
    ctx.fillStyle = p.kind > 0.85 ? pColors[Math.floor(p.phase) % pColors.length] : '#fffdf5';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }

  ctx.globalAlpha = 1;
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const p = fireworks[i];
    p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.vx *= 0.96; 
    p.life--;
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = '#ffb347';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2); ctx.fill();
    if (p.life <= 0) fireworks.splice(i, 1);
  }
}
requestAnimationFrame(draw);