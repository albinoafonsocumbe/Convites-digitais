import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function VerConvite() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);

  const fetchEvento = async () => {
    try {
      const response = await fetch("http://localhost:5000/eventos");
      const data = await response.json();
      const encontrado = data.find((e) => e.id === parseInt(id));
      setEvento(encontrado);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEvento();
  }, [id]);

  if (!evento)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Carregando convite...
      </p>
    );

  return (
    <div
      style={{
        border: "2px solid #007bff",
        padding: "25px",
        maxWidth: "500px",
        margin: "40px auto",
        borderRadius: "15px",
        boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
        backgroundColor: "#f9f9f9",
        textAlign: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h2 style={{ color: "#007bff", marginBottom: "15px" }}>
        {evento.nome_evento}
      </h2>
      <p>
        <strong>Data:</strong> {evento.data_evento}
      </p>
      <p>
        <strong>Local:</strong> {evento.local_evento}
      </p>
      <p>
        <strong>Mensagem:</strong> {evento.mensagem}
      </p>
    </div>
  );
}
