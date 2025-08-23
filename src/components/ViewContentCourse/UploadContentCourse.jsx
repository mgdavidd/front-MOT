import React, { useRef, useState } from "react";
import styles from "./UploadContentCourse.module.css";

function UploadContentCourse({ onClose, onSubmit }) {
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
        <h2 className={styles.subtitle}>Subir contenido</h2>
        <form onSubmit={handleSubmit}>
          <label>Título del contenido:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Introducción al curso"
            className={styles.input}
          />
          <label>Archivo:</label>
          <input
            type="file"
            ref={fileInputRef}
            className={styles.input}
          />
          <div className={styles.modalButtons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitButton}>
              Subir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadContentCourse;
