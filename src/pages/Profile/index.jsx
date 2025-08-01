import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import styles from "./Profile.module.css";
import Logo from "../../components/Logo";
import { useState } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  const normalizeUserData = (userData) => {
    if (!userData) return null;
    
    if (userData.rows) {
      return {
        nombre: userData.rows[0][1],
        nombre_usuario: userData.rows[0][2],
        email: userData.rows[0][3],
        area: userData.rows[0][5],
        rol: userData.rows[0][6],
        color_perfil: userData.rows[0][10],
        id: userData.rows[0][0]
      };
    }
    return userData;
  };

  useEffect(() => {
    const cookieValue = Cookies.get("user");
    if (!cookieValue) {
      navigate("/");
      return;
    }

    try {
      const userData = JSON.parse(cookieValue);
      const normalizedUser = normalizeUserData(userData);
      setUser(normalizedUser);

      // Aplicar color del tema
      if (normalizedUser?.color_perfil) {
        document.documentElement.style.setProperty(
          '--color-primary', 
          normalizedUser.color_perfil
        );
      }
    } catch (error) {
      console.error("Error al parsear cookie:", error);
      Cookies.remove("user");
      navigate("/");
    }
  }, [navigate]);

  const userName = user?.nombre || location.state?.userName || "Invitado";
  const userEmail = user?.email || "Correo no disponible";
  const userArea = user?.area || "Área no disponible";
  const userRol = user?.rol || "Sin rol";

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
        {userRol === "Estudiante"(
        )}
        
        <button
          className={styles["main-button"]}
          onClick={() => navigate("/editar-perfil")}
        >
          Editar perfil
        </button>
      </main>

      <div className={styles.navigation}>
        <button
          className={styles["main-button"]}
          onClick={() => navigate("/instructorNav")}
          style={{ backgroundColor: "#64748b" }}
        >
          Volver
        </button>
      </div>
    </div>
  );
}