/* ============================================================
   Habit Quest — 应用逻辑
   ============================================================ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const KEY = 'habitQuest.v2';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

let S = null;
const load = () => { try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
  if (window.Cloud && S && Cloud.isSignedIn()) Cloud.queuePush();
};

/* ---------- 常量 ---------- */
const STAGE_META = {
  1: { name: '初芽', en: 'SPROUT' },
  2: { name: '抽枝', en: 'BUDDING' },
  3: { name: '生长', en: 'GROWING' },
  4: { name: '绽放', en: 'BLOOM' },
  5: { name: '加冕', en: 'CROWNED' }
};
const EVO_DAYS = [3, 7, 14, 21];
const stageName = (n) => (isEN() ? STAGE_META[n].en : STAGE_META[n].name);

const PRAISES = [
  '今天的你，比昨天多了一点点厉害。', '盖章确认：这件事你做到了。', '星星替你记下了这一笔。',
  '小小的一步，也是往前走。', '肌肉（和意志力）正在悄悄长出来。', '这种稳定感，比爆发更难。',
  '你没有等「有状态」才行动，这就是大人。', '打卡成功，今天的自己可以被表扬。', '看起来很小，攒起来很大。',
  '你把「想做」变成了「做了」。', '这颗星星是专门留给你的。', '干得漂亮，继续保持这个节奏。',
  '今天的坚持，是未来的底气。', '你战胜的不是任务，是那 3 秒的犹豫。', '记录 +1，人生进度条 +1。',
  '这条习惯正在变成你的本能。', '你比想象中更可靠。', '不为别的，就为你真的去做了。',
  '今天也稳稳地接住了自己。', '有人在偷偷为你骄傲（是我）。', '这件小事，值得被认真对待。',
  '你很擅长「开始」，现在也擅长「继续」。', '又靠近那个理想版本一点点了。', '完成，是最性感的一个词。',
  '你的耐心正在变成一种天赋。', '这不是打卡，这是给自己投票。', '微小但确定，这就是复利。',
  '今天的努力已经存进你的账户了。', '做完了，可以理直气壮地休息。', '你正在成为「说到做到」的人。',
  '给你发一枚今日份的小红花。', '坚持这件事，你已经开始擅长了。', '你在给自己的未来铺路。',
  '一关一关打过去，很帅。', '今天的你状态在线。', '不慌不忙，但你一直在动。',
  '这件事已经有一点点像你了。', '一次不算什么，但这是第 N 次。', '你的自律在发光。'
];

const REWARD_POOL = [
  '打 10 分钟游戏', '吃一个甜品', '点一杯喜欢的奶茶', '看一集剧', '刷 15 分钟短视频',
  '泡一杯好茶 / 咖啡', '躺平 10 分钟什么都不做', '听一整张专辑', '买一束小花', '给自己敷个面膜',
  '午睡 20 分钟', '买一支新口红', '去楼下散步 15 分钟', '看 20 页小说', '给自己点一份想吃的外卖',
  '洗个热水澡 + 泡脚', '在购物车里买一件小东西', '和朋友聊 20 分钟', '看一场电影', '吃一份水果碗',
  '允许自己今晚早睡', '给房间换一束花', '玩半小时拼图 / 游戏', '买一本一直想看的书', '周末睡到自然醒',
  '点一份火锅外卖', '给自己写一句夸奖', '看一集喜欢的综艺', '撸猫 10 分钟', '去便利店随便挑一样'
];

/* 卡片标题按场景分组，保证「湖心明月」不会出现在沙漠 */
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

const CHAR_KEYS = ['prince', 'princess', 'cat'];

/* ---------- 状态 ---------- */
function defaultState() {
  return {
    v: 2, char: 'prince', name: '', habits: [], days: [], sim: 0,
    exp: 0, hp: 60, stage: 1, cards: [], decor: [], equipped: [],
    food: {}, rewards: [], drops: [], aura: '#ffd76e', sound: false, medal: false, created: Date.now()
  };
}
const totalDays = () => Math.min(21, S.days.length + (S.sim || 0));
const rawDays = () => S.days.length + (S.sim || 0);
const calcStage = () => {
  const d = totalDays();
  if (d >= 21) return 5;
  if (d >= 14) return 4;
  if (d >= 7) return 3;
  if (d >= 3) return 2;
  return 1;
};
const nextEvo = () => EVO_DAYS.find(d => d > totalDays()) || null;
/* 勋章：满 21 天颁发，之后仍可继续记录 */
function checkMedal() {
  if (!S.medal && rawDays() >= 21) {
    S.medal = true;
    setTimeout(() => {
      confetti(220);
      blip(1040, 0.18);
      setTimeout(() => blip(1320, 0.22), 160);
      toast(t('🏅 21 天习惯勋章达成！这一关，你通关了'));
    }, 1100);
  }
}
/* 勋章卡绘制 */
function drawMedal(p, scene) {
  drawScene(p, scene || 'sunrise', 91);
  p(0, 0, 96, 64, 'rgba(10,8,20,0.45)');
  // 缎带
  p(38, 20, 4, 12, '#c0453f'); p(54, 20, 4, 12, '#c0453f');
  p(42, 20, 12, 3, '#96332e');
  // 金章
  p.circle(48, 40, 14, '#e8b64a');
  p.circle(48, 40, 12, '#ffd76e');
  p.circle(48, 40, 10, '#f2cf7a');
  // 星
  p(46, 32, 5, 3, '#fff8d4'); p(44, 35, 9, 3, '#fff8d4');
  p(45, 38, 3, 4, '#fff8d4'); p(50, 38, 3, 4, '#fff8d4');
  // 数字 21
  p(43, 44, 2, 5, '#7a5a10'); p(45, 44, 2, 2, '#7a5a10'); p(45, 47, 2, 2, '#7a5a10');
  p(49, 44, 2, 5, '#7a5a10'); p(51, 44, 2, 2, '#7a5a10'); p(53, 45, 2, 2, '#7a5a10'); p(51, 47, 2, 2, '#7a5a10');
}
const currentCard = () => S.cards.length ? S.cards[S.cards.length - 1] : null;
const currentScene = () => (currentCard() && currentCard().scene) || 'star';

