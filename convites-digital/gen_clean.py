f = open("src/pages/ConvitePublico.js", "w", encoding="utf-8")
f.write(open("src/pages/ConvitePublico.js.bak", "w", encoding="utf-8") and "" or "")
f.close()

# Reescrever limpo
f = open("src/pages/ConvitePublico.js", "w", encoding="utf-8")
f.write('// GERADO\n')
f.close()
print("Limpo")
