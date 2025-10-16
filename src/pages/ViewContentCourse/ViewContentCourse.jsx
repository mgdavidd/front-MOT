import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ViewContentCourse.module.css";
import UploadContentCourse from "../../components/ViewContentCourse/UploadContentCourse";
import ModalCrearPruebaFinal from "../../components/ViewContentCourse/ModalCrearPruebaFinal";
import ModalEditarPruebaFinal from "../../components/ViewContentCourse/ModalEditarPruebaFinal";
import ModalResponderPruebaFinal from "../../components/ViewContentCourse/ModalResponderPruebaFinal";
import ModalEditarContenido from "../../components/ViewContentCourse/ModalEditarContenido";
import ContentList from "../../components/ViewContentCourse/ContentPreview";
import Cookies from "js-cookie";

//iconos
import { FaPlus, FaArrowLeft, FaPen, FaCheck, FaComments, FaFileAlt } from "react-icons/fa";

export default function ViewContentCourse() {
  const navigate = useNavigate();
  const { state: modulo } = useLocation();

  const [contenido, setContenido] = useState([]);
  const [grabaciones, setGrabaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("contenido");

  const [pruebaFinal, setPruebaFinal] = useState(null);
  const [showCrearPrueba, setShowCrearPrueba] = useState(false);
  const [showEditarPrueba, setShowEditarPrueba] = useState(false);
  const [showResponderPrueba, setShowResponderPrueba] = useState(false);
  
  // 🆕 Nota máxima específica del módulo actual
  const [notaMaximaModulo, setNotaMaximaModulo] = useState(null);
  
  const [contenidoVisto, setContenidoVisto] = useState(false);
  const [actualizandoProgreso, setActualizandoProgreso] = useState(false);
  const [modulosCurso, setModulosCurso] = useState([]);

  const getCurrentUser = () => {
    try {
      const cookie = Cookies.get("user");
      return cookie ? JSON.parse(cookie) : null;
    } catch {
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const userName = currentUser?.nombre;
  const token = Cookies.get("token");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!modulo?.id) {
      setLoading(false);
      return;
    }

    const fetchContenido = async () => {
      try {
        const res = await fetch(
          `https://server-mot.onrender.com/modules/content/${modulo.id}`,
          { headers: { ...authHeaders } }
        );
        setContenido(await res.json());
      } catch (err) {
        console.error("Error al obtener el contenido del módulo:", err);
        setContenido([]);
      }
    };

    const fetchGrabaciones = async () => {
      try {
        const res = await fetch(
          `https://server-mot.onrender.com/modules/recordings/${modulo.id}`,
          { headers: { ...authHeaders } }
        );
        setGrabaciones(await res.json());
      } catch (err) {
        console.error("Error al obtener las grabaciones del módulo:", err);
        setGrabaciones([]);
      }
    };

    const fetchPruebaFinal = async () => {
      try {
        const res = await fetch(
          `https://server-mot.onrender.com/modules/${modulo.id}/quizzes`,
          { headers: { ...authHeaders } }
        );
        const data = await res.json();
        setPruebaFinal(
          Array.isArray(data) && data.length > 0
            ? {
                ...data[0],
                preguntas:
                  typeof data[0].preguntas === "string"
                    ? JSON.parse(data[0].preguntas)
                    : data[0].preguntas,
              }
            : null
        );
      } catch (err) {
        console.error("Error al obtener la prueba final:", err);
        setPruebaFinal(null);
      }
    };

    Promise.all([fetchContenido(), fetchGrabaciones(), fetchPruebaFinal()]).finally(
      () => setLoading(false)
    );
  }, [modulo]);

  const [modalData, setModalData] = useState(null);

  const handleUpdateLocalState = (updatedItem) => {
    if (updatedItem.deleted) {
      if (modalData.type === "grabacion") {
        setGrabaciones((prev) => prev.filter((g) => g.id !== updatedItem.id));
      } else {
        setContenido((prev) => prev.filter((c) => c.id !== updatedItem.id));
      }
    } else {
      if (modalData.type === "grabacion") {
        setGrabaciones((prev) =>
          prev.map((g) => (g.id === updatedItem.id ? updatedItem : g))
        );
      } else {
        setContenido((prev) =>
          prev.map((c) => (c.id === updatedItem.id ? updatedItem : c))
        );
      }
    }
  };

  // 🆕 Obtener nota máxima específica del módulo actual
  useEffect(() => {
    async function fetchNotaMaximaModulo() {
      if (!currentUser || !modulo?.id || !pruebaFinal?.id) {
        setNotaMaximaModulo(null);
        return;
      }
      
      try {
        const res = await fetch(
          `https://server-mot.onrender.com/modules/${modulo.id}/quizzes/${pruebaFinal.id}/attempts/${currentUser.id}`,
          { headers: { ...authHeaders } }
        );
        const data = await res.json();
        
        // data.nota_maxima es la mejor nota del usuario en este módulo
        setNotaMaximaModulo(
          typeof data.nota_maxima === "number" ? data.nota_maxima : null
        );
      } catch (err) {
        console.error("Error obteniendo nota máxima del módulo:", err);
        setNotaMaximaModulo(null);
      }
    }
    
    fetchNotaMaximaModulo();
  }, [modulo, currentUser, pruebaFinal]);

  useEffect(() => {
    async function fetchModulosCurso() {
      if (!modulo?.id_curso) return;
      try {
        const res = await fetch(
          `https://server-mot.onrender.com/modules/course/${modulo.id_curso}`,
          { headers: { ...authHeaders } }
        );
        const data = await res.json();
        
        // Ordenar por orden
        const ordenados = Array.isArray(data) ? [...data] : [];
        ordenados.sort((a, b) => (a.orden || 0) - (b.orden || 0));
        
        setModulosCurso(ordenados);
      } catch (err) {
        console.error("Error al obtener los modulos del curso", err);
        setModulosCurso([]);
      }
    }
    fetchModulosCurso();
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

      let endpoint;
      let isRecordingUpload = false;

      if (activeTab === "grabaciones" && modulo.tipoCurso === "pregrabado") {
        endpoint = `https://server-mot.onrender.com/upload-pre-recording/${modulo.id}`;
        isRecordingUpload = true;
      } else if (activeTab === "contenido") {
        endpoint = `https://server-mot.onrender.com/upload-module-content/${modulo.id}`;
      } else {
        console.error("Configuración inválida para subir archivo");
        return;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { ...authHeaders },
        body: payload,
      });

      const data = await res.json();

      if (!data.success) {
        console.error("Error en la subida:", data.error || "Desconocido");
        return;
      }

      if (isRecordingUpload) {
        setGrabaciones((prev) => [
          ...prev,
          { id: Date.now(), titulo: formData.title, link: data.fileLink, inicio: null },
        ]);
      } else {
        setContenido((prev) => [
          ...prev,
          { id: Date.now(), titulo: formData.title, link: data.fileLink },
        ]);
      }
    } catch (err) {
      console.error("Error al subir:", err);
    }
  };

  const handleCrearPrueba = async (pruebaData) => {
    try {
      const payload = {
        ...pruebaData,
        preguntas:
          typeof pruebaData.preguntas === "string"
            ? pruebaData.preguntas
            : JSON.stringify(pruebaData.preguntas),
      };
      const res = await fetch(`https://server-mot.onrender.com/modules/${modulo.id}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        const pruebaRes = await fetch(
          `https://server-mot.onrender.com/modules/${modulo.id}/quizzes`,
          { headers: { ...authHeaders } }
        );
        const pruebaArr = await pruebaRes.json();
        setPruebaFinal(
          Array.isArray(pruebaArr) && pruebaArr.length > 0
            ? {
                ...pruebaArr[0],
                preguntas:
                  typeof pruebaArr[0].preguntas === "string"
                    ? JSON.parse(pruebaArr[0].preguntas)
                    : pruebaArr[0].preguntas,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Error al crear prueba final:", err);
    }
  };

  const handleEditarPrueba = async (pruebaData) => {
    try {
      const payload = {
        ...pruebaData,
        preguntas:
          typeof pruebaData.preguntas === "string"
            ? pruebaData.preguntas
            : JSON.stringify(pruebaData.preguntas),
      };
      const res = await fetch(
        `https://server-mot.onrender.com/modules/${modulo.id}/quizzes/${pruebaFinal.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (data.success) {
        const pruebaRes = await fetch(
          `https://server-mot.onrender.com/modules/${modulo.id}/quizzes`,
          { headers: { ...authHeaders } }
        );
        const pruebaArr = await pruebaRes.json();
        setPruebaFinal(
          Array.isArray(pruebaArr) && pruebaArr.length > 0
            ? {
                ...pruebaArr[0],
                preguntas:
                  typeof pruebaArr[0].preguntas === "string"
                    ? JSON.parse(pruebaArr[0].preguntas)
                    : pruebaArr[0].preguntas,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Error al editar prueba final:", err);
    }
  };

  // 🆕 Marcar contenido como visto (solo si NO hay prueba final)
  const handleContenidoVisto = async () => {
    if (actualizandoProgreso) return;
    
    // Si hay prueba final, el estudiante debe aprobarla primero
    if (pruebaFinal) {
      alert("Debes aprobar la prueba final para avanzar al siguiente módulo.");
      return;
    }
    
    setActualizandoProgreso(true);

    try {
      if (!modulosCurso || modulosCurso.length === 0) {
        alert("No se encontraron módulos para este curso.");
        return;
      }

      const idxActual = modulosCurso.findIndex((m) => m.id === modulo.id);
      const siguienteModulo = idxActual !== -1 ? modulosCurso[idxActual + 1] : undefined;

      if (siguienteModulo) {
        const progressRes = await fetch(
          `https://server-mot.onrender.com/courses/${modulo.id_curso}/progress`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({
              id_usuario: currentUser.id,
              id_modulo_actual: siguienteModulo.id,
              nota_maxima: null, // Sin nota porque no hay prueba
              modulo_anterior: modulo.id
            }),
          }
        );
        
        const progressData = await progressRes.json();
        
        if (progressData.success) {
          alert("¡Progreso actualizado! Puedes avanzar al siguiente módulo.");
          setContenidoVisto(true);
        } else {
          alert(progressData.error || "Error actualizando el progreso.");
        }
      } else {
        alert("¡Felicidades! Has completado el curso.");
        setContenidoVisto(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error actualizando el progreso.");
    } finally {
      setActualizandoProgreso(false);
    }
  };

  if (!modulo) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>No se encontró información del módulo.</p>
        <button className={styles.backButton} onClick={() => navigate("/instructorNav")}>
          <FaArrowLeft />
        </button>
      </div>
    );
  }

  if (loading) return <div className={styles.container}>Cargando contenido del módulo...</div>;

  const shouldShowAddButton = () => {
    if (currentUser?.rol !== "profesor") return false;
    if (activeTab === "contenido") return true;
    if (activeTab === "grabaciones" && modulo.tipoCurso === "pregrabado") return true;
    return false;
  };

  const shouldShowEditButtons = (itemType) => {
    if (currentUser?.rol !== "profesor") return false;
    if (itemType === "contenido" && activeTab === "contenido") return true;
    if (itemType === "grabacion" && activeTab === "grabaciones" && modulo.tipoCurso === "pregrabado") return true;
    return false;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{modulo.nombre}</h1>
      {modulo.descripcion && <p className={styles.text}><strong>Descripción:</strong> {modulo.descripcion}</p>}

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

      <div className={styles.section}>
        <h2 className={styles.subtitle}>
          {activeTab === "contenido" ? "Contenido del módulo" : "Grabaciones del módulo"}
        </h2>
        <ContentList
          contenido={contenido}
          grabaciones={grabaciones}
          activeTab={activeTab}
          shouldShowEditButtons={shouldShowEditButtons}
          onEdit={(item, type) => setModalData({ type, item })}
        />
        {shouldShowAddButton() && (
          <button className={styles.iconButton} onClick={() => setShowUploadModal(true)}>
            <FaPlus />
          </button>
        )}
      </div>

      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <FaArrowLeft />
      </button>

      {currentUser?.rol === "profesor" && !pruebaFinal && (
        <button onClick={() => setShowCrearPrueba(true)} className={styles.iconButton}>
          <FaFileAlt />
        </button>
      )}
      {currentUser?.rol === "profesor" && pruebaFinal && (
        <button onClick={() => setShowEditarPrueba(true)} className={styles.iconButton}>
          <FaPen />
        </button>
      )}
      {currentUser?.rol === "estudiante" && pruebaFinal && (
        <button onClick={() => setShowResponderPrueba(true)} className={styles.iconButton}>
          <FaCheck />
        </button>
      )}

      {showCrearPrueba && (
        <ModalCrearPruebaFinal
          onClose={() => setShowCrearPrueba(false)}
          onCreate={handleCrearPrueba}
          contenido={contenido}
          authHeaders={authHeaders}
        />
      )}
      {showEditarPrueba && (
        <ModalEditarPruebaFinal prueba={pruebaFinal} onClose={() => setShowEditarPrueba(false)} onEdit={handleEditarPrueba} />
      )}
      {showResponderPrueba && (
        <ModalResponderPruebaFinal
          prueba={pruebaFinal}
          onClose={() => setShowResponderPrueba(false)}
          modulo={modulo}
          currentUser={currentUser}
          modulosCurso={modulosCurso}
        />
      )}

      {modalData && (
        <ModalEditarContenido
          item={modalData.item}
          type={modalData.type}
          onClose={() => setModalData(null)}
          onSuccess={handleUpdateLocalState}
        />
      )}

      {showUploadModal && (
        <UploadContentCourse
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUpload}
          isRecording={activeTab === "grabaciones" && modulo.tipoCurso === "pregrabado"}
        />
      )}

      {/* 🆕 Mostrar nota máxima del módulo actual (solo si hay prueba) */}
      {currentUser?.rol === "estudiante" && pruebaFinal && notaMaximaModulo !== null && (
        <div className={styles.notaMaxima}>
          <strong>Tu mejor nota en este módulo:</strong> {notaMaximaModulo.toFixed(1)}
        </div>
      )}

      {/* 🆕 Checkbox solo si NO hay prueba final */}
      {currentUser?.rol === "estudiante" && !pruebaFinal && (
        <div style={{ marginTop: "2rem" }}>
          <label>
            <input
              type="checkbox"
              checked={contenidoVisto}
              disabled={contenidoVisto || actualizandoProgreso}
              onChange={handleContenidoVisto}
            />{" "}
            He visto todo el contenido del módulo
          </label>
        </div>
      )}

      <button
        className={styles.iconButton}
        onClick={() =>
          navigate("/forum", {
            state: { idModulo: modulo.id, idUsuario: currentUser.id, modulo },
          })
        }
      >
        <FaComments />
      </button>
    </div>
  );
}