import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import Cookies from "js-cookie";
import styles from "./Create.module.css";

export default function CreateCourse() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [tipoCurso, setTipoCurso] = useState("pregrabado");
  const [costo, setCosto] = useState(20000);
  const [imagen, setImagen] = useState(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [area, setArea] = useState("");
  const [videoFile, setVideoFile] = useState(null);

  const [modal, setModal] = useState({ visible: false, mensaje: "", tipo: "" });
  const [loading, setLoading] = useState(false);

  // ================== UTILS ==================
  const getCurrentUser = () => {
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return null;
      return JSON.parse(userCookie);
    } catch (error) {
      console.error("Error al parsear cookie:", error);
      return null;
    }
  };

  const mostrarModal = (mensaje, tipo = "error") => {
    setModal({ visible: true, mensaje, tipo });
    setTimeout(() => setModal({ visible: false, mensaje: "", tipo: "" }), 3500);
  };

  // ================== PORTADA ==================
  const manejarImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onloadend = () => setImagen(lector.result);
      lector.readAsDataURL(archivo);
    }
  };
  const quitarImagen = () => setImagen(null);

  // ================== VIDEO ==================
  const manejarVideo = (e) => {
    const archivo = e.target.files[0];
    if (archivo) setVideoFile(archivo);
  };

  // ================== SUBMIT TODO EN 1 ==================
  const manejarCrearConVideo = async () => {
    const usuario = getCurrentUser();
    if (!usuario?.id) {
      mostrarModal("No se pudo identificar al usuario.");
      return;
    }

    if (!nombre || !tipoCurso || !area || !imagen || !videoFile) {
      mostrarModal("Completa todos los campos y selecciona un video.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Crear curso
      const datos = {
        descripcion,
        costo,
        imagen, // base64
        tipoCurso,
        area,
        admin: usuario.id,
        nombre,
      };

      const resCurso = await fetch("http://localhost:3000/create-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });

      const resultadoCurso = await resCurso.json();

      if (!resCurso.ok || resultadoCurso.error) {
        mostrarModal(resultadoCurso.error || "Error al crear el curso.");
        setLoading(false);
        return;
      }

      const nuevoId = resultadoCurso.id;

      // 2️⃣ Subir video
      const formData = new FormData();
      formData.append("video", videoFile);

      const resVideo = await fetch(
        `http://localhost:3000/courses/${nuevoId}/video/introduction`,
        {
          method: "POST",
          body: formData,
        }
      );

      const resultadoVideo = await resVideo.json();

      if (!resVideo.ok || resultadoVideo.error) {
        // rollback
        await fetch(`http://localhost:3000/courses/${nuevoId}`, {
          method: "DELETE",
        });
        mostrarModal(resultadoVideo.error || "Error al subir el video.");
        setLoading(false);
        return;
      }

      // ✅ Éxito total
      mostrarModal("Curso y video creados exitosamente 🎉", "success");
      setTimeout(() => navigate("/instructorNav"), 2000);
    } catch (error) {
      console.error("Error:", error);
      mostrarModal("Ocurrió un error al crear el curso.");
    } finally {
      setLoading(false);
    }
  };

  // ================== RENDER ==================
  return (
    <div className={styles.page}>
      <div className={styles.formContainer}>
        <Logo />
        <h1 className={styles.title}>Crear nuevo curso</h1>

        {/* Título */}
        <div className={styles.section}>
          <label className={styles.label}>Título del curso</label>
          <input
            type="text"
            className={styles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        {/* Portada */}
        <div className={styles.section}>
          <label className={styles.label}>Foto de portada</label>
          <div
            className={styles.cover}
            onClick={() => fileInputRef.current.click()}
          >
            {imagen ? (
              <>
                <img
                  src={imagen}
                  alt="Vista previa"
                  className={styles.coverPreview}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    quitarImagen();
                  }}
                >
                  ✕
                </button>
              </>
            ) : (
              <span className={styles.coverPlaceholder}>
                Haz clic para subir
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={manejarImagen}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Área */}
        <div className={styles.section}>
          <label className={styles.label}>Área del curso</label>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">-- Selecciona un área --</option>
            <option value="Tecnología y Programación">Tecnología y Programación</option>
            <option value="Negocios y Marketing">Negocios y Marketing</option>
            <option value="Diseño y Creatividad">Diseño y Creatividad</option>
            <option value="Idiomas">Idiomas</option>
            <option value="Ciencias y Matemáticas">Ciencias y Matemáticas</option>
            <option value="Educación y Pedagogía">Educación y Pedagogía</option>
          </select>
        </div>

        {/* Descripción */}
        <div className={styles.section}>
          <label className={styles.label}>Descripción</label>
          <textarea
            rows={4}
            placeholder="Escribe aquí..."
            className={styles.textarea}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {/* Tipo */}
        <div className={styles.section}>
          <label className={styles.label}>Tipo de curso</label>
          <select
            value={tipoCurso}
            onChange={(e) => setTipoCurso(e.target.value)}
            className={styles.select}
          >
            <option value="pregrabado">Pregrabado</option>
            <option value="en_vivo">Clases en vivo</option>
          </select>
        </div>

        {/* Costo */}
        <div className={styles.section}>
          <label className={styles.label}>Costo por inscripción</label>
          <input
            type="range"
            min={0}
            max={100000}
            step={1000}
            value={costo}
            onChange={(e) => setCosto(e.target.value)}
            className={styles.slider}
          />
          <p className={styles.costText}>
            {parseInt(costo) === 0 ? (
              <span className={styles.free}>Gratis</span>
            ) : (
              `${parseInt(costo).toLocaleString()}$`
            )}
          </p>
        </div>

        {/* Video */}
        <div className={styles.videoSection}>
          <label className={styles.label}>Video de introducción</label>
          <input
            type="file"
            accept="video/*"
            onChange={manejarVideo}
            ref={videoInputRef}
            className={styles.videoInput}
          />
          {videoFile && <p>Archivo seleccionado: {videoFile.name}</p>}
        </div>

        {/* Botones */}
        <div className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.cancel}`}
            onClick={() => navigate("/instructorNav")}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className={`${styles.btn} ${styles.accept}`}
            onClick={manejarCrearConVideo}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear curso"}
          </button>
        </div>

        {/* Modal */}
        {modal.visible && (
          <div
            className={`${styles.modal} ${
              modal.tipo === "success" ? styles.success : ""
            }`}
          >
            {modal.mensaje}
          </div>
        )}
      </div>
    </div>
  );
}
