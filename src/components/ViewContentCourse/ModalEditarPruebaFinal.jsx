import React, { useState } from "react";
import styles from "./ModalPruebaFinal.module.css";

export default function ModalEditarPruebaFinal({ prueba, onClose, onEdit }) {
  const [notaMinima, setNotaMinima] = useState(prueba.nota_minima);
  const [preguntas, setPreguntas] = useState(prueba.preguntas);

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

  const addPregunta = () => {
    if (preguntas.length < 25)
      setPreguntas([...preguntas, { texto: "", opciones: ["", ""], respuestaCorrecta: 0 }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit({ nota_minima: notaMinima, preguntas });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Editar Prueba Final del Módulo</h2>
        <form onSubmit={handleSubmit}>
          <label>Nota mínima para aprobar (0-10):</label>
          <input
            type="number"
            min={0}
            max={10}
            value={notaMinima}
            onChange={e => setNotaMinima(Number(e.target.value))}
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
            <button type="submit" className={styles.saveBtn}>Guardar cambios</button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}