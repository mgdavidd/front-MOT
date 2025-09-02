import React, { useState } from "react";
import axios from "axios";
import styles from "./ForumModule.module.css";

const API_URL = "http://localhost:3000";

const ForumDetail = ({ foro, idUsuario, refreshForo }) => {
  const [newRespuesta, setNewRespuesta] = useState("");

  const createRespuesta = async () => {
    if (!newRespuesta) return;
    try {
      await axios.post(`${API_URL}/foros/${foro.id}/respuestas`, {
        idUsuario,
        mensaje: newRespuesta,
      });
      refreshForo(foro.id);
      setNewRespuesta("");
    } catch (error) {
      console.error("Error creando respuesta:", error);
    }
  };

  return (
    <div className={styles.detail}>
      <h3 className={styles.title}>{foro.titulo}</h3>
      <p className={styles.detailMsg}>{foro.mensaje}</p>

      <h4 className={styles.subtitle}>Respuestas</h4>
      {foro.respuestas.length === 0 ? (
        <p className={styles.empty}>No hay respuestas aún. Sé el primero en responder.</p>
      ) : (
        <ul className={styles.replies}>
          {foro.respuestas.map((r) => (
            <li key={r.id} className={styles.reply}>
              <strong>{r.autor}:</strong> {r.mensaje}
            </li>
          ))}
        </ul>
      )}

      <div>
        <textarea
          placeholder="Escribe tu respuesta..."
          className={styles.textarea}
          value={newRespuesta}
          onChange={(e) => setNewRespuesta(e.target.value)}
          rows={4}
        />
        <button onClick={createRespuesta} className={styles.btnReply}>
          Responder
        </button>
      </div>
    </div>
  );
};

export default ForumDetail;