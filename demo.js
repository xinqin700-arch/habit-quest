/* ============================================================
   进化演示页逻辑
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const TITLES = {
  desert: ['沙丘拾光者', '绿洲旅人', '沙海之王', '远方来信', '金色的路', '风起时'],
  star: ['星语初醒', '星轨观测员', '银河摆渡人', '月光缝纫师', '星辰加冕者', '夜航星'],
  sunrise: ['晨光旅人', '日出收藏家', '破晓骑士', '黎明守望', '第一缕光', '燃烧的地平线'],
  lake: ['湖畔微风', '湖心明月', '流萤之约', '薄雾行者', '倒影里的自己', '静水之约']
};
const SCENE_DESC = {
  desert: '风把沙吹成一条长长的路，你走得不快，但没停。',
  star: '夜里有无数颗星星，其中一颗因为你今天做到了而亮起来。',
  sunrise: '天刚亮，光从地平线漫过来，把昨天的疲惫冲淡了。',
  lake: '湖面很静，你能看见自己的倒影——比 21 天前更挺直了一点。'
};
const AURAS = ['#ffd76e', '#7fdaad', '#8fd0ff', '#f59ab8', '#c9a8ff', '#ffb27a'];

const PRAISES = [
  '今天的你，比昨天多了一点点厉害。', '小小的一步，也是往前走。', '你把「想做」变成了「做了」。',
  '这种稳定感，比爆发更难。', '这颗星星是专门留给你的。', '记录 +1，人生进度条 +1。'
];

const MILESTONES = [
  {
    day: 3, stage: 2, name: '抽枝', role: '披风初现',
    unlock: ['身后出现披风 / 尾巴', '颈部多一件配饰', '肩膀变宽、站姿变稳'],
    scene: 'desert'
  },
  {
    day: 7, stage: 3, name: '生长', role: '王冠加身',
    unlock: ['头上多一顶王冠', '身体拉长、四肢变长', '服装开始分层'],
    scene: 'star'
  },
  {
    day: 14, stage: 4, name: '绽放', role: '宝石与光',
    unlock: ['宝石 / 金饰点缀', '角色出现彩色光晕', '卡片场景更华丽'],
    scene: 'sunrise'
  },
  {
    day: 21, stage: 5, name: '加冕', role: '光之继承者',
    unlock: ['头顶光环 + 全套华服', '21 天勋章卡收录', '可继续记录进入下一轮'],
    scene: 'lake'
  }
];

/* CHARS / SCENES / SCENE_NAME / mkPainter / drawScene 均来自 pixel-art.js */

let curChar = 'prince';
let rolls = MILESTONES.map(m => ({ scene: m.scene, title: pick(TITLES[m.scene]), rarity: 3, aura: pick(AURAS) }));

/* ---------- 绘制 ---------- */
function paintCard(cv, i) {
  const m = MILESTONES[i], r = rolls[i];
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 96, 64);
  const p = mkPainter(ctx);
  drawScene(p, r.scene, 11 + m.stage * 13);
  // 光晕
  ctx.globalAlpha = 0.2;
  p.ellipse(48, 56, 18, 4, r.aura);
  ctx.globalAlpha = 1;
  p.ellipse(48, 57, 10, 2, 'rgba(20,10,30,0.22)');
  CHARS[curChar].draw(p, m.stage, 32, 26);
  // 星
  for (let s = 0; s < r.rarity; s++) {
    p(6 + s * 5, 6, 3, 1, '#ffe89a');
    p(7 + s * 5, 5, 1, 3, '#ffe89a');
  }
}

function render() {
  const grid = $('#grid');
  grid.innerHTML = MILESTONES.map((m, i) => `
    <div class="ms-card">
      <canvas class="px" width="96" height="64" data-cv="${i}"></canvas>
      <div class="ms-body">
        <div class="ms-day">DAY ${m.day}</div>
        <div class="ms-name">${m.name} · ${m.role}</div>
        <ul class="ms-unlock">${m.unlock.map(u => `<li>${u}</li>`).join('')}</ul>
        <div class="ms-scene">${SCENE_NAME[rolls[i].scene]} · ${rolls[i].title}</div>
        <button class="play-btn" data-play="${i}">▶ 播放这天的打卡</button>
      </div>
    </div>`).join('');

  $$('#grid canvas[data-cv]').forEach(cv => paintCard(cv, +cv.dataset.cv));
  $$('[data-play]').forEach(b => b.onclick = () => play(+b.dataset.play));
}

/* ---------- 撒花 ---------- */
const fxc = () => $('#fx');
let parts = [], raf = null;
const COLORS = ['#ffd76e', '#7fdaad', '#8fd0ff', '#f59ab8', '#c9a8ff', '#ffb27a', '#fff8ec'];

