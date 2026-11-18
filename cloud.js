/* ============================================================
   Habit Quest — 云端账号 + 进度同步
   依赖：@tencent-ai/workbuddy-cloud-sdk（CDN，全局 WorkBuddyCloud）
   ============================================================ */

/* publicConfig：来自云服务开通结果，可随前端一同发布 */
const CLOUD_CFG = {
  endpoint: 'https://habit-quest-29235.app.workbuddy.host',
  oauthRelayBaseUrl: 'https://www.workbuddy.cn/v2/as/genie-baas/oauth',
  publishableKey: 'wbpk_BXyfHvSnfuIIu3FoXCK0iT_c793d0TTqLfu7BPocRjhG3FvN9eSzyPb'
};

const SYNC_TABLE = 'game_states';
const STATE_VER = 3;

const Cloud = (() => {
  let client = null;
  let session = null;
  let onReady = null;

  let pushTimer = null;
  let pushing = false;
  let dirtyAgain = false;
  let lastError = null;

  let mode = 'email';               // email（手机短信已下线）
  let pending = null;               // { target, verificationId, isExistingUser }
  let coolTimer = null;
  let coolLeft = 0;
  let busy = false;

  const G = (id) => document.getElementById(id);

  /* ---------------- 同步状态 ---------------- */
  function setSync(kind, text) {
    const dot = G('syncDot');
    if (dot) dot.className = 'sync-dot' + (kind ? ' ' + kind : '');
    const t = G('syncText');
    if (t) t.textContent = text;
  }

  function gateErr(msg) {
    const el = G('gateErr');
    if (el) el.textContent = msg || '';
  }

  function acctRender() {
    const el = G('acctText');
    if (!el) return;
    if (!session) { el.textContent = '未登录'; return; }
    const who = session.user && (session.user.name || session.user.email || session.user.phone);
    el.innerHTML = '已登录' + (who ? ' · <b>' + escapeWho(who) + '</b>' : '') + ' · 进度已云端保存';
  }
  const escapeWho = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

  /* ---------------- 门 ---------------- */
  function drawGateHero() {
    const cv = G('gateCanvas');
    if (!cv || typeof drawScene !== 'function' || typeof CHARS === 'undefined') return;
    const p = mkPainter(cv.getContext('2d'));
    drawScene(p, 'sunrise', 47);
    [[6, 'prince'], [34, 'princess'], [62, 'cat']].forEach(([ox, k]) => {
      p.ellipse(ox + 16, 57, 9, 2, 'rgba(20,10,30,0.18)');
      CHARS[k].draw(p, 1, ox, 26);
    });
  }

  function gateShow(view) {
    const gate = G('gate');
    if (gate) gate.classList.add('show');
    const loading = G('gateLoading');
    const form = G('gateForm');
    if (loading) loading.hidden = view !== 'loading';
    if (form) form.hidden = view !== 'form';
  }

  function gateHide() {
    const gate = G('gate');
    if (gate) gate.classList.remove('show');
  }

  function setLoadingText(txt) {
    const el = G('gateLoading');
    if (el) el.querySelector('span').textContent = txt;
  }

  /* ---------------- 初始化 ---------------- */
  async function init() {
    if (!window.WorkBuddyCloud || !window.WorkBuddyCloud.createWorkBuddyCloud) return false;
    client = window.WorkBuddyCloud.createWorkBuddyCloud({
      endpoint: CLOUD_CFG.endpoint,
      oauthRelayBaseUrl: CLOUD_CFG.oauthRelayBaseUrl,
      publishableKey: CLOUD_CFG.publishableKey
    });
    return true;
  }

  async function getSession() {
    const { data, error } = await client.auth.getSession();
    if (error) return null;
    return data || null;
  }

  /* ---------------- 云端读写 ---------------- */
  async function pull() {
    const { data, error } = await client.database.from(SYNC_TABLE).select('state, updated_at').maybeSingle();
    if (error) throw error;
    return data && data.state ? data.state : null;
  }

  async function pushNow() {
    if (!session || !client) return;
    pushing = true;
    setSync('ing', '同步中');
    try {
      const state = onReady && onReady.getState ? onReady.getState() : null;
      if (!state) { pushing = false; return; }
      const payload = { state, schema_version: STATE_VER, updated_at: new Date().toISOString() };
      const { error } = await client.database.from(SYNC_TABLE).upsert(payload, { onConflict: 'owner_id' });
      if (error) throw error;
      lastError = null;
      setSync('ok', '已同步');
    } catch (e) {
      lastError = e;
      setSync('bad', '同步失败');
      console.warn('[cloud] push failed:', e && (e.message || e));
    } finally {
      pushing = false;
      if (dirtyAgain) { dirtyAgain = false; pushNow(); }
    }
  }

  function queuePush() {
    if (!session) return;
    setSync('ing', '同步中');
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      pushTimer = null;
      if (pushing) { dirtyAgain = true; return; }
      pushNow();
    }, 900);
  }

  async function pushNowWait() {
    if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; }
    await pushNow();
  }

  async function clearRemote() {
    if (!client || !session) return;
    const { error } = await client.database.from(SYNC_TABLE).delete();
    if (error) throw error;
  }

  /* ---------------- 登录交互 ---------------- */
  function setTab(next) {
    mode = next;
    const tp = G('tabPhone'), te = G('tabEmail');
    if (tp) tp.classList.toggle('on', mode === 'phone');
    if (te) te.classList.toggle('on', mode === 'email');
    const inp = G('gateId');
    if (inp) {
      inp.value = '';
      inp.placeholder = mode === 'phone' ? '请输入 11 位手机号' : '请输入邮箱地址';
      inp.maxLength = mode === 'phone' ? 11 : 60;
      inp.inputMode = mode === 'phone' ? 'numeric' : 'email';
      inp.autocomplete = mode === 'phone' ? 'tel' : 'email';
    }
    const code = G('gateCode');
    if (code) code.value = '';
    pending = null;
    gateErr('');
    resetCool();
  }

  function resetCool() {
    coolLeft = 0;
    if (coolTimer) { clearInterval(coolTimer); coolTimer = null; }
    const btn = G('gateSend');
    if (btn) { btn.disabled = false; btn.textContent = '获取验证码'; }
  }

  function startCool(sec) {
    coolLeft = sec;
    const btn = G('gateSend');
    if (!btn) return;
    btn.disabled = true;
    btn.textContent = coolLeft + ' 秒';
    if (coolTimer) clearInterval(coolTimer);
    coolTimer = setInterval(() => {
      coolLeft -= 1;
      if (coolLeft <= 0) { resetCool(); return; }
      btn.textContent = coolLeft + ' 秒';
    }, 1000);
  }

  function readTarget() {
    const inp = G('gateId');
    const v = inp ? inp.value.trim() : '';
    if (mode === 'phone') {
      if (!/^1\d{10}$/.test(v)) { gateErr('请输入正确的 11 位手机号'); return null; }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { gateErr('请输入正确的邮箱地址'); return null; }
    }
    gateErr('');
    return v;
  }

  async function sendCode() {
    if (busy || !client) return;
    const target = readTarget();
    if (!target) return;
    busy = true;
    const btn = G('gateSend');
    if (btn) btn.disabled = true;
    gateErr('');
    try {
      const sent = mode === 'phone'
        ? await client.auth.sendOtp({ phone: target })
        : await client.auth.sendOtp({ email: target });
      if (sent.error) { gateErr(prettyErr(sent.error)); return; }
      const d = sent.data || {};
      pending = { target, verificationId: d.verificationId, isExistingUser: !!d.isExistingUser };
      startCool(60);
      const tip = G('gateTip');
      if (tip) tip.innerHTML = '验证码已发送，请查看' + (mode === 'phone' ? '短信' : '邮箱') + '。<br>没收到可以等 60 秒后重发。';
    } catch (e) {
      gateErr(prettyErr(e));
    } finally {
      busy = false;
      const b = G('gateSend');
      if (b && coolLeft <= 0) b.disabled = false;
    }
  }

  async function submitCode() {
    if (busy || !client) return;
    const target = readTarget();
    if (!target) return;
    const codeEl = G('gateCode');
    const token = codeEl ? codeEl.value.trim() : '';
    if (!pending || pending.target !== target) { gateErr('请先获取验证码'); return; }
    if (!/^\d{4,8}$/.test(token)) { gateErr('请输入收到的验证码'); return; }
    busy = true;
    const btn = G('gateSubmit');
    if (btn) { btn.disabled = true; btn.textContent = '登录中…'; }
    gateErr('');
    try {
      const args = {
        verificationId: pending.verificationId,
        isExistingUser: pending.isExistingUser,
        token
      };
      if (mode === 'phone') args.phone = pending.target; else args.email = pending.target;
      const done = await client.auth.verifyOtp(args);
      if (done.error) { gateErr(prettyErr(done.error)); return; }
      pending = null;
      resetCool();
      const s = await getSession();
      if (!s) { gateErr('登录状态获取失败，请再试一次'); return; }
      session = s;
      acctRender();
      await startGame();
    } catch (e) {
      gateErr(prettyErr(e));
    } finally {
      busy = false;
      const b = G('gateSubmit');
      if (b) { b.disabled = false; b.textContent = '登录 / 注册'; }
    }
  }

  function prettyErr(e) {
    const raw = (e && (e.message || e.msg)) || '';
    const status = e && e.status;
    // 短信通道：单手机号每日/每分钟条数上限
    if (/PhoneNumberDailyLimit|single mobile number every day/i.test(raw))
      return '这个手机号今天的验证码已发满（短信有单号每日条数上限），请明天再试，或直接用微信 / 邮箱登录。';
    if (/LimitExceeded|exceeds the upper limit|DailyLimit/i.test(raw))
      return '验证码发送次数已达上限，请明天再试，或改用微信 / 邮箱登录。';
    if (/FrequencyLimit|too frequent|TooManyRequests|too many requests/i.test(raw))
      return '发送太频繁了，请等 1 分钟后再试。';
    if (/PhoneNumber.*regex|invalid.*PhoneNumber|invalid_argument/i.test(raw))
      return '手机号格式不对，请检查后重试。';
    if (/SmsSignature|signature|template.*not approved|not approved/i.test(raw))
      return '短信签名或模板未通过审核，暂时发不出去。请先用微信 / 邮箱登录。';
    if (/未开启|not enabled/i.test(raw)) return raw + '（管理员可在云服务面板开启该登录方式）';
    if (/network|fetch|failed to fetch|timeout/i.test(raw)) return '网络不太稳定，请稍后重试';
    if (status === 0 && !raw) return '操作失败，请重试';
    return raw || '操作失败，请重试';
  }

  /* ---------------- 第三方登录（微信 / WorkBuddy） ---------------- */
  const CALLBACK_KEYS = ['code', 'state', 'provider', 'provider_id', 'error', 'error_description'];

  function hasCallback() {
    const u = new URL(location.href);
    return u.searchParams.has('code') || u.searchParams.has('error');
  }

  function clearCallbackParams() {
    const u = new URL(location.href);
    let dirty = false;
    CALLBACK_KEYS.forEach((k) => {
      if (u.searchParams.has(k)) { u.searchParams.delete(k); dirty = true; }
    });
    if (!dirty) return;
    history.replaceState(null, '', u.pathname + u.search + u.hash);
  }

  function oauthRedirectTarget() {
    const back = new URL(location.href);
    back.pathname = '/';
    CALLBACK_KEYS.forEach((k) => back.searchParams.delete(k));
    return back.toString();
  }

  const PROVIDER_LABEL = { wechat: '微信', workbuddy: 'WorkBuddy' };

  async function handleOAuthCallback() {
    const u = new URL(location.href);
    const provider = u.searchParams.get('provider');
    gateShow('loading');
    if (!provider || !PROVIDER_LABEL[provider]) {
      clearCallbackParams();
      setLoadingText('登录信息不完整');
      gateShow('form');
      gateErr('授权回调缺少有效的登录方式，请重新登录。');
      return;
    }
    setLoadingText('正在完成' + PROVIDER_LABEL[provider] + '登录…');
    const fn = provider === 'wechat' ? client.auth.handleWechatWebCallback : client.auth.handleWorkBuddyCallback;
    if (typeof fn !== 'function') {
      clearCallbackParams();
      gateShow('form');
      gateErr('当前云端组件版本不支持该登录方式，请刷新页面后重试。');
      return;
    }
    let s = null;
    try {
      const res = await fn.call(client.auth);
      if (res && res.error) {
        clearCallbackParams();
        gateShow('form');
        gateErr(prettyErr(res.error));
        return;
      }
      s = res && res.data ? res.data : null;
    } catch (e) {
      clearCallbackParams();
      gateShow('form');
      gateErr(prettyErr(e));
      return;
    }
    clearCallbackParams();
    if (!s) { gateShow('form'); return; }
    session = s;
    acctRender();
    await startGame();
  }

  async function oauth(provider) {
    if (busy || !client) return;
    if (!PROVIDER_LABEL[provider]) return;
    busy = true;
    gateErr('');
    const btn = G(provider === 'wechat' ? 'btnWechat' : 'btnWorkbuddy');
    const label = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = '跳转中…'; }
    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        redirectTo: oauthRedirectTarget()
      });
      if (error) { gateErr(prettyErr(error)); return; }
      if (!data || !data.url) { gateErr('无法发起登录，请稍后再试'); return; }
      location.assign(data.url);
      return;
    } catch (e) {
      gateErr(prettyErr(e));
    } finally {
      busy = false;
      if (btn) { btn.disabled = false; btn.innerHTML = label; }
    }
  }

  /* ---------------- 启动 ---------------- */
  async function startGame() {
    gateShow('loading');
    setLoadingText('正在读取你的存档…');
    let state = null;
    try {
      state = await pull();
    } catch (e) {
      setLoadingText('存档读取失败');
      gateErr('无法读取云端存档：' + prettyErr(e));
      const btn = G('gateReload');
      if (btn) btn.hidden = false;
      return;
    }
    gateHide();
    setSync('ok', '已同步');
    if (onReady && onReady.enter) onReady.enter(state);
  }

  async function boot(handlers) {
    onReady = handlers || {};
    drawGateHero();
    gateShow('loading');
    setLoadingText('正在连接云端…');

    const ok = await init();
    if (!ok) {
      setLoadingText('云端组件加载失败');
      gateErr('网络异常，无法加载登录组件。请检查网络后刷新页面。');
      return;
    }
    // 授权回调必须先于任何登录门判断处理：code 是一次性的
    if (hasCallback()) {
      await handleOAuthCallback();
      return;
    }
    let s = null;
    try { s = await getSession(); } catch (e) { s = null; }
    if (!s) {
      session = null;
      gateShow('form');
      gateErr('');
      return;
    }
    session = s;
    acctRender();
    await startGame();
  }

  async function signOut() {
    try { await pushNowWait(); } catch (e) { }
    try { if (client) await client.auth.signOut(); } catch (e) { }
    session = null;
  }

  function isSignedIn() { return !!session; }

  return {
    boot, signOut, isSignedIn, queuePush, pushNowWait, clearRemote,
    setTab, sendCode, submitCode, oauth, acctRender, setSync,
    get current() { return session; },
    get mode() { return mode; }
  };
})();

/* ---------------- 门上的事件绑定 ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  const send = document.getElementById('gateSend');
  const sub = document.getElementById('gateSubmit');
  const idEl = document.getElementById('gateId');
  if (send) send.onclick = () => Cloud.sendCode();
  if (sub) sub.onclick = () => Cloud.submitCode();
  if (idEl) idEl.addEventListener('input', () => {
    const err = document.getElementById('gateErr');
    if (err) err.textContent = '';
  });
  const reload = document.getElementById('gateReload');
  if (reload) reload.onclick = () => location.reload();
  const wx = document.getElementById('btnWechat');
  const wb = document.getElementById('btnWorkbuddy');
  if (wx) wx.onclick = () => Cloud.oauth('wechat');
  if (wb) wb.onclick = () => Cloud.oauth('workbuddy');
});
