import os, re
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "pages", "ConvitePublico.js")
c = open(path, encoding="utf-8").read()

# Entities que estao em strings JS (entre aspas) devem ser Unicode
# Entities em JSX (fora de aspas) ficam como estao - funcionam bem
# Estrategia: substituir entities dentro de "..." ou '...' por unicode

entity_map = {
    "&#250;": "\u00fa",  # u
    "&#225;": "\u00e1",  # a agudo
    "&#227;": "\u00e3",  # a til
    "&#233;": "\u00e9",  # e agudo
    "&#234;": "\u00ea",  # e circunflexo
    "&#237;": "\u00ed",  # i agudo
    "&#243;": "\u00f3",  # o agudo
    "&#244;": "\u00f4",  # o circunflexo
    "&#245;": "\u00f5",  # o til
    "&#231;": "\u00e7",  # c cedilha
    "&#241;": "\u00f1",  # n til
    "&#193;": "\u00c1",  # A agudo
    "&#195;": "\u00c3",  # A til
    "&#201;": "\u00c9",  # E agudo
    "&#205;": "\u00cd",  # I agudo
    "&#211;": "\u00d3",  # O agudo
    "&#218;": "\u00da",  # U agudo
    "&#199;": "\u00c7",  # C cedilha
    "&#183;": "\u00b7",  # ponto medio
}

# Substituir entities dentro de strings JS (entre aspas duplas ou simples)
# usando regex para encontrar conteudo entre aspas
def fix_string(m):
    s = m.group(0)
    for ent, uni in entity_map.items():
        s = s.replace(ent, uni)
    return s

# Aplicar em strings entre aspas duplas
c = re.sub(r'"[^"]*&#\d+;[^"]*"', fix_string, c)
# Aplicar em strings entre aspas simples (JS)  
c = re.sub(r"'[^']*&#\d+;[^']*'", fix_string, c)
# Aplicar em template literals
c = re.sub(r'`[^`]*&#\d+;[^`]*`', fix_string, c)
# Aplicar no resto que ficou em texto JSX direto (fora de aspas) - deixar como entity
# MAS o caso especial: texto direto em JSX como >M&#250;sica< deve ficar
# Verificar linha 30 especificamente
lines = c.split("\n")
for i, l in enumerate(lines):
    if "&#" in l and ('"' in l or "'" in l):
        # ainda tem entities dentro de strings - substituir manualmente
        for ent, uni in entity_map.items():
            if ent in l:
                # so substituir se estiver dentro de aspas
                new_l = re.sub(r'("(?:[^"\\]|\\.)*")', lambda m: m.group(0).replace(ent, uni), l)
                new_l = re.sub(r"('(?:[^'\\]|\\.)*')", lambda m: m.group(0).replace(ent, uni), new_l)
                lines[i] = new_l

c = "\n".join(lines)
open(path, "w", encoding="utf-8").write(c)

# verificar linha 30
lines2 = c.split("\n")
print("linha 30:", lines2[29][:100])
print("Musica ok:", "M\u00fasica" in c or "M&#250;sica" not in c)
print("bytes:", len(c))