function resizeFx() {
  const cv = fxc();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}

function confetti(n = 100) {
  const W = innerWidth, H = innerHeight;
  for (let i = 0; i < n; i++) {
    parts.push({
      x: W / 2 + (Math.random() - 0.5) * W * 0.55,
      y: H * 0.3 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 7.5, vy: -6 - Math.random() * 8,
      w: 4 + Math.random() * 6, h: 4 + Math.random() * 6,
      c: pick(COLORS), g: .24 + Math.random() * .12, a: 1
    });
  }
  if (!raf) raf = requestAnimationFrame(loop);
}
function loop() {
  const cv = fxc(), ctx = cv.getContext('2d');
  const W = innerWidth, H = innerHeight;
  ctx.clearRect(0, 0, W, H);
  parts.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .99;
    if (p.y > H * .7) p.a -= .03;
    ctx.globalAlpha = Math.max(0, p.a);
    ctx.fillStyle = p.c;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.w, p.h);
  });
  ctx.globalAlpha = 1;
  parts = parts.filter(p => p.a > 0 && p.y < H + 40);
  if (parts.length) raf = requestAnimationFrame(loop);
  else { raf = null; ctx.clearRect(0, 0, W, H); }
}

/* ---------- 夸夸 ---------- */
function praise(text, tag) {
  const el = document.createElement('div');
  el.className = 'praise';
  el.innerHTML = `<span class="pq">“</span>${text}<span class="ph">—「${tag}」</span>`;
  $('#praiseLayer').appendChild(el);
  setTimeout(() => el.classList.add('out'), 2400);
  setTimeout(() => el.remove(), 3000);
}

function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('#toastLayer').appendChild(el);
  setTimeout(() => el.classList.add('out'), 2000);
  setTimeout(() => el.remove(), 2500);
}

/* ---------- 播放一天的打卡 ---------- */
let playing = false;
function play(i) {
  if (playing) return;
  playing = true;
  const m = MILESTONES[i], r = rolls[i];

  confetti(120);
  praise(pick(PRAISES), `第 ${m.day} 天 · 打卡`);
  toast(`活力 +18 · 经验 +32 · 掉落一条奖励`);

  // 卡片
  const cv = $('#gachaCanvas');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 96, 64);
  const p = mkPainter(ctx);
  drawScene(p, r.scene, 11 + m.stage * 13);
  ctx.globalAlpha = 0.2; p.ellipse(48, 56, 18, 4, r.aura); ctx.globalAlpha = 1;
  p.ellipse(48, 57, 10, 2, 'rgba(20,10,30,0.22)');
  CHARS[curChar].draw(p, m.stage, 32, 26);

  $('#gstars').textContent = '★'.repeat(r.rarity);
  $('#gtitle').textContent = r.title;
  $('#gdesc').textContent = SCENE_DESC[r.scene];
  $('#gstage').textContent = `STAGE ${m.stage} · ${m.name} · 第 ${m.day} 天`;
  $('#gbtn').textContent = '开启进化 ✦';

  const ov = $('#gacha');
  ov.classList.add('show');
  $('#card3d').classList.remove('flip');
  blip(520);

  setTimeout(() => {
    $('#card3d').classList.add('flip');
    blip(990);
    setTimeout(() => {
      confetti(140);
      $('#gbtn').textContent = '看到了，继续 →';
    }, 600);
  }, 900);
}

function closeGacha() {
  $('#gacha').classList.remove('show');
  playing = false;
}

/* ---------- 音效 ---------- */
let actx = null;
function blip(freq = 700, dur = .07) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'square'; o.frequency.value = freq; g.gain.value = .035;
    o.connect(g); g.connect(actx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur);
  } catch (e) { }
}

/* ---------- 初始化 ---------- */
function init() {
  resizeFx();
  render();

  $$('.tab').forEach(t => t.onclick = () => {
    $$('.tab').forEach(x => x.classList.remove('on'));
    t.classList.add('on');
    curChar = t.dataset.char;
    $('#charLabel').textContent = CHARS[curChar].name;
    render();
  });

  $('#reroll').onclick = () => {
    rolls = MILESTONES.map((m, i) => {
      let pool = SCENES.filter(s => s !== rolls[i].scene);
      const sc = pick(pool);
      return { scene: sc, title: pick(TITLES[sc]), rarity: Math.random() > .8 ? 5 : Math.random() > .45 ? 4 : 3, aura: pick(AURAS) };
    });
    render();
    toast('已重新抽卡：每次进化都是随机的');
  };

  $('#gbtn').onclick = closeGacha;
  window.addEventListener('resize', resizeFx);
}

document.addEventListener('DOMContentLoaded', init);
