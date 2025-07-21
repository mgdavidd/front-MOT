import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";


import styles from "./Create.module.css";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [costo, setCosto] = useState(20000);
  const [imagen, setImagen] = useState(null);
  const [descripcion, setDescripcion] = useState("");
  const fileInputRef = useRef(null);

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
    const datos = {
      descripcion,
      costo,
      imagen,
    };

    try {
      const respuesta = await fetch("/api/comentarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (!respuesta.ok) throw new Error("Error en la solicitud");

      const resultado = await respuesta.json();
      console.log("Comentario enviado:", resultado);
      alert("Curso creado correctamente (simulado)");
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("Ocurrió un error al enviar el curso.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.formContainer}>
        <Logo/>
        <h1 className={styles.title}>Crear nuevo curso</h1>

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
                  className={styles.removeImageBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    quitarImagen();
                  }}
                >
                  ✕
                </button>
              </>
            ) : (
              <span className={styles.coverPlaceholder}>Haz clic para subir</span>
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

        {/* Descripción */}
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
          <p className={styles.costText}>{parseInt(costo).toLocaleString()}$</p>
        </div>

        {/* Botones */}
        <div className={styles.buttons}>
          <button
            className={`${styles.btn} ${styles.cancel}`}
            onClick={() => navigate("/profile")}
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
      </div>
    </div>
  );
}



