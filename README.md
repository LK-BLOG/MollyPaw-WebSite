# MollyPaw 官网

> **Your AI, right at your paw.**

MollyPaw 桌面客户端的官方落地页。纯静态，零依赖，零构建步骤 —— 双击 `index.html` 就能看。

## 结构

```
MollyPaw WebSite/
├── index.html                # 单页站点
├── robots.txt
├── assets/
│   ├── css/style.css         # 全部样式（品牌 token 在 :root）
│   ├── js/main.js            # 导航 / 滚动动画 / 复制 / 宠物轮播
│   ├── favicon.svg
│   └── pet/                  # 宠物精灵图（已裁切、去底、透明）
│       ├── idle.png  work.png  cry.png  sleep.png
├── tools/prep_assets.py      # 从 D:\MollyPaw Agent\assets\pet 生成上面的图
└── README.md
```

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
