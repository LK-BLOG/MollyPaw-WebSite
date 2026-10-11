// 全站对比度扫描：找出所有「文字和它实际背景」对比度不足的地方
const PORT = 9223;

const EXPR = `(function(){
  function parse(c) {
    var m = /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/.exec(c || '');
    if (!m) return null;
    return { r:+m[1], g:+m[2], b:+m[3], a: m[4] === undefined ? 1 : parseFloat(m[4]) };
  }
  function lum(p) {
    var a = [p.r, p.g, p.b].map(function (v) {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
  }
  function over(fg, bg) { // fg 半透明时合成到 bg 上
    if (fg.a >= 1) return fg;
    return { r: fg.r*fg.a + bg.r*(1-fg.a), g: fg.g*fg.a + bg.g*(1-fg.a), b: fg.b*fg.a + bg.b*(1-fg.a), a: 1 };
  }
  function contrast(a, b) {
    var l1 = lum(a), l2 = lum(b);
    return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
  }
  function effBg(el) {
    var cur = el, depth = 0;
    while (cur && depth < 14) {
      var cs = getComputedStyle(cur);
      var bg = parse(cs.backgroundColor);
      if (bg && bg.a > 0.95) return bg;
      if (bg && bg.a > 0) {
        // 半透明背景，继续往上找底再合成
        var under = effBg(cur.parentElement);
        return under ? over(bg, under) : bg;
      }
      cur = cur.parentElement; depth++;
    }
    return { r:255, g:255, b:255, a:1 };
  }

  var bad = [];
  var seen = 0;
  var all = document.querySelectorAll('body *');
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    // 只看直接包含可见文字的叶子节点
    var hasText = false;
    for (var j = 0; j < el.childNodes.length; j++) {
      var n = el.childNodes[j];
      if (n.nodeType === 3 && n.textContent.trim().length > 1) { hasText = true; break; }
    }
    if (!hasText) continue;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1) continue;
    var r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    seen++;
    var fg = parse(cs.color);
    if (!fg) continue;
    var bg = effBg(el);
    var fgc = over(fg, bg);
    var c = contrast(fgc, bg);
    if (c < 4.5) {
      var path = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ').slice(0,2).join('.') : '');
      bad.push({ c: +c.toFixed(2), sel: path, txt: el.textContent.trim().slice(0, 22), fg: cs.color, bg: 'rgb('+Math.round(bg.r)+','+Math.round(bg.g)+','+Math.round(bg.b)+')' });
    }
  }
  bad.sort(function(a,b){ return a.c - b.c; });
  return JSON.stringify({ checked: seen, bad: bad.slice(0, 14), total: bad.length });
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
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  for (const mode of ['lite', 'dev']) {
    await send('Page.navigate', { url: 'http://127.0.0.1:8899/index.html?mode=' + mode });
    await new Promise((r) => setTimeout(r, 6500));
    const res = await send('Runtime.evaluate', { expression: EXPR, returnByValue: true });
    let o; try { o = JSON.parse(res.result.result.value); } catch (e) { console.log('解析失败'); continue; }
    console.log('======== mode=' + mode + ' 检查节点=' + o.checked + ' 不合格=' + o.total + ' ========');
    o.bad.forEach((b) => console.log('  ' + b.c + '  ' + b.sel + '  "' + b.txt + '"  fg=' + b.fg + ' bg=' + b.bg));
  }
  ws.close();
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
