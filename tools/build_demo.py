# -*- coding: utf-8 -*-
"""把真实前端打包成官网上的「在线试用」假实例。

- 复制 D:\\MollyPaw Agent\\frontend 到站点 demo/ 目录
- 注入 fetch 拦截器：所有 /api/* 都返回假数据，不碰任何真服务
- 禁止发消息：点发送 / 按回车都会被拦下并提示
- 顶部加一条演示横幅

用法：
    python tools/build_demo.py
"""
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = r"D:\MollyPaw Agent\frontend"
DST = os.path.join(ROOT, "demo")
FILES = ["style.css", "marked.min.js", "app.js"]

# 站点文案里的平台口径：只支持 Windows。演示数据里不许出现别的系统。
PROVIDERS = ["deepseek", "kimi", "qwen", "custom"]

DEMO_CSS = """
/* --- 官网演示模式专用，不影响真实前端 --- */
#demo-banner {
  position: fixed; inset: 0 0 auto 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  height: 34px; background: #6B4226; color: #FFF8F0;
  font: 600 12.5px/1 "PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  letter-spacing: .02em;
}
#demo-banner b { color: #E8B37B; }
#demo-banner .demo-cta {
  background: #D4823A; color: #fff; text-decoration: none;
  padding: 5px 12px; border-radius: 999px; font-weight: 700;
}
#demo-toast {
  position: fixed; left: 50%; bottom: 26px; transform: translate(-50%, 14px);
  background: #3A2A1A; color: #FFF8F0; padding: 10px 20px; border-radius: 999px;
  font: 600 13px/1 "PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  box-shadow: 0 10px 30px rgba(0,0,0,.3); opacity: 0; pointer-events: none;
  transition: opacity .25s ease, transform .25s ease; z-index: 9999; white-space: nowrap;
}
#demo-toast.show { opacity: 1; transform: translate(-50%, 0); }
html body { padding-top: 34px; box-sizing: border-box; height: 100vh; }
#send-btn { opacity: .55; cursor: not-allowed; }
"""

BANNER = """
<div id="demo-banner">
  <span>🧪 <b>在线演示</b> · 假数据，随便点，发不出消息</span>
  <a class="demo-cta" href="../index.html#download" target="_top">下载真货</a>
</div>
<div id="demo-toast"></div>
"""

