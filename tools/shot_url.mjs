// 精确截取新版引导卡片
import { writeFileSync } from 'node:fs';
const PORT = 9223;

async function main() {
  const target = process.argv[2] || '#whatis';
  const out = process.argv[3] || 'D:\\MollyPaw WebSite\\_chk\\el.png';
  const url = process.argv[4] || 'https://mollypaw.pages.dev/?mode=lite';
  const width = parseInt(process.argv[5] || '900', 10);

  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && !t.url.startsWith('edge://'));
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0; const w = new Map();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && w.has(m.id)) { w.get(m.id)(m); w.delete(m.id); }
  });
  await new Promise((r) => ws.addEventListener('open', r));
  const send = (m, p) => new Promise((r) => { const i = ++id; w.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  await send('Runtime.enable'); await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 9000));

  const r = await send('Runtime.evaluate', {
    expression: `(function(){
      var el=document.querySelector(${JSON.stringify(target)});
      if(!el) return 'null';
      el.scrollIntoView({block:'center'});
      return 'ok';
    })()`, returnByValue: true
  });
  if (r.result.result.value === 'null') { console.log('找不到 ' + target); ws.close(); return; }
  await new Promise((r2) => setTimeout(r2, 1500));

  const b = await send('Runtime.evaluate', {
    expression: `(function(){
      var b=document.querySelector(${JSON.stringify(target)}).getBoundingClientRect();
      return JSON.stringify({x:b.x,y:b.y,w:b.width,h:b.height});
    })()`, returnByValue: true
  });
  const box = JSON.parse(b.result.result.value);
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: box.x, y: box.y, width: box.w, height: Math.min(box.h, 2400), scale: 1.5 },
    captureBeyondViewport: true
  });
  writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('saved ' + out + '  ' + Math.round(box.w) + 'x' + Math.round(Math.min(box.h, 2400)));
  ws.close();
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
