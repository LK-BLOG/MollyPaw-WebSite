// 最终验证：页脚品牌色 + 导航小屏溢出
const PORT = 9223;

const FOOTER = `(function(){
  function p(c){var m=/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/.exec(c||'');return m?[+m[1],+m[2],+m[3]]:null;}
  function L(a){var x=a.map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*x[0]+0.7152*x[1]+0.0722*x[2];}
  var t=document.querySelector('.foot-brand .brand-text');
  var f=document.querySelector('.foot');
  if(!t||!f) return 'missing';
  var c1=p(getComputedStyle(t).color), c2=p(getComputedStyle(f).backgroundColor);
  var r=(Math.max(L(c1),L(c2))+0.05)/(Math.min(L(c1),L(c2))+0.05);
  return 'text='+getComputedStyle(t).color+' bg='+getComputedStyle(f).backgroundColor+' contrast='+r.toFixed(2);
})()`;

const NAV = `(function(){
  var d=document.documentElement, bad=[];
  var all=document.querySelectorAll('.nav-inner *, .nav *');
  for(var i=0;i<all.length;i++){
    var el=all[i], r=el.getBoundingClientRect(), cs=getComputedStyle(el);
    if(r.width<=0||cs.display==='none') continue;
    if(r.right>d.clientWidth+1) bad.push(el.tagName+'.'+String(el.className).slice(0,18)+'@'+Math.round(r.right));
  }
  return 'vw='+d.clientWidth+' sw='+d.scrollWidth+' over='+(d.scrollWidth-d.clientWidth)+' | '+(bad.length?bad.slice(0,4).join(', '):'导航无溢出');
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
    const a = await send('Runtime.evaluate', { expression: FOOTER, returnByValue: true });
    console.log('[' + mode + '] 页脚: ' + a.result.result.value);
  }

  console.log('');
  for (const width of [360, 375, 390, 440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: 'http://127.0.0.1:8899/index.html?mode=lite' });
    await new Promise((r) => setTimeout(r, 5000));
    const a = await send('Runtime.evaluate', { expression: NAV, returnByValue: true });
    console.log('[' + width + 'px] ' + a.result.result.value);
  }
  ws.close();
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
