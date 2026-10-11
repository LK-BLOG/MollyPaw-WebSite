// 取页脚品牌的真实计算颜色
const PORT = 9223;
const EXPR = `(function(){
  var out = [];
  function probe(sel, tag) {
    var el = document.querySelector(sel);
    if (!el) { out.push(tag + ': 缺失'); return; }
    var cs = getComputedStyle(el);
    out.push(tag + ' color=' + cs.color + ' bg=' + cs.backgroundColor);
  }
  out.push('mode=' + document.documentElement.getAttribute('data-mode'));
  probe('.foot', 'footer');
  probe('.foot-brand .brand', 'foot-brand .brand');
  probe('.foot-brand .brand-text', 'brand-text');
  probe('.foot-brand .brand em', 'brand em');
  probe('.foot-brand .brand-paw', 'brand-paw');
  probe('.foot-brand p', 'foot p');
  // 对比度
  function lum(c) {
    var m = /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/.exec(c);
    if (!m) return null;
    var a = [+m[1], +m[2], +m[3]].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
  }
  var b = document.querySelector('.foot-brand .brand-text');
  var f = document.querySelector('.foot');
  if (b && f) {
    var l1 = lum(getComputedStyle(b).color), l2 = lum(getComputedStyle(f).backgroundColor);
    if (l1 !== null && l2 !== null) {
      out.push('对比度=' + ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2));
    }
  }
  return out.join('\\n');
})()`;

async function main() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && !t.url.startsWith('edge://'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const w = new Map();
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && w.has(m.id)) { w.get(m.id)(m); w.delete(m.id); } });
  await new Promise((r) => ws.addEventListener('open', r));
  const send = (m, p) => new Promise((r) => { const i = ++id; w.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  await send('Runtime.enable'); await send('Page.enable');

  for (const mode of ['lite', 'dev']) {
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'http://127.0.0.1:8899/index.html?mode=' + mode });
    await new Promise((r) => setTimeout(r, 6000));
    const res = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
    console.log('======== mode=' + mode + ' ========');
    console.log(res.result.result.value);
  }
  ws.close();
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
