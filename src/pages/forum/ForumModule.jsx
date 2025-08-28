import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ForumModule.module.css";

const ForoPage = ({ idModulo }) => {
  const [foros, setForos] = useState([]);
  const [nuevoForo, setNuevoForo] = useState({
    titulo: "",
    mensaje: "",
    tipoReferencia: "general",
  });
  const [tabActivo, setTabActivo] = useState("preguntas");

  useEffect(() => {
    fetchForos();
  }, [idModulo]);

  const fetchForos = async () => {
    try {
      const res = await axios.get(`/api/modulos/${idModulo}/foros`);
      setForos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando foros:", err);
      setForos([]);
    }
  };

  const handlePublicar = async () => {
    if (!nuevoForo.titulo || !nuevoForo.mensaje) {
      return alert("Completa todos los campos");
    }
    try {
      await axios.post("/api/foros", {
        idModulo,
        idUsuario: 1, // cambiar por usuario logueado
        tipoReferencia: nuevoForo.tipoReferencia,
        titulo: nuevoForo.titulo,
        mensaje: nuevoForo.mensaje,
      });
      setNuevoForo({ titulo: "", mensaje: "", tipoReferencia: "general" });
      fetchForos();
    } catch (err) {
      console.error("Error creando foro:", err);
    }
  };

  const filtrarForos = (tipo) => {
    if (!Array.isArray(foros)) return [];
    return foros.filter(
      (foro) =>
        foro.tipoReferencia?.toLowerCase().trim() === tipo.toLowerCase()
    );
  };

  return (
    <div className="foro-container">
      <h1 className="foro-title">Foro del módulo</h1>
      <h2 className="foro-subtitle">Curso relacionado</h2>

      {/* Crear foro */}
      <div className="crear-foro">
        <h3>Crear nuevo foro</h3>
        <select
          value={nuevoForo.tipoReferencia}
          onChange={(e) =>
            setNuevoForo({ ...nuevoForo, tipoReferencia: e.target.value })
          }
          className="foro-input"
        >
          <option value="preguntas">Preguntas</option>
          <option value="aportes">Aportes</option>
          <option value="general">General</option>
        </select>
        <input
          type="text"
          placeholder="Título"
          className="foro-input"
          value={nuevoForo.titulo}
          onChange={(e) =>
            setNuevoForo({ ...nuevoForo, titulo: e.target.value })
          }
        />
        <textarea
          placeholder="Escribe tu mensaje..."
          className="foro-input"
          value={nuevoForo.mensaje}
          onChange={(e) =>
            setNuevoForo({ ...nuevoForo, mensaje: e.target.value })
          }
        />
        <button className="publicar-btn" onClick={handlePublicar}>
          Publicar
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${tabActivo === "preguntas" ? "active" : ""}`}
          onClick={() => setTabActivo("preguntas")}
        >
          Preguntas
        </button>
        <button
          className={`tab-btn ${tabActivo === "aportes" ? "active" : ""}`}
          onClick={() => setTabActivo("aportes")}
        >
          Aportes
        </button>
        <button
          className={`tab-btn ${tabActivo === "general" ? "active" : ""}`}
          onClick={() => setTabActivo("general")}
        >
          General
        </button>
      </div>

      {/* Contenido de pestañas */}
      <div className="tab-content">
        {tabActivo === "preguntas" && (
          <>
            <h3>Foros de Preguntas</h3>
            {filtrarForos("preguntas").length > 0 ? (
              filtrarForos("preguntas").map((foro) => (
                <div key={foro.id} className="foro-card">
                  <h4>{foro.titulo}</h4>
                  <p>{foro.mensaje}</p>
                  <span className="autor">Por: {foro.autor}</span>
                </div>
              ))
            ) : (
              <p className="no-content">No hay preguntas creadas aún.</p>
            )}
          </>
        )}

        {tabActivo === "aportes" && (
          <>
            <h3>Foros de Aportes</h3>
            {filtrarForos("aportes").length > 0 ? (
              filtrarForos("aportes").map((foro) => (
                <div key={foro.id} className="foro-card">
                  <h4>{foro.titulo}</h4>
                  <p>{foro.mensaje}</p>
                  <span className="autor">Por: {foro.autor}</span>
                </div>
              ))
            ) : (
              <p className="no-content">No hay aportes creados aún.</p>
            )}
          </>
        )}

        {tabActivo === "general" && (
          <>
            <h3>Foros Generales</h3>
            {filtrarForos("general").length > 0 ? (
              filtrarForos("general").map((foro) => (
                <div key={foro.id} className="foro-card">
                  <h4>{foro.titulo}</h4>
                  <p>{foro.mensaje}</p>
                  <span className="autor">Por: {foro.autor}</span>
                </div>
              ))
            ) : (
              <p className="no-content">No hay temas generales creados aún.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ForoPage;
