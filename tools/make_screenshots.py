# -*- coding: utf-8 -*-
"""用真实前端（D:\\MollyPaw Agent\\frontend）生成官网产品界面截图。

思路：不手搓 DOM。直接把真实 index.html 复制过来，在它前面塞一个 fetch 拦截器，
      把 /api/* 全喂成假数据，让 app.js 自己渲染出真实界面，再用无头浏览器截图。

用法：
    python tools/make_screenshots.py
产物：
    assets/shots/app-chat.png     有对话的界面
    assets/shots/app-welcome.png  欢迎页
"""
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = r"D:\MollyPaw Agent\frontend"
WORK = os.path.join(ROOT, ".shots-build")
OUT = os.path.join(ROOT, "assets", "shots")

EDGE_CANDIDATES = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]

MOCK = r"""
<script>
(function () {
  var CONVS = [
    { id: 'c1', title: '\u6574\u7406\u4e0b\u8f7d\u6587\u4ef6\u5939' },
    { id: 'c2', title: '\u8bfb\u4e00\u4e0b\u8fd9\u4efd\u5408\u540c\u7684\u98ce\u9669\u70b9' },
    { id: 'c3', title: '\u628a\u5468\u62a5\u7ffb\u8bd1\u6210\u82f1\u6587' },
    { id: 'c4', title: '\u5199\u4e2a\u6279\u91cf\u6539\u6587\u4ef6\u540d\u7684\u811a\u672c' },
    { id: 'c5', title: '\u89e3\u91ca PyWebView \u5de5\u4f5c\u539f\u7406' }
  ];

  var MSGS = [
    { role: 'user', content: '\u5e2e\u6211\u628a D:\\Downloads \u91cc\u7684\u56fe\u7247\u6309\u6708\u4efd\u5206\u5230\u5b50\u6587\u4ef6\u5939\u91cc' },
    { role: 'assistant', content:
      '\u597d\u7684\uff0c\u6211\u5148\u770b\u4e00\u4e0b\u91cc\u9762\u6709\u5565\u3002\n\n' +
      '**\u626b\u63cf\u7ed3\u679c**\uff1a\u5171 143 \u4e2a\u56fe\u7247\u6587\u4ef6\uff0c\u65f6\u95f4\u8de8\u5ea6 2026-03 \u5230 2026-09\u3002\n\n' +
      '\u6211\u6309 `YYYY-MM` \u5efa\u597d\u4e86 7 \u4e2a\u6587\u4ef6\u5939\uff0c\u540c\u540d\u51b2\u7a81\u7684\u81ea\u52a8\u52a0\u4e86\u5e8f\u53f7\u3002\n\n' +
      '- `2026-03/` \u2014 12 \u5f20\n- `2026-04/` \u2014 26 \u5f20\n- `2026-05/` \u2014 31 \u5f20\n\n' +
      '\u5269\u4e0b 4 \u4e2a\u4e0d\u662f\u56fe\u7247\u7684\u6587\u4ef6\u6211\u6ca1\u52a8\uff1a`readme.txt`\u3001`setup.exe`\u3001`data.csv`\u3001`note.md`\u3002' },
    { role: 'user', content: '\u4e0d\u7528\uff0c\u90a3\u51e0\u4e2a\u7559\u7740\u3002\u987a\u4fbf\u628a\u6587\u4ef6\u540d\u91cc\u7684\u7a7a\u683c\u6362\u6210\u4e0b\u5212\u7ebf' },
    { role: 'assistant', content:
      '\u641e\u5b9a\u3002**143 \u4e2a\u6587\u4ef6\u5168\u90e8\u91cd\u547d\u540d\u5b8c\u6bd5**\uff0c\u7a7a\u683c \u2192 \u4e0b\u5212\u7ebf\uff0c\u4e2d\u6587\u540d\u4fdd\u7559\u3002\n\n' +
      '> `IMG 2026 05 \u5feb\u9012\u5355.jpg` \u2192 `IMG_2026_05_\u5feb\u9012\u5355.jpg`\n\n' +
      '\u9700\u8981\u64a4\u9500\u7684\u8bdd\u544a\u8bc9\u6211\uff0c\u539f\u59cb\u6587\u4ef6\u540d\u6211\u8bb0\u5728 `rename_log.json` \u91cc\u4e86\u3002' }
  ];

  // 只拦 18765 的 /api/*，其余照常
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('127.0.0.1:18765') === -1) {
      return realFetch ? realFetch(input, init) : Promise.reject(new Error('no fetch'));
    }
    var path = url.replace(/^https?:\/\/127\.0\.0\.1:18765/, '');
    var payload = { ok: true };
    if (path.indexOf('/api/events') === 0) payload = { ok: true, events: [] };
    else if (path.indexOf('/api/conversations') === 0) payload = { ok: true, conversations: CONVS };
    else if (path.indexOf('/api/config') === 0) payload = {
      ok: true,
      config: {
        provider_id: 'deepseek', model: 'deepseek-flash', base_url: 'https://api.deepseek.com/v1',
        protocol: 'chat', approval_mode: 'full_access', language: 'zh', temperature: 0.7, max_tokens: 2048
      }
    };
    else if (path.indexOf('/api/balance') === 0) payload = {
      ok: true, supported: true, currency: 'CNY', balance: 12.83,
      balances: [{ currency: 'CNY', balance: 12.83 }, { currency: 'USD', balance: 1.76 }]
    };
    else if (path.indexOf('/api/models') === 0) payload = {
      ok: true, models: ['deepseek-flash']
    };
    return Promise.resolve({
      ok: true, status: 200,
      json: function () { return Promise.resolve(payload); },
      text: function () { return Promise.resolve(JSON.stringify(payload)); }
    });
  };

  window.__SHOT__ = {
    convs: CONVS,
    msgs: MSGS
  };
})();
</script>
"""


def find_browser():
    for p in EDGE_CANDIDATES:
        if os.path.exists(p):
            return p
    raise SystemExit("找不到 Edge/Chrome，自己装一个再来")


def build(page_name, inject_after_boot, size):
    """把真实前端 + mock + 渲染脚本组装成一个临时页面。"""
    with open(os.path.join(SRC, "index.html"), encoding="utf-8") as f:
        html = f.read()

    driver = """
<script>
window.addEventListener('load', function () {
  setTimeout(function () {
    var api = window.__SHOT__;
    if (window._onConversationsResult) window._onConversationsResult({ ok: true, conversations: api.convs });
    if (window._onBalanceResult) window._onBalanceResult({ ok: true, supported: true, currency: 'CNY', balance: 12.83, balances: [{ currency: 'CNY', balance: 12.83 }, { currency: 'USD', balance: 1.76 }] });
    if (window._onConfigResult) window._onConfigResult({ ok: true, config: {
      provider_id: 'deepseek', model: 'deepseek-flash', base_url: 'https://api.deepseek.com/v1',
      protocol: 'chat', approval_mode: 'full_access', language: 'zh', temperature: 0.7, max_tokens: 2048
    } });
    if (window._onModelsResult) window._onModelsResult({ ok: true, models: ['deepseek-flash'] });
""" + inject_after_boot + """
  }, 400);
});
</script>
"""

    # mock 必须在 app.js 之前执行 → 插到 </head> 前
    html = html.replace("</head>", MOCK + "</head>", 1)
    html = html.replace("</body>", driver + "</body>", 1)

    path = os.path.join(WORK, page_name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    return path


CHAT_DRIVER = """
    if (window._onLoadConversationResult) {
      window._onLoadConversationResult({ ok: true, conversation: { id: 'c1', messages: api.msgs } });
    }
    var items = document.querySelectorAll('.history-item');
    if (items[0]) items[0].classList.add('active');
    var t = document.querySelector('.messages');
    if (t) t.classList.add('has-messages');
"""

WELCOME_DRIVER = """
    var t = document.querySelector('.messages');
    if (t) t.classList.remove('has-messages');
"""


def shoot(browser, url, out_png, size):
    subprocess.run([
        browser, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=2",
        "--window-size=%s" % size,
        "--virtual-time-budget=8000",
        "--screenshot=%s" % out_png,
        url,
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
    ok = os.path.exists(out_png) and os.path.getsize(out_png) > 5000
    print(("[ok] " if ok else "[FAIL] ") + out_png)
    return ok


def main():
    if not os.path.isdir(SRC):
        raise SystemExit("找不到前端目录: %s" % SRC)
    os.makedirs(WORK, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)

    # 真实前端的静态资源
    for name in ("style.css", "marked.min.js", "app.js"):
        shutil.copy2(os.path.join(SRC, name), os.path.join(WORK, name))

    browser = find_browser()
    chat = build("chat.html", CHAT_DRIVER, "1200x820")
    welcome = build("welcome.html", WELCOME_DRIVER, "1200x820")

    uri = "file:///" + WORK.replace("\\", "/").replace(" ", "%20")
    ok1 = shoot(browser, uri + "/chat.html", os.path.join(OUT, "app-chat.png"), "1200x820")
    ok2 = shoot(browser, uri + "/welcome.html", os.path.join(OUT, "app-welcome.png"), "1200x820")
    return 0 if (ok1 and ok2) else 1


if __name__ == "__main__":
    sys.exit(main())
