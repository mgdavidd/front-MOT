import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CourseContent.module.css";

const cursos = [
  {
    id: 1,
    nombre: "Programación",
    descripcion: "Aprende lógica, algoritmos y desarrollo web.",
    profesor: "David Mejía"
  },
  {
    id: 2,
    nombre: "Física",
    descripcion: "Estudia el movimiento, la energía y las leyes del universo.",
    profesor: "Albert Newton"
  },
  {
    id: 3,
    nombre: "Psicología",
    descripcion: "Explora la mente humana y el comportamiento.",
    profesor: "Sigmund Carl"
  }
];

export default function CourseContent() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mis Cursos</h1>
      {cursos.map((curso) => (
        <button
          key={curso.id}
          className={styles.button}
          onClick={() => navigate("/curso", { state: curso })}
        >
          {curso.nombre}
        </button>
      ))}
    </div>
  );
}
