import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./ForumModule.module.css";

const API_URL = "https://server-mot.onrender.com";

const ForumForm = ({ idModulo, idUsuario, tipoForo, refreshForos }) => {
  const [formData, setFormData] = useState({ titulo: "", mensaje: "" });
  const [referencia, setReferencia] = useState({
    tipo: "grabacion",
    id: "",
    selectedItem: null
  });
  const [contenidos, setContenidos] = useState([]);
  const [grabaciones, setGrabaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isGeneralForum = tipoForo === "general";
  const requiresReference = !isGeneralForum;

  useEffect(() => {
    if (!idModulo || isGeneralForum) return;
    
    fetchReferences();
  }, [idModulo, isGeneralForum]);

  const fetchReferences = async () => {
    try {
      setLoading(true);
      const [contRes, recRes] = await Promise.all([
        axios.get(`${API_URL}/modules/content/${idModulo}`),
        axios.get(`${API_URL}/modules/recordings/${idModulo}`)
      ]);
      setContenidos(contRes.data || []);
      setGrabaciones(recRes.data || []);
    } catch (err) {
      console.error("Error cargando contenidos/grabaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleReferenceTypeChange = useCallback((tipo) => {
    setReferencia(prev => ({
      ...prev,
      tipo,
      id: "",
      selectedItem: null
    }));
  }, []);

  const handleReferenceSelect = useCallback((id) => {
    const items = referencia.tipo === "grabacion" ? grabaciones : contenidos;
    const selectedItem = items.find(item => item.id === parseInt(id));
    
    setReferencia(prev => ({
      ...prev,
      id,
      selectedItem: selectedItem || null
    }));
  }, [referencia.tipo, grabaciones, contenidos]);

  const resetForm = useCallback(() => {
    setFormData({ titulo: "", mensaje: "" });
    setReferencia({
      tipo: "grabacion",
      id: "",
      selectedItem: null
    });
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.titulo.trim() || !formData.mensaje.trim()) {
      return false;
    }
    
    if (requiresReference && !referencia.id) {
      return false;
    }
    
    return true;
  }, [formData, requiresReference, referencia.id]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const payload = {
      idModulo,
      idUsuario,
      tipoForo,
      titulo: formData.titulo.trim(),
      mensaje: formData.mensaje.trim()
    };
    
    if (requiresReference) {
      payload.tipoReferencia = referencia.tipo;
      payload.idReferencia = referencia.id;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_URL}/foros`, payload);
      resetForm();
      refreshForos();
    } catch (error) {
      console.error("Error creando foro:", error);
      // Aquí podrías agregar manejo de errores más sofisticado
    } finally {
      setSubmitting(false);
    }
  };

  const getFormTitle = () => {
    const titles = {
      pregunta: "Pregunta",
      aporte: "Aporte",
      general: "Tema General"
    };
    return titles[tipoForo];
  };

  const getSubmitButtonText = () => {
    if (submitting) return "Publicando...";
    
    const actions = {
      pregunta: "Publicar Pregunta",
      aporte: "Publicar Aporte",
      general: "Publicar Tema"
    };
    return actions[tipoForo];
  };

  const renderReferenceSelector = () => {
    if (isGeneralForum) return null;

    const items = referencia.tipo === "grabacion" ? grabaciones : contenidos;

    return (
      <>
        <div className={styles.refType}>
          <label>
            <input
              type="radio"
              value="grabacion"
              checked={referencia.tipo === "grabacion"}
              onChange={() => handleReferenceTypeChange("grabacion")}
              disabled={submitting}
            />
            Grabación
          </label>
          <label>
            <input
              type="radio"
              value="contenido"
              checked={referencia.tipo === "contenido"}
              onChange={() => handleReferenceTypeChange("contenido")}
              disabled={submitting}
            />
            Contenido
          </label>
        </div>

        <div className={styles.refSelector}>
          <label>Seleccionar {referencia.tipo}:</label>
          {loading ? (
            <div className={styles.empty}>Cargando opciones...</div>
          ) : (
            <select
              className={styles.select}
              value={referencia.id}
              onChange={(e) => handleReferenceSelect(e.target.value)}
              disabled={submitting}
            >
              <option value="">-- Selecciona --</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.titulo}
                </option>
              ))}
            </select>
          )}
        </div>

        {referencia.selectedItem && (
          <div className={styles.previewCard}>
            <p>
              <strong>Seleccionado:</strong> {referencia.selectedItem.titulo}
            </p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles.form}>
      <h3 className={styles.subtitle}>Crear {getFormTitle()}</h3>

      {renderReferenceSelector()}

      <input
        type="text"
        placeholder="Título"
        className={styles.input}
        value={formData.titulo}
        onChange={(e) => handleInputChange("titulo", e.target.value)}
        disabled={submitting}
        maxLength={200}
      />
      
      <textarea
        placeholder="Escribe tu mensaje aquí..."
        className={styles.textarea}
        value={formData.mensaje}
        onChange={(e) => handleInputChange("mensaje", e.target.value)}
        disabled={submitting}
        maxLength={2000}
        rows={4}
      />
      
      <button 
        onClick={handleSubmit} 
        className={styles.btnPublish}
        disabled={submitting || !validateForm()}
      >
        {getSubmitButtonText()}
      </button>
    </div>
  );
};

export default ForumForm;