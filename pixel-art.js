/* ============================================================
   Habit Quest — 像素风 21 天习惯养成
   像素绘制引擎：所有角色 / 场景 / 装饰都在 96x64 逻辑网格上绘制，
   再用 CSS image-rendering: pixelated 放大，保证真像素观感。
   ============================================================ */

const SCENE_W = 96;
const SCENE_H = 64;

const C = {
  ink: '#2b2138', ink2: '#463457',
  skin: '#f8d6b2', skinS: '#e6b58c', skinD: '#c98f6a',
  gold: '#f7c948', goldD: '#d9a227', goldL: '#ffe89a',
  white: '#fdf7ea', cream: '#f3e7d1',
  mint: '#4fb286', mintD: '#337d5c', mintL: '#7fdaad',
  red: '#e0574d', redD: '#ab3a33',
  pink: '#f59ab8', pinkD: '#cf7592', pinkL: '#ffc7d8',
  blue: '#5b8fd6', blueD: '#3a64a0',
  purple: '#9b7bdc', purpleD: '#6d4fb0',
  orange: '#f0a860', orangeD: '#cd7f3a', orangeL: '#ffcb8f',
  brown: '#8a6247', brownD: '#5f4029',
  night: '#1b1733', nightL: '#2c2650'
};

/* ---------- painter：逻辑像素画笔 ---------- */
function mkPainter(ctx) {
  const P = (x, y, w, h, col) => {
    if (w <= 0 || h <= 0 || !col) return;
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  P.rect = P;
  P.circle = (cx, cy, r, col) => {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r + r * 0.6) P(cx + x, cy + y, 1, 1, col);
      }
    }
  };
  P.ellipse = (cx, cy, rx, ry, col) => {
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        const d = (x * x) / (rx * rx) + (y * y) / (ry * ry);
        if (d <= 1.05) P(cx + x, cy + y, 1, 1, col);
      }
    }
  };
  // 竖直色带（像素渐变）
  P.bands = (x, y, w, h, cols, dither) => {
    const n = cols.length;
    for (let i = 0; i < n; i++) {
      const yy = y + Math.floor((i * h) / n);
      const hh = Math.ceil(h / n);
      P(x, yy, w, hh, cols[i]);
      if (dither && i > 0) {
        for (let dx = 0; dx < w; dx++) {
          for (let dy = 0; dy < 2; dy++) {
            if ((dx + dy) % 2 === 0) P(x + dx, yy + dy, 1, 1, cols[i - 1]);
          }
        }
      }
    }
  };
  // 阶梯三角（用于沙丘/山）
  P.tri = (cx, baseY, halfW, hgt, col) => {
    for (let i = 0; i < hgt; i++) {
      const t = i / hgt;
      const w = Math.round(halfW * (1 - t)) * 2 + 1;
      P(cx - Math.floor(w / 2), baseY - i, w, 1, col);
    }
  };
  P.stairs = (x, y, w, h, col, dir) => {
    // 右上斜的阶梯块
    for (let i = 0; i < h; i++) {
      const ww = Math.round(w * (1 - i / h));
      P(dir === 'l' ? x : x + (w - ww), y + i, ww, 1, col);
    }
  };
  return P;
}

/* ============================================================
   场景绘制
   ============================================================ */
const SCENES = ['desert', 'star', 'sunrise', 'lake'];
const SCENE_NAME = { desert: '沙漠', star: '星空', sunrise: '日出', lake: '湖泊' };

