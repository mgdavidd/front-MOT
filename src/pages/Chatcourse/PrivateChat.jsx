import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import io from "socket.io-client";
import { DateTime } from "luxon";
import styles from "./Chatcourse.module.css";

export default function PrivateChat() {
  const { otherUserId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef();
  const socketRef = useRef();

  const getUserData = () => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      navigate("/login");
      return null;
    }
    return JSON.parse(userCookie);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";

    try {
      const dateTime = DateTime.fromSQL(dateString, { zone: "utc" });
      return dateTime.toLocal().toLocaleString(DateTime.DATETIME_MED);
    } catch (err) {
      console.error("Error al formatear fecha:", dateString, err);
      return "Fecha inválida";
    }
  };

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const response = await fetch(
          `https://server-mot.onrender.com/users/${otherUserId}`
        );
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        setOtherUser(await response.json());
      } catch (err) {
        console.error("Error al cargar usuario:", err);
        setError("No se pudo cargar la información del usuario");
      }
    };

    fetchOtherUser();
  }, [otherUserId]);

  useEffect(() => {
    const userData = getUserData();
    if (!userData || !otherUser || error) return;

    socketRef.current = io("https://server-mot.onrender.com", {
      withCredentials: true,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Conectado al servidor Socket.io");
      setError(null);
    });

    socket.on("connect_error", (err) => {
      console.error("Error de conexión:", err);
      setError("Error de conexión con el servidor");
    });

    socket.on("new_private_message", (message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          fecha_local: formatDate(message.fecha_envio),
        },
      ]);
    });

    socket.on("private_chat_history", (history) => {
      setMessages(
        history.map((msg) => ({
          ...msg,
          fecha_local: formatDate(msg.fecha_envio),
        }))
      );

      if (history.length > 0) {
        setConversationId(history[0].conversacion_id);
      }
    });

    socket.emit("authenticate", {
      userId: userData.id,
      userName: userData.nombre,
      userPhoto: userData.fotoPerfil,
    });

    socket.emit("join_private_chat", {
      userId: userData.id,
      otherUserId: otherUser.id,
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [otherUser, error, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userData = getUserData();
    if (!userData) return;

    socketRef.current.emit("send_private_message", {
      senderId: userData.id,
      receiverId: otherUserId,
      message: trimmed,
    });

    setInputValue("");
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.returnContainer}>
        <button className={styles.returnButton} onClick={() => navigate(-1)}>
          ⬅ Volver
        </button>
      </div>

      <section className={styles.chatSection}>
        <div className={styles.header}>
          <div className={styles.info}>
            <h1>Chat con {otherUser.nombre}</h1>
          </div>
        </div>

        <div className={styles.messageListContainer}>
          <ul className={styles.messageList}>
            {messages.map((msg, i) => (
              <li
                key={i}
                className={
                  msg.remitente_id === getUserData()?.id
                    ? styles.myMessage
                    : styles.otherMessage
                }
              >
                <div className={styles.messageHeader}>
                  <img
                    src={msg.fotoPerfil || "../../img/usuario.png"}
                    alt={msg.nombre}
                    className={styles.userAvatar}
                  />
                  <span className={styles.userName}>{msg.nombre}</span>
                </div>
                <p className={styles.messageContent}>{msg.mensaje}</p>
                <div className={styles.messageFooter}>
                  <p className={styles.messageDate}>{msg.fecha_local}</p>
                </div>
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={!!error}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!!error || !inputValue.trim()}
          >
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}