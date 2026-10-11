// 诊断导航栏在小屏下的宽度分配
const PORT = 9223;
const AUDIT = `(function(){
  var out = [];
  var d = document.documentElement;
  out.push('viewport=' + d.clientWidth);
  var nav = document.querySelector('.nav-inner');
  function box(sel) {
    var el = document.querySelector(sel);
    if (!el) return sel + '=缺失';
    var r = el.getBoundingClientRect();
    var cs = getComputedStyle(el);
    return sel + ' w=' + Math.round(r.width) + ' right=' + Math.round(r.right) +
      ' disp=' + cs.display + ' flex=' + cs.flex + ' pad=' + cs.paddingLeft + '/' + cs.paddingRight;
  }
  ['.nav-inner', '.brand', '.brand-text', '.nav-links', '.nav-actions',
   '.mode-switch', '.mode-btn-mobile', '.nav-actions .btn-primary', '.nav-toggle'].forEach(function (s) {
    out.push(box(s));
  });
  return out.join('\\n');
})()`;

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && !t.url.startsWith('edge://'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const w = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && w.has(m.id)) { w.get(m.id)(m); w.delete(m.id); } });
  await new Promise((r) => ws.addEventListener('open', r));
  const send = (method, params) => new Promise((r) => { const i = ++id; w.set(i, r); ws.send(JSON.stringify({ id: i, method, params: params || {} })); });
  await send('Runtime.enable'); await send('Page.enable');

  for (const width of [360, 375, 390, 440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: 'http://127.0.0.1:8899/index.html?mode=lite' });
    await new Promise((r) => setTimeout(r, 5500));
    const res = await send('Runtime.evaluate', { expression: AUDIT, returnByValue: true });
    console.log('======== width ' + width + ' ========');
    console.log(res.result.result.value);
  }
  ws.close();
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
