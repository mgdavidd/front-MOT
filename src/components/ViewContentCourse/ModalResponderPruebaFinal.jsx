import React, { useState } from "react";
import styles from "./ModalPruebaFinal.module.css";

export default function ModalResponderPruebaFinal({ prueba, onClose, modulo, currentUser, modulosCurso }) {
  const [respuestas, setRespuestas] = useState(Array(prueba.preguntas.length).fill(null));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (pregIdx, opIdx) => {
    setRespuestas(respuestas.map((r, i) => (i === pregIdx ? opIdx : r)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Validar que todas las preguntas tengan respuesta
    if (respuestas.some(r => r === null)) {
      setError("Por favor responde todas las preguntas antes de enviar.");
      return;
    }
    setEnviando(true);
    console.log(modulo)
    try {
      const res = await fetch(
        `http://localhost:3000/modules/${modulo.id}/quizzes/${prueba.id}/attempts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            respuestas
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        alert(`Prueba enviada. Nota: ${data.nota}. ${data.aprobado ? "¡Aprobado!" : "No aprobado."}`);
        console.log(data)
        if (data.aprobado) {
          const idxActual = modulosCurso.findIndex(m => m.id === modulo.id);
          const siguienteModulo = idxActual !== -1 ? modulosCurso[idxActual + 1] : undefined;
          if (siguienteModulo) {
            await fetch(`http://localhost:3000/courses/${modulo.id_curso}/progress`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_usuario: currentUser.id,
                id_modulo_actual: siguienteModulo.id,
                nota_maxima: data.nota
              })
            });
          } else {
            alert("¡Felicidades! Has completado el curso.");
          }
        }
        onClose();
      } else {
        setError("Error al enviar la prueba. Intenta nuevamente.");
      }
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.");
      console.error("Error al enviar la prueba:", err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Prueba Final del Módulo</h2>
        <form onSubmit={handleSubmit}>
          {prueba.preguntas.map((p, idx) => (
            <div key={idx} className={styles.preguntaBlock}>
              <label>{idx + 1}. {p.texto}</label>
              <div className={styles.opcionesList}>
                {p.opciones.map((op, opIdx) => (
                  <div key={opIdx} className={styles.opcionBlock}>
                    <input
                      type="radio"
                      name={`respuesta-${idx}`}
                      checked={respuestas[idx] === opIdx}
                      onChange={() => handleChange(idx, opIdx)}
                      required
                    />
                    <span>{op}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <div className={styles.modalActions}>
            <button type="submit" className={styles.saveBtn} disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar respuestas"}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}