MOCK = r"""
<script>
(function () {
  var CONVS = [
    { id: 'c1', title: '整理下载文件夹' },
    { id: 'c2', title: '读一下这份合同的风险点' },
    { id: 'c3', title: '把周报翻译成英文' },
    { id: 'c4', title: '写个批量改文件名的脚本' },
    { id: 'c5', title: '解释 PyWebView 工作原理' }
  ];

  var SCRIPT = {
    c1: [
      { role: 'user', content: '帮我把 D:\\Downloads 里的图片按月份分到子文件夹里' },
      { role: 'assistant', content:
        '好嘞～ 我先去翻一下那个文件夹里有什么 🐾\n\n' +
        '**扫完了**，一共 **143 个图片文件**，从 2026-03 一直到 2026-09。\n\n' +
        '我先把方案说给你听，你点头我再动手：\n\n' +
        '- 按 `YYYY-MM` 建 7 个文件夹\n' +
        '- 重名的自动加序号，**不覆盖你原来的文件**\n\n' +
        '顺便，里面还混着 4 个不是图片的东西：`readme.txt`、`setup.exe`、`data.csv`、`note.md`。\n' +
        '这几个我打算**碰都不碰**，可以吧？回个「好」我就开始 🐶' },
      { role: 'user', content: '好，那几个留着。顺手把文件名里的空格换成下划线' },
      { role: 'assistant', content:
        '搞定啦～ **143 个文件全部搬完 + 改完名** 🐾\n\n' +
        '空格都换成下划线了，中文名一个没动：\n\n' +
        '> `IMG 2026 05 快递单.jpg` → `IMG_2026_05_快递单.jpg`\n\n' +
        '原来长什么样我记在 `rename_log.json` 里了，**想撤销随时喊我**，一条命令的事～' },
      { role: 'user', content: '那个 log 文件放哪了？' },
      { role: 'assistant', content:
        '就在 `D:\\Downloads\\rename_log.json`，跟图片放在一块儿了。\n\n' +
        '我故意没往系统目录塞东西，省得你以后找不到 😄 要删的话说一声，我顺手清掉。' }
    ],
    c2: [
      { role: 'user', content: '读一下 D:\\合同\\采购协议.pdf，告诉我对我不利的条款' },
      { role: 'assistant', content:
        '看完啦，一共 12 页 🐾 我挑出 **3 处你得留个心眼**的地方：\n\n' +
        '**① 第 4.2 条 · 付款节奏**\n预付款 60%，交付后 30 天内付清。这年头常见的是 30/70，这条对你现金流不太友好。\n\n' +
        '**② 第 7.1 条 · 违约金**\n只约了供方违约怎么办，**没写你违约怎么办** —— 单向的，不太对等。\n\n' +
        '**③ 第 9.3 条 · 争议管辖**\n写的是对方所在地法院。万一真闹起来，你得出差打官司。\n\n' +
        '⚠️ 顺便说一句：我只是帮你读文件，**不是律师**，真要签还是找专业的人过一眼。\n\n' +
        '要我把这 3 条整理成一份修改建议的 Word，放到 `D:\\合同\\` 里吗？' }
    ],
    c3: [
      { role: 'user', content: '把 D:\\周报.md 翻译成英文，保持 markdown 格式' },
      { role: 'assistant', content:
        '翻好啦～ 写到 `D:\\周报_EN.md` 了 🐾\n\n' +
        '标题层级、列表、代码块**全部原样保留**。专有名词按你之前定的规矩没翻：`MollyPaw`、`PyWebView`、`AgentCore`。\n\n' +
        '对了，原文第 3 段少了个句号，我**没自作主张补**，保持跟原文一致。要补的话跟我说～' }
    ],
    c4: [
      { role: 'user', content: '写个脚本，把文件夹里所有 .jpeg 改成 .jpg' },
      { role: 'assistant', content:
        '写好放 `D:\\rename_ext.py` 了 🐾\n\n' +
        '**默认是预览模式**，不加 `--apply` 绝对不会真改文件，你放心跑：\n\n' +
        '```python\nfor p in Path(root).rglob("*.jpeg"):\n    if p.with_suffix(".jpg").exists():\n        print("skip", p.name)   # 不覆盖已有的 .jpg\n        continue\n    print("rename", p.name)\n```\n\n' +
        '先跑一遍预览，把输出贴给我看看，确认没问题再加 `--apply` 真改～' }
    ],
    c5: [
      { role: 'user', content: '解释一下 PyWebView 到底怎么工作的' },
      { role: 'assistant', content:
        '核心就一句：它**不打包浏览器**，直接借系统自带的 Web 引擎开窗口 🐾\n\n' +
        '**1. 窗口从哪来**\n' +
        'PyWebView 自己不渲染页面，它只是个「遥控器」：调系统 API 开一个原生窗口，' +
        '里面塞一个系统 Web 控件。Windows 上是 **WebView2**（Edge 内核，Win10/11 自带）。\n\n' +
        '**2. Python 和页面怎么说话**\n' +
        '页面和 Python 是两个进程之外的东西，得有个通道。常见走法是搞一个本地 HTTP 服务，' +
        '前端用 `fetch` 打 `/api/*`，Python 那头收到就干活。\n\n' +
        '**3. 为什么不用 `js_api`**\n' +
        'PyWebView 自带 `window.pywebview.api` 那套桥接，但它**会卡死 UI** —— ' +
        '窗口线程和 Python 调用互相等，一旦同步调用就锁住。所以改用 HTTP + 轮询：\n' +
        '先返回 `pending`，真结果丢进队列，前端从 `GET /api/events` 定时取。\n\n' +
        '代价是有一点延迟（轮询间隔），换来的是界面永远不卡。' }
    ]
  };

  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  var queue = [];   // 模拟真实后端的 pending→event 机制

  function push(name, payload) {
    queue.push({ name: name, payload: payload });
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('127.0.0.1:18765') === -1) {
      return realFetch ? realFetch(input, init) : Promise.reject(new Error('blocked'));
    }
    var path = url.replace(/^https?:\/\/127\.0\.0\.1:18765/, '');
    var payload = { ok: true };
    var body = {};
    try { body = JSON.parse((init && init.body) || '{}'); } catch (e) {}

    if (path.indexOf('/api/events') === 0) {
      // 把攒下的事件一次性交给前端（真实后端就是这么干的）
      payload = { ok: true, events: queue.splice(0, queue.length) };
    } else if (path.indexOf('/api/conversations/load') === 0) {
      var id = body.id || 'c1';
      push('_onLoadConversationResult', {
        ok: true,
        conversation: { id: id, title: id, messages: SCRIPT[id] || SCRIPT.c1 }
      });
      payload = { ok: true, pending: true };
    } else if (path.indexOf('/api/conversations/delete') === 0) {
      var did = body.id;
      CONVS = CONVS.filter(function (c) { return c.id !== did; });
      push('_onConversationsResult', { ok: true, conversations: CONVS });
      payload = { ok: true, pending: true };
    } else if (path.indexOf('/api/conversations/new') === 0) {
      var nid = 'n' + (CONVS.length + 1);
      CONVS.unshift({ id: nid, title: '\u65b0\u5bf9\u8bdd' });
      push('_onConversationsResult', { ok: true, conversations: CONVS });
      push('_onNewConversationResult', { ok: true, id: nid });
      payload = { ok: true, pending: true };
    } else if (path.indexOf('/api/conversations') === 0) {
      payload = { ok: true, conversations: CONVS };
    } else if (path.indexOf('/api/balance') === 0) {
      payload = { ok: true, supported: true, currency: 'CNY', balance: 12.83,
                  balances: [{ currency: 'CNY', balance: 12.83 }, { currency: 'USD', balance: 1.76 }] };
    } else if (path.indexOf('/api/models') === 0) {
      payload = { ok: true, models: ['deepseek-flash'] };
    } else if (path.indexOf('/api/providers') === 0) {
      payload = { ok: true, providers: [
        { id: 'deepseek', display_name: 'DeepSeek', base_url: 'https://api.deepseek.com/v1', protocol: 'chat' },
        { id: 'kimi', display_name: 'Kimi / Moonshot', base_url: 'https://api.moonshot.cn/v1', protocol: 'chat' },
        { id: 'qwen', display_name: 'Qwen / DashScope', base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', protocol: 'chat' },
        { id: 'custom', display_name: 'Custom', base_url: '', protocol: 'chat' }
      ] };
    } else if (path.indexOf('/api/sleep') === 0) {
      payload = { ok: true, settings: { mode: 'off', tasks: ['memory', 'review', 'dream'], max_llm_calls: 100 } };
    } else if (path.indexOf('/api/config') === 0) {
      payload = { ok: true, config: {
        provider_id: 'deepseek', model: 'deepseek-flash', base_url: 'https://api.deepseek.com/v1',
        protocol: 'chat', approval_mode: 'full_access', language: 'zh',
        temperature: 0.7, max_tokens: 2048, api_key: 'sk-demo-not-a-real-key'
      } };
    } else if (path.indexOf('/api/chat') === 0) {
      // 演示模式绝不真的发消息，也不回任何内容
      payload = { ok: true, pending: true };
    } else {
      payload = { ok: true, demo: true };
    }

    return Promise.resolve({
      ok: true, status: 200,
      json: function () { return Promise.resolve(payload); },
      text: function () { return Promise.resolve(JSON.stringify(payload)); }
    });
  };

  window.__DEMO__ = { convs: CONVS, script: SCRIPT };
})();
</script>
"""