function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function drawScene(p, name, seed) {
  const R = seededRand(seed || 7);
  const W = SCENE_W, H = SCENE_H;

  if (name === 'desert') {
    p.bands(0, 0, W, 42, ['#f9dda4', '#f5c67f', '#eda261', '#e08a58'], true);
    p.circle(74, 15, 8, '#ffe9a8');
    p.circle(74, 15, 6, '#fff6cf');
    // 远沙丘
    p.tri(20, 42, 26, 8, '#e5a163');
    p.tri(62, 42, 30, 10, '#dd9557');
    p.tri(92, 42, 18, 7, '#e8aa6b');
    // 地面
    p(0, 42, W, 6, '#e3a868');
    p(0, 46, W, 18, '#ebbb7f');
    p(0, 49, W, 15, '#dfa568');
    // 沙纹
    for (let i = 0; i < 26; i++) {
      const x = Math.floor(R() * W), y = 46 + Math.floor(R() * 16);
      p(x, y, 3 + Math.floor(R() * 4), 1, '#d59a5f');
    }
    // 仙人掌
    p(13, 36, 4, 12, '#4f8f5e');
    p(10, 40, 3, 2, '#4f8f5e'); p(10, 38, 2, 3, '#4f8f5e');
    p(17, 43, 3, 2, '#4f8f5e'); p(19, 40, 2, 4, '#4f8f5e');
    p(14, 36, 1, 12, '#63a873');
    // 石头
    p(80, 51, 6, 3, '#b9834e'); p(82, 49, 4, 2, '#c99361');
    p(30, 54, 4, 2, '#c98f57');
    // 干草
    p(46, 50, 1, 3, '#a97a45'); p(48, 49, 1, 4, '#a97a45');
  }

  if (name === 'star') {
    p.bands(0, 0, W, 46, ['#151333', '#1d1b45', '#262a5e', '#33306e'], true);
    // 星星
    for (let i = 0; i < 60; i++) {
      const x = Math.floor(R() * W), y = Math.floor(R() * 48);
      const s = R();
      if (s > 0.86) { p(x, y, 2, 2, '#fff6cf'); p(x - 1, y + 1, 4, 1, '#fff6cf'); p(x + 1, y - 1, 1, 4, '#fff6cf'); }
      else if (s > 0.5) p(x, y, 1, 1, '#e8e2ff');
      else p(x, y, 1, 1, '#9f97d6');
    }
    // 月亮
    p.circle(72, 13, 8, '#fff4c9');
    p.circle(76, 11, 7, '#1d1b45');
    // 流星
    p(20, 12, 1, 1, '#fff'); p(18, 14, 2, 1, '#cfc6ff'); p(16, 16, 3, 1, '#7d73b8');
    // 山
    p.tri(24, 52, 22, 18, '#211d43');
    p.tri(66, 52, 26, 22, '#272350');
    p.tri(48, 52, 14, 12, '#2e2a5c');
    p(0, 52, W, 12, '#1a1738');
    p(0, 55, W, 9, '#131029');
    // 湖面反光
    p(30, 57, 8, 1, '#3a3468'); p(52, 59, 12, 1, '#3a3468');
  }

  if (name === 'sunrise') {
    p.bands(0, 0, W, 44, ['#3b2a5e', '#6b4272', '#a8577a', '#d97476', '#f0a271', '#f8c98a'], true);
    // 太阳
    p.circle(48, 40, 11, '#ffe9a8');
    p.circle(48, 40, 8, '#fff8d4');
    // 云
    for (const [cx, cy, w] of [[16, 18, 16], [70, 12, 20], [40, 26, 12]]) {
      p(cx, cy, w, 3, '#c98aa8'); p(cx + 3, cy - 2, w - 8, 2, '#e0a3b4');
      p(cx, cy + 3, w, 1, '#a8708f');
    }
    // 山
    p.tri(18, 52, 24, 16, '#5a3a63');
    p.tri(58, 52, 30, 20, '#4a2f55');
    p.tri(88, 52, 16, 11, '#5a3a63');
    p(0, 50, W, 14, '#3a2646');
    p(0, 54, W, 10, '#2c1c36');
    // 草地
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(R() * W);
      p(x, 57 + Math.floor(R() * 5), 1, 2, '#4a3a5e');
    }
  }

  if (name === 'lake') {
    const HZ = 30;          // 地平线（远岸）
    const SHORE = 51;       // 近岸线基准

    /* --- 天空：上冷下暖，靠近地平线泛奶油色，与青色湖面形成冷暖分界 --- */
    p.bands(0, 0, W, HZ + 1, ['#78b4cc', '#a2d1d7', '#cfe6dc', '#f3efd8'], true);
    // 太阳（偏右，给湖面倒影留位置）
    p.circle(68, 10, 7, '#fff0bd');
    p.circle(68, 10, 5, '#fffdf2');
    // 薄云
    for (const [cx, cy, w] of [[14, 8, 16], [38, 15, 12], [82, 6, 9]]) {
      p(cx, cy, w, 2, '#f6f4e4'); p(cx + 2, cy - 1, w - 6, 1, '#fdfcf3');
      p(cx, cy + 2, w, 1, '#d5e3da');
    }

    /* --- 远山：后面一层更淡，靠前一层更实 --- */
    p.tri(16, HZ, 20, 15, '#a8c6cf');
    p.tri(76, HZ, 18, 12, '#b0ccd2');
    p.tri(44, HZ, 25, 20, '#84a8b7');
    p.tri(60, HZ, 12, 9, '#93b4c0');
    // 雪顶
    p.tri(44, HZ - 16, 4, 4, '#f2f7f4');
    p.tri(16, HZ - 11, 3, 3, '#eef5f2');

    /* --- 对岸松树剪影：这一层是「湖」而非「海」的关键标识 --- */
    p(0, HZ - 1, W, 2, '#3d6a56');
    for (let i = 0; i < 18; i++) {
      const x = Math.floor(R() * W), h = 3 + Math.floor(R() * 3);
      p.tri(x, HZ - 1, 2, h, i % 3 === 0 ? '#335c4a' : '#3d6a56');
    }
    // 远岸浅色水线（岸与水的分界）
    p(0, HZ + 1, W, 1, '#c8e0d8');

    /* --- 湖面：由远及近逐层加深，形成纵向纵深 --- */
    p(0, HZ + 2, W, 6, '#8fc6ca');
    p(0, HZ + 8, W, 5, '#77b3be');
    p(0, HZ + 13, W, 5, '#61a0b1');
    p(0, HZ + 18, W, 5, '#518c9f');
    p(0, HZ + 23, W, 4, '#457f93');

    /* --- 倒影：山影用断续横条，做出水面破碎感 --- */
    const refl = (cx, halfW, hgt, col) => {
      for (let i = 0; i < hgt; i++) {
        if (i % 2) continue;
        const t = i / hgt, w = Math.round(halfW * (1 - t)) * 2 + 1;
        p(cx - Math.floor(w / 2), HZ + 2 + i, w, 1, col);
      }
    };
    refl(44, 16, 16, '#6d97a8');
    refl(16, 12, 11, '#7ba4b0');
    refl(76, 11, 9, '#7ba4b0');
    // 太阳在水面的光柱（越近越宽、越散）
    const sunCol = [[3, '#ffe9ad'], [5, '#ffeec0'], [4, '#ffe0a0'], [7, '#ffe9b4'], [5, '#f6d393'], [9, '#efcb8c'], [6, '#e2bd83']];
    sunCol.forEach(([w, col], i) => {
      p(68 - Math.floor(w / 2) + (i % 2 ? 1 : 0), HZ + 2 + i * 3, w, 1, col);
    });

    /* --- 波纹：靠近远岸的细密，靠近近岸的疏而长 --- */
    for (let i = 0; i < 40; i++) {
      const t = R();
      const y = HZ + 3 + Math.floor(t * 19);
      const x = Math.floor(R() * W);
      const w = 2 + Math.floor(t * 5 + R() * 3);
      p(x, y, w, 1, i % 4 === 0 ? '#c3e6e4' : '#5d9aa8');
    }

    /* --- 右侧木栈桥（延伸出画外），湖岸的第二重识别信号 --- */
    p(80, 46, 16, 2, '#8a5f3c');
    p(80, 46, 16, 1, '#a2744c');
    p(83, 48, 2, 4, '#6b4830'); p(89, 48, 2, 4, '#6b4830'); p(95, 48, 1, 4, '#6b4830');
    p(80, 52, 16, 1, '#4d7f8d'); // 桥影

    /* --- 水面上的浮萍与睡莲 --- */
    p.ellipse(18, 45, 4, 1, '#4f8b62'); p(19, 45, 2, 1, '#5fa071');
    p.ellipse(27, 41, 3, 1, '#4f8b62');
    p(21, 43, 2, 1, '#5fa071');
    p.circle(24, 47, 1, '#f2a8c4'); // 睡莲花

    /* --- 岸边芦苇（左侧，避免挡住人物） --- */
    p(5, 42, 1, 10, '#3f6b59'); p(4, 44, 2, 1, '#4e7f6b'); p(6, 46, 2, 1, '#4e7f6b');
    p(11, 45, 1, 7, '#4e7f6b'); p(12, 47, 2, 1, '#5d8f6b');
    p(8, 40, 1, 3, '#8a7a4e'); // 芦花

    /* --- 近岸：沙岸 + 草坡，给人物一个真正的落脚点 --- */
    for (let x = 0; x < W; x++) {
      const wob = Math.round(Math.sin(x / 6.3) * 1.4 + Math.sin(x / 2.7) * 0.5);
      const s = SHORE + wob;
      p(x, s, 1, 64 - s, '#c9bd9c');           // 干沙
      p(x, s + 2, 1, 64 - s - 2, '#7ba76b');   // 草
      p(x, s + 5, 1, 64 - s - 5, '#6a9a5e');
      p(x, 60, 1, 4, '#5c8b53');               // 前缘压深
    }
    // 沙与草之间的湿痕
    p(0, SHORE + 1, W, 1, '#d8cdaa');
    // 草簇 / 碎石 / 小野花
    for (let i = 0; i < 22; i++) {
      const x = 2 + Math.floor(R() * (W - 4));
      const y = SHORE + 4 + Math.floor(R() * 10);
      if (i % 5 === 0) { p(x, y, 1, 1, '#f7f3e2'); p(x + 1, y + 1, 1, 1, '#f2df8a'); }
      else if (i % 3 === 0) p(x, y, 2, 1, '#8fbb7a');
      else { p(x, y, 1, 2, '#5b8a52'); p(x + 2, y + 1, 1, 2, '#5b8a52'); }
    }
    // 岸边碎石
    p(30, 56, 3, 1, '#b3ab90'); p(62, 58, 4, 1, '#a9a289'); p(14, 59, 2, 1, '#b3ab90');
  }
}

