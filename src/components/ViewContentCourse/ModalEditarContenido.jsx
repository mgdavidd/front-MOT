import React, { useState } from "react";
import styles from "./ModalEditarContenido.module.css";
import Cookies from "js-cookie"
export default function ModalEditarContenido({ item, type, onClose, onSuccess }) {
  const [titulo, setTitulo] = useState(item.titulo);
  const [loading, setLoading] = useState(false);

  // ✅ Editar contenido / grabación
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint =
        type === "grabacion"
          ? "http://localhost:3000/update-recording"
          : `http://localhost:3000/content/${item.id}`;

      const method = type === "grabacion" ? "POST" : "PUT";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          type === "grabacion"
            ? { title: titulo, recordingId: item.id }
            : { title: titulo }
        ),
      });

      const data = await res.json();

      if (res.ok && (data.success || data.message)) {
        onSuccess({ ...item, titulo }); // actualiza en el padre
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

  // 🗑️ Eliminar contenido / grabación
  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar este elemento?")) return;
    setLoading(true);
    try {
      const endpoint =
        type === "grabacion"
          ? `http://localhost:3000/recordings/${item.id}`
          : `http://localhost:3000/content/${item.id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", authorization: `Bearer ${Cookies.get("token")}` },
        body: JSON.stringify({ link: item.link }), // necesario para borrar en Drive
      });

      const data = await res.json();
      if (res.ok && (data.success || data.message)) {
        onSuccess({ ...item, deleted: true }); // notificamos que se eliminó
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
