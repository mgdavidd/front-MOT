// ModulesCourse.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ModulesCourse.module.css";
import CreateModuleModal from "./CreateModuleModal";

export default function ModulesCourse() {
  const location = useLocation();
  const course = location.state;
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchModules = async () => {
    try {
      const response = await fetch(`http://localhost:3000/modules/course/${course.id}`);
      const data = await response.json();
      setModules(data);
    } catch (err) {
      console.error("Error fetching modules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, [course]);

  if (loading) return <div className={styles.loading}>Cargando módulos...</div>;

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Módulos de {course.nombre}</h1>
        </div>
        <button className={styles.addButton} onClick={() => setShowModal(true)}>+</button>

        <ul className={styles.list}>
          {modules.map((mod) => (
            <li key={mod.id} className={styles.moduleItem} style={{ backgroundColor: mod.color || "#FFFFFF" }}>
              {mod.title || mod.nombre}
            </li>
          ))}
        </ul>
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
