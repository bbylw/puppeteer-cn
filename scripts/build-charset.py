import pathlib
import sys

root = pathlib.Path(__file__).resolve().parent.parent
chars = set()

for p in (root / "src").rglob("*"):
    if p.suffix in {".astro", ".ts", ".tsx", ".md", ".json", ".css"}:
        try:
            chars |= set(p.read_text(encoding="utf-8"))
        except Exception:
            pass

# GB2312 first-level hanzi (3755 chars) as a safety net for future copy edits.
for b1 in range(0xB0, 0xD8):
    for b2 in range(0xA1, 0xFF):
        try:
            chars.add(bytes([b1, b2]).decode("gb2312"))
        except Exception:
            pass

# ASCII printable + common CJK punctuation + typographic marks.
chars |= set(chr(c) for c in range(0x20, 0x7F))
chars |= set("　、。，．·；：？！…—～‖“”‘’（）《》〈〉【】〔〕｛｝％＋－×÷＝±℃№→←↑↓↗↘※§¶©®™°")

text = "".join(sorted(c for c in chars if c.isprintable() or c == " "))
out = pathlib.Path(sys.argv[1])
out.write_text(text, encoding="utf-8")
print(f"{len(text)} characters -> {out}")
