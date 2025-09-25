import React, { useEffect, useState } from "react";
import styles from "./StudentsList.module.css";
import Cookies from "js-cookie";

export default function StudentsList({ courseId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docente, setDocente] = useState({
    id: "",
    nombre: "Docente",
    fotoPerfil: "",
    color_perfil: "#e0e7ef",
  });

  // Parsea la cookie "user" como JSON
  const userCookie = Cookies.get("user");
  const user = userCookie ? JSON.parse(userCookie) : {};
  // console.log(user.id); // Puedes quitar esto si no lo necesitas

  useEffect(() => {
    fetch(`https://server-mot.onrender.com/my-students/${courseId}`)
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));

    //fetch para el docente del curso
    fetch(`https://server-mot.onrender.com/users/${courseId}/docente`)
      .then(res => res.json())
      .then(data => {
        setDocente({
          id: data.id,
          nombre: data.nombre,
          fotoPerfil: data.fotoPerfil,
          color_perfil: data.color_perfil,
        });
      })
      .catch(() => setDocente({}));

  }, [courseId, docente]);

  const handleChat = (otherUserId) => {
    window.location.href = `/private-chat/${otherUserId}`;
  };

  // Filtra al usuario actual
  const filteredStudents = students.filter(stu => String(stu.id) !== String(user.id));

  return (
    <div className={styles.listContainer}>
      <h2 className={styles.sectionTitle}>Personas en este curso</h2>
      <ul className={styles.userList}>
        {/* Docente primero */}
        <li className={styles.userItem + " " + styles.docente}>
          <img
            src={docente.fotoPerfil || "/img/usuario.png"}
            alt={docente.nombre}
            className={styles.userImg}
            style={{ backgroundColor: docente.color_perfil || "#e0e7ef" }}
          />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{docente.nombre} <span className={styles.role}>Docente</span></span>
            <button className={styles.chatBtn} onClick={() => handleChat(docente.id)}>
              Chat privado
            </button>
          </div>
        </li>
        {loading ? (
          <li className={styles.loading}>Cargando estudiantes...</li>
        ) : filteredStudents.length === 0 ? (
          <li className={styles.empty}>No hay más estudiantes inscritos.</li>
        ) : (
          filteredStudents.map(stu => (
            <li key={stu.id} className={styles.userItem}>
              <img
                src={stu.fotoPerfil || "/img/usuario.png"}
                alt={stu.nombre}
                className={styles.userImg}
                style={{ backgroundColor: stu.color_perfil || "#f0f4fa" }}
              />
              <div className={styles.userInfo}>
                <span className={styles.userName}>{stu.nombre}</span>
                <span className={styles.username}>@{stu.nombre_usuario}</span>
                <button className={styles.chatBtn} onClick={() => handleChat(stu.id)}>
                  Chat privado
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}