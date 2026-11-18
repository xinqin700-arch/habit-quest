/* ============================================================
   Habit Quest — i18n（中文为源语言，英文词典以中文原文为 key）
   设计：源码里直接写中文，凡是要显示的地方包一层 t()。
        EN 词典命中就出英文，未命中回退中文，永不会显示空白。
        好处：存档里已存的卡片标题 / 奖励文本不用迁移，切语言会自动跟着变。
   ============================================================ */

const I18N_STORE = 'habitQuest.lang';

const EN = {
  /* ---------- 品牌 / HUD ---------- */
  '习惯星球': 'HABIT PLANET',
  '习惯星球 · Habit Quest': 'Habit Quest · Gamified habit builder',
  '云端同步状态': 'Cloud sync status',
  '已同步': 'Synced',
  '同步中': 'Syncing',
  '同步失败': 'Sync failed',
  '音效开关': 'Sound on / off',
  '设置': 'Settings',

  /* ---------- 面板标题 ---------- */
  '活力': 'Vitality',
  '经验': 'EXP',
  '21 天轨迹': '21-Day Track',
  '成就卡片': 'Achievement Cards',
  '已收集': 'Collected',
  '今日微习惯': "Today's Habits",
  '奖励掉落': 'Reward Drops',
  '完成任务随机掉一条': 'A reward drops per completed task',
  '衣柜 & 零食': 'Wardrobe & Snacks',
  '像素风 21 天习惯养成 · 进度自动保存到你的账号':
    'Pixel-art habit quest · progress saved to your account',
  '勋章': 'Medal',

  /* ---------- 登录门 ---------- */
  '游戏化习惯养成': 'Gamified Habit Builder',
  '21 天 · 养大一只你自己': '21 days · raise a little you',
  '正在读取你的存档…': 'Loading your save…',
  '邮箱验证码登录': 'Sign in with an email code',
  '请输入邮箱地址': 'Enter your email address',
  '获取验证码': 'Send code',
  '输入 6 位验证码': 'Enter the 6-digit code',
  '登录 / 注册': 'Sign in / Sign up',
  '或用以下方式': 'or continue with',
  '微信登录': 'WeChat',
  '推荐': 'Recommended',
  '使用 WorkBuddy 登录': 'Continue with WorkBuddy',
  '重新读取存档': 'Reload save',
  '第一次来会直接创建账号，不用设密码。<br>登录后进度存在云端 —— <b>换手机、换电脑都能接着养</b>。<br>不想收邮件？直接点下面的<b>微信登录</b>，扫一下就行。':
    'First visit? An account is created for you — no password needed.<br>Progress lives in the cloud, so <b>you can carry on from any device</b>.<br>Rather not wait for an email? Tap <b>WeChat</b> below and scan.',

  /* ---------- 引导 ---------- */
  '选一个同行者': 'Choose a companion',
  'TA 会陪你走完 21 天，并在第 3 / 7 / 14 / 21 天进化。':
    'They stay with you for 21 days and evolve on day 3 / 7 / 14 / 21.',
  '下一步 →': 'Next →',
  '定下你的微习惯': 'Pick your micro-habits',
  '最多 3 个，每个可以配一个自己的小形象。': 'Up to 3, each with its own little icon.',
  '← 返回': '← Back',
  '给自己准备奖励': 'Set up your rewards',
  '完成一次打卡会掉落一条。不设也行，系统会随机给。':
    'One drops after each check-in. Optional — leave it empty and we pick for you.',
  '比如：打 10 分钟游戏': 'e.g. play a game for 10 minutes',
  '添加': 'Add',
  '开始 21 天 ✦': 'Start 21 days ✦',
  '比如：早起喝一杯水': 'e.g. a glass of water after waking',
  '留空即不设置': 'leave blank to skip',
  '暂不设置 · 系统随机给': 'No custom rewards · we pick randomly',

  /* ---------- 抽卡 ---------- */
  '进 化 抽 卡': 'E V O L U T I O N',
  '开启进化 ✦': 'Open ✦',
  '收下这张卡': 'Keep this card',

  /* ---------- 设置 ---------- */
  '设 置': 'S E T T I N G S',
  '角色名': 'Character name',
  '习惯名称': 'Habit names',
  '自定义奖励（最多 8 条）': 'Custom rewards (up to 8)',
  '添加一条奖励': 'Add a reward',
  '进化演示 · 直接跳到第 N 天看打卡效果': 'Evolution demo · jump to day N',
  '第 3 天': 'Day 3',
  '第 7 天': 'Day 7',
  '第 14 天': 'Day 14',
  '第 21 天': 'Day 21',
  '账号': 'Account',
  '未登录': 'Not signed in',
  '退出登录': 'Sign out',
  '保存修改': 'Save changes',
  '预览：快进一天 ⏩': 'Preview: skip a day ⏩',
  '关闭': 'Close',
  '重置全部': 'Reset all',

  /* ---------- 游戏内动态文案 ---------- */
  '第 {d} 天': 'Day {d}',
  '第 {r} 轮 · {m}/21': 'Round {r} · {m}/21',
  '还没有习惯，去设置里添加吧。': 'No habits yet — add some in Settings.',
  '累计 {n} 次 · 连续 {s} 天': '{n} total · {s}-day streak',
  '打卡': 'Check in',
  '✓ 已完成': '✓ Done',
  '{n}/{m} 已打卡': '{n}/{m} checked in',
  '第 3 天会得到第一张卡片。每次进化都是抽卡，每个人抽到的都不一样。':
    'Your first card arrives on day 3. Every evolution is a draw — nobody gets the same one.',
  '21 天习惯勋章': '21-Day Medal',
  '通关纪念 · 可继续记录': 'Completion keepsake · keep logging',
  '{scene} · 第 {d} 天': '{scene} · Day {d}',
  '未设置 · 系统随机': 'Not set · random',
  '已兑现': 'Redeemed',
  '兑现': 'Redeem',
  '完成一次打卡就会掉一条奖励。': 'Finish a check-in and a reward drops here.',
  '{n} 件': '{n} items',
  '打卡有概率掉落装饰。墨镜、头花、手杖……都会随机出现。':
    'Decorations drop by chance — shades, hair flowers, canes…',
  '还没有零食。打卡时有概率捡到，投喂会让 TA 很开心。':
    'No snacks yet. Check-ins sometimes drop one — feeding makes them very happy.',
  '投喂 {name}': 'Feed {name}',
  '这个习惯今天已经打过卡啦 ✓': 'Already checked in today ✓',
  '🏅 21 天习惯勋章达成！这一关，你通关了': '🏅 21-day medal unlocked! You cleared this level.',
  '获得装饰：{icon} {name}': 'New decoration: {icon} {name}',
  '捡到零食：{name}': 'Found a snack: {name}',
  '{name} +1 · 它眯起了眼睛': '{name} +1 · they close their eyes happily',
  '奖励已兑现，好好享受 ✓': 'Redeemed — enjoy it ✓',
  '进化奖励：{icon} {name}': 'Evolution reward: {icon} {name}',
  '未设置': 'Not set',
  '至少定一个习惯，才有得打卡呀': 'Set at least one habit first',
  '21 天，从今天开始。': '21 days. Starting today.',
  '重抽一次进化效果，看看这次是什么': 'Redrawing your evolution — let us see what you get',
  '快进到第 {d} 天（预览用）': 'Skipped to day {d} (preview only)',
  '音效已开启': 'Sound on',
  '音效已关闭': 'Sound off',
  '先写下一个想养成的习惯吧': 'Write down one habit first',
  '最多 8 条奖励，够用啦': '8 rewards max — that is plenty!',
  '最多 8 条': 'Max 8',
  '已保存': 'Saved',
  '确定清空全部进度重新开始吗？账号里的云端存档也会一并清空，无法撤销。':
    'Reset everything? Your cloud save will be cleared as well. This cannot be undone.',
  '退出登录？进度已保存在云端，下次登录可以接着养。':
    'Sign out? Your progress stays in the cloud — just sign in again to continue.',
  '已把本机进度同步到你的账号': 'Local progress synced to your account',

  /* ---------- 云端 / 登录错误 ---------- */
  '已登录': 'Signed in',
  '· 进度已云端保存': '· progress saved to cloud',
  '正在连接云端…': 'Connecting to the cloud…',
  '云端组件加载失败': 'Cloud module failed to load',
  '网络异常，无法加载登录组件。请检查网络后刷新页面。':
    'Network problem — the sign-in module could not load. Check your connection and reload.',
  '存档读取失败': 'Could not load your save',
  '无法读取云端存档：': 'Could not read your cloud save: ',
  '请输入正确的邮箱地址': 'Enter a valid email address',
  '请输入正确的 11 位手机号': 'Enter a valid 11-digit phone number',
  '请输入 11 位手机号': 'Enter your phone number',
  '{n} 秒': '{n}s',
  '验证码已发送，请查看邮箱。<br>没收到可以等 60 秒后重发。':
    'Code sent — check your inbox.<br>Nothing yet? Wait 60 seconds and resend.',
  '请先获取验证码': 'Request a code first',
  '请输入收到的验证码': 'Enter the code you received',
  '登录中…': 'Signing in…',
  '登录状态获取失败，请再试一次': 'Could not start your session — please try again',
  '正在完成{provider}登录…': 'Finishing {provider} sign-in…',
  '登录信息不完整': 'Sign-in is incomplete',
  '授权回调缺少有效的登录方式，请重新登录。':
    'The callback is missing a valid sign-in method. Please sign in again.',
  '当前云端组件版本不支持该登录方式，请刷新页面后重试。':
    'This version of the cloud SDK does not support that sign-in method. Reload and try again.',
  '跳转中…': 'Redirecting…',
  '无法发起登录，请稍后再试': 'Could not start sign-in — please try again later',
  '操作失败，请重试': 'Something went wrong — please retry',
  '网络不太稳定，请稍后重试': 'Unstable connection — please retry in a moment',
  '（管理员可在云服务面板开启该登录方式）':
    ' (the app owner can enable this sign-in method in the cloud console)',
  '这个手机号今天的验证码已发满（短信有单号每日条数上限），请明天再试，或直接用微信 / 邮箱登录。':
    'This number has hit its daily SMS limit. Try again tomorrow, or use WeChat / email instead.',
  '验证码发送次数已达上限，请明天再试，或改用微信 / 邮箱登录。':
    'Too many codes sent today. Try again tomorrow, or use WeChat / email.',
  '发送太频繁了，请等 1 分钟后再试。': 'Too frequent — wait a minute and retry.',
  '手机号格式不对，请检查后重试。': 'That phone number looks wrong — please check it.',
  '短信签名或模板未通过审核，暂时发不出去。请先用微信 / 邮箱登录。':
    'The SMS signature is not approved yet, so texts cannot be sent. Please use WeChat / email.',
  '微信': 'WeChat',
  'WorkBuddy': 'WorkBuddy',

  /* ---------- 角色 ---------- */
  '小王子': 'Little Prince',
  '温柔坚定的星际旅人': 'A gentle, unwavering traveller',
  '小公主': 'Little Princess',
  '骄傲又心软的玫瑰公主': 'A proud rose princess with a soft heart',
  '小猫咪': 'Kitten',
  '好奇又贪吃的小家伙': 'Curious and always hungry',

  /* ---------- 场景 ---------- */
  '沙漠': 'Desert',
  '星空': 'Starry Sky',
  '日出': 'Sunrise',
  '湖泊': 'Lake',

  /* ---------- 场景文案 ---------- */
  '风把沙吹成一条长长的路，你走得不快，但没停。':
    'The wind draws a long road in the sand. You walk slowly, but you never stop.',
  '夜里有无数颗星星，其中一颗因为你今天做到了而亮起来。':
    'A thousand stars in the night — and one of them lit up because you did it today.',
  '天刚亮，光从地平线漫过来，把昨天的疲惫冲淡了。':
    'Daybreak. Light spills over the horizon and washes yesterday off you.',
  '湖面很静，你能看见自己的倒影——比 21 天前更挺直了一点。':
    'The lake is still. In your reflection you stand a little straighter than 21 days ago.',

  /* ---------- 装饰 ---------- */
  '酷墨镜': 'Cool shades',
  '小花发饰': 'Flower clip',
  '金色手杖': 'Golden cane',
  '迷你王冠': 'Mini crown',
  '蝴蝶结': 'Ribbon bow',
  '针织围巾': 'Knit scarf',
  '天使小翅膀': 'Angel wings',
  '光环': 'Halo',
  '星星胸针': 'Star brooch',
  '铃铛项圈': 'Bell collar',
  '圆框眼镜': 'Round glasses',
  '星空披风': 'Galaxy cape',

  /* ---------- 零食 ---------- */
  '焦糖布丁': 'Caramel pudding',
  '草莓甜甜圈': 'Strawberry donut',
  '草莓蛋糕': 'Strawberry cake',
  '三色团子': 'Tricolour dango',
  '热可可': 'Hot cocoa',
  '饭团': 'Onigiri',
  '寿司': 'Sushi',
  '小饼干': 'Cookie',

  /* ---------- 卡片标题 ---------- */
  '沙丘拾光者': 'Dune Light-Gatherer',
  '绿洲旅人': 'Oasis Wanderer',
  '沙海之王': 'King of the Sand Sea',
  '远方来信': 'Letter from Afar',
  '金色的路': 'The Golden Road',
  '风起时': 'When the Wind Rises',
  '星语初醒': 'First Whisper of Stars',
  '星轨观测员': 'Orbit Watcher',
  '银河摆渡人': 'Galaxy Ferryman',
  '月光缝纫师': 'Moonlight Tailor',
  '星辰加冕者': 'Crowned by Stars',
  '夜航星': 'Night Voyager',
  '晨光旅人': 'Dawn Traveller',
  '日出收藏家': 'Sunrise Collector',
  '破晓骑士': 'Knight of Daybreak',
  '黎明守望': 'Watcher of Dawn',
  '第一缕光': 'First Light',
  '燃烧的地平线': 'Burning Horizon',
  '湖畔微风': 'Lakeside Breeze',
  '湖心明月': 'Moon on the Lake',
  '流萤之约': 'Promise of Fireflies',
  '薄雾行者': 'Mist Walker',
  '倒影里的自己': 'The Self in the Reflection',
  '静水之约': 'Promise of Still Water',

  /* ---------- 系统奖励池 ---------- */
  '打 10 分钟游戏': 'Play a game for 10 minutes',
  '吃一个甜品': 'Have a dessert',
  '点一杯喜欢的奶茶': 'Order your favourite bubble tea',
  '看一集剧': 'Watch one episode',
  '刷 15 分钟短视频': 'Fifteen minutes of short videos',
  '泡一杯好茶 / 咖啡': 'Brew a proper tea or coffee',
  '躺平 10 分钟什么都不做': 'Do absolutely nothing for 10 minutes',
  '听一整张专辑': 'Listen to a whole album',
  '买一束小花': 'Buy yourself flowers',
  '给自己敷个面膜': 'Put on a face mask',
  '午睡 20 分钟': 'Take a 20-minute nap',
  '买一支新口红': 'Buy a new lipstick',
  '去楼下散步 15 分钟': 'Take a 15-minute walk outside',
  '看 20 页小说': 'Read 20 pages of a novel',
  '给自己点一份想吃的外卖': 'Order the takeout you have been craving',
  '洗个热水澡 + 泡脚': 'Hot shower and a foot soak',
  '在购物车里买一件小东西': 'Check out one small thing from your cart',
  '和朋友聊 20 分钟': 'Talk with a friend for 20 minutes',
  '看一场电影': 'Watch a movie',
  '吃一份水果碗': 'Have a fruit bowl',
  '允许自己今晚早睡': 'Let yourself go to bed early tonight',
  '给房间换一束花': 'Fresh flowers for your room',
  '玩半小时拼图 / 游戏': 'Half an hour of puzzles or games',
  '买一本一直想看的书': 'Buy that book you keep meaning to read',
  '周末睡到自然醒': 'Sleep in on the weekend',
  '点一份火锅外卖': 'Order hotpot delivery',
  '给自己写一句夸奖': 'Write yourself a compliment',
  '看一集喜欢的综艺': 'Watch an episode of your favourite show',
  '撸猫 10 分钟': 'Pet the cat for 10 minutes',
  '去便利店随便挑一样': 'Pick anything you like at the corner shop',

  /* ---------- 打卡夸夸 ---------- */
  '今天的你，比昨天多了一点点厉害。': 'Today you are a little better than yesterday.',
  '盖章确认：这件事你做到了。': 'Stamped and confirmed: you did it.',
  '星星替你记下了这一笔。': 'A star just wrote this one down for you.',
  '小小的一步，也是往前走。': 'A small step still moves you forward.',
  '肌肉（和意志力）正在悄悄长出来。': 'Muscle — and willpower — growing quietly.',
  '这种稳定感，比爆发更难。': 'This steadiness is harder than any burst of effort.',
  '你没有等「有状态」才行动，这就是大人。':
    'You did not wait to feel ready. That is what being grown-up means.',
  '打卡成功，今天的自己可以被表扬。': 'Checked in — today you deserve a compliment.',
  '看起来很小，攒起来很大。': 'It looks tiny. It compounds enormously.',
  '你把「想做」变成了「做了」。': 'You turned “I want to” into “I did”.',
  '这颗星星是专门留给你的。': 'This star was kept just for you.',
  '干得漂亮，继续保持这个节奏。': 'Nice work — keep this rhythm.',
  '今天的坚持，是未来的底气。': "Today's persistence is tomorrow's confidence.",
  '你战胜的不是任务，是那 3 秒的犹豫。':
    'What you beat was not the task — it was those three seconds of hesitation.',
  '记录 +1，人生进度条 +1。': 'Log +1, life progress bar +1.',
  '这条习惯正在变成你的本能。': 'This habit is turning into instinct.',
  '你比想象中更可靠。': 'You are more dependable than you think.',
  '不为别的，就为你真的去做了。': 'Just because you actually did it.',
  '今天也稳稳地接住了自己。': 'You caught yourself, steadily, again today.',
  '有人在偷偷为你骄傲（是我）。': 'Someone is quietly proud of you. (It is me.)',
  '这件小事，值得被认真对待。': 'A small thing, worth taking seriously.',
  '你很擅长「开始」，现在也擅长「继续」。':
    'You are good at starting — now you are good at continuing.',
  '又靠近那个理想版本一点点了。': 'A little closer to the version of you in your head.',
  '完成，是最性感的一个词。': '“Done” is the sexiest word there is.',
  '你的耐心正在变成一种天赋。': 'Your patience is turning into a gift.',
  '这不是打卡，这是给自己投票。': 'This is not a check-in. It is a vote for yourself.',
  '微小但确定，这就是复利。': 'Small but certain — that is compounding.',
  '今天的努力已经存进你的账户了。': "Today's effort is already in your account.",
  '做完了，可以理直气壮地休息。': 'Finished — now rest without guilt.',
  '你正在成为「说到做到」的人。': 'You are becoming someone who keeps their word.',
  '给你发一枚今日份的小红花。': 'Here is a little gold star for today.',
  '坚持这件事，你已经开始擅长了。': 'You are getting good at this whole persistence thing.',
  '你在给自己的未来铺路。': 'You are paving your own future.',
  '一关一关打过去，很帅。': 'Clearing one level at a time. Very cool.',
  '今天的你状态在线。': 'You are on form today.',
  '不慌不忙，但你一直在动。': 'No rush, no panic — but always moving.',
  '这件事已经有一点点像你了。': 'This habit is starting to look like you.',
  '一次不算什么，但这是第 N 次。': 'Once means little. This is the Nth time.',
  '你的自律在发光。': 'Your self-discipline is glowing.'
};

