// CreateModuleModal.jsx
import React, { useState } from "react";
import styles from "./CreateModuleModal.module.css";

const coloresPastel = [
  "#42A5F5", "#FF6B81", "#FF9F45",
  "#40df94ff", "#32E0C4", "#A259FF"
];

export default function CreateModuleModal({ courseId, onClose, onModuleCreated }) {
    console.log(courseId)
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(coloresPastel[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`https://server-mot.onrender.com/modules/course/${courseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, color }),
      });

      const result = await response.json();

      if (result.success) {
        onModuleCreated();
        onClose();
      } else {
        setError(result.message || "Error al crear el módulo.");
      }
    } catch (err) {
      console.error(err);
      setError("Error en la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Crear Módulo</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título del módulo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className={styles.colorPicker}>
            {coloresPastel.map((c) => (
              <div
                key={c}
                className={`${styles.colorBox} ${color === c ? styles.selected : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Creando..." : "Crear"}
          </button>
          <button type="button" onClick={onClose} className={styles.cancel}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
