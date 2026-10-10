# -*- coding: utf-8 -*-
"""给官网裁切 + 去底 MollyPaw 宠物精灵图。

关键点：不能用「颜色接近背景就抠掉」——眼白和背景都是浅色，会被一起打穿，
            在暗色模式下眼睛就变成黑洞。必须从四边泛洪（flood fill），
            只抠掉与边界连通的背景。

输入: D:/MollyPaw Agent/assets/pet/pet_<state>.png  (1024x1024 平底)
输出: assets/pet/<state>.png                        (透明、紧裁、≤512px)
"""
import os
import sys
from collections import deque
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PET = os.path.join(ROOT, "assets", "pet")
SRC_DIRS = [
    os.path.join(PET),                                              # 已改名的情况
    os.path.join(PET, "src"),                                       # 备份目录
    r"D:\MollyPaw Agent\assets\pet",                                # 主仓库
]
STATES = ["idle", "work", "cry", "sleep"]
TOLERANCE = 30     # 泛洪时允许的颜色偏差
SOFT = 60          # 边缘羽化范围
MAX_SIZE = 512


def find_src(state: str):
    for name in (f"pet_{state}.png", f"{state}.png"):
        for d in SRC_DIRS:
            p = os.path.join(d, name)
            if os.path.exists(p):
                return p
    # 兜底：把原图放进 assets/pet/src 再跑
    return None


def bg_key(img: Image.Image):
    """用四条边的中位数估计背景色。"""
    w, h = img.size
    px = img.load()
    samples = []
    step = max(1, min(w, h) // 64)
    for x in range(0, w, step):
        samples.append(px[x, 0])
        samples.append(px[x, h - 1])
    for y in range(0, h, step):
        samples.append(px[0, y])
        samples.append(px[w - 1, y])
    rs = sorted(s[0] for s in samples)
    gs = sorted(s[1] for s in samples)
    bs = sorted(s[2] for s in samples)
    mid = len(samples) // 2
    return rs[mid], gs[mid], bs[mid]


def close(a, b, tol):
    return abs(a[0] - b[0]) <= tol and abs(a[1] - b[1]) <= tol and abs(a[2] - b[2]) <= tol


def debackground(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    key = bg_key(img)

    # 从四条边开始泛洪，标记「背景连通区」
    is_bg = bytearray(w * h)
    q = deque()

    def push(x, y):
        i = y * w + x
        if is_bg[i]:
            return
        p = px[x, y]
        if close(p, key, TOLERANCE):
            is_bg[i] = 1
            q.append((x, y))

    for x in range(w):
        push(x, 0)
        push(x, h - 1)
    for y in range(h):
        push(0, y)
        push(w - 1, y)

    while q:
        x, y = q.popleft()
        if x > 0: push(x - 1, y)
        if x < w - 1: push(x + 1, y)
        if y > 0: push(x, y - 1)
        if y < h - 1: push(x, y + 1)

    # 背景连通区 → 全透明；紧贴背景的非背景像素 → 按色差羽化，去白边
    for y in range(h):
        for x in range(w):
            i = y * w + x
            r, g, b, a = px[x, y]
            if is_bg[i]:
                px[x, y] = (r, g, b, 0)
                continue
            if not a:
                continue
            near_bg = False
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and is_bg[ny * w + nx]:
                    near_bg = True
                    break
            if near_bg:
                d = max(abs(r - key[0]), abs(g - key[1]), abs(b - key[2]))
                if d < SOFT:
                    px[x, y] = (r, g, b, int(255 * d / SOFT))
    return img


def main() -> None:
    os.makedirs(PET, exist_ok=True)
    ok = 0
    for state in STATES:
        src = find_src(state)
        if not src:
            print(f"[skip] {state}: 找不到原图，把 pet_{state}.png 放到 assets/pet/src/ 再跑")
            continue
        with Image.open(src) as im:
            out = debackground(im)
        bbox = out.getbbox()
        if bbox:
            out = out.crop(bbox)
        pad = max(4, int(max(out.size) * 0.03))
        canvas = Image.new("RGBA", (out.width + pad * 2, out.height + pad * 2), (0, 0, 0, 0))
        canvas.paste(out, (pad, pad))
        out = canvas
        out.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
        dst = os.path.join(PET, f"{state}.png")
        out.save(dst, "PNG", optimize=True)
        ok += 1
        print(f"[ok] {state}: {out.size} <- {src}  ({os.path.getsize(dst) // 1024} KB)")
    if not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
