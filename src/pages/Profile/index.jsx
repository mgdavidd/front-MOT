import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./Profile.module.css";
import Logo from "../../components/Logo"; // Asegúrate de que el path sea correcto

export default function App() {
  const navigate = useNavigate();

  let user = null;
  const cookieValue = Cookies.get("user");

  if (cookieValue) {
    try {
      const decoded = decodeURIComponent(cookieValue);
      user = JSON.parse(decoded);
    } catch (error) {
      console.error("Error al parsear la cookie:", error);
    }
  }

  const userName = location.state?.userName || user?.nombre || "Invitado";
  const userEmail = user?.email || "Correo no disponible";
  const userArea = user?.area || "Área no disponible";
  const userRol = user?.rol || "sin Rol";

  return (
    <div className={styles["app-container"]}>
      <header className={styles.header}>
        <Logo />
        <h1 className={styles.title}>{userRol}</h1>
        <p className={styles.subtitle}>{userName}</p>
        <p className={styles.subtitle}>{userEmail}</p>
        <p className={styles.subtitle}>{userArea}</p>
      </header>

      <main className={styles["main-content"]}>
        <button
          className={styles["main-button"]}
          onClick={() => navigate("/crear-curso")}
        >
          Crear curso
        </button>
        <button
          className={styles["main-button"]}
          onClick={() => navigate("/editar-perfil")}
        >
          Editar perfil
        </button>
      </main>

      <div>
        <button
          className={styles["main-button"]}
          onClick={() => navigate("/instructorNav")}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
