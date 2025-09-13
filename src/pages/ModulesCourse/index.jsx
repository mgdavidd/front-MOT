import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ModulesCourse.module.css";
import CreateModuleModal from "./CreateModuleModal";
import Cookies from "js-cookie";
import StudentsList from "./StudentsList";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

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
          setCurrentUser(JSON.parse(userCookie));
        }
      } catch (err) {
        console.error("Error leyendo user cookie:", err);
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  const fetchModules = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(
        `http://localhost:3000/courses/${course.id}/modules/${currentUser.id}`
      );
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
    if (currentUser.rol === "estudiante" && !module.desbloqueado) {
      confirmAlert({
        title: "Módulo Bloqueado 🔒",
        message: "Este módulo está bloqueado. Debes completar los módulos anteriores primero.",
        buttons: [
          {
            label: "Entendido",
            onClick: () => {},
            className: styles.confirmButton
          }
        ],
        customUI: ({ onClose, title, message, buttons }) => (
          <div className={styles.customAlert}>
            <div className={styles.alertHeader}>
              <h2 className={styles.alertTitle}>{title}</h2>
            </div>
            <div className={styles.alertBody}>
              <p className={styles.alertMessage}>{message}</p>
            </div>
            <div className={styles.alertFooter}>
              {buttons.map((button, index) => (
                <button
                  key={index}
                  className={`${styles.alertButton} ${styles.infoButton}`}
                  onClick={() => {
                    button.onClick();
                    onClose();
                  }}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        )
      });
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
    confirmAlert({
      title: "Eliminar Curso",
      message: `¿Estás seguro de que deseas eliminar el curso "${course.nombre}"? Esta acción eliminará todos los módulos y no se puede deshacer.`,
      buttons: [
        {
          label: "Sí, eliminar",
          onClick: async () => {
            try {
              const response = await fetch(
                `http://localhost:3000/del/courses/${course.id}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Cookies.get("token")}`,
                  },
                }
              );
              if (response.ok) {
                confirmAlert({
                  title: "¡Éxito!",
                  message: "Curso eliminado correctamente.",
                  buttons: [
                    {
                      label: "Aceptar",
                      onClick: () => navigate("/instructorNav")
                    }
                  ],
                  customUI: ({ onClose, title, message, buttons }) => (
                    <div className={styles.customAlert}>
                      <div className={styles.alertHeader}>
                        <h2 className={`${styles.alertTitle} ${styles.successTitle}`}>✅ {title}</h2>
                      </div>
                      <div className={styles.alertBody}>
                        <p className={styles.alertMessage}>{message}</p>
                      </div>
                      <div className={styles.alertFooter}>
                        {buttons.map((button, index) => (
                          <button
                            key={index}
                            className={`${styles.alertButton} ${styles.successButton}`}
                            onClick={() => {
                              button.onClick();
                              onClose();
                            }}
                          >
                            {button.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                });
              } else {
                confirmAlert({
                  title: "Error",
                  message: "Ocurrió un error al eliminar el curso. Por favor, intenta nuevamente.",
                  buttons: [
                    {
                      label: "Aceptar",
                      onClick: () => {}
                    }
                  ],
                  customUI: ({ onClose, title, message, buttons }) => (
                    <div className={styles.customAlert}>
                      <div className={styles.alertHeader}>
                        <h2 className={`${styles.alertTitle} ${styles.errorTitle}`}>❌ {title}</h2>
                      </div>
                      <div className={styles.alertBody}>
                        <p className={styles.alertMessage}>{message}</p>
                      </div>
                      <div className={styles.alertFooter}>
                        {buttons.map((button, index) => (
                          <button
                            key={index}
                            className={`${styles.alertButton} ${styles.errorButton}`}
                            onClick={() => {
                              button.onClick();
                              onClose();
                            }}
                          >
                            {button.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                });
              }
            } catch (error) {
              console.error("Error al eliminar el curso:", error);
              confirmAlert({
                title: "Error de Conexión",
                message: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
                buttons: [
                  {
                    label: "Aceptar",
                    onClick: () => {}
                  }
                ],
                customUI: ({ onClose, title, message, buttons }) => (
                  <div className={styles.customAlert}>
                    <div className={styles.alertHeader}>
                      <h2 className={`${styles.alertTitle} ${styles.errorTitle}`}>❌ {title}</h2>
                    </div>
                    <div className={styles.alertBody}>
                      <p className={styles.alertMessage}>{message}</p>
                    </div>
                    <div className={styles.alertFooter}>
                      {buttons.map((button, index) => (
                        <button
                          key={index}
                          className={`${styles.alertButton} ${styles.errorButton}`}
                          onClick={() => {
                            button.onClick();
                            onClose();
                          }}
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              });
            }
          },
        },
        {
          label: "Cancelar",
          onClick: () => {},
        },
      ],
      customUI: ({ onClose, title, message, buttons }) => (
        <div className={styles.customAlert}>
          <div className={styles.alertHeader}>
            <h2 className={`${styles.alertTitle} ${styles.dangerTitle}`}>⚠️ {title}</h2>
          </div>
          <div className={styles.alertBody}>
            <p className={styles.alertMessage}>{message}</p>
          </div>
          <div className={styles.alertFooter}>
            {buttons.map((button, index) => (
              <button
                key={index}
                className={`${styles.alertButton} ${
                  index === 0 ? styles.dangerButton : styles.cancelButton
                }`}
                onClick={() => {
                  button.onClick();
                  onClose();
                }}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      )
    });
  };

  const handleDeleteModule = async (moduleId, moduleName, e) => {
    e.stopPropagation();

    confirmAlert({
      title: "Eliminar Módulo",
      message: `¿Estás seguro de que deseas eliminar el módulo "${moduleName}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          label: "Sí, eliminar",
          onClick: async () => {
            try {
              const token = Cookies.get("token");
              const response = await fetch(
                `http://localhost:3000/modules/${moduleId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              const result = await response.json();

              if (response.ok) {
                confirmAlert({
                  title: "¡Éxito!",
                  message: "Módulo eliminado correctamente.",
                  buttons: [
                    {
                      label: "Aceptar",
                      onClick: () => fetchModules()
                    }
                  ],
                  customUI: ({ onClose, title, message, buttons }) => (
                    <div className={styles.customAlert}>
                      <div className={styles.alertHeader}>
                        <h2 className={`${styles.alertTitle} ${styles.successTitle}`}>✅ {title}</h2>
                      </div>
                      <div className={styles.alertBody}>
                        <p className={styles.alertMessage}>{message}</p>
                      </div>
                      <div className={styles.alertFooter}>
                        {buttons.map((button, index) => (
                          <button
                            key={index}
                            className={`${styles.alertButton} ${styles.successButton}`}
                            onClick={() => {
                              button.onClick();
                              onClose();
                            }}
                          >
                            {button.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                });
              } else {
                confirmAlert({
                  title: "Error",
                  message: `Error: ${result.error || "No se pudo eliminar el módulo"}`,
                  buttons: [
                    {
                      label: "Aceptar",
                      onClick: () => {}
                    }
                  ],
                  customUI: ({ onClose, title, message, buttons }) => (
                    <div className={styles.customAlert}>
                      <div className={styles.alertHeader}>
                        <h2 className={`${styles.alertTitle} ${styles.errorTitle}`}>❌ {title}</h2>
                      </div>
                      <div className={styles.alertBody}>
                        <p className={styles.alertMessage}>{message}</p>
                      </div>
                      <div className={styles.alertFooter}>
                        {buttons.map((button, index) => (
                          <button
                            key={index}
                            className={`${styles.alertButton} ${styles.errorButton}`}
                            onClick={() => {
                              button.onClick();
                              onClose();
                            }}
                          >
                            {button.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                });
              }
            } catch (error) {
              console.error("Error al eliminar módulo:", error);
              confirmAlert({
                title: "Error de Conexión",
                message: "No se pudo eliminar el módulo. Verifica tu conexión a internet.",
                buttons: [
                  {
                    label: "Aceptar",
                    onClick: () => {}
                  }
                ],
                customUI: ({ onClose, title, message, buttons }) => (
                  <div className={styles.customAlert}>
                    <div className={styles.alertHeader}>
                      <h2 className={`${styles.alertTitle} ${styles.errorTitle}`}>❌ {title}</h2>
                    </div>
                    <div className={styles.alertBody}>
                      <p className={styles.alertMessage}>{message}</p>
                    </div>
                    <div className={styles.alertFooter}>
                      {buttons.map((button, index) => (
                        <button
                          key={index}
                          className={`${styles.alertButton} ${styles.errorButton}`}
                          onClick={() => {
                            button.onClick();
                            onClose();
                          }}
                        >
                          {button.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              });
            }
          },
        },
        {
          label: "Cancelar",
          onClick: () => {},
        },
      ],
      customUI: ({ onClose, title, message, buttons }) => (
        <div className={styles.customAlert}>
          <div className={styles.alertHeader}>
            <h2 className={`${styles.alertTitle} ${styles.dangerTitle}`}>⚠️ {title}</h2>
          </div>
          <div className={styles.alertBody}>
            <p className={styles.alertMessage}>{message}</p>
          </div>
          <div className={styles.alertFooter}>
            {buttons.map((button, index) => (
              <button
                key={index}
                className={`${styles.alertButton} ${
                  index === 0 ? styles.dangerButton : styles.cancelButton
                }`}
                onClick={() => {
                  button.onClick();
                  onClose();
                }}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      )
    });
  };

  if (loading) return <div className={styles.loading}>
    <div className={styles.loadingSpinner}></div>
    <p>Cargando módulos...</p>
  </div>;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header con información del curso */}
        <div className={styles.courseHeader}>
          <div className={styles.courseInfo}>
            <h1 className={styles.title}>{course.nombre}</h1>
            {currentUser &&
              currentUser.rol === "estudiante" &&
              progresoActual && (
                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{
                        width: `${((modules.findIndex(m => m.id === progresoActual.id_modulo_actual) + 1) / modules.length) * 100}%`
                      }}
                    ></div>
                  </div>
                  <p className={styles.progressInfo}>
                    Progreso: Módulo{" "}
                    {progresoActual.id_modulo_actual
                      ? modules.findIndex(
                          (m) => m.id === progresoActual.id_modulo_actual
                        ) + 1
                      : 1}{" "}
                    de {modules.length}
                  </p>
                </div>
              )}
          </div>

          {/* Botones de acción */}
          <div className={styles.actionButtons}>
            {currentUser && currentUser.rol === "profesor" && (
              <>
                <button
                  className={styles.addButton}
                  onClick={() => setShowModal(true)}
                  title="Agregar nuevo módulo"
                >
                  <span className={styles.addIcon}>+</span>
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={handleDeleteCourse}
                  title="Eliminar curso"
                >
                  <span className={styles.deleteIcon}>🗑️</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Lista de módulos */}
        <div className={styles.modulesGrid}>
          {modules.map((mod, index) => (
            <div
              key={mod.id}
              className={`${styles.moduleCard} ${
                currentUser.rol === "estudiante" && !mod.desbloqueado
                  ? styles.lockedModule
                  : ""
              }`}
              style={{
                backgroundColor: mod.color || "#FFFFFF",
                cursor:
                  currentUser.rol === "estudiante" && !mod.desbloqueado
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  currentUser.rol === "estudiante" && !mod.desbloqueado
                    ? 0.7
                    : 1,
              }}
              onClick={() => handleModuleClick(mod)}
            >
              <div className={styles.moduleNumber}>{index + 1}</div>
              
              <div className={styles.moduleContent}>
                <h3 className={styles.moduleName}>{mod.title || mod.nombre}</h3>
                
                {currentUser.rol === "estudiante" && !mod.desbloqueado && (
                  <div className={styles.lockBadge}>
                    <span className={styles.lockIcon}>🔒</span>
                    <span>Bloqueado</span>
                  </div>
                )}

                {currentUser.rol === "profesor" && (
                  <button
                    className={styles.deleteModuleButton}
                    onClick={(e) =>
                      handleDeleteModule(mod.id, mod.title || mod.nombre, e)
                    }
                    title="Eliminar módulo"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {modules.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📚</div>
            <h3>No hay módulos aún</h3>
            <p>
              {currentUser?.rol === "profesor" 
                ? "Comienza agregando tu primer módulo"
                : "El profesor aún no ha agregado módulos a este curso"
              }
            </p>
          </div>
        )}

        {/* Lista de estudiantes para estudiantes */}
        {currentUser && currentUser.rol === "estudiante" && (
          <StudentsList
            courseId={course.id}
            docente={{
              id: course.admin || "",
              nombre: "Docente",
              fotoPerfil: course.fotoPerfil || "",
              color_perfil: "#e0e7ef",
            }}
          />
        )}

        {/* Botón volver */}
        <button
          className={styles.backButton}
          onClick={() => navigate("/instructorNav")}
        >
          ← Volver al inicio
        </button>
      </div>

      {/* Modal para crear módulo */}
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