/* ============================================================
   绘制英雄区
   ============================================================ */
const heroCv = () => $('#heroCanvas');
let heroT = 0;
let heroFx = [];

function drawHero() {
  const cv = heroCv();
  if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 96, 64);
  const p = mkPainter(ctx);

  // 场景
  drawScene(p, currentScene(), 13 + S.stage * 17);

  // 进化光晕
  const card = currentCard();
  if (card) {
    const aura = card.aura || '#ffd76e';
    ctx.globalAlpha = 0.18;
    p.ellipse(48, 56, 20, 5, aura);
    ctx.globalAlpha = 1;
    for (let i = 0; i < 6; i++) {
      const ang = heroT / 900 + i * (Math.PI / 3);
      const rx = 26 + Math.sin(heroT / 700 + i) * 3;
      const x = 48 + Math.cos(ang) * rx;
      const y = 34 + Math.sin(ang) * 9;
      p(Math.round(x), Math.round(y), 1, 1, aura);
    }
  }

  // 影子
  p.ellipse(48, 57, 10, 2, 'rgba(20,10,30,0.20)');

  const bob = Math.sin(heroT / 620) > 0.2 ? 1 : 0;
  const ox = 32, oy = 26 - bob;

  // 背后装饰
  const m = CHARS[S.char].draw(p, S.stage, ox, oy);
  S.equipped.forEach(id => {
    const d = DECOR_MAP[id];
    if (d && d.slot === 'back') d.draw(p, m);
  });
  // 正面装饰
  S.equipped.forEach(id => {
    const d = DECOR_MAP[id];
    if (d && d.slot !== 'back') d.draw(p, m);
  });

  // 特效
  heroFx = heroFx.filter(f => f.life > 0);
  heroFx.forEach(f => {
    if (f.type === 'heart') {
      p(Math.round(f.x), Math.round(f.y), 2, 1, '#ff9ab5');
      p(Math.round(f.x), Math.round(f.y + 1), 1, 1, '#ff9ab5');
      p(Math.round(f.x + 1), Math.round(f.y + 1), 1, 1, '#ff9ab5');
      p(Math.round(f.x + 2), Math.round(f.y + 1), 1, 1, '#ff9ab5');
      p(Math.round(f.x + 1), Math.round(f.y + 2), 1, 1, '#ff9ab5');
    } else if (f.type === 'spark') {
      p(Math.round(f.x), Math.round(f.y), 1, 1, f.col || '#ffe89a');
    } else if (f.type === 'food') {
      FOOD_MAP[f.id] && FOOD_MAP[f.id].draw(p, Math.round(f.x), Math.round(f.y));
    }
    f.life--;
    f.y -= f.vy;
    f.x += f.vx || 0;
  });
}

function heroTick(t) {
  heroT = t;
  drawHero();
  requestAnimationFrame(heroTick);
}

function addFx(list) {
  list.forEach(f => heroFx.push(f));
}

/* ============================================================
   渲染：整体
   ============================================================ */
function renderAll() {
  if (!S) return;
  renderHud();
  renderHeroMeta();
  renderCalendar();
  renderCards();
  renderHabits();
  renderDrops();
  renderWardrobe();
  drawHero();
}

function renderHud() {
  const d = totalDays();
  if (rawDays() > 21) {
    const m = ((rawDays() - 1) % 21) + 1;
    $('#dayChip').textContent = t('第 {r} 轮 · {m}/21', { r: Math.floor((rawDays() - 1) / 21) + 1, m });
  } else {
    $('#dayChip').textContent = `DAY ${Math.max(d, 1)} / 21`;
  }
  $('#soundBtn').classList.toggle('on', !!S.sound);
}

