import os
path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "pages", "ConvitePublico.js")
c = open(path, encoding="utf-8").read()
lines = c.split("\n")

# substituir linhas 152-162 (indices 151-161) com o calc robusto
novo_calc = [
    "    const calc = () => {",
    "      try {",
    "        const ds = (evento.data_evento||\"\").substring(0,10);",
    "        const hs = evento.hora_evento || \"00:00\";",
    "        const [ano,mes,dia] = ds.split(\"-\").map(Number);",
    "        const [hh,mm] = hs.split(\":\").map(Number);",
    "        const alvo = new Date(ano, mes-1, dia, hh||0, mm||0, 0);",
    "        const d = alvo - new Date();",
    "        if (isNaN(d) || d <= 0) { setT({ dias:0, horas:0, mins:0, segs:0 }); return; }",
    "        setT({",
    "          dias:  Math.floor(d / 86400000),",
    "          horas: Math.floor((d % 86400000) / 3600000),",
    "          mins:  Math.floor((d % 3600000) / 60000),",
    "          segs:  Math.floor((d % 60000) / 1000),",
    "        });",
    "      } catch(e) { setT({ dias:0, horas:0, mins:0, segs:0 }); }",
    "    };",
]

new_lines = lines[:151] + novo_calc + lines[162:]
open(path, "w", encoding="utf-8").write("\n".join(new_lines))

# verificar
c2 = open(path, encoding="utf-8").read()
print("dataStr.split:", "ds.split" in c2)
print("isNaN:", "isNaN" in c2)
print("linhas:", len(c2.split("\n")))
