import os, re

base = os.path.dirname(os.path.abspath(__file__))
dirs = [os.path.join(base, "src"), os.path.join(base, "backend")]

# mapa de substituicoes: unicode -> string limpa
fixes = {
    # acentos portugueses
    "\u00e1": "\u00e1", "\u00e0": "\u00e0", "\u00e2": "\u00e2", "\u00e3": "\u00e3",
    "\u00e9": "\u00e9", "\u00e8": "\u00e8", "\u00ea": "\u00ea", "\u00eb": "\u00eb",
    "\u00ed": "\u00ed", "\u00ec": "\u00ec", "\u00ee": "\u00ee",
    "\u00f3": "\u00f3", "\u00f2": "\u00f2", "\u00f4": "\u00f4", "\u00f5": "\u00f5",
    "\u00fa": "\u00fa", "\u00f9": "\u00f9", "\u00fb": "\u00fb",
    "\u00e7": "\u00e7", "\u00f1": "\u00f1",
    # corrompidos comuns (UTF-8 lido como latin-1)
    "\u00c3\u00a1": "\u00e1", "\u00c3\u00a3": "\u00e3", "\u00c3\u00a7": "\u00e7",
    "\u00c3\u00b3": "\u00f3", "\u00c3\u00ad": "\u00ed", "\u00c3\u00a9": "\u00e9",
    "\u00c3\u00aa": "\u00ea", "\u00c3\u00ba": "\u00fa", "\u00c3\u00b5": "\u00f5",
    "\u00c3\u00b4": "\u00f4", "\u00c3\u00a2": "\u00e2",
    "\u00c3\u0083": "\u00c3", "\u00c3\u0087": "\u00c7",
    "\u00c2\u00b7": "\u00b7",
    # simbolos corrompidos
    "\u00e2\u0080\u00a2": "\u2022",
    "\u00e2\u009c\u00a6": "\u2726",
    "\u00e2\u0080\u009c": '"', "\u00e2\u0080\u009d": '"',
    "\u00e2\u0080\u0099": "'",
    # caracteres estranhos que aparecem como lixo
    "\u00f9": "\u00fa",  # u com grave -> u com agudo (caso Login.js placeholder)
}

# caracteres que sao claramente lixo e devem ser removidos ou substituidos
lixo = {
    "\u00f9\u00f9\u00f9\u00f9\u00f9\u00f9\u00f9\u00f9": "password",  # placeholder corrompido
}

fixed = []
for d in dirs:
    for root, subdirs, files in os.walk(d):
        subdirs[:] = [s for s in subdirs if s != "node_modules"]
        for fname in files:
            if not any(fname.endswith(x) for x in [".js", ".jsx", ".css"]):
                continue
            fp = os.path.join(root, fname)
            try:
                c = open(fp, encoding="utf-8").read()
                orig = c
                # fix lixo primeiro
                for bad, good in lixo.items():
                    c = c.replace(bad, good)
                # fix sequencias corrompidas (ordem importa - mais longas primeiro)
                for bad in sorted(fixes, key=len, reverse=True):
                    good = fixes[bad]
                    if bad != good:
                        c = c.replace(bad, good)
                if c != orig:
                    open(fp, "w", encoding="utf-8").write(c)
                    rel = fp.replace(base + os.sep, "")
                    fixed.append(rel)
                    print("FIXED:", rel)
            except Exception as e:
                print("ERRO:", fp, e)

if not fixed:
    print("Nenhum problema encontrado")
else:
    print(f"\nTotal: {len(fixed)} ficheiros corrigidos")
