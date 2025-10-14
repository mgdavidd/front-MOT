import React, { useState } from "react";
import styles from "./ModalEditarContenido.module.css";
import Cookies from "js-cookie"
export default function ModalEditarContenido({ item, type, onClose, onSuccess }) {
  const [titulo, setTitulo] = useState(item?.titulo ?? item?.title ?? "");
  const [loading, setLoading] = useState(false);

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
          : { titulo: titulo };

      console.log("ModalEditarContenido: submit", { endpoint, method, body });

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("ModalEditarContenido: response", res.status, data);

      if (res.ok && (data.success || data.message)) {
        onSuccess({ ...item, titulo });
        onClose();
      } else {
        alert(data.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Hubo un error al actualizar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar este elemento?")) return;
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
        onSuccess({ ...item, deleted: true });
        onClose();
      } else {
        alert(data.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Hubo un error al eliminar.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
