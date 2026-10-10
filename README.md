# MollyPaw 官网

> **Your AI, right at your paw.**

MollyPaw 桌面客户端的官方落地页。纯静态，零依赖，零构建步骤 —— 双击 `index.html` 就能看。

## 线上地址

- **Cloudflare Pages**：https://mollypaw.pages.dev ← 主站
- **GitHub Pages**：https://lk-blog.github.io/MollyPaw-WebSite/ （备用）

## 结构

```
MollyPaw WebSite/
├── index.html                # 单页站点
├── demo/                     # 在线试用：主仓库真实前端 + 假 API
├── releases.json             # Release 快照（实时 API 挂了时的兜底）
├── _headers                  # Cloudflare Pages 缓存 / 安全响应头
├── robots.txt  sitemap.xml
├── assets/
│   ├── css/style.css         # 全部样式（品牌 token 在 :root）
│   ├── js/main.js            # 导航 / 模式切换 / 版本 / 镜像 / 宠物
│   ├── shots/                # 产品截图（也是 og:image）
│   ├── favicon.svg
│   └── pet/                  # 宠物精灵图（已裁切、去底、透明）
│       ├── idle.png  work.png  cry.png  sleep.png
├── tools/
│   ├── prep_assets.py        # 从 D:\MollyPaw Agent\assets\pet 生成宠物图
│   ├── fetch_releases.py     # 刷新 releases.json 快照
│   ├── build_demo.py         # 用真实前端生成 demo/
│   ├── make_screenshots.py   # 生成 assets/shots/
│   └── audit.js              # 无头浏览器验收脚本
└── README.md
```

## 部署

主站走 Cloudflare Pages：

```bash
wrangler pages deploy . --project-name=mollypaw --branch=main
```

改了 `assets/` 或 `index.html` 都要重新部署一次，Cloudflare 不会自动同步本地改动。

## 三个模式的开关

`小白版 / 技术版` 存在 `localStorage.mollypaw-mode`，也可以用 `?mode=lite` / `?mode=dev` 强制指定。
技术版会自动套暗色主题（brand 禁冷色，暗色底是深棕不是灰）。

## 本地预览

直接开文件也行，但要用无缓存的方式看得更准：

```bash
cd "D:\MollyPaw WebSite"
python -m http.server 8080
# 然后打开 http://127.0.0.1:8080
```

## 配色（严格来自 BRAND.md）

| 用途 | 变量 | 色值 |
|------|------|------|
| 主文字 / 标题 | `--brown-700` | `#6B4226` |
| 导航 / 次级元素 | `--brown-600` | `#8B5E3C` |
| 悬停 / 装饰 | `--brown-500` | `#A67B5B` |
| 背景渐变 / 卡片底 | `--brown-300` | `#D2B48C` |
| 页面底色（米白） | `--cream` | `#FFF8F0` |
| 卡片（纯白） | `--white` | `#FFFFFF` |
| 分隔线 | `--brown-100` | `#F5EDE3` |
| CTA / 高亮（爪印橙） | `--orange` | `#D4823A` |
| 代码块底（摩尼黑） | `--brown-900` | `#3A2A1A` |

换肤只改 `style.css` 顶部 `:root` 那一块，别处不要写死色值。

## 重新生成宠物图

```bash
python tools/prep_assets.py
```

从 `D:\MollyPaw Agent\assets\pet\pet_*.png` 读原图，去底、裁切、缩到 512px 内，输出到 `assets/pet/`。

## 部署

纯静态，扔哪都行：

- **GitHub Pages** — 仓库 Settings → Pages → 根目录
- **Cloudflare Pages / Vercel / Netlify** — 无构建命令，输出目录填 `.`
- **自己的服务器** — 拷 `index.html` + `assets/` 到站点根目录

## 维护提醒

- 站点文案里的版本号、Release 链接、里程碑状态跟主仓库同步，改主仓库顺手改这里。
- 品牌禁忌：不用冷色当主色、不用纯黑当正文色、不做花哨装饰动画。

GPLv3 · 灵感来自摩尼，一只可乐色和白色的小泰迪犬。
