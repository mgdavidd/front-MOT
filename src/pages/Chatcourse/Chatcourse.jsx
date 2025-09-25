import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import io from "socket.io-client";
import { DateTime } from "luxon";
import styles from "./Chatcourse.module.css";

export default function ChatCourse() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const messagesEndRef = useRef();
  const socketRef = useRef();

  const getUserData = () => {
    const userCookie = Cookies.get("user");
    if (!userCookie) {
      navigate("/");
      return null;
    }
    return JSON.parse(userCookie);
  };

  const userData = getUserData();

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";

    try {
      // Manejar diferentes formatos de fecha
      let dateTime;
      if (dateString.includes("T")) {
        dateTime = DateTime.fromISO(dateString);
      } else {
        dateTime = DateTime.fromSQL(dateString, { zone: "utc" });
      }
      return dateTime.toLocal().toLocaleString(DateTime.DATETIME_MED);
    } catch (err) {
      console.error("Error al formatear fecha:", dateString, err);
      return "Fecha inválida";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const [courseRes, messagesRes] = await Promise.all([
          fetch(`http://localhost:3000/courses/${courseId}`),
          fetch(`http://localhost:3000/courses/${courseId}/messages`),
        ]);

        if (!courseRes.ok) throw new Error(`Error HTTP: ${courseRes.status}`);
        if (!messagesRes.ok)
          throw new Error(`Error HTTP: ${messagesRes.status}`);

        const [courseData, messagesData] = await Promise.all([
          courseRes.json(),
          messagesRes.json(),
        ]);

        setCourseInfo(courseData);
        setMessages(
          messagesData.map((msg) => ({
            ...msg,
            fecha_local: formatDate(msg.fecha_envio),
          }))
        );
      } catch (err) {
        console.error("Error:", err);
        setError(err.message || "Error al cargar datos del curso");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    const userData = getUserData();
    if (!userData) return;

    socketRef.current = io("http://localhost:3000", {
      withCredentials: true,
      transports: ["websocket"],
    });

    const socket = socketRef.current;
    socket.on("connect_error", (err) => {
      console.error("Error de conexión:", err);
      setError("Error de conexión con el servidor");
    });

    socket.on("course_message", (message) => {
      setMessages((prev) => [
        ...prev,
        {
          ...message,
          fecha_local: formatDate(message.fecha_envio),
        },
      ]);
    });

    socket.on("course_chat_history", (history) => {
      setMessages(
        history.map((msg) => ({
          ...msg,
          fecha_local: formatDate(msg.fecha_envio),
        }))
      );
    });

    socket.emit("authenticate", {
      userId: userData.id,
      userName: userData.nombre,
      userPhoto: userData.fotoPerfil,
    });

    socket.emit("join_course_chat", courseId);

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [courseId]);

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userData = getUserData();
    if (!userData) return;

    socketRef.current.emit("course_message", {
      courseId,
      userId: userData.id,
      message: trimmed,
    });

    setInputValue("");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando chat del curso...</div>
      </div>
    );
  }

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
            <h1>{courseInfo?.nombre || "Chat del Curso"}</h1>
            <p className={styles.courseDescription}>
              {courseInfo?.descripcion || ""}
            </p>
          </div>
        </div>

        <div className={styles.messageListContainer}>
          <ul className={styles.messageList}>
            {messages.map((message, index) => (
              <li
                key={index}
                className={
                  message.usuario_id === userData.id
                    ? styles.myMessage
                    : message.rol_usuario === "profesor"
                    ? styles.teacherMessage
                    : styles.otherMessage
                }
              >
                <div className={styles.messageHeader}>
                  <img
                    src={message.fotoPerfil || "../../img/usuario.png"}
                    alt={message.nombre}
                    className={styles.userAvatar}
                  />
                  <span className={styles.userName}>{message.nombre}</span>
                </div>
                <p className={styles.messageContent}>{message.mensaje}</p>
                <div className={styles.messageFooter}>
                  <p className={styles.messageDate}>{message.fecha_local}</p>
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
            placeholder="Escribe tu mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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