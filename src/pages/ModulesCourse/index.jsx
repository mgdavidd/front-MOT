import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ModulesCourse.module.css";
import CreateModuleModal from "./CreateModuleModal";
import Cookies from "js-cookie" 
import StudentsList from "./StudentsList";

const getCurrentUser = async () => {
  try {
    const userCookie = await Cookies.get("user");
    if (!userCookie) return null;
    const decoded = await decodeURIComponent(userCookie);
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Error al parsear cookie:", error);
    return null;
  }
};

const currentUser = await getCurrentUser();
const userId = currentUser?.id;

export default function ModulesCourse() {
  const location = useLocation();
  const course = location.state;
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [progresoActual, setProgresoActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchModules = async () => {
    try {
      const response = await fetch(`http://localhost:3000/courses/${course.id}/modules/${userId}`);
      const data = await response.json();
      
      // Para estudiantes, la API devuelve {result, progresoActual}
      if (currentUser.rol === "estudiante") {
        setModules(data.result || []);
        setProgresoActual(data.progresoActual || null);
      } else {
        // Para profesores, la API devuelve directamente el array
        setModules(data || []);
      }
    } catch (err) {
      console.error("Error fetching modules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [course]);

  const handleModuleClick = (module) => {
    // Para estudiantes, verificar si el módulo está desbloqueado
    if (currentUser.rol === "estudiante" && !module.desbloqueado) {
      alert("Este módulo está bloqueado. Debes completar los módulos anteriores primero.");
      return;
    }
    
    navigate("/viewContent", {
      state: {
        id: module.id,
        nombre: module.title || module.nombre,
        descripcion: module.descripcion || "",
        profesor: course.profesor || "Profesor no especificado",
        courseName: course.nombre,
        id_curso: course.id
      },
    });
  };

  if (loading) return <div className={styles.loading}>Cargando módulos...</div>;

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Módulos de {course.nombre}</h1>
          {currentUser && currentUser.rol === "estudiante" && progresoActual && (
            <p className={styles.progressInfo}>
              Tu progreso actual: Módulo {progresoActual.id_modulo_actual ? modules.findIndex(m => m.id === progresoActual.id_modulo_actual) + 1 : 1} de {modules.length}
            </p>
          )}
        </div>
        {currentUser && currentUser.rol === "profesor" && (
          <button className={styles.addButton} onClick={() => setShowModal(true)}>+</button>
        )}

        <ul className={styles.list}>
          {modules.map((mod) => (
            <li
              key={mod.id}
              className={`${styles.moduleItem} ${currentUser.rol === "estudiante" && !mod.desbloqueado ? styles.lockedModule : ""}`}
              style={{ 
                backgroundColor: mod.color || "#FFFFFF", 
                cursor: currentUser.rol === "estudiante" && !mod.desbloqueado ? "not-allowed" : "pointer",
                opacity: currentUser.rol === "estudiante" && !mod.desbloqueado ? 0.6 : 1
              }}
              onClick={() => handleModuleClick(mod)}
            >
              {mod.title || mod.nombre}
              {currentUser.rol === "estudiante" && !mod.desbloqueado && (
                <span className={styles.lockIcon}> 🔒</span>
              )}
            </li>
          ))}
        </ul>

        {currentUser && currentUser.rol === "estudiante" && (
          <StudentsList courseId={course.id} docente={{
            id: course.admin || "",
            nombre: "Docente",
            fotoPerfil: course.fotoPerfil || "",
            color_perfil: "#e0e7ef"
          }} />
        )}

        {/* Botón de retroceso */}
        <button className={styles.backButton} onClick={() => navigate("/instructorNav")}>
          ← Volver
        </button>
      </div>

      {showModal && (
        <CreateModuleModal
          courseId={course.id}
          onClose={() => setShowModal(false)}
          onModuleCreated={fetchModules}
        />
      )}
    </div>
  );
}