/* ============================================================
   角色绘制 —— 返回锚点信息供装饰定位
   ============================================================ */

function drawShadow(p, cx, y) {
  p.ellipse(cx, y, 9, 2, 'rgba(20,10,30,0.18)');
}

/* ---------- 小王子 ---------- */
function drawPrince(p, stage, ox, oy) {
  const tall = stage >= 3;
  const cx = ox + 16;
  const hy = oy + (tall ? 1 : 4);
  const headW = 16, headH = 14;
  const hx = cx - 8;
  const bodyTop = hy + headH - 2;
  const bodyW = tall ? 14 : 13;
  const bx = cx - Math.floor(bodyW / 2);
  const bodyH = tall ? 11 : 8;
  const legTop = bodyTop + bodyH;
  const feetY = oy + 31;

  // 披风（stage>=2）
  if (stage >= 2) {
    const capeCol = stage >= 4 ? '#7c3fa8' : C.red;
    const capeColD = stage >= 4 ? '#5b2b7d' : C.redD;
    const cw = stage >= 4 ? 5 : 4;
    p(bx - cw, bodyTop, cw, bodyH + (tall ? 8 : 5), capeColD);
    p(bx + bodyW, bodyTop, cw, bodyH + (tall ? 8 : 5), capeColD);
    p(bx - cw + 1, bodyTop, 1, bodyH + (tall ? 8 : 5), capeCol);
    p(bx + bodyW, bodyTop, 1, bodyH + (tall ? 8 : 5), capeCol);
  }

  // 腿
  p(cx - 4, legTop, 3, feetY - legTop - 2, '#2f3550');
  p(cx + 1, legTop, 3, feetY - legTop - 2, '#2f3550');
  // 靴子
  p(cx - 5, feetY - 3, 4, 3, C.brownD);
  p(cx + 1, feetY - 3, 4, 3, C.brownD);
  p(cx - 5, feetY - 3, 4, 1, C.brown);

  // 身体
  p(bx, bodyTop, bodyW, bodyH, C.mint);
  p(bx, bodyTop, bodyW, 2, C.mintL);
  p(bx + bodyW - 2, bodyTop, 2, bodyH, C.mintD);
  // 手臂
  p(bx - 2, bodyTop + 2, 2, bodyH - 2, C.mintD);
  p(bx + bodyW, bodyTop + 2, 2, bodyH - 2, C.mintD);
  p(bx - 2, bodyTop + bodyH - 1, 2, 2, C.skin);
  p(bx + bodyW, bodyTop + bodyH - 1, 2, 2, C.skin);
  // 门襟 + 扣子
  p(cx - 1, bodyTop + 2, 2, bodyH - 2, C.mintD);
  p(cx - 1, bodyTop + 3, 1, 1, C.gold);
  p(cx - 1, bodyTop + 6, 1, 1, C.gold);
  // 红领巾
  p(cx - 4, bodyTop - 1, 8, 2, C.red);
  p(cx - 2, bodyTop + 1, 4, 1, C.redD);
  // 肩章（stage>=3）
  if (stage >= 3) {
    p(bx - 1, bodyTop, 3, 2, C.gold);
    p(bx + bodyW - 2, bodyTop, 3, 2, C.gold);
  }

  // 头
  p(hx - 1, hy + 2, headW + 2, 11, C.gold);       // 后发
  p(hx + 1, hy, headW - 2, 4, C.gold);            // 顶发
  p(hx + 2, hy + 3, headW - 4, 10, C.skin);       // 脸
  p(hx + 1, hy + 3, headW - 2, 2, C.gold);        // 刘海
  p(hx + 4, hy + 5, 3, 1, C.gold);
  p(hx + 9, hy + 5, 3, 1, C.gold);
  p(hx, hy + 4, 2, 9, C.goldD);                   // 鬓角
  p(hx + headW - 2, hy + 4, 2, 9, C.goldD);
  // 五官
  p(cx - 4, hy + 7, 2, 2, C.ink);
  p(cx + 2, hy + 7, 2, 2, C.ink);
  p(cx - 4, hy + 7, 1, 1, C.white);
  p(cx + 2, hy + 7, 1, 1, C.white);
  p(cx - 6, hy + 9, 2, 1, '#f0a9a0');
  p(cx + 4, hy + 9, 2, 1, '#f0a9a0');
  p(cx - 1, hy + 10, 2, 1, C.redD);

  // 王冠
  if (stage >= 3) {
    p(cx - 6, hy - 2, 12, 2, C.gold);
    p(cx - 6, hy - 4, 2, 2, C.gold);
    p(cx - 1, hy - 5, 2, 3, C.gold);
    p(cx + 4, hy - 4, 2, 2, C.gold);
    p(cx - 1, hy - 2, 1, 1, C.red);
  }
  if (stage >= 5) {
    p(cx - 6, hy - 2, 12, 1, C.goldL);
    p(cx - 3, hy - 4, 1, 2, C.goldL);
    p(cx + 3, hy - 4, 1, 2, C.goldL);
  }
  // 光环（stage>=5）
  if (stage >= 5) {
    p(cx - 7, hy - 8, 14, 1, '#ffe89a');
    p(cx - 8, hy - 7, 1, 1, '#ffe89a');
    p(cx + 7, hy - 7, 1, 1, '#ffe89a');
  }

  return { cx, headTop: hy, headW, headH, bodyTop, bodyW: bodyW, bx, feetY, neckY: bodyTop - 2, stage };
}

