import React, { useState } from "react";
import styles from "./ModalPruebaFinal.module.css";
import ModalGenerarConIA from "./ModalGenerarConIA";

export default function ModalCrearPruebaFinal({ onClose, onCreate, contenido, authHeaders }) {
  const [notaMinima, setNotaMinima] = useState(7);
  const [preguntas, setPreguntas] = useState([
    { texto: "", opciones: ["", ""], respuestaCorrecta: 0 }
  ]);
  const [showModalIA, setShowModalIA] = useState(false);
  const [generandoIA, setGenerandoIA] = useState(false);

  const addPregunta = () => {
    if (preguntas.length < 25)
      setPreguntas([...preguntas, { texto: "", opciones: ["", ""], respuestaCorrecta: 0 }]);
  };

  const updatePregunta = (idx, field, value) => {
    const updated = preguntas.map((p, i) =>
      i === idx ? { ...p, [field]: value } : p
    );
    setPreguntas(updated);
  };

  const updateOpcion = (idx, opIdx, value) => {
    const updated = preguntas.map((p, i) =>
      i === idx
        ? { ...p, opciones: p.opciones.map((op, j) => (j === opIdx ? value : op)) }
        : p
    );
    setPreguntas(updated);
  };

  const addOpcion = (idx) => {
    setPreguntas(preguntas.map((p, i) =>
      i === idx && p.opciones.length < 5
        ? { ...p, opciones: [...p.opciones, ""] }
        : p
    ));
  };

  const handleGenerarConIA = async (config) => {
    setGenerandoIA(true);
    try {
      const response = await fetch(
        "https://server-mot.onrender.com/modules/quizzes/ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders
          },
          body: JSON.stringify({
            contexto: config.contexto,
            num_preguntas: config.num_preguntas,
            nivel_dificultad: config.nivel_dificultad
          })
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Error al generar preguntas");
      }

      // Parsear las preguntas generadas
      let preguntasIA;
      try {
        let cleanJson = data.preguntas.trim();
        if (cleanJson.startsWith("```json")) {
          cleanJson = cleanJson.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (cleanJson.startsWith("```")) {
          cleanJson = cleanJson.replace(/```\n?/g, "");
        }
        preguntasIA = JSON.parse(cleanJson);

        if (!Array.isArray(preguntasIA) || preguntasIA.length === 0) {
          throw new Error("La IA no devolvió un listado de preguntas válido.");
        }
        if (preguntasIA.length > 25) preguntasIA = preguntasIA.slice(0,25);

        preguntasIA = preguntasIA.map((q) => {
          const texto = (q.texto || "").toString().trim();
          const opciones = Array.isArray(q.opciones) ? q.opciones.map(o => (o||"").toString().trim()) : [];

          while (opciones.length < 3) opciones.push("Opción");
          if (opciones.length > 5) opciones.splice(5);
          let respuestaCorrecta = typeof q.respuestaCorrecta === "number" ? q.respuestaCorrecta : Number(q.respuesta_correcta);
          if (!Number.isInteger(respuestaCorrecta) || respuestaCorrecta < 0 || respuestaCorrecta >= opciones.length) {
            respuestaCorrecta = 0;
          }
          return { texto, opciones, respuestaCorrecta };
        });

        if (preguntasIA.some(p => !p.texto)) {
          throw new Error("La IA generó preguntas vacías. Intenta nuevamente con otro contenido.");
        }

      } catch (parseError) {
        console.error("Error parseando JSON:", parseError);
        throw new Error("La IA generó un formato inválido. Intenta nuevamente.");
      }

      setPreguntas(preguntasIA);
      setNotaMinima(
        typeof config.nota_minima === "number"
          ? config.nota_minima
          : parseFloat(config.nota_minima) || 0
      );
      setShowModalIA(false);
      alert("¡Examen generado exitosamente! Revisa las preguntas antes de guardar.");
    } catch (error) {
      console.error("Error generando con IA:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setGenerandoIA(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (preguntas.length === 0) {
      alert("Debes agregar al menos una pregunta");
      return;
    }

    if (isNaN(notaMinima) || notaMinima < 0.1 || notaMinima > 10.0) {
      alert("La nota mínima debe ser un número entre 0.1 y 10.0.");
      return;
    }

    const preguntasVacias = preguntas.some(p => !p.texto.trim());
    if (preguntasVacias) {
      alert("Todas las preguntas deben tener texto");
      return;
    }

    const opcionesVacias = preguntas.some(p => 
      p.opciones.some(op => !op.trim())
    );
    if (opcionesVacias) {
      alert("Todas las opciones deben tener texto");
      return;
    }

    onCreate({ nota_minima: notaMinima, preguntas });
    onClose();
  };

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h2>Crear Prueba Final del Módulo</h2>
          
          {/* Botón para generar con IA */}
          <div style={{ marginBottom: "1rem", textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setShowModalIA(true)}
              disabled={generandoIA}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: generandoIA ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                transition: "all 0.2s"
              }}
            >
              {generandoIA ? "Generando..." : "✨ Generar con IA"}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <label>Nota mínima para aprobar (0-10):</label>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1} /* permitir decimales */
              value={notaMinima}
              onChange={e => setNotaMinima(parseFloat(e.target.value))}
              required
            />
            <div className={styles.preguntasList}>
              {preguntas.map((p, idx) => (
                <div key={idx} className={styles.preguntaBlock}>
                  <label>Pregunta {idx + 1}:</label>
                  <input
                    type="text"
                    value={p.texto}
                    onChange={e => updatePregunta(idx, "texto", e.target.value)}
                    required
                  />
                  <div className={styles.opcionesList}>
                    {p.opciones.map((op, opIdx) => (
                      <div key={opIdx} className={styles.opcionBlock}>
                        <input
                          type="text"
                          value={op}
                          onChange={e => updateOpcion(idx, opIdx, e.target.value)}
                          required
                          placeholder={`Opción ${opIdx + 1}`}
                        />
                        <input
                          type="radio"
                          name={`correcta-${idx}`}
                          checked={p.respuestaCorrecta === opIdx}
                          onChange={() => updatePregunta(idx, "respuestaCorrecta", opIdx)}
                          title="Respuesta correcta"
                        />
                      </div>
                    ))}
                    {p.opciones.length < 5 && (
                      <button type="button" className={styles.addOptionBtn} onClick={() => addOpcion(idx)}>
                        + Opción
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {preguntas.length < 25 && (
              <button type="button" className={styles.addQuestionBtn} onClick={addPregunta}>
                + Agregar pregunta
              </button>
            )}
            <div className={styles.modalActions}>
              <button type="submit" className={styles.saveBtn}>Crear prueba</button>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de generación con IA */}
      {showModalIA && (
        <ModalGenerarConIA
          onClose={() => setShowModalIA(false)}
          onGenerate={handleGenerarConIA}
          contenido={contenido}
          authHeaders={authHeaders}
        />
      )}
    </>
  );
}