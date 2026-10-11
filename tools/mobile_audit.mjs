// 用 CDP 在真实移动视口下审计（--window-size 在无头模式下不可靠）
// 用法: node tools/mobile_audit.mjs [url]
const TARGET = process.argv[2] || 'http://127.0.0.1:8899/index.html?mode=lite';
const PORT = 9223;

const DEVICES = [
  { name: 'iPhone SE 375', w: 375, h: 667, dpr: 2 },
  { name: 'iPhone 14 390', w: 390, h: 844, dpr: 3 },
  { name: 'iPhone 16PM 440', w: 440, h: 956, dpr: 3 },
  { name: 'Android 360', w: 360, h: 800, dpr: 3 }
];

async function connect() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && !t.url.startsWith('edge://'));
  if (!page) throw new Error('没有可用的 page target');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const waiters = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && waiters.has(m.id)) { waiters.get(m.id)(m); waiters.delete(m.id); }
  });
  await new Promise((res) => ws.addEventListener('open', res));
  const send = (method, params) => new Promise((res) => {
    const myId = ++id;
    waiters.set(myId, res);
    ws.send(JSON.stringify({ id: myId, method, params: params || {} }));
  });
  return { ws, send };
}

const AUDIT = `(function(){
  var d = document.documentElement;
  var res = { vw: d.clientWidth, sw: d.scrollWidth, overflow: d.scrollWidth - d.clientWidth, bad: [] };
  var all = document.querySelectorAll('body *');
  for (var i = 0; i < all.length; i++) {
    var el = all[i], r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (r.width <= 0 || cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (el.closest('.ticker') || el.classList.contains('hero-glow')) continue;
    if (el.classList.contains('ticker-track')) continue;
    if (r.right > d.clientWidth + 1) {
      res.bad.push(el.tagName + '.' + String(el.className).slice(0, 24) + '@' + Math.round(r.right));
      if (res.bad.length >= 6) break;
    }
  }
  var lede = document.querySelector('.lede');
  if (lede) { var lr = lede.getBoundingClientRect(); res.ledeW = Math.round(lr.width); res.ledeRight = Math.round(lr.right); }
  var h1 = document.querySelector('.hero h1');
  if (h1) { var hr = h1.getBoundingClientRect(); res.h1 = Math.round(hr.width) + '@' + Math.round(hr.right); }
  // 按钮是否可点（下载按钮不应在版本未到时是启用的）
  var dl = document.querySelector('.js-download[data-dl="primary"]');
  if (dl) res.dl = (dl.classList.contains('is-disabled') ? 'LOCK' : 'OPEN') + '|' + (dl.getAttribute('href') || '').slice(0, 30);
  return JSON.stringify(res);
})()`;

(async () => {
  const { ws, send } = await connect();
  await send('Runtime.enable');
  await send('Page.enable');
  for (const dev of DEVICES) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: dev.w, height: dev.h, deviceScaleFactor: dev.dpr, mobile: true
    });
    await send('Page.navigate', { url: TARGET });
    await new Promise((r) => setTimeout(r, 7000));
    const r = await send('Runtime.evaluate', { expression: AUDIT, returnByValue: true });
    const val = r.result && r.result.result && r.result.result.value;
    console.log('=== ' + dev.name + ' ===');
    try {
      const o = JSON.parse(val);
      console.log('  viewport=' + o.vw + ' scrollWidth=' + o.sw + ' overflow=' + o.overflow);
      console.log('  溢出元素: ' + (o.bad.length ? o.bad.join(' , ') : '无'));
      console.log('  lede: w=' + o.ledeW + ' right=' + o.ledeRight + ' | h1: ' + o.h1);
      console.log('  下载按钮: ' + o.dl);
    } catch (e) { console.log('  解析失败: ' + val); }
  }
  await send('Emulation.clearDeviceMetricsOverride');
  ws.close();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
