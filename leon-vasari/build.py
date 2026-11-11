#!/usr/bin/env python3
"""Build leon-vasari/index.html (The Vasari Library) from src.html by inlining every font as base64 WOFF2.

Usage:  python3 leon-vasari/build.py
Needs network access to fonts.googleapis.com / fonts.gstatic.com (fetched with curl).
"""
import base64, pathlib, re, subprocess, urllib.parse

HERE = pathlib.Path(__file__).resolve().parent
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/130.0 Safari/537.36")


def get(url: str) -> bytes:
    return subprocess.run(["curl", "-sSfL", "-A", UA, url], check=True,
                          capture_output=True).stdout


def faces(css_url: str, keep_subset: str | None = "latin"):
    """Yield (style, weight, woff2 bytes, unicode-range) from a Google Fonts CSS2 URL."""
    css = get(css_url).decode()
    blocks = re.findall(r"(?:/\* ([\w-]+) \*/\s*)?@font-face\s*{([^}]*)}", css)
    for subset, body in blocks:
        if keep_subset and subset and subset != keep_subset:
            continue
        style = re.search(r"font-style:\s*(\w+)", body).group(1)
        weight = re.search(r"font-weight:\s*([\d ]+);", body).group(1).strip()
        src = re.search(r"url\(([^)]+)\)", body).group(1)
        rng = re.search(r"unicode-range:\s*([^;]+);", body)
        yield style, weight, get(src), rng.group(1).strip() if rng else None


def face_css(family, style, weight, data, rng, display="swap"):
    b64 = base64.b64encode(data).decode()
    out = (f"@font-face{{font-family:\"{family}\";font-style:{style};font-weight:{weight};"
           f"font-display:{display};src:url(data:font/woff2;base64,{b64}) format(\"woff2\")")
    if rng:
        out += f";unicode-range:{rng}"
    return out + "}"


def main():
    src = (HERE / "src.html").read_text(encoding="utf-8")
    # every non-ASCII glyph the page uses (kanji, kana, punctuation)
    jp = "".join(sorted({c for c in src if ord(c) > 0x2FFF}))
    q = urllib.parse.quote
    G = "https://fonts.googleapis.com/css2?"
    css = []
    for st, w, data, rng in faces(G + "family=Inter+Tight:wght@100..900&display=swap"):
        css.append(face_css("Inter Tight", st, w, data, rng))
    for st, w, data, rng in faces(G + "family=Newsreader:ital,wght@0,200..800;1,200..800&display=swap"):
        css.append(face_css("Newsreader", st, w, data, rng))
    for st, w, data, rng in faces(G + f"family=Noto+Sans+JP:wght@500&text={q(jp)}&display=swap", None):
        css.append(face_css("Noto Sans JP", st, w, data, rng))
    for st, w, data, rng in faces(G + f"family=Noto+Serif+SC:wght@700&text={q(jp)}&display=swap", None):
        css.append(face_css("Noto Serif SC", st, w, data, rng))
    for st, w, data, rng in faces(G + f"family=Noto+Sans+JP:wght@800&text={q('書庫の記憶')}&display=block", None):
        css.append(face_css("Noto Sans JP Big", st, w, data, rng, display="block"))
    out = src.replace("/*@FONTS@*/", "\n".join(css))
    (HERE / "index.html").write_text(out, encoding="utf-8")
    print(f"wrote index.html ({len(out)/1024:.0f} KB, {len(css)} faces, {len(jp)} CJK glyphs)")


if __name__ == "__main__":
    main()
