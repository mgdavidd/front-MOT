import React, { useState, useEffect } from "react";
import styles from "./ModalPruebaFinal.module.css";

export default function ModalResponderPruebaFinal({ prueba, onClose, modulo, currentUser, modulosCurso }) {
  // estado para preguntas ya parseadas (si vienen como string JSON o array)
  const [preguntasArray, setPreguntasArray] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // parsear y normalizar preguntas cada vez que cambie la prop prueba
  useEffect(() => {
    let arr = [];
    if (prueba && prueba.preguntas != null) {
      try {
        if (typeof prueba.preguntas === "string") {
          arr = JSON.parse(prueba.preguntas);
          // manejar caso doble-escaped: JSON.parse devuelve otra string
          if (typeof arr === "string") {
            arr = JSON.parse(arr);
          }
        } else if (Array.isArray(prueba.preguntas)) {
          arr = prueba.preguntas;
        }
      } catch (err) {
        console.error("ModalResponderPruebaFinal: error parsing preguntas:", err);
        arr = [];
      }
    }
    arr = Array.isArray(arr) ? arr : [];
    setPreguntasArray(arr);
    setRespuestas(Array(arr.length).fill(null));
  }, [prueba]);

  const handleChange = (pregIdx, opIdx) => {
    setRespuestas(prev => prev.map((r, i) => (i === pregIdx ? opIdx : r)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (respuestas.length === 0 || respuestas.some(r => r === null)) {
      setError("Por favor responde todas las preguntas antes de enviar.");
      return;
    }
    setEnviando(true);
    try {
      // 1. Enviar respuestas
      const res = await fetch(
        `https://server-mot.onrender.com/modules/${modulo.id}/quizzes/${prueba.id}/attempts`,
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
        // Mostrar resultado del intento actual
        alert(`Prueba enviada. Nota: ${data.nota}. ${data.aprobado ? "¡Aprobado!" : "No aprobado."}`);
        
        // Si aprobó y es una nota más alta que la anterior, actualizar progreso
        if (data.aprobado && (!data.notaPrevia || data.nota > data.notaPrevia)) {
          const idxActual = modulosCurso.findIndex(m => m.id === modulo.id);
          const siguienteModulo = idxActual !== -1 ? modulosCurso[idxActual + 1] : undefined;
          
          if (siguienteModulo) {
            try {
              const progressRes = await fetch(
                `https://server-mot.onrender.com/courses/${modulo.id_curso}/progress`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id_usuario: currentUser.id,
                    id_modulo_actual: siguienteModulo.id,
                    nota_maxima: data.nota,
                    modulo_anterior: modulo.id
                  })
                }
              );
              
              const progressData = await progressRes.json();
              
              if (!progressData.success) {
                console.error("Error actualizando progreso:", progressData.error);
              } else if (progressData.action === "updated") {
                alert(`¡Felicitaciones! Has mejorado tu nota anterior (${data.notaPrevia}) con un ${data.nota}.`);
              }
            } catch (err) {
              console.error("Error en actualización de progreso:", err);
            }
          } else {
            alert("¡Felicidades! Has completado el curso con una nota de " + data.nota);
          }
        }
        onClose();
      } else {
        setError(data.error || "Error al enviar la prueba. Intenta nuevamente.");
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
          {preguntasArray.length === 0 && <p>No hay preguntas válidas para esta prueba.</p>}
          {preguntasArray.map((p, idx) => (
            <div key={idx} className={styles.preguntaBlock}>
              <label>{idx + 1}. {p.texto}</label>
              <div className={styles.opcionesList}>
                {(Array.isArray(p.opciones) ? p.opciones : []).map((op, opIdx) => (
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