/* ---------- 小公主 ---------- */
function drawPrincess(p, stage, ox, oy) {
  const tall = stage >= 3;
  const cx = ox + 16;
  const hy = oy + (tall ? 1 : 4);
  const headW = 15, headH = 14;
  const hx = cx - 7;
  const bodyTop = hy + headH - 2;
  const feetY = oy + 31;
  const dressTop = bodyTop + (tall ? 6 : 5);
  const skirtW = tall ? 22 : 18;

  // 长发（背后）
  p(hx - 2, hy + 2, headW + 4, tall ? 24 : 20, '#a5703f');
  p(hx - 3, hy + 6, 2, tall ? 20 : 16, '#8d5c33');
  p(hx + headW + 1, hy + 6, 2, tall ? 20 : 16, '#8d5c33');

  // 披风/薄纱（stage>=4）
  if (stage >= 4) {
    const col = stage >= 5 ? '#cfa8f0' : '#f7c6dd';
    p(cx - skirtW / 2 - 3, dressTop, 3, feetY - dressTop - 3, col);
    p(cx + skirtW / 2, dressTop, 3, feetY - dressTop - 3, col);
  }

  // 裙摆（阶梯三角）
  for (let i = 0; i < feetY - dressTop; i++) {
    const t = i / (feetY - dressTop);
    const w = Math.round(skirtW - (skirtW - 12) * (1 - t) * 0.55) + (i > 2 ? 2 : 0);
    const ww = Math.min(skirtW, 12 + Math.round(i * 0.9));
    p(cx - Math.floor(ww / 2), dressTop + i, ww, 1, i % 6 === 5 ? C.pinkD : C.pink);
  }
  p(cx - Math.floor(skirtW / 2) + 1, feetY - 2, skirtW - 2, 2, C.pinkD);

  // 腿 + 鞋
  p(cx - 3, feetY - 4, 2, 3, C.skin);
  p(cx + 1, feetY - 4, 2, 3, C.skin);
  p(cx - 3, feetY - 1, 3, 2, '#c96a8a');
  p(cx + 1, feetY - 1, 3, 2, '#c96a8a');

  // 上身
  p(cx - 6, bodyTop, 12, tall ? 7 : 6, '#fdf0f4');
  p(cx - 6, bodyTop, 12, 1, C.white);
  p(cx - 2, bodyTop + 1, 4, 2, C.pinkL);
  // 泡泡袖
  p(cx - 9, bodyTop, 3, 4, C.pinkL);
  p(cx + 6, bodyTop, 3, 4, C.pinkL);
  p(cx - 9, bodyTop + 4, 3, 2, C.skin);
  p(cx + 6, bodyTop + 4, 3, 2, C.skin);
  // 腰带
  p(cx - 6, dressTop - 2, 12, 2, stage >= 3 ? C.gold : C.pinkD);
  p(cx - 1, dressTop - 2, 2, 2, stage >= 3 ? C.red : C.gold);

  // 头
  p(hx, hy, headW, 5, '#a5703f');
  p(hx + 2, hy + 4, headW - 4, 9, C.skin);
  p(hx + 3, hy + 4, headW - 6, 2, '#a5703f');
  p(hx, hy + 4, 2, 8, '#a5703f');
  p(hx + headW - 2, hy + 4, 2, 8, '#a5703f');
  // 五官
  p(cx - 4, hy + 7, 2, 2, C.ink);
  p(cx + 2, hy + 7, 2, 2, C.ink);
  p(cx - 4, hy + 7, 1, 1, C.white);
  p(cx + 2, hy + 7, 1, 1, C.white);
  p(cx - 6, hy + 9, 2, 1, '#f7a8b8');
  p(cx + 4, hy + 9, 2, 1, '#f7a8b8');
  p(cx - 1, hy + 10, 2, 1, C.redD);
  // 蝴蝶结
  p(cx - 7, hy - 1, 3, 2, C.red);
  p(cx + 4, hy - 1, 3, 2, C.red);

  // 王冠
  if (stage >= 2) {
    p(cx - 6, hy - 3, 12, 2, C.gold);
    p(cx - 6, hy - 5, 2, 2, C.gold);
    p(cx - 1, hy - 6, 2, 3, C.gold);
    p(cx + 4, hy - 5, 2, 2, C.gold);
    p(cx - 1, hy - 4, 1, 1, C.pink);
  } else {
    p(cx - 4, hy - 2, 8, 1, C.gold);
  }
  if (stage >= 4) {
    p(cx - 8, hy - 4, 2, 1, C.goldL);
    p(cx + 6, hy - 4, 2, 1, C.goldL);
    p(cx - 1, hy - 7, 1, 1, C.goldL);
  }
  if (stage >= 5) {
    p(cx - 7, hy - 9, 14, 1, '#ffe89a');
    p(cx - 8, hy - 8, 1, 1, '#ffe89a');
    p(cx + 7, hy - 8, 1, 1, '#ffe89a');
  }

  return { cx, headTop: hy, headW, headH, bodyTop, bodyW: 12, bx: cx - 6, feetY, neckY: bodyTop - 1, stage };
}

