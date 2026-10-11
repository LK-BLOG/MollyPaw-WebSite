/* ============================================================
   MollyPaw 官网 — 交互脚本（无依赖，纯原生 JS）
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var MODES = {
    lite: { name: '小白版', other: '技术版', tip: '已切到小白版：说人话，教你用' },
    dev:  { name: '技术版', other: '小白版', tip: '已切到技术版：命令、架构、硬核细节' }
  };

  /* ---------- 模式：读取 / 应用 / 切换 ---------- */
  function getMode() {
    var m = root.getAttribute('data-mode');
    return (m === 'dev' || m === 'lite') ? m : 'lite';
  }

  function applyMode(mode, opts) {
    if (!MODES[mode]) mode = 'lite';
    var changed = getMode() !== mode;
    root.setAttribute('data-mode', mode);

    document.querySelectorAll('.ms-btn').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.mode === mode));
    });
    var mobileLabel = document.querySelector('#modeBtnMobile .ms-label');
    if (mobileLabel) mobileLabel.textContent = MODES[mode].name;
    var footName = document.getElementById('footModeName');
    if (footName) footName.textContent = MODES[mode].name;

    // 用户切换版本时靠 CSS 显示/隐藏；把新露脸的区块直接点亮，避免空白
    if (changed) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        var scope = el.closest('.only-lite, .only-dev');
        if (scope && !scope.classList.contains('only-' + mode)) return;
        el.classList.add('in');
      });
    }

    try {
      localStorage.setItem('mollypaw-mode', mode);
      if (changed) {
        var url = new URL(location.href);
        url.searchParams.set('mode', mode);
        history.replaceState(null, '', url);
      }
    } catch (e) { /* 无痕模式 / file:// 限制，忽略 */ }

    if (changed || (opts && opts.force)) toast(MODES[mode].tip);
    if (opts && opts.scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- 提示条 ---------- */
  var toastEl = document.getElementById('modeToast');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  function bindModeSwitch() {
    document.querySelectorAll('.ms-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { applyMode(btn.dataset.mode); });
    });
    var mobileBtn = document.getElementById('modeBtnMobile');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', function () {
        applyMode(getMode() === 'lite' ? 'dev' : 'lite');
      });
    }
    var footToggle = document.getElementById('footModeToggle');
    if (footToggle) {
      footToggle.addEventListener('click', function () {
        applyMode(getMode() === 'lite' ? 'dev' : 'lite');
      });
    }
    var navEntry = document.getElementById('navModeEntry');
    if (navEntry) {
      navEntry.addEventListener('click', function (e) {
        e.preventDefault();
        applyMode(getMode() === 'lite' ? 'dev' : 'lite');
        if (links) {
          links.classList.remove('open');
          if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
    document.querySelectorAll('[data-goto-mode]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyMode(btn.dataset.gotoMode, { force: true });
        var target = document.getElementById('features');
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    document.addEventListener('keydown', function (e) {
      // 按 M 快速切版，输入框里不触发
      var tag = (e.target.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'm' || e.key === 'M') {
        applyMode(getMode() === 'lite' ? 'dev' : 'lite');
      }
    });
  }

  // 首屏脚本已经把 data-mode 设好；这里补齐 UI 状态
  var bootMode = new URLSearchParams(location.search).get('mode');
  applyMode((bootMode === 'dev' || bootMode === 'lite') ? bootMode : getMode());
  bindModeSwitch();

  /* ---------- 导航：滚动阴影 ---------- */
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 导航：移动端菜单 ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 滚动进入动画 ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = Array.prototype.slice.call(el.parentNode.children).indexOf(el);
        el.style.transitionDelay = Math.min(sibs, 6) * 70 + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 复制 ---------- */
  // .copy-btn（带图标+文字）和 .copy-inline（地址旁边的小胶囊）都走这套
  document.querySelectorAll('.copy-btn, .copy-inline').forEach(function (copyBtn) {
    if (!navigator.clipboard) return;
    var label = copyBtn.querySelector('span');
    var original = label ? label.textContent : copyBtn.textContent;
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.dataset.copy || '';
      if (!text) {
        if (label) label.textContent = '暂无内容';
        return;
      }
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.classList.add('ok');
        if (label) label.textContent = '已复制';
        else copyBtn.textContent = '已复制';
        setTimeout(function () {
          copyBtn.classList.remove('ok');
          if (label) label.textContent = original;
          else copyBtn.textContent = original;
        }, 1800);
      }).catch(function () {
        if (label) label.textContent = '复制失败';
        else copyBtn.textContent = '复制失败';
        setTimeout(function () {
          if (label) label.textContent = original;
          else copyBtn.textContent = original;
        }, 1800);
      });
    });
  });

  /* ============================================================
     下载中心：实时版本号 + 国内镜像测速
     ============================================================ */
  var REPO = 'LK-BLOG/MollyPaw';
  var RELEASES_API = 'https://api.github.com/repos/' + REPO + '/releases';
  var SNAPSHOT_URL = 'releases.json';
  var MIRROR_TIMEOUT = 9000;
  // 加速前缀：挂在 https://github.com/... 原地址前面。
  // 顺序 = 优先尝试顺序；实测可达且最快的会排到最前，并接管「主下载按钮」。
  // 挂了自己在数组里加一行 / 删一行，格式：{ name, prefix }
  var MIRRORS = [
    { name: 'cdn.gh-proxy.org', label: '线路 A', prefix: 'https://cdn.gh-proxy.org/' },
    { name: 'ghproxy.net', label: '线路 B', prefix: 'https://ghproxy.net/' },
    { name: 'ghfast.top', label: '线路 C', prefix: 'https://ghfast.top/' },
    { name: 'ghfile.geekertao.top', label: '线路 D', prefix: 'https://ghfile.geekertao.top/' },
    { name: 'gh-proxy.com', label: '线路 E', prefix: 'https://gh-proxy.com/' },
    { name: 'gh.llkk.cc', label: '线路 F', prefix: 'https://gh.llkk.cc/' }
  ];

  var relState = { data: null, source: 'none', latest: null };

  // 速度分级：比裸毫秒数好读，也避免把抖动当成精确排名
  function tier(ms) {
    if (ms < 400) return '很快';
    if (ms < 1500) return '可用';
    if (ms < 4000) return '偏慢';
    return '很慢';
  }

  function fmtSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function setVer(key, text) {
    document.querySelectorAll('[data-ver="' + key + '"]').forEach(function (el) {
      el.textContent = text;
    });
  }

  function mainAsset(rel) {
    if (!rel) return null;
    var list = rel.assets || [];
    for (var i = 0; i < list.length; i++) {
      if (/\.exe$/i.test(list[i].name || '')) return list[i];
    }
    return list[0] || null;
  }

  function normalize(raw) {
    // GitHub API 原始结构
    if (Array.isArray(raw)) {
      return raw.map(function (r) {
        return {
          tag: r.tag_name,
          name: r.name || r.tag_name,
          published: r.published_at,
          prerelease: !!r.prerelease,
          url: r.html_url,
          notes: (r.body || '').trim(),
          assets: (r.assets || []).map(function (a) {
            return { name: a.name, size: a.size, downloads: a.download_count, url: a.browser_download_url };
          })
        };
      });
    }
    if (raw && Array.isArray(raw.releases)) return raw.releases;   // 本地快照
    return [];
  }

  function render() {
    var list = relState.data || [];
    var latest = list[0] || null;
    relState.latest = latest;

    var verName = document.querySelector('[data-ver="name"]');
    if (latest) {
      // 直接用 Release 的 name，别动它的空格
      var pretty = (latest.name || latest.tag || '').trim() || latest.tag || '未知版本';
      setVer('name', pretty);
      var asset = mainAsset(latest);
      setVer('date', fmtDate(latest.published) ? '发布于 ' + fmtDate(latest.published) : '');
      setVer('size', asset ? fmtSize(asset.size) : '');
      setVer('assets', asset ? asset.name : '');
    } else {
      setVer('name', 'Beta 0.0.0.1.5');
      setVer('date', '');
      setVer('size', '');
    }

    // 原始 GitHub 资产地址；镜像前缀 + 这个地址 = 加速下载链接
    var rawUrl = null;
    if (latest) {
      var a = mainAsset(latest);
      rawUrl = (a && a.url) || (latest.url ? latest.url : null);
    }
    // 拿不到就用 releases/latest 这种「页面地址」兜底。
    // 这地址不是文件，不能拼镜像（拼出来是垃圾链接），所以标记一下。
    var isFileUrl = !!rawUrl;
    if (!rawUrl) rawUrl = 'https://github.com/' + REPO + '/releases/latest';
    relState.rawUrl = rawUrl;
    relState.isFileUrl = isFileUrl;
    updatePrimaryDownload();

    // 来源提示
    var srcEl = document.querySelector('[data-ver="source"]');
    if (srcEl) {
      srcEl.className = 'ver-src ' + relState.source;
      srcEl.textContent = relState.source === 'live' ? 'GitHub 实时'
        : relState.source === 'snapshot' ? '离线快照（GitHub 暂时拿不到）'
        : '拿不到版本信息，请手动去 Release 页';
    }

    var errEl = document.querySelector('[data-ver="error"]');
    if (errEl) {
      if (relState.source === 'none') {
        errEl.hidden = false;
        errEl.textContent = '⚠️ 没能从 GitHub 取到版本信息，也不在本地快照里。下面按钮会直接跳到 Release 页面。';
      } else if (relState.source === 'snapshot') {
        errEl.hidden = false;
        errEl.textContent = '⚠️ 现在连不上 GitHub，显示的是本地快照（可能不是最新）。等网络好点再点「重新获取」。';
      } else {
        errEl.hidden = true;
      }
    }

    // SHA256 一行（快照里没存就提示）
    var sumLine = document.getElementById('sumLine');
    if (sumLine) {
      sumLine.textContent = latest && latest.sha256
        ? latest.sha256
        : '（Release 未提供 SHA256，可自行核对下载大小 ' + (latest && mainAsset(latest) ? fmtSize(mainAsset(latest).size) : '未知') + '）';
    }
    var sumBtn = document.getElementById('sumCopyBtn');
    if (sumBtn) sumBtn.dataset.copy = latest && latest.sha256 ? latest.sha256 : '';

    renderMirrors(rawUrl);
    renderReleases(list);
  }

  function renderReleases(list) {
    var box = document.getElementById('relList');
    if (!box) return;
    if (!list.length) {
      box.innerHTML = '<p class="mirror-loading">没取到版本记录，去 <a href="https://github.com/' + REPO + '/releases" target="_blank" rel="noopener">GitHub Releases</a> 看。</p>';
      return;
    }
    box.innerHTML = '';
    list.slice(0, 8).forEach(function (rel, i) {
      var item = document.createElement('div');
      item.className = 'rel-item';

      var head = document.createElement('div');
      head.className = 'rel-item-head';
      var strong = document.createElement('strong');
      strong.textContent = rel.name || rel.tag;
      if (i === 0) {
        var tag = document.createElement('span');
        tag.className = 'rel-tag latest';
        tag.textContent = '最新';
        head.appendChild(tag);
      } else if (rel.prerelease) {
        var pre = document.createElement('span');
        pre.className = 'rel-tag';
        pre.textContent = '预发布';
        head.appendChild(pre);
      }
      var date = document.createElement('span');
      date.className = 'rel-date';
      date.textContent = fmtDate(rel.published);
      head.insertBefore(strong, head.firstChild);
      head.appendChild(date);
      item.appendChild(head);

      if (rel.assets && rel.assets.length) {
        var assets = document.createElement('div');
        assets.className = 'rel-assets';
        rel.assets.forEach(function (a) {
          var link = document.createElement('a');
          link.className = 'rel-asset';
          link.href = a.url;
          link.target = '_blank';
          link.rel = 'noopener';
          link.textContent = '⬇ ' + a.name + (a.size ? '（' + fmtSize(a.size) + '）' : '');
          assets.appendChild(link);
        });
        item.appendChild(assets);
      }

      var notes = (rel.notes || '').trim();
      if (notes) {
        var p = document.createElement('p');
        p.className = 'rel-notes';
        p.textContent = notes.length > 900 ? notes.slice(0, 900) + '…' : notes;
        item.appendChild(p);
      }
      box.appendChild(item);
    });
  }

  var probeState = { pending: 0, results: {}, best: null, done: false };

  /* ---- 镜像列表 ---- */
  var mirrorRendered = false;
  function renderMirrors(rawUrl) {
    var box = document.getElementById('mirrorList');
    if (!box || !rawUrl) return;
    // 必须是「文件地址」才能拼镜像。releases/latest 这种页面地址拼出来是垃圾链接。
    var usable = relState.isFileUrl && /^https:\/\/github\.com\/.+\/releases\/download\//.test(rawUrl);
    if (!usable) {
      box.innerHTML = '<p class="mirror-loading">没拿到下载文件地址，镜像拼不出来。' +
        '稍后点上面的「重新获取」，或者去 <a href="https://github.com/' + REPO + '/releases" target="_blank" rel="noopener">Release 页</a> 自己找。</p>';
      return;
    }

    if (!mirrorRendered) {
      box.innerHTML = '';
      MIRRORS.forEach(function (m) {
        var row = document.createElement('div');
        row.className = 'mirror-row';

        var name = document.createElement('span');
        name.className = 'mirror-name';
        name.textContent = m.label + ' · ' + m.name;

        var host = document.createElement('span');
        host.className = 'mirror-host';
        host.textContent = m.prefix;

        var a = document.createElement('a');
        a.className = 'btn btn-outline mirror-go';
        a.textContent = '下载';
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-disabled', 'true');
        a.classList.add('is-disabled');

        var status = document.createElement('span');
        status.className = 'mirror-status wait';
        status.textContent = '测速中…';

        row.dataset.mirror = m.name;
        row.appendChild(name);
        row.appendChild(host);
        row.appendChild(a);
        row.appendChild(status);
        box.appendChild(row);

        m._row = row;
        m._link = a;
        m._status = status;
      });
      mirrorRendered = true;
    }

    // 重新渲染 = 重新测速：把所有状态复位，按钮回到锁定态
    probeState.pending = 0;
    probeState.results = {};
    probeState.best = null;
    probeState.done = false;
    MIRRORS.forEach(function (m) {
      m.ms = undefined;
      m._link.href = m.prefix + rawUrl;
      m._link.textContent = '下载';
      m._link.classList.add('is-disabled');
      m._link.setAttribute('aria-disabled', 'true');
      m._status.className = 'mirror-status wait';
      m._status.textContent = '待测速';
      m._row.classList.remove('best');
    });
    updatePrimaryDownload();
    scheduleProbe(rawUrl, true);
  }

  var probeScheduled = false;
  // 主下载按钮在首屏，所以不能等镜像区滚进视口才测速 —— 直接排一次，稍微错开避免同时打 6 个请求
  function scheduleProbe(rawUrl, force) {
    if (probeScheduled && !force) return;
    if (probeScheduled && force) { runProbes(rawUrl); return; }
    probeScheduled = true;
    var start = function () { runProbes(rawUrl); };
    if (window.requestIdleCallback) {
      window.requestIdleCallback(start, { timeout: 2500 });
    } else {
      setTimeout(start, 1200);
    }
  }

  function runProbes(rawUrl) {
    probeState.pending = 0;
    probeState.results = {};
    probeState.best = null;
    probeState.done = false;
    updatePrimaryDownload();   // 按钮立刻回到「正在挑线路…」的锁定态
    MIRRORS.forEach(function (m, i) {
      setTimeout(function () {
        m._status.className = 'mirror-status wait';
        m._status.textContent = '测速中…';
        probeState.pending++;
        probe(m, rawUrl);
      }, i * 120);
    });
  }

  function reorderMirrors() {
    var box = document.getElementById('mirrorList');
    if (!box) return;
    var rows = Array.prototype.slice.call(box.children);
    rows.sort(function (a, b) {
      var ra = probeState.results[a.dataset.mirror];
      var rb = probeState.results[b.dataset.mirror];
      if (ra === undefined) ra = Infinity;
      if (rb === undefined) rb = Infinity;
      return ra - rb;
    });
    rows.forEach(function (r) { box.appendChild(r); });
  }

  function probe(m, rawUrl, attempt) {
    attempt = attempt || 1;
    var started = Date.now();
    var done = false;
    var ctrl = null;
    var url = m.prefix + rawUrl;
    m._status.className = 'mirror-status wait';
    m._status.textContent = attempt > 1 ? '重试中…' : '测速中…';

    var finish = function (ok, ms, note) {
      if (done) return;
      done = true;
      // 失败允许重试一次：这些公益节点抖动很厉害，一次超时不代表挂了
      if (!ok && attempt < 2) {
        setTimeout(function () { probe(m, rawUrl, attempt + 1); }, 400);
        return;
      }
      probeState.pending--;
      probeState.results[m.name] = ok ? ms : Infinity;
      m.ms = ok ? ms : Infinity;
      if (ok) {
        m._row.classList.add('best');
        m._status.className = 'mirror-status ok';
        m._status.textContent = tier(ms) + ' · ' + ms + 'ms';
        // 这个节点测通了才解锁它自己的下载按钮
        if (m._link) {
          m._link.classList.remove('is-disabled');
          m._link.removeAttribute('aria-disabled');
        }
      } else {
        m._row.classList.remove('best');
        m._status.className = 'mirror-status bad';
        m._status.textContent = '连不上';
      }
      if (probeState.pending <= 0) onAllProbed();
    };

    var timer = setTimeout(function () { if (ctrl) try { ctrl.abort(); } catch (e) {} finish(false); }, MIRROR_TIMEOUT);

    // no-cors 模式下 Range 头会被浏览器静默丢弃，等于在后台下整个文件。
    // 所以在「拿到响应头」的瞬间立刻 abort，只保留首包耗时，不浪费流量。
    ctrl = ('AbortController' in window) ? new AbortController() : null;
    try {
      fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: ctrl ? ctrl.signal : undefined
      })
        .then(function () {
          var ms = Date.now() - started;
          if (ctrl) { try { ctrl.abort(); } catch (e) {} }
          clearTimeout(timer);
          finish(true, ms);
        })
        .catch(function () { clearTimeout(timer); finish(false); });
    } catch (e) {
      clearTimeout(timer);
      finish(false);
    }
  }

  function onAllProbed() {
    probeState.done = true;
    reorderMirrors();
    var best = null;
    MIRRORS.forEach(function (m) {
      if (m.ms !== undefined && m.ms !== Infinity && (!best || m.ms < best.ms)) best = m;
    });
    probeState.best = best;
    updatePrimaryDownload();
    var route = document.querySelector('[data-ver="route"]');
    if (route) {
      if (best) {
        route.textContent = '已自动选择最快节点：' + best.name + '（' + best.ms + 'ms）。按钮点下去就是它。';
      } else {
        route.textContent = '这次测速都没通（这些公益节点经常抽风）。主按钮还是指向 ' + MIRRORS[0].name +
          '，多试几次，或者手动点下面的节点。';
      }
    }
  }

  // 把主下载按钮切到「锁定」状态，并写明原因
  function lockPrimaryDownload(reason) {
    document.querySelectorAll('.js-download[data-dl="primary"]').forEach(function (el) {
      el.setAttribute('href', '#download');
      el.classList.add('is-disabled');
      el.setAttribute('aria-disabled', 'true');
      var note = el.querySelector('.dl-via');
      if (!note) {
        note = document.createElement('em');
        note.className = 'dl-via';
        el.appendChild(note);
      }
      note.textContent = reason;
      note.classList.add('weak');
    });
  }

  function updatePrimaryDownload() {
    var raw = relState.rawUrl;

    // 第 1 道闸：没拿到真实文件地址 → 锁死。
    // 否则小白会被丢进 GitHub 的英文 Release 页面，或者点到一个拼坏的链接。
    if (!raw || !relState.isFileUrl) {
      lockPrimaryDownload(relState.source === 'none' ? '版本没取到，往下滚手动下载' : '正在获取版本…');
      return;
    }

    // 第 2 道闸：地址有了，但线路还没挑完 → 照样锁死。
    // 挑线路期间解锁按钮 = 让用户用一条没验证过的线路，点了可能半天不动。
    if (!probeState.done) {
      lockPrimaryDownload('正在挑最快的线路…');
      return;
    }

    // 两道闸都过了，才选线路并解锁
    var isGithub = /^https:\/\/github\.com\//.test(raw);
    var prefix, noteText;
    if (probeState.best) {
      prefix = probeState.best.prefix;
      noteText = '已自动选好线路';
    } else {
      // 所有节点都没测通。这时指向默认节点，并如实说明；
      // 绝不回 GitHub —— 国内那个才是真连不上的。
      prefix = MIRRORS[0].prefix;
      noteText = '线路不太好，下载慢就换下面的';
    }
    var chosen = (prefix && isGithub) ? (prefix + raw) : raw;
    document.querySelectorAll('.js-download[data-dl="primary"]').forEach(function (el) {
      el.setAttribute('href', chosen);
      el.setAttribute('rel', 'noopener');
      el.setAttribute('data-via', prefix ? 'mirror' : 'github');
      el.classList.remove('is-disabled');
      el.removeAttribute('aria-disabled');
      var note = el.querySelector('.dl-via');
      if (!note) {
        note = document.createElement('em');
        note.className = 'dl-via';
        el.appendChild(note);
      }
      note.textContent = noteText;
      note.classList.toggle('weak', !probeState.best);
    });
    // 注意：这里不解锁镜像列表的按钮。每个节点要等自己测通了才解锁（见 probe 里）。
  }

  /* ---- 数据加载：实时 API → 本地快照 ---- */
  function loadReleases(force) {
    if (relState.data && !force) { render(); return; }
    setVer('source', '正在连 GitHub…');
    fetch(RELEASES_API, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (raw) {
        var list = normalize(raw);
        if (!list.length) throw new Error('empty');
        relState.data = list;
        relState.source = 'live';
        render();
      })
      .catch(function () {
        // 实时失败 → 退到本地快照
        fetch(SNAPSHOT_URL, { cache: 'no-store' })
          .then(function (r) { if (!r.ok) throw new Error('snapshot ' + r.status); return r.json(); })
          .then(function (raw) {
            var list = normalize(raw);
            if (!list.length) throw new Error('empty snapshot');
            relState.data = list;
            relState.source = 'snapshot';
            render();
          })
          .catch(function () {
            relState.data = [];
            relState.source = 'none';
            render();
          });
      });
  }

  function bindDownload() {
    var btn = document.getElementById('verRefresh');
    if (btn) btn.addEventListener('click', function () { loadReleases(true); });

    // 禁用状态的下载链接：一律拦截，别把用户丢到 GitHub
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.is-disabled');
      if (!a) return;
      e.preventDefault();
      e.stopPropagation();
      if (relState.rawUrl) {
        toast('线路还在挑，稍等一下～ 急的话往下滚，手动挑一个节点');
      } else {
        toast('版本还没拿到，稍等一下～ 或者滚到下面手动下载');
      }
    }, true);

    loadReleases(false);
    // 版本号实时性：回到页面时刷一次
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && relState.source !== 'live') loadReleases(true);
    });
  }

  bindDownload();

  /* ---------- 宠物状态轮播 ---------- */
  var STATES = [
    { key: 'idle',  chip: '摩尼正在待命' },
    { key: 'work',  chip: '摩尼正在干活' },
    { key: 'cry',   chip: '摩尼出问题了' },
    { key: 'sleep', chip: '摩尼睡着了' }
  ];
  var petImg = document.getElementById('heroPet');
  var chipText = document.getElementById('heroChip');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.pet-card-sm'));
  var idx = 0;
  var locked = false;
  var lockTimer = null;

  function applyPet(state, animate) {
    if (!petImg || !state) return;
    var src = 'assets/pet/' + state.key + '.png';
    if (petImg.getAttribute('src') !== src) {
      if (animate) {
        petImg.classList.add('swap');
        setTimeout(function () { petImg.src = src; petImg.classList.remove('swap'); }, 220);
      } else {
        petImg.src = src;
      }
    }
    if (chipText) {
      var dot = chipText.querySelector('.dot');
      chipText.textContent = state.chip;
      if (dot) chipText.prepend(dot);
    }
    cards.forEach(function (c) {
      c.classList.toggle('active', c.dataset.state === state.key);
    });
  }

  function tick() {
    if (locked) return;
    idx = (idx + 1) % STATES.length;
    applyPet(STATES[idx], true);
  }
  var timer = window.setInterval(tick, 4600);

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var match = null;
      STATES.forEach(function (s) { if (s.key === card.dataset.state) match = s; });
      if (!match) return;
      idx = STATES.indexOf(match);
      locked = true;
      clearTimeout(lockTimer);
      lockTimer = setTimeout(function () { locked = false; }, 14000);
      applyPet(match, true);
    });
  });

  /* 页面不可见时省点电 */
  document.addEventListener('visibilitychange', function () {
    window.clearInterval(timer);
    if (!document.hidden) timer = window.setInterval(tick, 4600);
  });
})();
