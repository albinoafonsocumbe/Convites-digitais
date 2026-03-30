import os, re
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "pages", "ConvitePublico.js")
c = open(path, encoding="utf-8").read()

# Mapa completo de caracteres -> HTML entities
m = {
    "\u00e1":"&#225;","\u00e0":"&#224;","\u00e2":"&#226;","\u00e3":"&#227;",
    "\u00e9":"&#233;","\u00e8":"&#232;","\u00ea":"&#234;",
    "\u00ed":"&#237;","\u00ec":"&#236;","\u00ee":"&#238;",
    "\u00f3":"&#243;","\u00f2":"&#242;","\u00f4":"&#244;","\u00f5":"&#245;",
    "\u00fa":"&#250;","\u00f9":"&#249;","\u00fb":"&#251;",
    "\u00e7":"&#231;","\u00f1":"&#241;",
    "\u00c1":"&#193;","\u00c0":"&#192;","\u00c2":"&#194;","\u00c3":"&#195;",
    "\u00c9":"&#201;","\u00ca":"&#202;",
    "\u00cd":"&#205;","\u00ce":"&#206;",
    "\u00d3":"&#211;","\u00d4":"&#212;","\u00d5":"&#213;",
    "\u00da":"&#218;","\u00db":"&#219;",
    "\u00c7":"&#199;","\u00d1":"&#209;",
    "\u00b7":"&#183;","\u00ba":"&#186;","\u00aa":"&#170;",
    "\u2022":"&#8226;","\u2019":"&#8217;","\u2018":"&#8216;",
    "\u201c":"&#8220;","\u201d":"&#8221;",
    "\u2013":"&#8211;","\u2014":"&#8212;",
    "\u00bf":"&#191;","\u00a1":"&#161;",
    "\u2026":"&#8230;",
}

# so substituir dentro de strings JS (entre aspas), nao em comentarios
# abordagem simples: substituir tudo excepto dentro de template literals CSS
for bad, good in m.items():
    c = c.replace(bad, good)

open(path, "w", encoding="utf-8").write(c)

# verificar que nao ha mais chars > 127
remaining = [(i+1, hex(ord(ch)), repr(l[:50])) for i,l in enumerate(c.split('\n')) for ch in l if ord(ch)>127]
if remaining:
    print("Ainda tem:", remaining[:10])
else:
    print("OK - sem caracteres corrompidos")
print("bytes:", len(c))