/* ---------- 小猫咪 ---------- */
function drawCat(p, stage, ox, oy) {
  const big = stage >= 3;
  const cx = ox + 16;
  const headW = big ? 20 : 16;
  const headH = big ? 15 : 13;
  const hy = oy + (big ? 2 : 8);
  const hx = cx - Math.floor(headW / 2);
  const feetY = oy + 31;
  const bodyTop = hy + headH - 2;
  const bodyW = big ? 18 : 14;
  const bx = cx - Math.floor(bodyW / 2);
  const bodyH = feetY - bodyTop - 4;

  // 尾巴
  const tailCol = C.orange, tailD = C.orangeD;
  if (stage >= 2) {
    p(bx + bodyW, bodyTop + 3, 3, 3, tailCol);
    p(bx + bodyW + 2, bodyTop + 1, 2, 3, tailCol);
    p(bx + bodyW + 3, bodyTop - 2, 2, 4, tailCol);
    p(bx + bodyW + 3, bodyTop - 3, 2, 2, C.cream);
    if (stage >= 4) { p(bx + bodyW + 1, bodyTop + 5, 2, 3, tailD); }
  } else {
    p(bx + bodyW, bodyTop + 6, 3, 2, tailCol);
    p(bx + bodyW + 1, bodyTop + 4, 2, 3, tailCol);
  }

  // 身体
  p(bx, bodyTop, bodyW, bodyH, C.orange);
  p(bx, bodyTop, bodyW, 1, C.orangeL);
  p(bx + bodyW - 1, bodyTop, 1, bodyH, C.orangeD);
  // 胸口奶油色
  p(cx - 3, bodyTop + 2, 6, bodyH - 3, C.cream);
  // 前爪
  p(cx - 6, feetY - 3, 5, 3, C.cream);
  p(cx + 1, feetY - 3, 5, 3, C.cream);
  p(cx - 6, feetY - 1, 5, 1, '#e7d5b4');

  // 头
  p(hx + 1, hy + 2, headW - 2, headH - 1, C.orange);
  p(hx + 2, hy + 3, headW - 4, headH - 3, C.orange);
  // 耳朵
  p(hx, hy - 2, 5, 6, C.orange);
  p(hx + headW - 5, hy - 2, 5, 6, C.orange);
  p(hx + 1, hy - 1, 3, 4, C.pinkL);
  p(hx + headW - 4, hy - 1, 3, 4, C.pinkL);
  p(hx, hy - 3, 4, 2, C.orangeD);
  p(hx + headW - 4, hy - 3, 4, 2, C.orangeD);
  // 脸部浅色
  p(cx - 6, hy + 7, 12, 6, C.cream);
  // 眼睛
  if (stage === 5) {
    p(cx - 5, hy + 6, 2, 2, C.gold); p(cx + 3, hy + 6, 2, 2, C.gold);
    p(cx - 5, hy + 6, 1, 1, C.white); p(cx + 3, hy + 6, 1, 1, C.white);
  } else {
    p(cx - 5, hy + 6, 2, 3, C.ink); p(cx + 3, hy + 6, 2, 3, C.ink);
    p(cx - 5, hy + 6, 1, 1, C.white); p(cx + 3, hy + 6, 1, 1, C.white);
  }
  // 鼻子 + 嘴
  p(cx - 1, hy + 9, 2, 1, C.pinkD);
  p(cx - 1, hy + 10, 1, 1, C.orangeD);
  p(cx + 1, hy + 10, 1, 1, C.orangeD);
  // 胡须
  p(cx - 9, hy + 9, 3, 1, '#c98f5c');
  p(cx - 9, hy + 11, 3, 1, '#c98f5c');
  p(cx + 6, hy + 9, 3, 1, '#c98f5c');
  p(cx + 6, hy + 11, 3, 1, '#c98f5c');
  // 腮红
  p(cx - 7, hy + 9, 2, 1, '#f7b2a0');
  p(cx + 5, hy + 9, 2, 1, '#f7b2a0');

  // 项圈
  const collarCol = stage >= 4 ? C.gold : C.red;
  p(cx - 6, bodyTop - 1, 12, 2, collarCol);
  p(cx - 1, bodyTop + 1, 2, 2, C.goldL);
  if (stage >= 3) { p(cx - 8, bodyTop - 1, 2, 2, C.goldL); p(cx + 6, bodyTop - 1, 2, 2, C.goldL); }

  // 王冠（stage>=4）/ 光环（stage 5）
  if (stage >= 4) {
    p(cx - 5, hy - 6, 10, 2, C.gold);
    p(cx - 5, hy - 8, 2, 2, C.gold);
    p(cx - 1, hy - 9, 2, 3, C.gold);
    p(cx + 3, hy - 8, 2, 2, C.gold);
    p(cx - 1, hy - 7, 1, 1, C.pink);
  }
  if (stage >= 5) {
    p(cx - 7, hy - 12, 14, 1, '#ffe89a');
    p(cx - 8, hy - 11, 1, 1, '#ffe89a');
    p(cx + 7, hy - 11, 1, 1, '#ffe89a');
    p(cx - 10, hy + 4, 1, 1, '#fff6cf'); p(cx + 10, hy + 2, 1, 1, '#fff6cf');
  }

  return { cx, headTop: hy, headW, headH, bodyTop, bodyW, bx, feetY, neckY: bodyTop - 1, stage, cat: true };
}

