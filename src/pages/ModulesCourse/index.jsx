import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ModulesCourse.module.css";
import CreateModuleModal from "./CreateModuleModal";
import Cookies from "js-cookie";
import StudentsList from "./StudentsList";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export default function ModulesCourse() {
  const location = useLocation();
  const course = location.state;
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [progresoActual, setProgresoActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Leer cookie cada vez que se monte el componente
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userCookie = Cookies.get("user");
        if (userCookie) {
          setCurrentUser(JSON.parse(decodeURIComponent(userCookie)));
        }
      } catch (err) {
        console.error("Error leyendo user cookie:", err);
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []); // <- ejecuta solo al montar

  const fetchModules = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`http://localhost:3000/courses/${course.id}/modules/${currentUser.id}`);
      const data = await response.json();

      if (currentUser.rol === "estudiante") {
        setModules(data.result || []);
        setProgresoActual(data.progresoActual || null);
      } else {
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
  }, [course, currentUser]);

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
        courseName: course.nombre,
        id_curso: course.id,
        tipoCurso: course.tipoCurso,
      },
    });
  };

  const handleDeleteCourse = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este curso?")) {
      try {
        const response = await fetch(`http://localhost:3000/del/courses/${course.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Cookies.get("token")}`
          }
        });
        if (response.ok) {
          alert("Curso eliminado con éxito.");
          navigate("/instructorNav");
        } else {
          alert("Error al eliminar el curso.");
        }
      } catch (error) {
        console.error("Error al eliminar el curso:", error);
      }
    }
  };

  const handleDeleteModule = async (moduleId, moduleName, e) => {
    e.stopPropagation(); // Prevenir que se active el click del módulo

    confirmAlert({
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el módulo "${moduleName}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          label: 'Sí, eliminar',
          onClick: async () => {
            try {
              const token = Cookies.get("token");
              const response = await fetch(`http://localhost:3000/modules/${moduleId}`, {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              });

              const result = await response.json();

              if (response.ok) {
                alert("Módulo eliminado con éxito.");
                fetchModules(); // Recargar la lista
              } else {
                alert(`Error: ${result.error || "No se pudo eliminar el módulo"}`);
              }
            } catch (error) {
              console.error("Error al eliminar módulo:", error);
              alert("Error al eliminar el módulo");
            }
          }
        },
        {
          label: 'Cancelar',
          onClick: () => {}
        }
      ]
    });
  };

  if (loading) return <div className={styles.loading}>Cargando módulos...</div>;

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <button onClick={handleDeleteCourse} style={{ backgroundColor: "red", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}>Eliminar Curso</button>
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
              <div className={styles.moduleContent}>
                <span>{mod.title || mod.nombre}</span>
                
                {currentUser.rol === "profesor" && (
                  <button 
                    className={styles.deleteModuleButton}
                    onClick={(e) => handleDeleteModule(mod.id, mod.title || mod.nombre, e)}
                    title="Eliminar módulo"
                  >
                    <img src="../../img/basura.png" alt="eliminar" className={styles.deleteIcon}/>
                  </button>
                )}
              </div>
              
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