function renderHeroMeta() {
  const c = CHARS[S.char];
  const defaultNames = CHAR_KEYS.map(k => CHARS[k].name);
  const custom = S.name && defaultNames.indexOf(S.name) < 0 ? S.name : '';
  $('#charName').textContent = custom || t(c.name);
  $('#charSub').textContent = t(c.sub);
  $('#stagePill').textContent = `${stageName(S.stage)} · STAGE ${S.stage}`;
  const mp = $('#medalPill');
  if (mp) mp.hidden = !S.medal;
  $('#sceneTag').textContent = t(SCENE_NAME[currentScene()]);

  const hp = clamp(S.hp, 0, 100);
  $('#hpBar').style.width = hp + '%';
  $('#hpTxt').textContent = `${hp}/100`;

  const per = 120;
  const inStage = S.exp % per;
  $('#expBar').style.width = (inStage / per * 100) + '%';
  $('#expTxt').textContent = `${inStage}/${per}`;

  // 进化轨迹
  const d = totalDays();
  $('#evoTrack').innerHTML = EVO_DAYS.map((day, i) => {
    const done = d >= day;
    const isNext = nextEvo() === day;
    return `<div class="evo-step ${done ? 'done' : ''} ${isNext ? 'next' : ''}">
      <span class="dot">${done ? '✦' : day}</span>
      <span class="lbl">${t('第 {d} 天', { d: day })}</span>
    </div>`;
  }).join('');
}

function renderCalendar() {
  const d = totalDays();
  let html = '';
  for (let i = 0; i < 21; i++) {
    const filled = i < d;
    const isToday = i === d - 1;
    html += `<div class="cal-cell ${filled ? 'filled' : ''} ${isToday ? 'today' : ''}">
      <span>${filled ? '✦' : i + 1}</span></div>`;
  }
  $('#calendar').innerHTML = html;
  $('#calHint') && ($('#calHint').textContent = `${d}/21`);
}

function renderHabits() {
  const box = $('#habits');
  const tk = todayKey();
  if (!S.habits.length) {
    box.innerHTML = `<p class="tiny">${t('还没有习惯，去设置里添加吧。')}</p>`;
    return;
  }
  box.innerHTML = S.habits.map(h => {
    const doneToday = h.last === tk;
    return `<div class="habit ${doneToday ? 'done' : ''}" data-id="${h.id}">
      <div class="habit-ava"><canvas class="px" width="8" height="8" data-icon="${h.icon}"></canvas></div>
      <div class="habit-main">
        <div class="habit-top">
          <span class="habit-name">${escapeHtml(h.name)}</span>
          ${h.streak > 1 ? `<span class="streak">🔥 ${h.streak}</span>` : ''}
        </div>
        <div class="habit-meta">${t('累计 {n} 次 · 连续 {s} 天', { n: h.total, s: h.streak })}</div>
        <div class="bar mini"><i style="width:${Math.min(100, h.streak / 21 * 100)}%"></i></div>
      </div>
      <button class="btn check ${doneToday ? 'ghost' : ''}" ${doneToday ? 'disabled' : ''} data-check="${h.id}">
        ${doneToday ? t('✓ 已完成') : t('打卡')}
      </button>
    </div>`;
  }).join('');
  const doneCount = S.habits.filter(h => h.last === tk).length;
  $('#habitHint').textContent = t('{n}/{m} 已打卡', { n: doneCount, m: S.habits.length });

  $$('#habits canvas[data-icon]').forEach(cv => {
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, 8, 8);
    const p = mkPainter(ctx);
    drawIcon(p, cv.dataset.icon, 0, 0, ICON_COLOR[cv.dataset.icon]);
  });
}

function renderCards() {
  const box = $('#cards');
  const total = S.cards.length + (S.medal ? 1 : 0);
  $('#cardCount').textContent = total;
  if (!total) {
    box.innerHTML = `<p class="tiny">${t('第 3 天会得到第一张卡片。每次进化都是抽卡，每个人抽到的都不一样。')}</p>`;
    return;
  }
  let html = '';
  if (S.medal) {
    html += `<div class="acard medal">
      <canvas class="px" width="96" height="64" id="medalCanvas"></canvas>
      <div class="acard-meta">
        <span class="acard-title">${t('21 天习惯勋章')}</span>
        <span class="acard-sub">${t('通关纪念 · 可继续记录')}</span>
      </div>
    </div>`;
  }
  html += S.cards.map(c => `
    <div class="acard">
      <canvas class="px" width="96" height="64" data-card="${c.id}"></canvas>
      <div class="acard-meta">
        <span class="acard-title">${escapeHtml(t(c.title))}</span>
        <span class="acard-sub">${t('{scene} · 第 {d} 天', { scene: t(SCENE_NAME[c.scene]), d: c.stage === 2 ? 3 : c.stage === 3 ? 7 : c.stage === 4 ? 14 : 21 })}</span>
      </div>
    </div>`).join('');
  box.innerHTML = html;

  if (S.medal) {
    const mcv = $('#medalCanvas');
    const mctx = mcv.getContext('2d');
    mctx.clearRect(0, 0, 96, 64);
    drawMedal(mkPainter(mctx), currentCard() && currentCard().scene);
  }

  S.cards.forEach(c => {
    const cv = box.querySelector(`canvas[data-card="${c.id}"]`);
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, 96, 64);
    const p = mkPainter(ctx);
    drawScene(p, c.scene, 13 + c.stage * 17);
    p.ellipse(48, 57, 10, 2, 'rgba(20,10,30,0.20)');
    CHARS[S.char].draw(p, c.stage, 32, 26);
    // 卡片星星
    for (let i = 0; i < c.rarity; i++) {
      p(6 + i * 5, 6, 3, 1, '#ffe89a');
      p(7 + i * 5, 5, 1, 3, '#ffe89a');
    }
  });
}

function renderDrops() {
  const box = $('#rewardDrops');
  const recent = S.drops.slice(-8).reverse();
  const chips = S.rewards.length
    ? S.rewards.map(r => `<span class="chip">${escapeHtml(r)}</span>`).join('')
    : `<span class="chip dim">${t('未设置 · 系统随机')}</span>`;

  box.innerHTML = `
    <div class="chips">${chips}</div>
    ${recent.length ? recent.map(d => `
      <div class="drop ${d.claimed ? 'claimed' : ''}" data-drop="${d.id}">
        <span class="drop-icon">🎁</span>
        <span class="drop-text">${escapeHtml(t(d.text))}</span>
        <button class="mini-btn" data-claim="${d.id}">${d.claimed ? t('已兑现') : t('兑现')}</button>
      </div>`).join('') : `<p class="tiny">${t('完成一次打卡就会掉一条奖励。')}</p>`}
  `;
}

function renderWardrobe() {
  $('#decorHint').textContent = t('{n} 件', { n: S.decor.length });
  const box = $('#wardrobe');
  box.classList.toggle('empty', !S.decor.length);
  if (!S.decor.length) {
    box.innerHTML = `<p class="tiny">${t('打卡有概率掉落装饰。墨镜、头花、手杖……都会随机出现。')}</p>`;
  } else {
    box.innerHTML = S.decor.map(id => {
      const d = DECOR_MAP[id];
      if (!d) return '';
      const on = S.equipped.includes(id);
      return `<button class="decor ${on ? 'on' : ''}" data-decor="${id}" title="${escapeHtml(t(d.name))}">
        <canvas class="px" width="32" height="32" data-dp="${id}"></canvas>
        <span>${escapeHtml(t(d.name))}</span>
      </button>`;
    }).join('');
    S.decor.forEach(id => {
      const cv = box.querySelector(`canvas[data-dp="${id}"]`);
      if (!cv) return;
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, 32, 32);
      const p = mkPainter(ctx);
      const stage = Math.max(3, S.stage);
      const m = CHARS[S.char].draw(p, stage, 0, 0);
      const d = DECOR_MAP[id];
      if (d.slot === 'back') { /* 重绘以叠加 */ }
      d.draw(p, m);
    });
  }

  // 零食袋
  const foods = Object.keys(S.food).filter(k => S.food[k] > 0);
  $('#foodBag').innerHTML = foods.length
    ? foods.map(fid => {
      const f = FOOD_MAP[fid];
      return `<button class="food" data-feed="${fid}" title="${escapeHtml(t('投喂 {name}', { name: t(f.name) }))}">
        <canvas class="px" width="10" height="10" data-fd="${fid}"></canvas>
        <span>${escapeHtml(t(f.name))}</span><b>x${S.food[fid]}</b></button>`;
    }).join('')
    : `<p class="tiny">${t('还没有零食。打卡时有概率捡到，投喂会让 TA 很开心。')}</p>`;

  foods.forEach(fid => {
    const cv = $(`canvas[data-fd="${fid}"]`);
    if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, 10, 10);
    const p = mkPainter(ctx);
    FOOD_MAP[fid].draw(p, 1, 1);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

/* ============================================================
   打卡
   ============================================================ */
function doCheckIn(id) {
  const h = S.habits.find(x => x.id === id);
  if (!h) return;
  const tk = todayKey();
  if (h.last === tk) { toast(t('这个习惯今天已经打过卡啦 ✓')); return; }

  const yest = dayKey(new Date(Date.now() - 864e5));
  h.streak = h.last === yest ? h.streak + 1 : 1;
  h.last = tk;
  h.total++;
  h.dates.push(tk);

  S.hp = Math.min(100, S.hp + 18);
  S.exp += 32 + Math.min(h.streak, 7) * 3;
  if (!S.days.includes(tk)) S.days.push(tk);

  confetti();
  blip(660, 0.08);
  showPraise(h.name);
  dropReward();

  // 装饰掉落 30%
  if (Math.random() < 0.3) dropDecor();
  // 零食掉落 25%
  if (Math.random() < 0.25) dropFood();

  const before = S.stage;
  S.stage = calcStage();
  checkMedal();
  save();
  renderAll();

  if (S.stage > before) {
    setTimeout(() => openGacha(S.stage), 750);
  }
}

function dropReward() {
  let text;
  if (S.rewards.length) {
    /* 用户设了自定义奖励，就只从自定义池里掉，绝不混入系统建议 */
    const recent = new Set(S.drops.slice(-3).map(d => d.text));
    const avail = S.rewards.filter(r => !recent.has(r));
    text = pick(avail.length ? avail : S.rewards);
  } else {
    text = pick(REWARD_POOL);
  }
  S.drops.push({ id: 'r' + Date.now() + Math.floor(Math.random() * 99), text, claimed: false, ts: Date.now() });
}

function dropDecor() {
  const owned = new Set(S.decor);
  const left = DECOR.filter(d => !owned.has(d.id));
  if (!left.length) { dropFood(); return; }
  const d = pick(left);
  S.decor.push(d.id);
  toast(t('获得装饰：{icon} {name}', { icon: d.icon, name: t(d.name) }));
  blip(880, 0.06);
}

function dropFood() {
  const f = pick(FOODS);
  S.food[f.id] = (S.food[f.id] || 0) + 1;
  toast(t('捡到零食：{name}', { name: t(f.name) }));
}

/* ---------- 夸夸 ---------- */
let praiseBag = [];
function showPraise(habitName) {
  if (!praiseBag.length) praiseBag = PRAISES.slice().sort(() => Math.random() - 0.5);
  const text = t(praiseBag.pop());
  const el = document.createElement('div');
  el.className = 'praise';
  el.innerHTML = `<span class="pq">“</span>${text}<span class="ph">${isEN() ? '— ' : '—「'}${escapeHtml(habitName)}${isEN() ? '' : '」'}</span>`;
  $('#praiseLayer').appendChild(el);
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3300);
}