const CHARS = {
  prince: { name: '小王子', sub: '温柔坚定的星际旅人', draw: drawPrince, accent: '#4fb286' },
  princess: { name: '小公主', sub: '骄傲又心软的玫瑰公主', draw: drawPrincess, accent: '#f59ab8' },
  cat: { name: '小猫咪', sub: '好奇又贪吃的小家伙', draw: drawCat, accent: '#f0a860' }
};

/* ============================================================
   装饰物
   ============================================================ */
const DECOR = [
  { id: 'sunglasses', name: '酷墨镜', slot: 'face', icon: '🕶', draw(p, m) {
      const y = m.headTop + 7, x = m.cx - 7;
      p(x, y, 14, 3, '#20202c');
      p(x, y, 5, 3, '#33334a'); p(x + 9, y, 5, 3, '#33334a');
      p(x + 5, y + 1, 4, 1, '#20202c');
      p(x + 1, y + 1, 1, 1, '#8fd0ff'); p(x + 10, y + 1, 1, 1, '#8fd0ff');
    } },
  { id: 'flower', name: '小花发饰', slot: 'head', icon: '🌸', draw(p, m) {
      const x = m.cx + 5, y = m.headTop + 1;
      p(x, y, 2, 2, '#f7a8c4'); p(x - 2, y + 1, 2, 2, '#f7a8c4');
      p(x + 2, y + 1, 2, 2, '#f7a8c4'); p(x, y + 3, 2, 2, '#f7a8c4');
      p(x + 1, y + 2, 1, 1, '#fff3b0');
    } },
  { id: 'cane', name: '金色手杖', slot: 'hand', icon: '🪄', draw(p, m) {
      const x = m.bx + m.bodyW + 3, y = m.bodyTop + 1;
      p(x, y + 3, 2, m.feetY - y - 3, '#c9a24a');
      p(x, y + 2, 4, 2, '#f7c948');
      p(x + 1, y + 1, 2, 1, '#ffe89a');
    } },
  { id: 'crown', name: '迷你王冠', slot: 'head', icon: '👑', draw(p, m) {
      const y = m.headTop - 4;
      p(m.cx - 6, y, 12, 2, C.gold);
      p(m.cx - 6, y - 2, 2, 2, C.gold); p(m.cx - 1, y - 3, 2, 3, C.gold); p(m.cx + 4, y - 2, 2, 2, C.gold);
      p(m.cx - 1, y + 1, 1, 1, '#e0574d');
    } },
  { id: 'bow', name: '蝴蝶结', slot: 'head', icon: '🎀', draw(p, m) {
      const x = m.cx - 8, y = m.headTop + 1;
      p(x - 2, y, 3, 3, '#e0574d'); p(x + 2, y, 3, 3, '#e0574d');
      p(x, y + 1, 2, 2, '#ab3a33');
      p(x - 2, y + 3, 2, 3, '#ab3a33'); p(x + 2, y + 3, 2, 3, '#ab3a33');
    } },
  { id: 'scarf', name: '针织围巾', slot: 'neck', icon: '🧣', draw(p, m) {
      const y = m.bodyTop - 2;
      p(m.cx - 7, y, 14, 3, '#7c9fd9');
      p(m.cx - 7, y + 2, 14, 1, '#5b7fb8');
      p(m.cx + 3, y + 3, 3, 6, '#7c9fd9');
      p(m.cx + 3, y + 6, 3, 1, '#5b7fb8');
      p(m.cx + 3, y + 9, 3, 1, '#5b7fb8');
    } },
  { id: 'wings', name: '天使小翅膀', slot: 'back', icon: '🪽', draw(p, m) {
      const y = m.bodyTop + 1;
      p(m.bx - 8, y, 4, 5, '#fff8ec'); p(m.bx - 11, y + 2, 4, 5, '#f0e4d0');
      p(m.bx + m.bodyW + 4, y, 4, 5, '#fff8ec'); p(m.bx + m.bodyW + 7, y + 2, 4, 5, '#f0e4d0');
    } },
  { id: 'halo', name: '光环', slot: 'head', icon: '😇', draw(p, m) {
      const y = m.headTop - 7;
      p(m.cx - 7, y, 14, 1, '#ffe89a');
      p(m.cx - 8, y + 1, 1, 1, '#ffe89a'); p(m.cx + 7, y + 1, 1, 1, '#ffe89a');
      p(m.cx - 7, y - 1, 14, 1, 'rgba(255,232,154,0.35)');
    } },
  { id: 'star', name: '星星胸针', slot: 'body', icon: '⭐', draw(p, m) {
      const x = m.cx - 5, y = m.bodyTop + 3;
      p(x, y, 3, 1, '#ffe89a'); p(x + 1, y - 1, 1, 3, '#ffe89a');
    } },
  { id: 'bell', name: '铃铛项圈', slot: 'neck', icon: '🔔', draw(p, m) {
      const y = m.bodyTop - 1;
      p(m.cx - 6, y, 12, 2, '#c0453f');
      p(m.cx - 1, y + 2, 3, 2, '#f7c948');
      p(m.cx, y + 3, 1, 1, '#a8821f');
    } },
  { id: 'glasses2', name: '圆框眼镜', slot: 'face', icon: '👓', draw(p, m) {
      const y = m.headTop + 6;
      p(m.cx - 7, y, 5, 1, '#4a3a5e'); p(m.cx - 7, y + 3, 5, 1, '#4a3a5e');
      p(m.cx - 7, y, 1, 4, '#4a3a5e'); p(m.cx - 3, y, 1, 4, '#4a3a5e');
      p(m.cx + 2, y, 5, 1, '#4a3a5e'); p(m.cx + 2, y + 3, 5, 1, '#4a3a5e');
      p(m.cx + 2, y, 1, 4, '#4a3a5e'); p(m.cx + 6, y, 1, 4, '#4a3a5e');
      p(m.cx - 2, y + 1, 4, 1, '#4a3a5e');
    } },
  { id: 'cape', name: '星空披风', slot: 'back', icon: '🌌', draw(p, m) {
      const col = '#3a2f72', col2 = '#54439c';
      p(m.bx - 5, m.bodyTop, 5, m.feetY - m.bodyTop - 3, col);
      p(m.bx + m.bodyW, m.bodyTop, 5, m.feetY - m.bodyTop - 3, col);
      p(m.bx - 4, m.bodyTop + 2, 2, 3, col2);
      p(m.bx + m.bodyW + 1, m.bodyTop + 5, 2, 3, col2);
      p(m.bx - 3, m.bodyTop + 8, 1, 1, '#ffe89a');
      p(m.bx + m.bodyW + 2, m.bodyTop + 11, 1, 1, '#ffe89a');
    } }
];
const DECOR_MAP = Object.fromEntries(DECOR.map(d => [d.id, d]));

