import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ViewContentCourse.module.css";
import UploadContentCourse from "../../components/UploadContentCourse";
import Cookies from "js-cookie"

function ViewContentCourse() {

  const getCurrentUser = () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return null;
      const decoded = decodeURIComponent(userCookie);
      return JSON.parse(decoded);
    } catch (error) {
      console.error("Error al parsear cookie:", error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const userName = currentUser?.nombre;
  
  const { state: curso } = useLocation();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [contenido, setContenido] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!curso?.id) {
      setLoading(false);
      return;
    }

    const fetchContenido = async () => {
      try {
        const res = await fetch(`http://localhost:3000/courses/content/${curso.id}`);
        const data = await res.json();
        setContenido(data);
      } catch (err) {
        console.error("Error al obtener el contenido del curso:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContenido();
  }, [curso]);

  const handleUpload = async (formData) => {
    try {
      const payload = new FormData();
      payload.append("file", formData.file);
      payload.append("title", formData.title);
      payload.append("courseId", curso.id);
      payload.append("courseName", curso.nombre);
      payload.append("adminUserName", userName);

      const res = await fetch("http://localhost:3000/upload-course-content", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!data.success) {
        console.error("Error en la subida:", data.error || "Desconocido");
        return;
      }

      // Agregar al estado
      setContenido((prev) => [
        ...prev,
        {
          titulo: formData.title,
          link: data.fileLink,
        },
      ]);
    } catch (err) {
      console.error("Error al subir contenido:", err);
    }
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

  if (loading) return <div className={styles.container}>Cargando contenido...</div>;

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
                📄 <strong>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.titulo}
                  </a>
                </strong>
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
