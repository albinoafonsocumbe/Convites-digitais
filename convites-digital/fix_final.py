# -*- coding: utf-8 -*-
import os, re

path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src", "pages", "ConvitePublico.js")
js = open(path, encoding="latin-1").read()

# Corrigir encoding latin1 -> utf8 mal interpretado
# Estes sao bytes UTF-8 lidos como latin-1
replacements = [
    # acentos
    ("\u00c3\u00a1", "\u00e1"),  # a agudo
    ("\u00c3\u00a3", "\u00e3"),  # a til
    ("\u00c3\u00a7", "\u00e7"),  # c cedilha
    ("\u00c3\u00b3", "\u00f3"),  # o agudo
    ("\u00c3\u00ad", "\u00ed"),  # i agudo
    ("\u00c3\u00a9", "\u00e9"),  # e agudo
    ("\u00c3\u00aa", "\u00ea"),  # e circunflexo
    ("\u00c3\u00ba", "\u00fa"),  # u agudo
    ("\u00c3\u00b5", "\u00f5"),  # o til
    ("\u00c3\u00b4", "\u00f4"),  # o circunflexo
    ("\u00c3\u00a2", "\u00e2"),  # a circunflexo
    ("\u00c3\u0083", "\u00c3"),  # A til maiusc
    ("\u00c3\u0087", "\u00c7"),  # C cedilha maiusc
    ("\u00c3\u0089", "\u00c9"),  # E agudo maiusc
    ("\u00c3\u009c", "\u00dc"),  # U umlaut maiusc
    ("\u00c2\u00b7", "\u00b7"),  # ponto medio
    ("\u00c2\u00b0", "\u00b0"),  # grau
    # simbolos especiais corrompidos
    ("\u00e2\u0080\u00a2", "&#8226;"),   # bullet
    ("\u00e2\u009c\u00a6", "&#10022;"),  # estrela
    ("\u00e2\u009c\u0093", "&#10003;"),  # check
    ("\u00e2\u009c\u0097", "&#10007;"),  # x
    ("\u00e2\u0080\u009c", '"'),         # aspas esq
    ("\u00e2\u0080\u009d", '"'),         # aspas dir
    # emojis corrompidos -> html entities
    ("\u00f0\u009f\u0093\u0085", "&#128197;"),  # calendario
    ("\u00f0\u009f\u0093\u008d", "&#128205;"),  # pin
]

for bad, good in replacements:
    js = js.replace(bad, good)

# Agora salvar como UTF-8
open(path, "w", encoding="utf-8").write(js)

# Verificar resultado
js2 = open(path, encoding="utf-8").read()

# Fix musica autoplay
if "autoPlay" not in js2:
    js2 = js2.replace(
        "function MusicaPlayer({ url })",
        "function MusicaPlayer({ url, autoPlay })"
    )
    js2 = js2.replace(
        "evento.musica_url && <MusicaPlayer url={evento.musica_url}/>",
        "evento.musica_url && <MusicaPlayer url={evento.musica_url} autoPlay={true}/>"
    )
    # adicionar useEffect de autoplay depois do toggle
    js2 = js2.replace(
        "  const tog = () => { const a=ref.current; if(on){a.pause();setOn(false);}else{a.play();setOn(true);} };",
        "  const tried=useRef(false);\n  useEffect(()=>{ if(autoPlay&&!tried.current&&ref.current){tried.current=true;ref.current.play().then(()=>setOn(true)).catch(()=>{});} },[autoPlay]);\n  const tog = () => { const a=ref.current; if(on){a.pause();setOn(false);}else{a.play();setOn(true);} };"
    )
    open(path, "w", encoding="utf-8").write(js2)

print("OK", os.path.getsize(path), "bytes")

# Verificar palavras chave
check = open(path, encoding="utf-8").read()
for word in ["está chegando", "Cerimónia", "Refeição", "Presença", "Localização", "autoPlay", "tried"]:
    print(word+":", "OK" if word in check else "FALTA")