/* ============================================================
   食物
   ============================================================ */
const FOODS = [
  { id: 'pudding', name: '焦糖布丁', draw(p, x, y) {
      p(x, y + 2, 7, 4, '#f7c948'); p(x + 1, y + 1, 5, 1, '#fff3c4'); p(x, y + 1, 7, 1, '#c98f3a');
      p(x + 1, y, 5, 1, '#fff8e0');
    } },
  { id: 'donut', name: '草莓甜甜圈', draw(p, x, y) {
      p.circle(x + 3, y + 3, 3, '#e8b47a'); p.circle(x + 3, y + 3, 1, null);
      p(x + 1, y, 5, 1, '#f59ab8'); p(x, y + 1, 7, 1, '#f59ab8'); p(x, y + 2, 2, 1, '#f59ab8');
      p(x + 5, y + 2, 2, 1, '#f59ab8'); p(x + 1, y + 5, 5, 1, '#f59ab8');
      p(x + 2, y + 1, 1, 1, '#fff3b0'); p(x + 4, y + 4, 1, 1, '#7fdaad');
    } },
  { id: 'cake', name: '草莓蛋糕', draw(p, x, y) {
      p(x, y + 2, 8, 3, '#fff0f5'); p(x, y + 2, 8, 1, '#f59ab8');
      p(x, y + 5, 8, 1, '#e8d0b8');
      p(x + 3, y, 2, 2, '#e0574d'); p(x + 3, y - 1, 1, 1, '#4fb286');
    } },
  { id: 'dango', name: '三色团子', draw(p, x, y) {
      p(x + 2, y + 1, 3, 2, '#fff6e0'); p(x + 2, y + 3, 3, 2, '#f7a8c4'); p(x + 2, y + 5, 3, 2, '#a8d8a0');
      p(x + 3, y, 1, 1, '#8a6247');
    } },
  { id: 'cocoa', name: '热可可', draw(p, x, y) {
      p(x, y + 2, 7, 5, '#fff8ec'); p(x + 1, y + 3, 5, 3, '#8a5a3a');
      p(x + 1, y + 1, 5, 1, '#fff8ec');
      p(x + 2, y + 3, 3, 1, '#fff8ec');
      p(x + 8, y + 3, 1, 3, '#fff8ec'); p(x + 8, y + 2, 1, 1, '#fff8ec');
      p(x + 2, y, 1, 1, '#e8d8c8'); p(x + 4, y - 1, 1, 1, '#e8d8c8');
    } },
  { id: 'onigiri', name: '饭团', draw(p, x, y) {
      p(x + 2, y, 4, 1, '#fff8ec'); p(x + 1, y + 1, 6, 5, '#fff8ec'); p(x, y + 5, 8, 1, '#fff8ec');
      p(x + 2, y + 2, 4, 3, '#2b2138'); p(x + 3, y + 3, 2, 1, '#e0574d');
    } },
  { id: 'sushi', name: '寿司', draw(p, x, y) {
      p(x, y + 3, 8, 3, '#fff8ec'); p(x, y + 2, 8, 1, '#f0e0c8');
      p(x, y, 8, 2, '#f59ab8'); p(x + 1, y + 1, 6, 1, '#f7c1d2');
      p(x, y, 1, 3, '#2b2138');
    } },
  { id: 'cookie', name: '小饼干', draw(p, x, y) {
      p.circle(x + 4, y + 3, 4, '#d9a05e'); p.circle(x + 4, y + 3, 3, '#e8b47a');
      p(x + 2, y + 2, 1, 1, '#5f4029'); p(x + 5, y + 3, 1, 1, '#5f4029'); p(x + 4, y + 5, 1, 1, '#5f4029');
    } }
];
const FOOD_MAP = Object.fromEntries(FOODS.map(f => [f.id, f]));

