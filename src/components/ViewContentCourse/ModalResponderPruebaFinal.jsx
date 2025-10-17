import React, { useState, useEffect } from "react";
import styles from "./ModalPruebaFinal.module.css";

export default function ModalResponderPruebaFinal({ prueba, onClose, modulo, currentUser, modulosCurso }) {
  const [preguntasArray, setPreguntasArray] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Parsear y normalizar preguntas
  useEffect(() => {
    let arr = [];
    if (prueba && prueba.preguntas != null) {
      try {
        if (typeof prueba.preguntas === "string") {
          arr = JSON.parse(prueba.preguntas);
          // Manejar caso doble-escaped
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
      // 1. Enviar respuestas y obtener calificación
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
      
      if (!data.success) {
        setError(data.error || "Error al enviar la prueba. Intenta nuevamente.");
        return;
      }

      const { nota, notaPrevia, aprobado } = data;

      // 2. Mostrar resultado inmediato
      let mensaje = `Prueba enviada.\n\nNota obtenida: ${nota.toFixed(1)}\n`;
      
      if (notaPrevia !== null) {
        mensaje += `Nota anterior: ${notaPrevia.toFixed(1)}\n`;
      }
      
      mensaje += `\n${aprobado ? "✅ ¡Aprobado!" : "❌ No aprobado."}`;

      // 3. Si aprobó, SIEMPRE verificar si puede avanzar
      if (aprobado) {
        // Ordenar módulos por orden
        const modulosOrdenados = Array.isArray(modulosCurso) ? [...modulosCurso] : [];
        modulosOrdenados.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        
        const idxActual = modulosOrdenados.findIndex(m => m.id === modulo.id);
        const siguienteModulo = idxActual !== -1 ? modulosOrdenados[idxActual + 1] : undefined;
        
        // 🔥 CAMBIO CRÍTICO: Siempre intentar actualizar progreso si aprobó
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
                  nota_maxima: Math.max(nota, notaPrevia || 0), // Mantener la nota más alta
                  modulo_anterior: modulo.id
                })
              }
            );
            
            const progressData = await progressRes.json();
            
            if (progressData.success) {
              if (notaPrevia !== null && nota > notaPrevia) {
                mensaje += `\n\n🎉 ¡Has mejorado tu nota! Ahora puedes continuar al siguiente módulo.`;
              } else if (notaPrevia !== null) {
                mensaje += `\n\n✅ Tu progreso se ha verificado. Puedes continuar al siguiente módulo.`;
              } else {
                mensaje += `\n\n🎉 ¡Progreso actualizado! Puedes avanzar al siguiente módulo.`;
              }
            } else {
              console.error("Error actualizando progreso:", progressData.error);
            }
          } catch (err) {
            console.error("Error en actualización de progreso:", err);
          }
        } else {
          // Es el último módulo
          if (notaPrevia !== null && nota > notaPrevia) {
            mensaje += `\n\n🎉 ¡Has mejorado tu nota final del curso!`;
          } else {
            mensaje += `\n\n🎉 ¡Felicidades! Has completado el curso.`;
          }
        }
      } else {
        // No aprobó
        mensaje += `\n\nPuedes intentar nuevamente para mejorar tu calificación.`;
      }

      alert(mensaje);
      onClose();
      
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
          {preguntasArray.length === 0 && (
            <p>No hay preguntas válidas para esta prueba.</p>
          )}
          
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
          
          {error && (
            <div style={{ 
              color: "#dc3545", 
              background: "#fef2f2",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "1rem",
              border: "1px solid #fecaca"
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <div className={styles.modalActions}>
            <button 
              type="submit" 
              className={styles.saveBtn} 
              disabled={enviando || respuestas.some(r => r === null)}
            >
              {enviando ? "Enviando..." : "Enviar respuestas"}
            </button>
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={onClose}
              disabled={enviando}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}