import { useState } from "react";

export default function CriarEvento() {
  const [nomeEvento, setNomeEvento] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [localEvento, setLocalEvento] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/eventos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_evento: nomeEvento,
          data_evento: dataEvento,
          local_evento: localEvento,
          mensagem: mensagem,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus("Evento criado com sucesso! ID: " + data.id);
        // limpar campos
        setNomeEvento("");
        setDataEvento("");
        setLocalEvento("");
        setMensagem("");
      } else {
        setStatus("Erro ao criar evento");
      }
    } catch (error) {
      console.error(error);
      setStatus("Erro de conexão com o servidor");
    }
  };

  return (
    <div>
      <h2>Criar Convite</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome do Evento"
          value={nomeEvento}
          onChange={(e) => setNomeEvento(e.target.value)}
          required
        />
        <input
          type="date"
          value={dataEvento}
          onChange={(e) => setDataEvento(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Local do Evento"
          value={localEvento}
          onChange={(e) => setLocalEvento(e.target.value)}
          required
        />
        <textarea
          placeholder="Mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          required
        />
        <button type="submit">Criar Convite</button>
      </form>
      <p>{status}</p>
    </div>
  );
}