/* ---------- toast ---------- */
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('#toastLayer').appendChild(el);
  setTimeout(() => el.classList.add('out'), 1900);
  setTimeout(() => el.remove(), 2500);
}

/* ============================================================
   抽卡进化
   ============================================================ */
let pendingCard = null;
let gachaOpened = false;

function rollCard(stage) {
  const last = currentCard();
  let pool = SCENES.slice();
  if (last) pool = pool.filter(s => s !== last.scene);
  if (!pool.length) pool = SCENES.slice();
  const r = Math.random();
  const rarity = r > 0.82 ? 5 : r > 0.48 ? 4 : 3;
  const scene = pick(pool);
  return {
    id: 'c' + Date.now() + Math.floor(Math.random() * 999),
    stage,
    scene,
    title: pick(TITLES[scene]),
    rarity,
    aura: pick(AURAS),
    date: todayKey()
  };
}

function openGacha(stage) {
  pendingCard = rollCard(stage);
  gachaOpened = false;
  const ov = $('#gacha');
  ov.classList.add('show');
  $('#card3d').classList.remove('flip');
  $('#gachaBtn').textContent = t('开启进化 ✦');
  $('#gachaBtn').disabled = false;
  $('#gachaStars').textContent = '★'.repeat(pendingCard.rarity);
  $('#gachaTitle').textContent = t(pendingCard.title);
  $('#gachaDesc').textContent = t(SCENE_DESC[pendingCard.scene]);
  $('#gachaStage').textContent = `STAGE ${stage} · ${stageName(stage)}`;

  const cv = $('#gachaCanvas');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 96, 64);
  const p = mkPainter(ctx);
  drawScene(p, pendingCard.scene, 13 + stage * 17);
  p.ellipse(48, 57, 10, 2, 'rgba(20,10,30,0.20)');
  CHARS[S.char].draw(p, stage, 32, 26);
  blip(520, 0.09);
}

function revealGacha() {
  if (!pendingCard || gachaOpened) return;
  gachaOpened = true;
  $('#card3d').classList.add('flip');
  blip(990, 0.12);
  setTimeout(() => {
    confetti(120);
    $('#gachaBtn').textContent = t('收下这张卡');
    $('#gachaBtn').disabled = false;
  }, 620);
}

function closeGacha() {
  if (!pendingCard) return;
  S.cards.push(pendingCard);
  S.aura = pendingCard.aura;
  // 进化奖励：一件装饰
  const owned = new Set(S.decor);
  const left = DECOR.filter(d => !owned.has(d.id));
  if (left.length) {
    const d = pick(left);
    S.decor.push(d.id);
    setTimeout(() => toast(t('进化奖励：{icon} {name}', { icon: d.icon, name: t(d.name) })), 400);
  }
  pendingCard = null;
  save();
  $('#gacha').classList.remove('show');
  renderAll();
  sparkleBurst();
}

/* ============================================================
   零食 / 装饰交互
   ============================================================ */
function feed(fid) {
  if (!S.food[fid]) return;
  S.food[fid]--;
  S.hp = Math.min(100, S.hp + 5);
  const f = FOOD_MAP[fid];
  addFx([
    { type: 'food', id: fid, x: 56, y: 44, vx: -0.35, vy: 0.35, life: 26 },
    { type: 'heart', x: 62, y: 40, vx: 0.1, vy: 0.6, life: 30 },
    { type: 'heart', x: 58, y: 36, vx: -0.15, vy: 0.5, life: 26 },
    { type: 'heart', x: 66, y: 44, vx: 0.2, vy: 0.55, life: 22 }
  ]);
  toast(t('{name} +1 · 它眯起了眼睛', { name: t(f.name) }));
  blip(760, 0.05);
  save(); renderAll();
}

function toggleDecor(id) {
  if (!S.decor.includes(id)) return;
  const i = S.equipped.indexOf(id);
  if (i >= 0) S.equipped.splice(i, 1);
  else {
    const d = DECOR_MAP[id];
    // 同槽位互斥
    S.equipped = S.equipped.filter(x => DECOR_MAP[x] && DECOR_MAP[x].slot !== d.slot);
    S.equipped.push(id);
  }
  save(); renderAll();
}

function claimDrop(id) {
  const d = S.drops.find(x => x.id === id);
  if (!d) return;
  d.claimed = !d.claimed;
  if (d.claimed) { confetti(40); toast(t('奖励已兑现，好好享受 ✓')); }
  save(); renderAll();
}

/* ============================================================
   撒花 / 特效
   ============================================================ */
const fxCv = () => $('#fxCanvas');
let parts = [], fxRaf = null;

function resizeFx() {
  const cv = fxCv();
  if (!cv) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = window.innerWidth * dpr;
  cv.height = window.innerHeight * dpr;
  cv.style.width = window.innerWidth + 'px';
  cv.style.height = window.innerHeight + 'px';
  cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
}

const CONF_COLORS = ['#ffd76e', '#7fdaad', '#8fd0ff', '#f59ab8', '#c9a8ff', '#ffb27a', '#fff8ec'];

function confetti(n = 90) {
  const cv = fxCv();
  if (!cv) return;
  const W = window.innerWidth, H = window.innerHeight;
  for (let i = 0; i < n; i++) {
    parts.push({
      x: W / 2 + (Math.random() - 0.5) * W * 0.5,
      y: H * 0.28 + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 7,
      vy: -6 - Math.random() * 7,
      w: 4 + Math.random() * 6,
      h: 4 + Math.random() * 6,
      c: pick(CONF_COLORS),
      g: 0.24 + Math.random() * 0.12,
      a: 1
    });
  }
  if (!fxRaf) fxRaf = requestAnimationFrame(fxLoop);
}

function fxLoop() {
  const cv = fxCv();
  const ctx = cv.getContext('2d');
  const W = window.innerWidth, H = window.innerHeight;
  ctx.clearRect(0, 0, W, H);
  parts.forEach(pt => {
    pt.x += pt.vx; pt.y += pt.vy; pt.vy += pt.g; pt.vx *= 0.99;
    if (pt.y > H * 0.72) pt.a -= 0.03;
    ctx.globalAlpha = Math.max(0, pt.a);
    ctx.fillStyle = pt.c;
    ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.w, pt.h);
  });
  ctx.globalAlpha = 1;
  parts = parts.filter(p => p.a > 0 && p.y < H + 40);
  if (parts.length) fxRaf = requestAnimationFrame(fxLoop);
  else { fxRaf = null; ctx.clearRect(0, 0, W, H); }
}

function sparkleBurst() {
  const fxs = [];
  for (let i = 0; i < 24; i++) {
    fxs.push({
      type: 'spark',
      x: 48 + (Math.random() - 0.5) * 30,
      y: 50 + (Math.random() - 0.5) * 24,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.3 + Math.random() * 0.6,
      life: 20 + Math.random() * 20,
      col: pick(AURAS)
    });
  }
  addFx(fxs);
}

/* ---------- 音效 ---------- */
let actx = null;
function blip(freq = 700, dur = 0.07) {
  if (!S || !S.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = 'square';
    o.frequency.value = freq;
    g.gain.value = 0.04;
    o.connect(g); g.connect(actx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur);
  } catch (e) { }
}

/* ============================================================
   引导流程
   ============================================================ */
let obChar = null;
let obHabits = [];
let obRewards = [];

function buildCharPick() {
  const box = $('#charPick');
  box.innerHTML = CHAR_KEYS.map(k => `
    <button class="char-card" data-char="${k}">
      <canvas class="px" width="96" height="64" data-preview="${k}"></canvas>
      <div class="char-card-meta">
        <b>${escapeHtml(t(CHARS[k].name))}</b>
        <span>${escapeHtml(t(CHARS[k].sub))}</span>
      </div>
    </button>`).join('');

  CHAR_KEYS.forEach(k => {
    const cv = box.querySelector(`canvas[data-preview="${k}"]`);
    const ctx = cv.getContext('2d');
    const p = mkPainter(ctx);
    const sc = k === 'cat' ? 'sunrise' : k === 'prince' ? 'star' : 'lake';
    drawScene(p, sc, k === 'cat' ? 31 : k === 'prince' ? 17 : 47);
    p.ellipse(48, 57, 10, 2, 'rgba(20,10,30,0.20)');
    CHARS[k].draw(p, 3, 32, 26);
  });

  box.onclick = (e) => {
    const card = e.target.closest('.char-card');
    if (!card) return;
    obChar = card.dataset.char;
    $$('.char-card').forEach(c => c.classList.toggle('sel', c === card));
    $('#toStep2').disabled = false;
    blip(720, 0.05);
  };
}

