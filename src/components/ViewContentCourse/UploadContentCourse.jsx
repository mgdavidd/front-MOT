import React, { useRef, useState } from "react";
import styles from "./UploadContentCourse.module.css";

function UploadContentCourse({ onClose, onSubmit, isRecording }) {
  const fileInputRef = useRef(null);
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const file = fileInputRef.current.files[0];
    if (!file || !title.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    onSubmit({ file, title });
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className={styles.subtitle}>
          {isRecording ? "Subir grabación" : "Subir contenido"}
        </h2>
        <form onSubmit={handleSubmit}>
          <label>{isRecording ? "Título de la grabación:" : "Título del contenido:"}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isRecording ? "Ej. Clase 1 - Introducción" : "Ej. Introducción al curso"}
            className={styles.input}
          />
          <label>{isRecording ? "Archivo de video:" : "Archivo:"}</label>
          <input
            type="file"
            ref={fileInputRef}
            className={styles.input}
            accept={isRecording ? "video/*" : "*/*"} // 👈 Restricción aquí
          />
          <div className={styles.modalButtons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              {isRecording ? "Subir grabación" : "Subir contenido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadContentCourse;
