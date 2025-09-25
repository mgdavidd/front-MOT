import React, { useState } from "react";
import axios from "axios";
import styles from "./ForumModule.module.css";

const API_URL = "https://server-mot.onrender.com";

const ForumModal = ({ foro, idUsuario, onClose, refreshForo }) => {
  const [newRespuesta, setNewRespuesta] = useState("");

  const createRespuesta = async () => {
    if (!newRespuesta) return;
    try {
      await axios.post(`${API_URL}/foros/${foro.id}/respuestas`, {
        idUsuario,
        mensaje: newRespuesta,
      });
      refreshForo();
      setNewRespuesta("");
    } catch (error) {
      console.error("Error creando respuesta:", error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <h3 className={styles.modalTitle}>{foro.titulo}</h3>
        <div className={styles.modalHeader}>
          <span className={styles.autor}>por {foro.autor}</span>
          {foro.referenciaTitulo && (
            <div className={styles.referenciaInfo}>
              <small>
                Sobre: {foro.referenciaTitulo}
                {foro.tipoReferencia === 'grabacion' ? ' (Grabación)' : ' (Contenido)'}
              </small>
            </div>
          )}
        </div>
        
        <div className={styles.modalMessageContainer}>
          <p className={styles.modalMessage}>{foro.mensaje}</p>
        </div>

        <h4 className={styles.subtitle}>Respuestas ({foro.respuestas?.length || 0})</h4>
        {!foro.respuestas || foro.respuestas.length === 0 ? (
          <p className={styles.empty}>No hay respuestas aún. Sé el primero en responder.</p>
        ) : (
          <div className={styles.repliesContainer}>
            <ul className={styles.replies}>
              {foro.respuestas.map((r) => (
                <li key={r.id} className={styles.reply}>
                  <div className={styles.replyHeader}>
                    <strong>{r.autor}</strong>
                  </div>
                  <p className={styles.replyMessage}>{r.mensaje}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.responseForm}>
          <textarea
            placeholder="Escribe tu respuesta..."
            className={styles.textarea}
            value={newRespuesta}
            onChange={(e) => setNewRespuesta(e.target.value)}
            rows={3}
          />
          <button onClick={createRespuesta} className={styles.btnReply}>
            Responder
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForumModal;