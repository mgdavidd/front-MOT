import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ViewContentCourse.module.css";
import UploadContentCourse from "../../components/UploadContentCourse";
import Cookies from "js-cookie";

function ViewContentCourse() {
  const navigate = useNavigate();
  const { state: modulo } = useLocation();

  const [contenido, setContenido] = useState([]);
  const [grabaciones, setGrabaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("contenido");

  const getCurrentUser = () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return null;
      return JSON.parse(decodeURIComponent(userCookie));
    } catch (error) {
      console.error("Error al parsear cookie:", error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const userName = currentUser?.nombre;

  useEffect(() => {
    if (!modulo?.id) {
      setLoading(false);
      return;
    }

    const fetchContenido = async () => {
      try {
        const res = await fetch(`http://localhost:3000/modules/content/${modulo.id}`);
        const data = await res.json();
        setContenido(data);
      } catch (err) {
        console.error("Error al obtener el contenido del módulo:", err);
      }
    };

    const fetchGrabaciones = async () => {
      try {
        const res = await fetch(`http://localhost:3000/modules/recordings/${modulo.id}`);
        const data = await res.json();
        setGrabaciones(data);
      } catch (err) {
        console.error("Error al obtener las grabaciones del módulo:", err);
      }
    };

    Promise.all([fetchContenido(), fetchGrabaciones()]).finally(() => {
      setLoading(false);
    });
  }, [modulo]);

  const handleUpload = async (formData) => {
    try {
      const payload = new FormData();
      payload.append("file", formData.file);
      payload.append("title", formData.title);
      payload.append("moduleId", modulo.id);
      payload.append("moduleName", modulo.nombre);
      payload.append("adminUserName", userName);
      payload.append("courseName", modulo.courseName);

      const res = await fetch(`http://localhost:3000/upload-module-content/${modulo.id}`, {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!data.success) {
        console.error("Error en la subida:", data.error || "Desconocido");
        return;
      }

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

  if (!modulo) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>No se encontró información del módulo.</p>
        <button className={styles.button} onClick={() => navigate("/instructorNav")}>
          Volver
        </button>
      </div>
    );
  }

  if (loading) return <div className={styles.container}>Cargando contenido del módulo...</div>;

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{modulo.nombre}</h1>
      {modulo.descripcion && (
        <p className={styles.text}><strong>Descripción:</strong> {modulo.descripcion}</p>
      )}

      {/* Navegación de pestañas */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === "contenido" ? styles.active : ""}`}
          onClick={() => setActiveTab("contenido")}
        >
          Contenido
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "grabaciones" ? styles.active : ""}`}
          onClick={() => setActiveTab("grabaciones")}
        >
          Grabaciones
        </button>
      </div>

      {/* Contenido del módulo */}
      {activeTab === "contenido" && (
        <div className={styles.section}>
          <h2 className={styles.subtitle}>Contenido del módulo</h2>
          {contenido.length === 0 ? (
            <p className={styles.placeholder}>Aún no hay contenido agregado.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Enlace</th>
                </tr>
              </thead>
              <tbody>
                {contenido.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.titulo}</td>
                    <td>
                      <a href={item.link} target="_blank" rel="noopener noreferrer">Ver</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button className={styles.addButton} onClick={() => setShowUploadModal(true)}>
            + Agregar contenido
          </button>
        </div>
      )}

      {/* Grabaciones del módulo */}
      {activeTab === "grabaciones" && (
        <div className={styles.section}>
          <h2 className={styles.subtitle}>Grabaciones del módulo</h2>
          {grabaciones.length === 0 ? (
            <p className={styles.placeholder}>Aún no hay grabaciones disponibles.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Fecha</th>
                  <th>Enlace</th>
                </tr>
              </thead>
              <tbody>
                {grabaciones.map((rec, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{rec.titulo}</td>
                    <td>{rec.inicio ? formatFecha(rec.inicio) : "Sin fecha"}</td>
                    <td>
                      <a href={rec.link} target="_blank" rel="noopener noreferrer">Ver</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Volver
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

