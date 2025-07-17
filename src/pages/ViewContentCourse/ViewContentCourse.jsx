import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ViewContentCourse.module.css";
import UploadContentCourse from "../../components/UploadContentCourse";

function ViewContentCourse() {
  const { state: curso } = useLocation();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [contenido, setContenido] = useState([]);

  const handleUpload = (data) => {
    // Aquí podrías subir a un backend, pero por ahora se simula agregando al estado
    setContenido((prev) => [...prev, data]);
  };

  if (!curso) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>No se encontró información del curso.</p>
        <button className={styles.button} onClick={() => navigate("/instructorNav")}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{curso.nombre}</h1>
      <p className={styles.text}><strong>Descripción:</strong> {curso.descripcion}</p>
      <p className={styles.text}><strong>Profesor:</strong> {curso.profesor}</p>

      <div className={styles.section}>
        <h2 className={styles.subtitle}>Contenido del curso</h2>

        {contenido.length === 0 ? (
          <p className={styles.placeholder}>Aún no hay contenido agregado.</p>
        ) : (
          <ul>
            {contenido.map((item, index) => (
              <li key={index} className={styles.text}>
                📄 <strong>{item.title}</strong> – {item.file.name}
              </li>
            ))}
          </ul>
        )}

        <button className={styles.addButton} onClick={() => setShowUploadModal(true)}>
          + Agregar contenido
        </button>
      </div>

      <button className={styles.backButton} onClick={() => navigate("/instructorNav")}>
        ← Volver a cursos
      </button>

      {showUploadModal && (
        <UploadContentCourse
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUpload}
        />
      )}
    </div>
  );
}

export default ViewContentCourse;
