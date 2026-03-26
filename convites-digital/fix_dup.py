c = open("src/pages/ConvitePublico.js", encoding="utf-8").read()

# Encontrar as duas posicoes
i1 = c.find("function Envelope(")
i2 = c.find("function Envelope(", i1+1)

# A primeira e a antiga (sem nomeEvento), a segunda e a nova
# Remover do inicio da primeira ate ao inicio da segunda
c_novo = c[:i1] + c[i2:]

open("src/pages/ConvitePublico.js", "w", encoding="utf-8").write(c_novo)
print("OK - removida duplicata. Tamanho:", len(c_novo))
