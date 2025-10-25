import React, { useState } from "react";
import styles from "./ModalEditarContenido.module.css";
import Cookies from "js-cookie";
import Alert from "../Alert";

export default function ModalEditarContenido({ item, type, onClose, onSuccess }) {
  const [titulo, setTitulo] = useState(item?.titulo ?? item?.title ?? "");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", type: "info" });

  const token = Cookies.get("token");
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint =
        type === "grabacion"
          ? "https://server-mot.onrender.com/update-recording"
          : `https://server-mot.onrender.com/content/${item.id}`;

      const method = type === "grabacion" ? "POST" : "PUT";

      const body =
        type === "grabacion"
          ? { title: titulo, recordingId: item.id }
          : { title: titulo };

      console.log("ModalEditarContenido: submit", { endpoint, method, body });

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("ModalEditarContenido: response", res.status, data);

      if (res.ok && (data.success || data.message)) {
        setAlert({
          isOpen: true,
          title: "Éxito",
          message: "Cambios guardados correctamente",
          type: "success"
        });
        onSuccess({ ...item, titulo });
        setTimeout(() => onClose(), 1500);
      } else {
        setAlert({
          isOpen: true,
          title: "Error",
          message: data.error || "Error al guardar",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      setAlert({
        isOpen: true,
        title: "Error",
        message: "Hubo un error al actualizar.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setAlert({
      isOpen: true,
      title: "Confirmar eliminación",
      message: "¿Seguro que quieres eliminar este elemento?",
      type: "warning",
      showConfirm: true
    });
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const endpoint =
        type === "grabacion"
          ? `https://server-mot.onrender.com/recordings/${item.id}`
          : `https://server-mot.onrender.com/content/${item.id}`;

      console.log("ModalEditarContenido: delete", { endpoint, item });

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ link: item.link }),
      });

      const data = await res.json();
      console.log("ModalEditarContenido: delete response", res.status, data);

      if (res.ok && (data.success || data.message)) {
        setAlert({
          isOpen: true,
          title: "Éxito",
          message: "Elemento eliminado correctamente",
          type: "success"
        });
        onSuccess({ ...item, deleted: true });
        setTimeout(() => onClose(), 1500);
      } else {
        setAlert({
          isOpen: true,
          title: "Error",
          message: data.error || "Error al eliminar",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      setAlert({
        isOpen: true,
        title: "Error",
        message: "Hubo un error al eliminar.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <h2>{type === "grabacion" ? "Editar Grabación" : "Editar Contenido"}</h2>
          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nuevo título"
            disabled={loading}
          />
          <div className={styles.actions}>
            <button onClick={handleSubmit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={handleDelete} className={styles.deleteButton} disabled={loading}>
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
            <button onClick={onClose} disabled={loading}>
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <Alert
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => {
          if (alert.showConfirm) {
            setAlert({ isOpen: false, title: "", message: "", type: "info" });
          } else {
            setAlert({ isOpen: false, title: "", message: "", type: "info" });
          }
        }}
        onConfirm={alert.showConfirm ? confirmDelete : undefined}
        autoCloseTime={alert.showConfirm ? 0 : 4000}
      />
    </>
  );
}