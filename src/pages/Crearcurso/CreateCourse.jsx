import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import Cookies from "js-cookie";
import styles from "./Create.module.css";

export default function CreateCourse() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tipoCurso, setTipoCurso] = useState("pregrabado");
  const [costo, setCosto] = useState(20000);
  const [imagen, setImagen] = useState(null);
  const [area, setArea] = useState("");
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modal, setModal] = useState({ visible: false, mensaje: "", tipo: "" });

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
    setTimeout(() => setModal({ visible: false, mensaje: "", tipo: "" }), 3000);
  };

  const manejarImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onloadend = () => setImagen(lector.result);
      lector.readAsDataURL(archivo);
    }
  };

  const quitarImagen = () => setImagen(null);

  const manejarAceptar = async () => {
    const usuario = getCurrentUser();
    if (!usuario?.id) {
      mostrarModal("No se pudo identificar al usuario.");
      return;
    }

    if (!nombre || !tipoCurso || !area || !imagen) {
      mostrarModal("Por favor completa todos los campos obligatorios.");
      return;
    }

    const datos = {
      descripcion,
      costo,
      imagen,
      tipoCurso,
      area,
      admin: usuario.id,
      nombre,
    };

    try {
      const respuesta = await fetch("http://localhost:3000/create-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || resultado.error) {
        mostrarModal(resultado.error || "Error al crear el curso.");
        return;
      }

      mostrarModal("Curso creado exitosamente.", "success");
      setTimeout(() => navigate("/instructorNav"), 1000);
    } catch (error) {
      console.error("Error al enviar:", error);
      mostrarModal("Ocurrió un error al enviar el curso.");
    }
  };

  const handleAreaChange = (e) => setArea(e.target.value);

  return (
    <div className={styles.page}>
      <div className={styles.formContainer}>
        <Logo />
        <h1 className={styles.title}>Crear nuevo curso</h1>

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

        {/* Foto de portada */}
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

        <div className={styles.section}>
          <label className={styles.label}>Área del curso</label>
          <select
            value={area}
            onChange={handleAreaChange}
            className={styles.select}
            required
          >
            <option value="">-- Selecciona un área --</option>
            <option value="Tecnología y Programación">
              Tecnología y Programación
            </option>
            <option value="Negocios y Marketing">Negocios y Marketing</option>
            <option value="Diseño y Creatividad">Diseño y Creatividad</option>
            <option value="Idiomas">Idiomas</option>
            <option value="Ciencias y Matemáticas">
              Ciencias y Matemáticas
            </option>
            <option value="Educación y Pedagogía">Educación y Pedagogía</option>
          </select>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Descripción del curso</label>
          <textarea
            rows={4}
            placeholder="Escribe aquí..."
            className={styles.textarea}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

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
            {parseInt(costo).toLocaleString()}$
          </p>
        </div>

        <div className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.cancel}`}
            onClick={() => navigate("/instructorNav")}
          >
            Cancelar
          </button>
          <button
            className={`${styles.btn} ${styles.accept}`}
            onClick={manejarAceptar}
          >
            Aceptar
          </button>
        </div>

        {modal.visible && (
          <div
            style={{
              position: "fixed",
              bottom: "50%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor:
                modal.tipo === "success" ? "#4BB543" : "#d6323bff",
              color: "#fff",
              padding: "1rem 2rem",
              borderRadius: "8px",
              zIndex: 1000,
              fontWeight: "bold",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              width: "85%",
              fontSize: "1rem",
            }}
          >
            {modal.mensaje}
          </div>
        )}
      </div>
    </div>
  );
}
