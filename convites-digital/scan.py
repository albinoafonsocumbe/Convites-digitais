import os, re

src = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")

entity_map = {
    "&#250;": "\u00fa", "&#225;": "\u00e1", "&#227;": "\u00e3",
    "&#233;": "\u00e9", "&#234;": "\u00ea", "&#237;": "\u00ed",
    "&#243;": "\u00f3", "&#244;": "\u00f4", "&#245;": "\u00f5",
    "&#231;": "\u00e7", "&#241;": "\u00f1", "&#193;": "\u00c1",
    "&#195;": "\u00c3", "&#201;": "\u00c9", "&#205;": "\u00cd",
    "&#211;": "\u00d3", "&#218;": "\u00da", "&#199;": "\u00c7",
    "&#183;": "\u00b7", "&#192;": "\u00c0", "&#224;": "\u00e0",
    "&#226;": "\u00e2", "&#232;": "\u00e8", "&#235;": "\u00eb",
    "&#238;": "\u00ee", "&#239;": "\u00ef", "&#242;": "\u00f2",
    "&#249;": "\u00f9", "&#251;": "\u00fb", "&#252;": "\u00fc",
}

fixed_files = []

for root, dirs, files in os.walk(src):
    dirs[:] = [d for d in dirs if d != "node_modules"]
    for fname in files:
        if not (fname.endswith(".js") or fname.endswith(".jsx") or fname.endswith(".css")):
            continue
        fp = os.path.join(root, fname)
        try:
            c = open(fp, encoding="utf-8").read()
            original = c
            lines = c.split("\n")
            changed = False
            for i, l in enumerate(lines):
                if "&#" not in l:
                    continue
                new_l = l
                for ent, uni in entity_map.items():
                    if ent not in new_l:
                        continue
                    # substituir dentro de strings JS (aspas duplas, simples, template)
                    def fix_dq(m):
                        return m.group(0).replace(ent, uni)
                    new_l = re.sub(r'"[^"\n]*' + re.escape(ent) + r'[^"\n]*"', fix_dq, new_l)
                    new_l = re.sub(r"'[^'\n]*" + re.escape(ent) + r"[^'\n]*'", fix_dq, new_l)
                    new_l = re.sub(r'`[^`\n]*' + re.escape(ent) + r'[^`\n]*`', fix_dq, new_l)
                if new_l != l:
                    lines[i] = new_l
                    changed = True
            if changed:
                open(fp, "w", encoding="utf-8").write("\n".join(lines))
                fixed_files.append(fp.replace(os.path.dirname(os.path.dirname(fp)), ""))
        except Exception as e:
            print("ERRO:", fp, e)

if fixed_files:
    print("Corrigidos:")
    for f in fixed_files:
        print(" ", f)
else:
    print("Nenhum problema encontrado nos ficheiros JS/CSS")
