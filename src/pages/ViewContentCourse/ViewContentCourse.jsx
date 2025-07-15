import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ViewContentCourse.module.css";

function ViewContentCourse() {
  const { state: curso } = useLocation();
  const navigate = useNavigate();

  if (!curso) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>No se encontró información del curso.</p>
        <button className={styles.button} onClick={() => navigate("/instructorNav")}>Volver</button>
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
        <p className={styles.placeholder}>Aún no hay contenido agregado.</p>
        <button className={styles.addButton}>+ Agregar contenido</button>
      </div>

      <button className={styles.backButton} onClick={() => navigate("/instructorNav")}>
        ← Volver a cursos
      </button>
    </div>
  );
}

export default ViewContentCourse;