LOCK = r"""
<script>
(function () {
  // 嵌在 iframe 里时，焦点被抢会把父页面滚走 —— 演示页直接禁掉自动 focus
  var EMBEDDED = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  if (EMBEDDED) {
    var realFocus = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function () {
      // 只有用户主动点进来时才允许聚焦，避免页面自己抢焦点
      if (document.__userInteracted) return realFocus.apply(this, arguments);
    };
    document.addEventListener('mousedown', function () { document.__userInteracted = true; }, true);
    document.addEventListener('touchstart', function () { document.__userInteracted = true; }, true);
  }

  var toastEl = document.getElementById('demo-toast');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }
  window.__demoToast = toast;

  // 1) 拦住发送按钮（捕获阶段，抢在 app.js 之前）
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('#send-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    toast('\u6f14\u793a\u6a21\u5f0f\u53d1\u4e0d\u51fa\u6d88\u606f \u2014\u2014 \u4e0b\u8f7d\u540e\u63a5\u4f60\u81ea\u5df1\u7684\u6a21\u578b\u5c31\u80fd\u804a\u4e86');
  }, true);

  // 2) 拦住回车发送
  document.addEventListener('keydown', function (e) {
    var ta = e.target;
    if (!ta || ta.id !== 'user-input') return;
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    e.stopPropagation();
    toast('\u6f14\u793a\u6a21\u5f0f\u53d1\u4e0d\u51fa\u6d88\u606f \u2014\u2014 \u4e0b\u8f7d\u540e\u63a5\u4f60\u81ea\u5df1\u7684\u6a21\u578b\u5c31\u80fd\u804a\u4e86');
  }, true);

  // 3) 兜底：任何指向 /api/chat 的请求直接掐断
  var realFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('/api/chat') !== -1) {
      toast('\u6f14\u793a\u6a21\u5f0f\u53d1\u4e0d\u51fa\u6d88\u606f');
      return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve({ ok: true, pending: true }); } });
    }
    return realFetch.apply(this, arguments);
  };

  // 4) 渲染假对话 + 预置用量
  window.addEventListener('load', function () {
    setTimeout(function () {
      var api = window.__DEMO__;
      if (!api) return;
      if (window._onConversationsResult) window._onConversationsResult({ ok: true, conversations: api.convs });
      if (window._onBalanceResult) window._onBalanceResult({ ok: true, supported: true, currency: 'CNY', balance: 12.83,
        balances: [{ currency: 'CNY', balance: 12.83 }, { currency: 'USD', balance: 1.76 }] });
      if (window._onConfigResult) window._onConfigResult({ ok: true, config: {
        provider_id: 'deepseek', model: 'deepseek-flash', base_url: 'https://api.deepseek.com/v1',
        protocol: 'chat', approval_mode: 'full_access', language: 'zh', temperature: 0.7, max_tokens: 2048
      } });
      if (window._onModelsResult) window._onModelsResult({ ok: true, models: ['deepseek-flash'] });
      if (window._onLoadConversationResult) {
        window._onLoadConversationResult({ ok: true, conversation: { id: 'c1', messages: api.script.c1 } });
      }
      var first = document.querySelector('.history-item');
      if (first) first.classList.add('active');
      var box = document.querySelector('.messages');
      if (box) box.classList.add('has-messages');
      var ta = document.getElementById('user-input');
      if (ta && !ta.value) ta.placeholder = '\u6f14\u793a\u6a21\u5f0f\uff1a\u80fd\u6253\u5b57\uff0c\u53d1\u4e0d\u51fa\u53bb';
    }, 500);
  });
})();
</script>
"""