/* ---------- 当前语言 ---------- */
let LANG = (function () {
  try {
    const saved = localStorage.getItem(I18N_STORE);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch (e) { }
  const nav = String((navigator.languages && navigator.languages[0]) || navigator.language || 'zh').toLowerCase();
  return nav.indexOf('zh') === 0 ? 'zh' : 'en';
})();

const isEN = () => LANG === 'en';

/* 翻译：中文原文进，按当前语言出；支持 {var} 插值 */
function t(str, vars) {
  if (str == null) return '';
  let out = str;
  if (LANG === 'en' && Object.prototype.hasOwnProperty.call(EN, str)) out = EN[str];
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
  return out;
}

/* 静态节点：data-i18n（纯文本）/ data-i18n-html / data-i18n-ph / data-i18n-title */
function applyI18n(root) {
  const sc = root || document;
  sc.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  sc.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  sc.querySelectorAll('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  sc.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.documentElement.lang = LANG === 'en' ? 'en' : 'zh-CN';
  document.querySelectorAll('[data-lang-toggle]').forEach((b) => {
    b.textContent = LANG === 'en' ? '中文' : 'EN';
  });
  if (document.title) document.title = t('习惯星球 · Habit Quest');
}

function setLang(next) {
  LANG = next === 'en' ? 'en' : 'zh';
  try { localStorage.setItem(I18N_STORE, LANG); } catch (e) { }
  applyI18n();
  if (typeof onLangChange === 'function') onLangChange();
}

document.addEventListener('DOMContentLoaded', () => {
  applyI18n();
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang-toggle]');
    if (!btn) return;
    setLang(LANG === 'en' ? 'zh' : 'en');
  });
});
