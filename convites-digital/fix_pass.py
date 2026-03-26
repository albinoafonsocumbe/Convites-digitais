c = open("src/pages/ConvitePublico.js", encoding="utf-8").read()

old = 'if (!aberto) return <Envelope nome={nomeConv} relacao={relConv} nomeEvento={evento.nome_evento} onAbrir={() => setAberto(true)}/>;'
new = 'if (!aberto) return <Envelope nome={nomeConv} relacao={relConv} nomeEvento={evento.nome_evento} dataEvento={evento.data_evento} horaEvento={evento.hora_evento} localEvento={evento.local_evento} onAbrir={() => setAberto(true)}/>;'

c2 = c.replace(old, new)
open("src/pages/ConvitePublico.js", "w", encoding="utf-8").write(c2)
print("OK" if new in c2 else "FAIL")
