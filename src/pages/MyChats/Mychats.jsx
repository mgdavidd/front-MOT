// src/Chatcourse/MyChats.jsx
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import styles from "./MyChats.module.css";
import { DateTime } from "luxon";

export default function MyChats() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("No se encontró el token");
          return;
        }

        const response = await fetch("http://localhost:3000/myChats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Error al cargar los chats");

        const data = await response.json();

        // intentar parsear cursos_en_comun si es string JSON
        const formatted = data.map((chat) => ({
          ...chat,
          cursos_en_comun: (() => {
            try {
              return typeof chat.cursos_en_comun === "string"
                ? JSON.parse(chat.cursos_en_comun)
                : chat.cursos_en_comun;
            } catch {
              return [];
            }
          })(),
        }));

        setChats(formatted);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  if (loading) return <div className={styles.container}>Cargando...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis Chats</h1>
        <button onClick={() => navigate(-1)}>⬅ Volver</button>
      </div>

      <ul className={styles.chatList}>
        {chats.map((chat) => (
          <li
            key={chat.conversacion_id}
            className={styles.chatItem}
            onClick={() => navigate(`/private-chat/${chat.participante_id}`)}
          >
            <img
              src={chat.fotoPerfil || "/img/usuario.png"}
              alt={chat.participante_nombre}
              className={styles.avatar}
            />
            <div className={styles.chatInfo}>
              <div className={styles.name}>
                {chat.participante_nombre}{" "}
                <span className={styles.role}>({chat.participante_rol})</span>
              </div>
              <div className={styles.lastMessage}>
                <span className={styles.time}>
                  {chat.ultimo_mensaje
                    ? DateTime.fromFormat(chat.ultimo_mensaje, "yyyy-MM-dd HH:mm:ss", { zone: "utc" })
                        .setZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
                        .toFormat("dd/MM/yyyy HH:mm")
                    : ""}
                </span>
              </div>
              {chat.cursos_en_comun && chat.cursos_en_comun.length > 0 && (
                <div className={styles.commonCourses}>
                  Cursos en común: {chat.cursos_en_comun.join(", ")}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
