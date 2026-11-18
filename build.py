#!/usr/bin/env python3
"""构建：把 template + js 合并成自包含 HTML。
   1) index.html           —— 主游戏
   2) evolution-demo.html  —— 进化演示页
"""
import pathlib

BASE = pathlib.Path(__file__).parent


def build(tpl_name, js_names, out_name):
    html = (BASE / tpl_name).read_text(encoding="utf-8")
    block = "".join(f'<script src="{n}"></script>\n' for n in js_names)
    js = "\n".join((BASE / n).read_text(encoding="utf-8") for n in js_names)
    assert block in html, f"{tpl_name}: script block not found"
    html = html.replace(block, "<script>\n" + js + "\n</script>\n")
    out = BASE / out_name
    out.write_text(html, encoding="utf-8")
    print(f"built {out.name}  {out.stat().st_size/1024:.1f} KB")


build("template.html", ["workbuddy-cloud-sdk.js", "pixel-art.js", "cloud.js", "app.js"], "index.html")
build("demo-template.html", ["pixel-art.js", "demo.js"], "evolution-demo.html")