function buildHabitInputs() {
  const box = $('#habitInputs');
  box.innerHTML = [0, 1, 2].map(i => `
    <div class="habit-input" data-i="${i}">
      <span class="hi-num">${i + 1}</span>
      <input class="hi-name" maxlength="12" placeholder="${escapeHtml(i === 0 ? t('比如：早起喝一杯水') : t('留空即不设置'))}" />
      <div class="hi-icons">${ICONS.map(ic => `<button class="hi-ic ${i === 0 && ic === 'star' ? 'on' : ''}" data-ic="${ic}"><canvas class="px" width="8" height="8" data-hic="${ic}"></canvas></button>`).join('')}</div>
    </div>`).join('');

  $$('#habitInputs canvas[data-hic]').forEach(cv => {
    const ctx = cv.getContext('2d');
    const p = mkPainter(ctx);
    drawIcon(p, cv.dataset.hic, 0, 0, ICON_COLOR[cv.dataset.hic]);
  });
  $$('#habitInputs .hi-ic').forEach(btn => {
    btn.onclick = () => {
      $$('.hi-ic', btn.parentElement).forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      blip(640, 0.04);
    };
  });
}

function buildRewardChips() {
  const box = $('#rewardChips');
  box.innerHTML = obRewards.length
    ? obRewards.map((r, i) => `<span class="chip">${escapeHtml(r)}<button data-rmr="${i}">×</button></span>`).join('')
    : `<span class="chip dim">${t('暂不设置 · 系统随机给')}</span>`;
  $$('[data-rmr]').forEach(b => b.onclick = () => {
    obRewards.splice(+b.dataset.rmr, 1);
    buildRewardChips();
  });
}

function startGame() {
  const habits = [];
  $$('#habitInputs .habit-input').forEach((row, i) => {
    const name = $('.hi-name', row).value.trim();
    if (!name) return;
    const icon = $('.hi-ic.on', row)?.dataset.ic || ICONS[i % ICONS.length];
    habits.push({
      id: 'h' + Date.now() + i,
      name, icon,
      total: 0, streak: 0, last: null, dates: []
    });
  });
  if (!habits.length) { toast(t('至少定一个习惯，才有得打卡呀')); return; }

  S = defaultState();
  S.char = obChar || 'prince';
  S.name = '';
  S.habits = habits;
  S.rewards = obRewards.slice();
  save();
  $('#onboard').classList.remove('show');
  renderAll();
  setTimeout(() => toast(t('21 天，从今天开始。')), 500);
}

/* ============================================================
   设置
   ============================================================ */
function openSettings() {
  const defaultNames = CHAR_KEYS.map(k => CHARS[k].name);
  $('#setName').value = S.name && defaultNames.indexOf(S.name) < 0 ? S.name : '';
  $('#setName').placeholder = escapeHtml(t(CHARS[S.char].name));
  $('#setHabits').innerHTML = S.habits.map((h, i) => `
    <div class="set-row"><span>${i + 1}</span><input data-hn="${h.id}" value="${escapeHtml(h.name)}" maxlength="12"></div>`).join('');
  buildSetRewards();
  if (window.Cloud) Cloud.acctRender();
  $('#settings').classList.add('show');
}

function buildSetRewards() {
  $('#setRewards').innerHTML = S.rewards.length
    ? S.rewards.map((r, i) => `<span class="chip">${escapeHtml(r)}<button data-srm="${i}">×</button></span>`).join('')
    : `<span class="chip dim">${t('未设置')}</span>`;
  $$('[data-srm]').forEach(b => b.onclick = () => {
    S.rewards.splice(+b.dataset.srm, 1);
    save(); buildSetRewards(); renderDrops();
  });
}

/* 演示：直接跳到第 N 天，触发一次完整的「打卡 + 进化」效果 */
function demoMilestone(n) {
  $('#settings').classList.remove('show');
  const need = n - S.days.length;
  S.sim = Math.max(0, need);
  S.hp = Math.min(100, S.hp + 18);
  S.exp += 32;
  const before = S.stage;
  S.stage = calcStage();
  checkMedal();
  if (before === S.stage) {
    /* 已经在这个形态：换一张卡重新抽，展示「每人不一样」 */
    save(); renderAll();
    toast(t('重抽一次进化效果，看看这次是什么'));
    setTimeout(() => openGacha(S.stage), 400);
    return;
  }
  save(); renderAll();
  confetti(110);
  blip(660, 0.08);
  showPraise(t('第 {d} 天', { d: n }));
  dropReward();
  save(); renderAll();
  setTimeout(() => openGacha(S.stage), 850);
}

function simulateDay() {
  S.sim = (S.sim || 0) + 1;
  S.exp += 24;
  S.hp = Math.max(20, S.hp - 6);
  const before = S.stage;
  S.stage = calcStage();
  checkMedal();
  save(); renderAll();
  toast(t('快进到第 {d} 天（预览用）', { d: totalDays() }));
  if (S.stage > before) setTimeout(() => openGacha(S.stage), 500);
}

/* ============================================================
   事件绑定 / 初始化
   ============================================================ */
