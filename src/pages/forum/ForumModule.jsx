import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ForumForm from "./ForumForm";
import ForumModal from "./ForumModal";
import styles from "./ForumModule.module.css";

const API_URL = "https://server-mot.onrender.com";

const ForumModules = ({ idModulo: propIdModulo, idUsuario: propIdUsuario, modulo: propModulo }) => {
  const location = useLocation();
  const idModulo = propIdModulo || location.state?.idModulo;
  const idUsuario = propIdUsuario || location.state?.idUsuario;
  const modulo = propModulo || location.state?.modulo;

  const [foros, setForos] = useState([]);
  const [selectedTab, setSelectedTab] = useState("pregunta");
  const [selectedForo, setSelectedForo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (idModulo) fetchForos();
  }, [idModulo]);

  const fetchForos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/modulos/${idModulo}/foros`);
      setForos(res.data);
    } catch (error) {
      console.error("Error cargando foros:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectForo = async (foroId) => {
    try {
      const res = await axios.get(`${API_URL}/foros/${foroId}`);
      setSelectedForo(res.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error cargando foro:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedForo(null);
  };

  const renderReferenciaInfo = (foro) => {
    if (!foro.referenciaTitulo) return null;
    
    return (
      <div className={styles.referenciaInfo}>
        <small>
          Sobre: {foro.referenciaTitulo}
          {foro.tipoReferencia === 'grabacion' ? ' (Grabación)' : ' (Contenido)'}
        </small>
      </div>
    );
  };

  const getTabLabel = (tab) => {
    const labels = {
      pregunta: "Preguntas",
      aporte: "Aportes", 
      general: "General"
    };
    return labels[tab];
  };

  const getForumsByType = (type) => {
    return foros.filter((f) => f.tipoForo === type);
  };

  const renderForumCards = () => {
    const currentForos = getForumsByType(selectedTab);
    
    if (loading) {
      return <p className={styles.empty}>Cargando...</p>;
    }
    
    if (currentForos.length === 0) {
      const typeText = selectedTab === "pregunta" ? "preguntas" : 
                      selectedTab === "aporte" ? "aportes" : "discusiones generales";
      return <p className={styles.empty}>Aún no hay {typeText}.</p>;
    }

    return (
      <div className={styles.cardGrid}>
        {currentForos.map((foro) => (
          <div
            key={foro.id}
            className={styles.card}
            onClick={() => selectForo(foro.id)}
          >
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>{foro.titulo}</h4>
              <span className={styles.autor}>por {foro.autor}</span>
            </div>
            {renderReferenciaInfo(foro)}
            <p className={styles.cardContent}>{foro.mensaje.substring(0, 120)}...</p>
            <div className={styles.cardFooter}>
              <span className={styles.respuestasCount}>
                {foro.respuestasCount || 0} respuestas
              </span>
              <button className={styles.verMasBtn}>Ver más</button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* Header con título y tabs */}
      <button className={styles.backButton} onClick={() => window.history.back()}>
        ←
      </button>
      <div className={styles.header}>
        <h2 className={styles.title}>Foro del Módulo: {modulo?.nombre}</h2>

        <div className={styles.tabs}>
          {["pregunta", "aporte", "general"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`${styles.tab} ${selectedTab === tab ? styles.tabActive : ""}`}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className={styles.scrollableContent}>
        <div className={styles.cardsSection}>
          <h3 className={styles.subtitle}>
            {getTabLabel(selectedTab)}
          </h3>
          {renderForumCards()}
        </div>
      </div>

      {/* Formulario fijo en el footer */}
      <div className={styles.fixedFooter}>
        <ForumForm
          idModulo={idModulo}
          idUsuario={idUsuario}
          tipoForo={selectedTab}
          refreshForos={fetchForos}
        />
      </div>

      {showModal && selectedForo && (
        <ForumModal 
          foro={selectedForo} 
          idUsuario={idUsuario} 
          onClose={closeModal}
          refreshForo={() => selectForo(selectedForo.id)}
        />
      )}
    </div>
  );
};

export default ForumModules;