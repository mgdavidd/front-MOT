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

export default function ViewContentCourse() {
  const navigate = useNavigate();
  const { state: modulo } = useLocation();
  console.log(modulo);

  const [contenido, setContenido] = useState([]);
  const [grabaciones, setGrabaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("contenido");

  // Estados para prueba final
  const [pruebaFinal, setPruebaFinal] = useState(null);
  const [showCrearPrueba, setShowCrearPrueba] = useState(false);
  const [showEditarPrueba, setShowEditarPrueba] = useState(false);
  const [showResponderPrueba, setShowResponderPrueba] = useState(false);
  const [notaMaxima, setNotaMaxima] = useState(null);
  const [contenidoVisto, setContenidoVisto] = useState(false);
  const [actualizandoProgreso, setActualizandoProgreso] = useState(false);
  const [modulosCurso, setModulosCurso] = useState([]);

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
        const res = await fetch(
          `http://localhost:3000/modules/content/${modulo.id}`
        );
        const data = await res.json();
        setContenido(data);
      } catch (err) {
        console.error("Error al obtener el contenido del módulo:", err);
      }
    };

    const fetchGrabaciones = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/modules/recordings/${modulo.id}`
        );
        const data = await res.json();
        setGrabaciones(data);
      } catch (err) {
        console.error("Error al obtener las grabaciones del módulo:", err);
      }
    };

    const fetchPruebaFinal = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/modules/${modulo.id}/quizzes`
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
      }
    };

    Promise.all([
      fetchContenido(),
      fetchGrabaciones(),
      fetchPruebaFinal(),
    ]).finally(() => {
      setLoading(false);
    });
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

  useEffect(() => {
    async function fetchNotaMaxima() {
      if (!currentUser || !modulo?.id_curso) return;
      try {
        const res = await fetch(
          `http://localhost:3000/courses/${modulo.id_curso}/progress/${currentUser.id}`
        );
        const data = await res.json();
        if (data && typeof data.nota_maxima === "number") {
          setNotaMaxima(data.nota_maxima);
        } else {
          setNotaMaxima(null);
        }
      } catch (err) {
        setNotaMaxima(null);
        console.error(err);
      }
    }

    fetchNotaMaxima();
  }, [modulo, currentUser]);

  useEffect(() => {
    async function fetchModulosCurso() {
      if (!modulo?.id_curso) return;
      try {
        const res = await fetch(
          `http://localhost:3000/modules/course/${modulo.id_curso}`
        );
        const data = await res.json();
        setModulosCurso(data);
      } catch (err) {
        setModulosCurso([]);
        console.error("Error al obtener los modulos del curso", err);
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
        endpoint = `http://localhost:3000/upload-pre-recording/${modulo.id}`;
        isRecordingUpload = true;
      } else if (activeTab === "contenido") {
        endpoint = `http://localhost:3000/upload-module-content/${modulo.id}`;
        isRecordingUpload = false;
      } else {
        console.error("Configuración inválida para subir archivo");
        return;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!data.success) {
        console.error("Error en la subida:", data.error || "Desconocido");
        return;
      }

      if (isRecordingUpload) {
        const newGrabacion = {
          id: Date.now(),
          titulo: formData.title,
          link: data.fileLink,
          inicio: null,
        };
        setGrabaciones((prev) => [...prev, newGrabacion]);
      } else {
        const newContenido = {
          id: Date.now(),
          titulo: formData.title,
          link: data.fileLink,
        };
        setContenido((prev) => [...prev, newContenido]);
      }
    } catch (err) {
      console.error("Error al subir:", err);
    }
  };

  const handleCrearPrueba = async (pruebaData) => {
    try {
      const res = await fetch(
        `http://localhost:3000/modules/${modulo.id}/quizzes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pruebaData),
        }
      );
      const data = await res.json();
      if (data.success) {
        const pruebaRes = await fetch(
          `http://localhost:3000/modules/${modulo.id}/quizzes`
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
      const res = await fetch(
        `http://localhost:3000/modules/${modulo.id}/quizzes/${pruebaFinal.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pruebaData),
        }
      );
      const data = await res.json();
      if (data.success) {
        const pruebaRes = await fetch(
          `http://localhost:3000/modules/${modulo.id}/quizzes`
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

  const handleResponderPrueba = async (respuestas) => {
    try {
      const res = await fetch(
        `http://localhost:3000/modules/${modulo.id}/quizzes/${pruebaFinal.id}/attempts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            respuestas,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        if (data.aprobado) {
          await fetch(
            `http://localhost:3000/courses/${modulo.id_curso}/progress`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id_usuario: currentUser.id,
                id_modulo_actual: modulo.id,
                nota_maxima: data.nota,
              }),
            }
          );
        }
      }
    } catch (err) {
      console.error("Error al responder prueba final:", err);
    }
  };

  const handleContenidoVisto = async () => {
    if (actualizandoProgreso) return;
    setActualizandoProgreso(true);

    try {
      if (!modulosCurso || modulosCurso.length === 0) {
        alert("No se encontraron módulos para este curso.");
        return;
      }

      const moduloActual = modulosCurso.find((m) => m.id === modulo.id);
      if (!moduloActual) {
        alert("No se pudo encontrar el módulo actual.");
        return;
      }

      const moduloActualOrden = moduloActual.orden;
      const siguienteModulo = modulosCurso.find(
        (m) => m.orden === moduloActualOrden + 1
      );

      if (siguienteModulo) {
        await fetch(
          `http://localhost:3000/courses/${modulo.id_curso}/progress`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_usuario: currentUser.id,
              id_modulo_actual: siguienteModulo.id,
              nota_maxima: null,
            }),
          }
        );
        alert("¡Progreso actualizado! Puedes avanzar al siguiente módulo.");
      } else {
        alert("¡Felicidades! Has completado el curso.");
      }
      setContenidoVisto(true);
    } catch (err) {
      alert("Error actualizando el progreso.");
      console.error(err);
    } finally {
      setActualizandoProgreso(false);
    }
  };

  if (!modulo) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>No se encontró información del módulo.</p>
        <button
          className={styles.button}
          onClick={() => navigate("/instructorNav")}
        >
          Volver
        </button>
      </div>
    );
  }

  if (loading)
    return (
      <div className={styles.container}>Cargando contenido del módulo...</div>
    );

  const shouldShowAddButton = () => {
    if (currentUser?.rol !== "profesor") return false;
    if (activeTab === "contenido") return true;
    if (activeTab === "grabaciones" && modulo.tipoCurso === "pregrabado")
      return true;
    return false;
  };

  const shouldShowEditButtons = (itemType) => {
    if (currentUser?.rol !== "profesor") return false;
    if (itemType === "contenido" && activeTab === "contenido") return true;
    if (
      itemType === "grabacion" &&
      activeTab === "grabaciones" &&
      modulo.tipoCurso === "pregrabado"
    )
      return true;
    return false;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{modulo.nombre}</h1>
      {modulo.descripcion && (
        <p className={styles.text}>
          <strong>Descripción:</strong> {modulo.descripcion}
        </p>
      )}

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "contenido" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("contenido")}
        >
          Contenido
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "grabaciones" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("grabaciones")}
        >
          Grabaciones
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.subtitle}>
          {activeTab === "contenido"
            ? "Contenido del módulo"
            : "Grabaciones del módulo"}
        </h2>
        <ContentList
          contenido={contenido}
          grabaciones={grabaciones}
          activeTab={activeTab}
          shouldShowEditButtons={shouldShowEditButtons}
          onEdit={(item, type) => setModalData({ type, item })}
        />
        {shouldShowAddButton() && (
          <button
            className={styles.addButton}
            onClick={() => setShowUploadModal(true)}
          >
            {activeTab === "contenido"
              ? "+ Agregar contenido"
              : "+ Agregar grabación"}
          </button>
        )}
      </div>

      <button className={styles.backButton} onClick={() => navigate(-1)}>
        ← Volver
      </button>

      {currentUser?.rol === "profesor" && !pruebaFinal && (
        <button onClick={() => setShowCrearPrueba(true)}>
          + Crear prueba final
        </button>
      )}
      {currentUser?.rol === "profesor" && pruebaFinal && (
        <button onClick={() => setShowEditarPrueba(true)}>
          Editar prueba final
        </button>
      )}
      {currentUser?.rol === "estudiante" && pruebaFinal && (
        <button onClick={() => setShowResponderPrueba(true)}>
          Realizar prueba final
        </button>
      )}

      {showCrearPrueba && (
        <ModalCrearPruebaFinal
          onClose={() => setShowCrearPrueba(false)}
          onCreate={handleCrearPrueba}
        />
      )}
      {showEditarPrueba && (
        <ModalEditarPruebaFinal
          prueba={pruebaFinal}
          onClose={() => setShowEditarPrueba(false)}
          onEdit={handleEditarPrueba}
        />
      )}
      {showResponderPrueba && (
        <ModalResponderPruebaFinal
          prueba={pruebaFinal}
          onClose={() => setShowResponderPrueba(false)}
          onSubmit={handleResponderPrueba}
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
          isRecording={
            activeTab === "grabaciones" && modulo.tipoCurso === "pregrabado"
          }
        />
      )}

      {currentUser?.rol === "estudiante" && notaMaxima !== null && (
        <div className={styles.notaMaxima}>
          <strong>Tu nota más alta en este módulo:</strong> {notaMaxima}
        </div>
      )}

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
        className={styles.forumButton}
        onClick={() =>
          navigate("/forum", {
            state: {
              idModulo: modulo.id,
              idUsuario: currentUser.id,
              modulo,
            },
          })
        }
      >
        Ir al Foro del módulo
      </button>
    </div>
  );
}