def main():
    if not os.path.isdir(SRC):
        print("找不到前端目录: %s" % SRC)
        return 1

    if os.path.isdir(DST):
        shutil.rmtree(DST)
    os.makedirs(DST)

    for name in FILES:
        shutil.copy2(os.path.join(SRC, name), os.path.join(DST, name))

    # 真实 app.js 加载时会 userInput.focus()。嵌在 iframe 里会把父页面拽着滚下去，
    # 所以演示副本里把这几次 focus 去掉（只改演示副本，不动主仓库）。
    app_path = os.path.join(DST, "app.js")
    with open(app_path, encoding="utf-8") as f:
        app = f.read()
    app = re.sub(r"\b(userInput|ta|input)\.focus\(\)\s*;", "/* focus disabled in demo */;", app)
    with open(app_path, "w", encoding="utf-8") as f:
        f.write(app)

    with open(os.path.join(SRC, "index.html"), encoding="utf-8") as f:
        html = f.read()

    # 演示横幅样式 + mock 在 app.js 之前跑 → 都插到 </head> 前
    html = html.replace("</head>", "<style>%s</style>\n%s\n</head>" % (DEMO_CSS, MOCK), 1)
    # 横幅 DOM + 锁，插到 </body> 前
    html = html.replace("</body>", BANNER + LOCK + "</body>", 1)

    out = os.path.join(DST, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    print("[ok] %s" % out)
    print("     共 %d 个文件，大小 %.1f KB" % (
        len(os.listdir(DST)),
        sum(os.path.getsize(os.path.join(DST, n)) for n in os.listdir(DST)) / 1024.0))
    return 0


if __name__ == "__main__":
    sys.exit(main())
