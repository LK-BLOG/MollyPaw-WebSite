// 截取指定元素（用于看清暗色代码块实际观感）
import { writeFileSync } from 'node:fs';

const PORT = 9223;

async function main() {
  const target = process.argv[2] || '.code-card';
  const out = process.argv[3] || 'D:\\MollyPaw WebSite\\_mob\\el.png';
  const mode = process.argv[4] || 'dev';
  const width = parseInt(process.argv[5] || '1280', 10);

  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && !t.url.startsWith('edge://'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const w = new Map();
  const events = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && w.has(m.id)) { w.get(m.id)(m); w.delete(m.id); }
    else if (m.method) events.push(m);
  });
  await new Promise((r) => ws.addEventListener('open', r));
  const send = (m, p) => new Promise((r) => { const i = ++id; w.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: 'http://127.0.0.1:8899/index.html?mode=' + mode });
  await new Promise((r) => setTimeout(r, 7000));

  // 拿到元素坐标
  const r = await send('Runtime.evaluate', {
    expression: `(function(){
      var el = document.querySelector(${JSON.stringify(target)});
      if (!el) return 'null';
      el.scrollIntoView({block:'center'});
      var b = el.getBoundingClientRect();
      return JSON.stringify({x:b.x, y:b.y, w:b.width, h:b.height});
    })()`,
    returnByValue: true
  });
  const box = JSON.parse(r.result.result.value);
  if (!box) { console.log('找不到元素 ' + target); ws.close(); return; }
  await new Promise((r2) => setTimeout(r2, 1200));

  // 重新取（滚动后坐标变了）
  const r2 = await send('Runtime.evaluate', {
    expression: `(function(){
      var b = document.querySelector(${JSON.stringify(target)}).getBoundingClientRect();
      return JSON.stringify({x:b.x, y:b.y, w:b.width, h:b.height});
    })()`,
    returnByValue: true
  });
  const b2 = JSON.parse(r2.result.result.value);

  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: b2.x, y: b2.y, width: b2.w, height: b2.h, scale: 2 },
    captureBeyondViewport: true
  });
  const fs = { writeFileSync: writeFileSync };
  fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('saved ' + out + '  ' + Math.round(b2.w) + 'x' + Math.round(b2.h));
  ws.close();
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