/* ============================================================
   习惯小形象
   ============================================================ */
const ICONS = ['star', 'moon', 'drop', 'flame', 'leaf', 'heart'];
function drawIcon(p, id, ox, oy, col) {
  const c = col || '#ffd76e';
  if (id === 'star') {
    p(ox + 3, oy, 2, 2, c); p(ox + 1, oy + 2, 6, 2, c);
    p(ox, oy + 4, 8, 1, c); p(ox + 1, oy + 5, 2, 2, c); p(ox + 5, oy + 5, 2, 2, c);
  } else if (id === 'moon') {
    p(ox + 2, oy, 4, 1, c);
    p(ox + 1, oy + 1, 3, 2, c);
    p(ox + 1, oy + 3, 2, 3, c);
    p(ox + 2, oy + 6, 4, 1, c);
    p(ox + 2, oy + 2, 1, 1, '#fff8ec');
  } else if (id === 'drop') {
    p(ox + 3, oy, 2, 2, c); p(ox + 2, oy + 2, 4, 2, c); p(ox + 1, oy + 4, 6, 2, c);
    p(ox + 2, oy + 5, 2, 1, 'rgba(255,255,255,.55)');
  } else if (id === 'flame') {
    p(ox + 3, oy, 2, 2, c); p(ox + 2, oy + 2, 4, 3, c); p(ox + 1, oy + 4, 6, 3, c);
    p(ox + 3, oy + 4, 2, 3, '#fff3c4');
  } else if (id === 'leaf') {
    p(ox + 2, oy + 1, 4, 4, c); p(ox + 1, oy + 2, 2, 3, c); p(ox + 5, oy + 2, 2, 2, c);
    p(ox + 2, oy + 5, 1, 2, '#8a6247');
  } else {
    p(ox + 1, oy + 1, 2, 3, c); p(ox + 5, oy + 1, 2, 3, c);
    p(ox + 1, oy + 3, 6, 2, c); p(ox + 2, oy + 5, 4, 1, c); p(ox + 3, oy + 6, 2, 1, c);
  }
}
const ICON_COLOR = { star: '#ffd76e', moon: '#c9c2ff', drop: '#8fd0ff', flame: '#ff9a6a', leaf: '#8fe0a0', heart: '#ff9ab5' };
const ICON_NAME = { star: '星星', moon: '月亮', drop: '水滴', flame: '火苗', leaf: '叶子', heart: '爱心' };