function bindEvents() {
  // 打卡（事件委托）
  document.addEventListener('click', (e) => {
    const chk = e.target.closest('[data-check]');
    if (chk) { doCheckIn(chk.dataset.check); return; }
    const dc = e.target.closest('[data-decor]');
    if (dc) { toggleDecor(dc.dataset.decor); return; }
    const fd = e.target.closest('[data-feed]');
    if (fd) { feed(fd.dataset.feed); return; }
    const cl = e.target.closest('[data-claim]');
    if (cl) { claimDrop(cl.dataset.claim); return; }
  });

  $('#soundBtn').onclick = () => {
    S.sound = !S.sound;
    save(); renderHud();
    if (S.sound) blip(880, 0.08);
    toast(t(S.sound ? '音效已开启' : '音效已关闭'));
  };

  $('#settingsBtn').onclick = openSettings;

  $('#toStep2').onclick = () => {
    $('#ob1').hidden = true; $('#ob2').hidden = false;
    buildHabitInputs();
  };
  $('#backStep1').onclick = () => { $('#ob2').hidden = true; $('#ob1').hidden = false; };
  $('#toStep3').onclick = () => {
    const any = $$('#habitInputs .hi-name').some(i => i.value.trim());
    if (!any) { toast(t('先写下一个想养成的习惯吧')); return; }
    $('#ob2').hidden = true; $('#ob3').hidden = false;
    buildRewardChips();
  };
  $('#backStep2').onclick = () => { $('#ob3').hidden = true; $('#ob2').hidden = false; };
  $('#addReward').onclick = () => {
    const v = $('#rewardInput').value.trim();
    if (!v) return;
    if (obRewards.length >= 8) { toast(t('最多 8 条奖励，够用啦')); return; }
    obRewards.push(v);
    $('#rewardInput').value = '';
    buildRewardChips();
  };
  $('#rewardInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('#addReward').click(); });
  $('#startBtn').onclick = startGame;

  // 抽卡
  $('#gachaBtn').onclick = () => {
    if (!gachaOpened) revealGacha();
    else closeGacha();
  };

  // 设置面板
  $('#setSave').onclick = () => {
    S.name = $('#setName').value.trim() || '';
    $$('#setHabits input[data-hn]').forEach(inp => {
      const h = S.habits.find(x => x.id === inp.dataset.hn);
      if (h) h.name = inp.value.trim() || h.name;
    });
    save(); renderAll(); toast(t('已保存'));
  };
  $('#setAddReward').onclick = () => {
    const v = $('#setRewardInput').value.trim();
    if (!v) return;
    if (S.rewards.length >= 8) { toast(t('最多 8 条')); return; }
    S.rewards.push(v);
    $('#setRewardInput').value = '';
    save(); buildSetRewards(); renderDrops();
  };
  $('#setSim').onclick = simulateDay;
  $$('[data-demo]').forEach(b => {
    b.onclick = () => demoMilestone(+b.dataset.demo);
  });
  $('#setReset').onclick = async () => {
    if (!confirm(t('确定清空全部进度重新开始吗？账号里的云端存档也会一并清空，无法撤销。'))) return;
    try { await Cloud.clearRemote(); } catch (e) { }
    localStorage.removeItem(KEY);
    location.reload();
  };
  $('#acctOut').onclick = async () => {
    if (!confirm(t('退出登录？进度已保存在云端，下次登录可以接着养。'))) return;
    await Cloud.signOut();
    localStorage.removeItem(KEY);
    location.reload();
  };
  $('#setClose').onclick = () => $('#settings').classList.remove('show');

  window.addEventListener('resize', resizeFx);
}

function init() {
  bindEvents();
  resizeFx();
  buildCharPick();

  /* 登录后才会进入游戏：Cloud 负责门禁与云端存档读取 */
  Cloud.boot({
    enter: enterGame,
    getState: () => S
  });
}

/* 兼容旧版本存档字段 */
function normalizeState(st) {
  const s = st || defaultState();
  s.sim = s.sim || 0; s.decor = s.decor || []; s.equipped = s.equipped || [];
  s.food = s.food || {}; s.cards = s.cards || []; s.drops = s.drops || [];
  s.medal = !!s.medal;
  // 旧存档里可能存的是角色默认名（中文），清掉以便跟随语言显示
  if (s.name && CHAR_KEYS.some(k => CHARS[k].name === s.name)) s.name = '';
  return s;
}

function enterGame(cloudState) {
  const local = load();
  if (cloudState) {
    S = normalizeState(cloudState);
  } else if (local) {
    // 首次登录：把本机已有的进度搬到账号里
    S = normalizeState(local);
    Cloud.queuePush();
    toast(t('已把本机进度同步到你的账号'));
  } else {
    S = defaultState();
  }
  enterView();
}

function enterView() {
  if (!S.habits || !S.habits.length) {
    $('#onboard').classList.add('show');
    requestAnimationFrame(heroTick);
    return;
  }
  S.stage = calcStage();
  renderAll();
  requestAnimationFrame(heroTick);
}

/* 切换语言：静态节点由 applyI18n 处理，这里重绘所有动态区域 */
function onLangChange() {
  buildCharPick();
  if (!S) return;
  renderAll();
  const set = $('#settings');
  if (set && set.classList.contains('show')) openSettings();
}

document.addEventListener('DOMContentLoaded', init);
