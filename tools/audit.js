// 官网验收脚本：跑在无头浏览器里，结果写进 document.title
(function () {
  function px(c) {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c || '');
    return m ? [+m[1], +m[2], +m[3]] : null;
  }
  function lum(rgb) {
    var a = rgb.map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrast(fg, bg) {
    var l1 = lum(fg), l2 = lum(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  function run() {
    var out = [];
    var d = document.documentElement;
    var mode = d.getAttribute('data-mode');
    out.push('mode=' + mode);
    out.push('overflowX=' + (d.scrollWidth - d.clientWidth));
    out.push('scrollY=' + Math.round(window.scrollY));

    // 可见区块
    var visible = 0, hidden = 0;
    document.querySelectorAll('.only-lite, .only-dev').forEach(function (el) {
      var shown = el.offsetParent !== null || getComputedStyle(el).display !== 'none';
      if (shown) visible++; else hidden++;
    });
    out.push('visibleScopes=' + visible + ' hiddenScopes=' + hidden + ' partial=' + (hidden > 0));

    // 版本号是否已从 Release 填充
    var ver = document.querySelector('[data-ver="name"]');
    out.push('version=' + (ver ? ver.textContent.trim() : 'none'));
    var route = document.querySelector('[data-ver="route"]');
    out.push('mirrorRoute=' + (route ? (route.textContent.indexOf('cdn.gh-proxy.org') >= 0 || route.textContent.indexOf('最快节点') >= 0) : 'none'));

    // 主下载按钮指向
    var dl = document.querySelector('.js-download[data-dl="primary"]');
    out.push('dlIsMirror=' + (dl ? /^https:\/\/(cdn\.gh-proxy\.org|ghproxy\.net|ghfast\.top|ghfile\.geekertao\.top|gh-proxy\.com|gh\.llkk\.cc)\//.test(dl.getAttribute('href')) : 'none'));

    // iframe 存在且能取到同源文档
    var ifr = document.querySelector('.tryon-body iframe');
    var ifrOk = false;
    try { ifrOk = !!(ifr && ifr.contentDocument && ifr.contentDocument.querySelector('.history-item')); } catch (e) {}
    out.push('demoLoaded=' + ifrOk);

    // 关键文字对比度
    var probes = [
      ['body', document.body],
      ['h1', document.querySelector('.hero h1')],
      ['card-p', document.querySelector('.card p')],
      ['footer', document.querySelector('.foot p')]
    ];
    var worst = 99, worstName = '';
    probes.forEach(function (p) {
      if (!p[1]) return;
      var cs = getComputedStyle(p[1]);
      var fg = px(cs.color);
      var bg = px(cs.backgroundColor);
      var el = p[1], tries = 0;
      while (bg && bg[0] === 0 && bg[1] === 0 && bg[2] === 0 && tries < 6) {
        el = el.parentElement; tries++;
        bg = el ? px(getComputedStyle(el).backgroundColor) : null;
      }
      if (!fg || !bg) return;
      var c = contrast(fg, bg);
      if (c < worst) { worst = c; worstName = p[0]; }
    });
    out.push('worstContrast=' + worst.toFixed(2) + '@' + worstName);

    // 空链接 / 空按钮
    var badLinks = 0;
    document.querySelectorAll('a[href=""], a:not([href])').forEach(function () { badLinks++; });
    out.push('emptyLinks=' + badLinks);

    // 图片是否都有 alt
    var noAlt = 0;
    document.querySelectorAll('img:not([alt])').forEach(function () { noAlt++; });
    out.push('imgsWithoutAlt=' + noAlt);

    document.title = out.join(' || ');
  }

  if (document.readyState === 'complete') setTimeout(run, 2000);
  else window.addEventListener('load', function () { setTimeout(run, 2000); });
})();
