import React, { useState } from "react";

const MejorarRedaccionOpenAI = () => {
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);

  const mejorarRedaccion = async () => {
    setCargando(true);
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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" 
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Eres un asistente que mejora la redacción de textos en español manteniendo el significado original."
            },
            {
              role: "user",
              content: "Mejora la redacción del siguiente texto:\n" + texto
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const textoMejorado = data.choices?.[0]?.message?.content || texto;
      setTexto(textoMejorado);
    } catch (error) {
      console.error("Error al mejorar la redacción:", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <textarea
        rows="10"
        style={{ width: "100%", padding: "10px", fontSize: "1rem" }}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe tu texto aquí..."
      />
      <button
        onClick={mejorarRedaccion}
        disabled={cargando}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          fontSize: "1rem",
          cursor: "pointer"
        }}
      >
        {cargando ? "Mejorando..." : "Mejorar redacción con OpenAI"}
      </button>
    </div>
  );
};

export default MejorarRedaccionOpenAI;
