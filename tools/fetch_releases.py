# -*- coding: utf-8 -*-
"""把 GitHub Releases 快照成本地 releases.json，给官网做断网/CORS 兜底。

用法：
    python tools/fetch_releases.py
"""
import json
import os
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = "LK-BLOG/MollyPaw"
API = "https://api.github.com/repos/%s/releases" % REPO
OUT = os.path.join(ROOT, "releases.json")
KEEP = 8


def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "MollyPaw-Website-Snapshot",
        "Accept": "application/vnd.github+json",
    })
    with urllib.request.urlopen(req, timeout=25) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    releases = fetch(API)
    slim = []
    for rel in releases[:KEEP]:
        assets = []
        for a in rel.get("assets") or []:
            assets.append({
                "name": a.get("name"),
                "size": a.get("size"),
                "downloads": a.get("download_count", 0),
                "url": a.get("browser_download_url"),
            })
        slim.append({
            "tag": rel.get("tag_name"),
            "name": rel.get("name") or rel.get("tag_name"),
            "published": rel.get("published_at"),
            "prerelease": bool(rel.get("prerelease")),
            "url": rel.get("html_url"),
            "notes": (rel.get("body") or "").strip(),
            "assets": assets,
        })
    payload = {"repo": REPO, "snapshot": True, "releases": slim}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    latest = slim[0] if slim else {}
    print("wrote %s  |  latest=%s  assets=%d" % (OUT, latest.get("tag"), len(latest.get("assets") or [])))


if __name__ == "__main__":
    main()
